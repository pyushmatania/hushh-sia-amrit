import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const DEFAULT_FILTERS: Record<string, string[]> = {
  stay: ["All", "Private Villa", "Pool Villa", "Farmhouse", "Rooftop Space", "Work Pod", "Couple Room", "Open Lawn", "Camping"],
  experience: ["All", "Romantic", "Celebration", "Party", "Adventure", "Cultural", "Sports", "Workshop", "Walking Tour"],
  service: ["All", "Chef Service", "Decoration", "Transport", "Entertainment"],
  curation: ["All", "🔥 Popular", "💑 Romantic", "🎉 Party", "🍗 Foodie", "💻 Work", "🎬 Entertainment", "💸 Budget"],
};

let cachedFilters: Record<string, string[]> | null = null;
let listeners: Array<() => void> = [];
const notify = () => listeners.forEach(l => l());

async function loadFilters() {
  const { data } = await (supabase as any)
    .from("app_config")
    .select("key, value")
    .eq("key", "homepage_filters")
    .maybeSingle();

  if (data?.value) {
    try {
      const parsed = JSON.parse(data.value);
      if (parsed && typeof parsed === "object") {
        cachedFilters = { ...DEFAULT_FILTERS, ...parsed };
        notify();
        return;
      }
    } catch { /* fall through */ }
  }
  cachedFilters = DEFAULT_FILTERS;
  notify();
}

export function useHomepageFilters() {
  const [filters, setFilters] = useState<Record<string, string[]>>(cachedFilters || DEFAULT_FILTERS);

  useEffect(() => {
    if (!cachedFilters) loadFilters();
    const handler = () => { if (cachedFilters) setFilters({ ...cachedFilters }); };
    listeners.push(handler);
    return () => { listeners = listeners.filter(l => l !== handler); };
  }, []);

  return filters;
}
