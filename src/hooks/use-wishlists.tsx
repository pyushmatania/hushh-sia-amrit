import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./use-auth";

export function useWishlists() {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setWishlist([]); setLoading(false); return; }

    const load = async () => {
      const { data } = await supabase
        .from("wishlists")
        .select("property_id")
        .eq("user_id", user.id);
      setWishlist(data?.map((w) => w.property_id) ?? []);
      setLoading(false);
    };
    load();
  }, [user]);

  const toggleWishlist = useCallback(
    async (propertyId: string) => {
      if (!user) return;
      const exists = wishlist.includes(propertyId);

      // Optimistic update
      setWishlist((prev) =>
        exists ? prev.filter((id) => id !== propertyId) : [...prev, propertyId]
      );

      if (exists) {
        await supabase
          .from("wishlists")
          .delete()
          .eq("user_id", user.id)
          .eq("property_id", propertyId);
      } else {
        await supabase
          .from("wishlists")
          .insert({ user_id: user.id, property_id: propertyId });
      }
    },
    [user, wishlist]
  );

  return { wishlist, toggleWishlist, loading };
}
