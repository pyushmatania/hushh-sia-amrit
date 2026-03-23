import { useState, useCallback, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SearchResult {
  id: string;
  type: "property" | "curation";
  name: string;
  description: string;
  image_url: string | null;
  price: number;
  location?: string;
  tags: string[];
}

export function useSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState<"all" | "stays" | "experiences" | "services" | "curations">("all");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(
    async (searchQuery: string, cat: string) => {
      if (!searchQuery.trim()) {
        setResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const term = `%${searchQuery.trim()}%`;
      const allResults: SearchResult[] = [];

      // Search properties
      if (cat === "all" || cat !== "curations") {
        let propQuery = supabase
          .from("host_listings")
          .select("id, name, description, image_urls, base_price, location, tags, category, status")
          .eq("status", "published")
          .or(`name.ilike.${term},description.ilike.${term},location.ilike.${term}`)
          .limit(20);

        if (cat !== "all") {
          propQuery = propQuery.ilike("category", cat);
        }

        const { data: props } = await propQuery;
        for (const p of props ?? []) {
          allResults.push({
            id: p.id,
            type: "property",
            name: p.name,
            description: p.description ?? "",
            image_url: p.image_urls?.[0] ?? null,
            price: Number(p.base_price),
            location: p.location,
            tags: p.tags ?? [],
          });
        }
      }

      // Search curations
      if (cat === "all" || cat === "curations") {
        const { data: curations } = await supabase
          .from("curations")
          .select("id, name, tagline, image_urls, price, tags")
          .eq("active", true)
          .or(`name.ilike.${term},tagline.ilike.${term}`)
          .limit(10);

        for (const c of curations ?? []) {
          allResults.push({
            id: c.id,
            type: "curation",
            name: c.name,
            description: c.tagline ?? "",
            image_url: c.image_urls?.[0] ?? null,
            price: Number(c.price),
            tags: c.tags ?? [],
          });
        }
      }

      setResults(allResults);
      setLoading(false);
    },
    []
  );

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(() => {
      search(query, category);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, category, search]);

  return { query, setQuery, category, setCategory, results, loading };
}
