import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { experiencePacks as fallbackPacks, type ExperiencePack } from "@/components/home/CuratedPackCard";
import { useDataMode } from "@/hooks/use-data-mode";

export function useCurations() {
  const { isRealMode } = useDataMode();
  const [packs, setPacks] = useState<ExperiencePack[]>(isRealMode ? [] : fallbackPacks);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("curations")
        .select("*")
        .eq("active", true)
        .order("sort_order", { ascending: true });

      if (data && data.length > 0) {
        setPacks(
          data.map((row) => ({
            id: row.id,
            name: row.name,
            tagline: row.tagline,
            emoji: row.emoji,
            slot: row.slot,
            price: Number(row.price),
            originalPrice: row.original_price ? Number(row.original_price) : undefined,
            includes: row.includes,
            tags: row.tags,
            mood: row.mood as ExperiencePack["mood"],
            propertyId: row.property_id,
            gradient: row.gradient,
            badge: row.badge ?? undefined,
            imageUrls: row.image_urls ?? undefined,
          }))
        );
      }
      } else if (!isRealMode) {
        // Keep fallbackPacks only in demo mode
      } else {
        setPacks([]);
      }
      setLoading(false);
    };
    load();
  }, [isRealMode]);

  return { packs, loading };
}
