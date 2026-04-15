import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./use-auth";
import { useToast } from "./use-toast";
import { properties as staticProperties } from "@/data/properties";
import { useDataMode } from "./use-data-mode";

const LOCAL_KEY = "hushh_wishlists";
const DEMO_WISHLIST_IDS = ["1", "3", "5", "7", "10"];

function sanitizeWishlist(ids: string[], propList?: { id: string }[]): string[] {
  const validIds = new Set((propList || staticProperties).map((p) => p.id));
  return Array.from(new Set(ids.filter((id) => validIds.has(id))));
}

function readLocalWishlist(): { hasStoredValue: boolean; ids: string[] } {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (raw === null) return { hasStoredValue: false, ids: [] };

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return { hasStoredValue: true, ids: [] };

    return {
      hasStoredValue: true,
      ids: parsed.map(String),
    };
  } catch {
    return { hasStoredValue: true, ids: [] };
  }
}

function setLocalWishlist(ids: string[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(ids));
}

export function useWishlists() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { isRealMode } = useDataMode();
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const load = async () => {
        const { data } = await supabase
          .from("wishlists")
          .select("property_id")
          .eq("user_id", user.id);

        const dbIds = sanitizeWishlist(data?.map((w) => w.property_id) ?? []);

        // Merge any local wishlists into DB on login
        const local = sanitizeWishlist(readLocalWishlist().ids);
        const toSync = local.filter((id) => !dbIds.includes(id));

        if (toSync.length > 0) {
          await supabase.from("wishlists").insert(
            toSync.map((property_id) => ({ user_id: user.id, property_id }))
          );
          dbIds.push(...toSync);
          localStorage.removeItem(LOCAL_KEY);
        }

        setWishlist(sanitizeWishlist(dbIds));
        setLoading(false);
      };

      load();
      return;
    }

    // Guest mode: in real mode show empty, in demo mode show demo data
    if (isRealMode) {
      setWishlist([]);
      setLoading(false);
      return;
    }

    const { hasStoredValue, ids } = readLocalWishlist();
    const sanitized = sanitizeWishlist(ids);

    if (!hasStoredValue || sanitized.length === 0) {
      setWishlist(DEMO_WISHLIST_IDS);
    } else {
      setWishlist(sanitized);
    }

    setLoading(false);
  }, [user, isRealMode]);

  const toggleWishlist = useCallback(
    async (propertyId: string) => {
      const exists = wishlist.includes(propertyId);
      const next = exists ? wishlist.filter((id) => id !== propertyId) : [...wishlist, propertyId];
      const sanitizedNext = sanitizeWishlist(next);

      setWishlist(sanitizedNext);

      toast({
        title: exists ? "💔 Removed from Wishlist" : "❤️ Saved to Wishlist",
        description: exists ? "You can always add it back later" : "Find it in your Wishlists tab",
      });

      if (user) {
        if (exists) {
          await supabase.from("wishlists").delete().eq("user_id", user.id).eq("property_id", propertyId);
        } else {
          await supabase.from("wishlists").insert({ user_id: user.id, property_id: propertyId });
        }
      } else {
        setLocalWishlist(sanitizedNext);
      }
    },
    [user, wishlist, toast]
  );

  return { wishlist, toggleWishlist, loading };
}
