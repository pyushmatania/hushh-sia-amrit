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
import { getListingThumbnail } from "@/lib/listing-thumbnails";

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

  const dbImages = Array.isArray(row.image_urls) ? row.image_urls.filter(Boolean) : [];
  const staticImages = staticMatch?.images?.filter(Boolean) || [];
  const mappedThumb = getListingThumbnail(row.name || "", dbImages, { preferMapped: true });
  const guaranteedFallback = staticProperties[0]?.images?.[0] || "";
  const primaryImage = mappedThumb || staticImages[0] || dbImages[0] || guaranteedFallback;
  const images = Array.from(new Set([primaryImage, ...dbImages, ...staticImages].filter(Boolean)));

  return {
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
  } catch {}
}

// Map DB inventory categories to consumer-facing addon group names
const categoryToAddonGroup: Record<string, { group: string; emoji: string }> = {
  food: { group: "Food & Drinks", emoji: "🍽️" },
  drinks: { group: "Food & Drinks", emoji: "🍽️" },
  decoration: { group: "Decoration", emoji: "🎨" },
  decor: { group: "Decoration", emoji: "🎨" },
  entertainment: { group: "Music & Entertainment", emoji: "🎵" },
  activity: { group: "Activities", emoji: "🏊" },
  work: { group: "Work Add-ons", emoji: "💻" },
  comfort: { group: "Comfort Add-ons", emoji: "🛏️" },
  staff: { group: "Staff & Extras", emoji: "📸" },
  equipment: { group: "Staff & Extras", emoji: "📸" },
};

function inventoryToAddons(rows: any[]): Record<string, Addon[]> {
  const grouped: Record<string, Addon[]> = {};
  for (const row of rows) {
    if (!row.available) continue;
    const mapping = categoryToAddonGroup[row.category] || { group: "Extras", emoji: "✨" };
    const addon: Addon = {
      id: row.id,
      category: mapping.group,
      categoryEmoji: mapping.emoji,
      emoji: row.emoji || "✨",
      name: row.name,
      description: `${row.category} · ₹${row.unit_price}`,
      price: Number(row.unit_price),
      perPerson: row.category === "food",
    };
    if (!grouped[mapping.group]) grouped[mapping.group] = [];
    grouped[mapping.group].push(addon);
  }
  return grouped;
}

function curationsToCombo(row: any, staticMatch: CuratedCombo | undefined, propertyImage?: string): CuratedCombo {
  // Priority: curation's own image_urls > static match image > property image
  const curationOwnImage = Array.isArray(row.image_urls) && row.image_urls.length > 0 ? row.image_urls[0] : null;
  const resolvedImage = curationOwnImage || staticMatch?.image || propertyImage || "";
  return {
    id: staticMatch?.id || row.id,
    name: row.name,
    tagline: row.tagline || staticMatch?.tagline || "",
    emoji: row.emoji || staticMatch?.emoji || "✨",
    time: row.slot || staticMatch?.time || "",
    priceRange: [Number(row.price), Number(row.original_price || row.price)],
    includes: row.includes?.length ? row.includes : staticMatch?.includes || [],
    image: resolvedImage,
    gradient: row.gradient || staticMatch?.gradient || "from-primary/80 to-primary/40",
    tags: row.tags?.length ? row.tags : staticMatch?.tags || [],
    popular: !!row.badge || staticMatch?.popular,
  };
}

export function PropertiesProvider({ children }: { children: ReactNode }) {
  const [properties, setProperties] = useState<Property[]>(staticProperties);
  const [packages, setPackages] = useState<ExperiencePackage[]>(staticPackages);
  const [addons, setAddons] = useState<Record<string, Addon[]>>(staticAddons);
  const [curatedCombos, setCuratedCombos] = useState<CuratedCombo[]>(staticCombos);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const load = useCallback(async () => {
    const [listingsRes, inventoryRes, curationsRes, packagesRes] = await Promise.all([
      supabase.from("host_listings").select("*").eq("status", "published").order("sort_order", { ascending: true }).order("created_at", { ascending: true }),
      supabase.from("inventory").select("*").order("sort_order", { ascending: true }).order("category").order("name"),
      supabase.from("curations").select("*").eq("active", true).order("sort_order", { ascending: true }),
      supabase.from("experience_packages").select("*").eq("active", true).order("sort_order", { ascending: true }),
    ]);

    // Process listings
    if (!listingsRes.error && listingsRes.data && listingsRes.data.length > 0) {
      const staticByName = new Map(staticProperties.map((p) => [p.name.toLowerCase().trim(), p]));
      const staticById = new Map(staticProperties.map((p) => [p.id, p]));
      const links = readListingLinks();
      const nextLinks = { ...links };
      const matchedStaticIds = new Set<string>();

      const merged = listingsRes.data.map((row) => {
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

    // Process inventory → addons
    if (!inventoryRes.error && inventoryRes.data && inventoryRes.data.length > 0) {
      const dbAddons = inventoryToAddons(inventoryRes.data);
      const merged = { ...staticAddons };
      for (const [group, items] of Object.entries(dbAddons)) {
        merged[group] = items;
      }
      setAddons(merged);
    } else {
      setAddons(staticAddons);
    }

    // Process curations → curatedCombos
    // Build a property image map from listings for curations that don't match static combos
    const listingImageMap = new Map<string, string>();
    if (listingsRes.data) {
      for (const row of listingsRes.data) {
        const thumb = getListingThumbnail(row.name, row.image_urls || [], { preferMapped: true });
        if (thumb) listingImageMap.set(row.id, thumb);
        else if (row.image_urls?.[0]) listingImageMap.set(row.id, row.image_urls[0]);
      }
    }

    if (!curationsRes.error && curationsRes.data && curationsRes.data.length > 0) {
      const staticByName = new Map(staticCombos.map((c) => [c.name.toLowerCase().trim(), c]));
      const merged = curationsRes.data.map((row) => {
        const staticMatch = staticByName.get((row.name || "").toLowerCase().trim());
        const propertyImage = listingImageMap.get(row.property_id);
        return curationsToCombo(row, staticMatch, propertyImage);
      });
      setCuratedCombos(merged);
    } else {
      setCuratedCombos(staticCombos);
    }

    // Process experience packages
    if (!packagesRes.error && packagesRes.data && packagesRes.data.length > 0) {
      setPackages(
        packagesRes.data.map((row: any) => ({
          id: row.id,
          name: row.name,
          emoji: row.emoji || "✨",
          price: Number(row.price),
          includes: row.includes || [],
          gradient: row.gradient || "from-primary/80 to-primary/40",
        }))
      );
    } else {
      setPackages(staticPackages);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

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
        packages,
        curatedCombos,
        addons,
        loading,
        refresh,
      }}
    >
      {children}
    </PropertiesContext.Provider>
  );
}
