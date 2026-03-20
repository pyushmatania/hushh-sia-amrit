import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
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

const LISTING_LINKS_STORAGE_KEY = "hushh_db_static_listing_links_v1";

function readListingLinks(): Record<string, string> {
  try {
    const raw = localStorage.getItem(LISTING_LINKS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

function writeListingLinks(links: Record<string, string>) {
  try {
    localStorage.setItem(LISTING_LINKS_STORAGE_KEY, JSON.stringify(links));
  } catch {
    // ignore storage issues
  }
}

export function PropertiesProvider({ children }: { children: ReactNode }) {
  const [properties, setProperties] = useState<Property[]>(staticProperties);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("host_listings")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: true });

    if (error) {
      setProperties(staticProperties);
      setLoading(false);
      return;
    }

    if (data && data.length > 0) {
      const staticByName = new Map(staticProperties.map((p) => [p.name.toLowerCase().trim(), p]));
      const staticById = new Map(staticProperties.map((p) => [p.id, p]));
      const links = readListingLinks();
      const nextLinks = { ...links };
      const matchedStaticIds = new Set<string>();

      const merged = data.map((row) => {
        const linkedStatic = links[row.id] ? staticById.get(links[row.id]) : undefined;
        const staticMatch = linkedStatic || staticByName.get((row.name || "").toLowerCase().trim());

        if (staticMatch) {
          matchedStaticIds.add(staticMatch.id);
          if (!links[row.id]) nextLinks[row.id] = staticMatch.id;
        }

        return mergeDbRow(row, staticMatch);
      });

      if (Object.keys(nextLinks).length !== Object.keys(links).length) {
        writeListingLinks(nextLinks);
      }

      const missing = staticProperties.filter((p) => !matchedStaticIds.has(p.id));
      setProperties([...merged, ...missing]);
    } else {
      setProperties(staticProperties);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  // Re-fetch when tab becomes visible (e.g. returning from /admin)
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") load();
    };
    const onFocus = () => load();
    const onListingsUpdated = () => load();

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onFocus);
    window.addEventListener("hushh:listings-updated", onListingsUpdated);

    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("hushh:listings-updated", onListingsUpdated);
    };
  }, [load]);

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
