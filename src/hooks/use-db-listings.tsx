import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Property, TimeSlot, PropertyRule } from "@/data/properties";
import { properties as fallbackProperties } from "@/data/properties";

function mapDbToProperty(row: any): Property {
  const slots: TimeSlot[] = Array.isArray(row.slots)
    ? row.slots.map((s: any, i: number) => ({
        id: s.id || `s${i}`,
        label: s.label || "",
        time: s.time || "",
        price: Number(s.price) || 0,
        available: s.available !== false,
        popular: s.popular || false,
        originalPrice: s.originalPrice ? Number(s.originalPrice) : undefined,
        tag: s.tag,
        demandScore: s.demandScore ? Number(s.demandScore) : undefined,
        viewersNow: s.viewersNow ? Number(s.viewersNow) : undefined,
      }))
    : [];

  const rules: PropertyRule[] = Array.isArray(row.rules)
    ? row.rules.map((r: any) => ({ icon: r.icon || "📋", text: r.text || "" }))
    : [];

  const category = Array.isArray(row.category) ? row.category : row.category ? [row.category] : [];
  const availableSlots = slots.filter(s => s.available);

  return {
    id: row.id,
    name: row.name || "",
    description: row.description || "",
    fullDescription: row.full_description || "",
    images: row.image_urls || [],
    rating: Number(row.rating) || 0,
    reviewCount: Number(row.review_count) || 0,
    location: row.location || "Jeypore, Odisha",
    lat: Number(row.lat) || 18.856,
    lng: Number(row.lng) || 82.571,
    amenities: row.amenities || [],
    amenityIcons: (row.amenities || []).map(() => "✨"),
    slotsLeft: availableSlots.length,
    basePrice: Number(row.base_price) || 0,
    tags: row.tags || [],
    verified: true,
    slots,
    entryInstructions: row.entry_instructions || "",
    capacity: Number(row.capacity) || 10,
    hostName: row.host_name || "Hushh Host",
    hostSince: "2024",
    responseRate: "98%",
    rules,
    reviews: [],
    highlights: row.highlights || [],
    primaryCategory: (row.primary_category || "stay") as Property["primaryCategory"],
    propertyType: row.property_type || "",
    discountLabel: row.discount_label || undefined,
    category,
  };
}

let cachedProperties: Property[] | null = null;
let fetchPromise: Promise<Property[]> | null = null;

export function useDbListings() {
  const [properties, setProperties] = useState<Property[]>(cachedProperties || fallbackProperties);
  const [loading, setLoading] = useState(!cachedProperties);

  useEffect(() => {
    if (cachedProperties) {
      setProperties(cachedProperties);
      setLoading(false);
      return;
    }

    if (!fetchPromise) {
      fetchPromise = supabase
        .from("host_listings")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: true })
        .then(({ data, error }) => {
          if (error || !data || data.length === 0) {
            cachedProperties = fallbackProperties;
            return fallbackProperties;
          }
          const mapped = data.map(mapDbToProperty);
          cachedProperties = mapped;
          return mapped;
        });
    }

    fetchPromise.then((result) => {
      setProperties(result);
      setLoading(false);
    });
  }, []);

  // Subscribe to realtime changes
  useEffect(() => {
    const channel = supabase
      .channel("listings-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "host_listings" }, () => {
        // Refetch on any change
        cachedProperties = null;
        fetchPromise = null;
        supabase
          .from("host_listings")
          .select("*")
          .eq("status", "published")
          .order("created_at", { ascending: true })
          .then(({ data }) => {
            if (data && data.length > 0) {
              const mapped = data.map(mapDbToProperty);
              cachedProperties = mapped;
              setProperties(mapped);
            }
          });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return { properties, loading };
}

// Helper to find a property by ID from the cache
export function getDbProperty(id: string): Property | undefined {
  return cachedProperties?.find(p => p.id === id);
}
