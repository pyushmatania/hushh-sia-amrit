import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  properties as staticProperties,
  packages as staticPackages,
  curatedCombos as staticCombos,
  addons as staticAddons,
  type Property,
  type ExperiencePackage,
  type CuratedCombo,
  type Addon,
  type TimeSlot,
  type PropertyRule,
} from "@/data/properties";

interface PropertiesContextValue {
  properties: Property[];
  packages: ExperiencePackage[];
  curatedCombos: CuratedCombo[];
  addons: Record<string, Addon[]>;
  loading: boolean;
  refresh: () => void;
}

const PropertiesContext = createContext<PropertiesContextValue>({
  properties: staticProperties,
  packages: staticPackages,
  curatedCombos: staticCombos,
  addons: staticAddons,
  loading: true,
  refresh: () => {},
});

export function usePropertiesData() {
  return useContext(PropertiesContext);
}

/** Map a DB host_listings row onto the static Property shape, merging images from static data */
function mergeDbRow(row: any, staticMatch: Property | undefined): Property {
  const dbSlots: TimeSlot[] = Array.isArray(row.slots)
    ? row.slots.map((s: any, i: number) => ({
        id: s.id || `s${i + 1}`,
        label: s.label || "",
        time: s.time || "",
        price: Number(s.price || 0),
        available: s.available !== false,
        popular: s.popular || false,
        originalPrice: s.originalPrice ? Number(s.originalPrice) : undefined,
        tag: s.tag,
        demandScore: s.demandScore,
        viewersNow: s.viewersNow,
      }))
    : [];

  const dbRules: PropertyRule[] = Array.isArray(row.rules)
    ? row.rules.map((r: any) => ({ icon: r.icon || "📋", text: r.text || "" }))
    : [];

  // Use static images if DB has none, otherwise use DB image URLs
  const images =
    row.image_urls && row.image_urls.length > 0
      ? row.image_urls
      : staticMatch?.images || [];

  return {
    // Use static ID if we have a match (so bookings/wishlists keep working)
    id: staticMatch?.id || row.id,
    name: row.name,
    description: row.description || staticMatch?.description || "",
    fullDescription: row.full_description || staticMatch?.fullDescription || "",
    images,
    rating: Number(row.rating) || staticMatch?.rating || 0,
    reviewCount: row.review_count || staticMatch?.reviewCount || 0,
    location: row.location || "Jeypore, Odisha",
    lat: Number(row.lat) || staticMatch?.lat || 18.856,
    lng: Number(row.lng) || staticMatch?.lng || 82.571,
    amenities: row.amenities?.length ? row.amenities : staticMatch?.amenities || [],
    amenityIcons: staticMatch?.amenityIcons || row.amenities?.map(() => "✨") || [],
    slotsLeft: staticMatch?.slotsLeft ?? 3,
    basePrice: Number(row.base_price),
    tags: row.tags?.length ? row.tags : staticMatch?.tags || [],
    verified: staticMatch?.verified ?? true,
    capacity: row.capacity || staticMatch?.capacity || 10,
    hostName: row.host_name || staticMatch?.hostName || "",
    hostSince: staticMatch?.hostSince || "2024",
    responseRate: staticMatch?.responseRate || "95%",
    primaryCategory: (row.primary_category || staticMatch?.primaryCategory || "stay") as Property["primaryCategory"],
    propertyType: row.property_type || staticMatch?.propertyType || "",
    category: staticMatch?.category || [row.category?.toLowerCase() || "stays"],
    highlights: row.highlights?.length ? row.highlights : staticMatch?.highlights || [],
    rules: dbRules.length ? dbRules : staticMatch?.rules || [],
    reviews: staticMatch?.reviews || [],
    slots: dbSlots.length ? dbSlots : staticMatch?.slots || [],
    entryInstructions: row.entry_instructions || staticMatch?.entryInstructions || "",
    discountLabel: row.discount_label || staticMatch?.discountLabel,
  };
}

export function PropertiesProvider({ children }: { children: ReactNode }) {
  const [properties, setProperties] = useState<Property[]>(staticProperties);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const { data, error } = await supabase
        .from("host_listings")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: true });

      if (cancelled) return;

      if (data && data.length > 0) {
        // Build a name→static lookup for merging
        const staticByName = new Map(staticProperties.map((p) => [p.name.toLowerCase().trim(), p]));

        const merged = data.map((row) => {
          const staticMatch = staticByName.get(row.name.toLowerCase().trim());
          return mergeDbRow(row, staticMatch);
        });

        // Add any static properties that don't exist in DB (safety fallback)
        const dbNames = new Set(data.map((r) => r.name.toLowerCase().trim()));
        const missing = staticProperties.filter((p) => !dbNames.has(p.name.toLowerCase().trim()));

        setProperties([...merged, ...missing]);
      }
      // If DB is empty, keep static properties
      setLoading(false);
    };

    load();
    return () => { cancelled = true; };
  }, [refreshKey]);

  const refresh = () => setRefreshKey((k) => k + 1);

  return (
    <PropertiesContext.Provider
      value={{
        properties,
        packages: staticPackages,
        curatedCombos: staticCombos,
        addons: staticAddons,
        loading,
        refresh,
      }}
    >
      {children}
    </PropertiesContext.Provider>
  );
}
