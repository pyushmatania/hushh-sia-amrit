import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./use-auth";

export interface HostListing {
  id: string;
  name: string;
  description: string;
  fullDescription: string;
  location: string;
  category: string;
  basePrice: number;
  capacity: number;
  amenities: string[];
  tags: string[];
  imageUrls: string[];
  status: "draft" | "published" | "paused";
  createdAt: string;
}

export function useHostListings() {
  const { user } = useAuth();
  const [listings, setListings] = useState<HostListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setListings([]); setLoading(false); return; }

    const load = async () => {
      const { data } = await supabase
        .from("host_listings")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (data) {
        setListings(data.map(mapRow));
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const createListing = useCallback(
    async (listing: Omit<HostListing, "id" | "createdAt">) => {
      if (!user) return null;
      const { data } = await supabase
        .from("host_listings")
        .insert({
          user_id: user.id,
          name: listing.name,
          description: listing.description,
          full_description: listing.fullDescription,
          location: listing.location,
          category: listing.category,
          base_price: listing.basePrice,
          capacity: listing.capacity,
          amenities: listing.amenities,
          tags: listing.tags,
          image_urls: listing.imageUrls,
          status: listing.status,
        })
        .select()
        .single();

      if (data) {
        const newListing = mapRow(data);
        setListings((prev) => [newListing, ...prev]);
        return newListing;
      }
      return null;
    },
    [user]
  );

  const updateListing = useCallback(
    async (id: string, updates: Partial<Omit<HostListing, "id" | "createdAt">>) => {
      const dbUpdates: Record<string, unknown> = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.fullDescription !== undefined) dbUpdates.full_description = updates.fullDescription;
      if (updates.location !== undefined) dbUpdates.location = updates.location;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.basePrice !== undefined) dbUpdates.base_price = updates.basePrice;
      if (updates.capacity !== undefined) dbUpdates.capacity = updates.capacity;
      if (updates.amenities !== undefined) dbUpdates.amenities = updates.amenities;
      if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
      if (updates.imageUrls !== undefined) dbUpdates.image_urls = updates.imageUrls;
      if (updates.status !== undefined) dbUpdates.status = updates.status;

      await supabase.from("host_listings").update(dbUpdates).eq("id", id);
      setListings((prev) =>
        prev.map((l) => (l.id === id ? { ...l, ...updates } : l))
      );
    },
    []
  );

  const deleteListing = useCallback(async (id: string) => {
    setListings((prev) => prev.filter((l) => l.id !== id));
    await supabase.from("host_listings").delete().eq("id", id);
  }, []);

  return { listings, loading, createListing, updateListing, deleteListing };
}

function mapRow(b: any): HostListing {
  return {
    id: b.id,
    name: b.name,
    description: b.description,
    fullDescription: b.full_description,
    location: b.location,
    category: b.category,
    basePrice: Number(b.base_price),
    capacity: b.capacity,
    amenities: b.amenities ?? [],
    tags: b.tags ?? [],
    imageUrls: b.image_urls ?? [],
    status: b.status as HostListing["status"],
    createdAt: b.created_at,
  };
}
