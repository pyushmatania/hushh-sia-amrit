import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./use-auth";
import { useToast } from "./use-toast";

const LOCAL_KEY = "hushh_wishlists";

function getLocalWishlist(): string[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
  } catch { return []; }
}

function setLocalWishlist(ids: string[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(ids));
}

export function useWishlists() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const load = async () => {
        const { data } = await supabase
          .from("wishlists")
          .select("property_id")
          .eq("user_id", user.id);
        const ids = data?.map((w) => w.property_id) ?? [];
        // Merge any local wishlists into DB on login
        const local = getLocalWishlist();
        const toSync = local.filter((id) => !ids.includes(id));
        if (toSync.length > 0) {
          await supabase.from("wishlists").insert(
            toSync.map((property_id) => ({ user_id: user.id, property_id }))
          );
          ids.push(...toSync);
          localStorage.removeItem(LOCAL_KEY);
        }
        setWishlist(ids);
        setLoading(false);
      };
      load();
    } else {
      setWishlist(getLocalWishlist());
      setLoading(false);
    }
  }, [user]);

  const toggleWishlist = useCallback(
    async (propertyId: string) => {
      const exists = wishlist.includes(propertyId);
      const next = exists ? wishlist.filter((id) => id !== propertyId) : [...wishlist, propertyId];
      setWishlist(next);

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
        setLocalWishlist(next);
      }
    },
    [user, wishlist]
  );

  return { wishlist, toggleWishlist, loading };
}
