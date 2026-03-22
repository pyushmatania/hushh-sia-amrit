import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface HomepageSection {
  id: string;
  key: string;
  label: string;
  emoji: string;
  visible: boolean;
  sort_order: number;
  category: string;
}

const DEFAULT_SECTIONS: HomepageSection[] = [
  { id: "s1", key: "active_trip", label: "Active Trip Card", emoji: "🗺️", visible: true, sort_order: 0, category: "home" },
  { id: "s2", key: "spotlight", label: "Tonight's Vibe (Video Carousel)", emoji: "🔥", visible: true, sort_order: 1, category: "home" },
  { id: "s3", key: "packages", label: "Book Your Experience", emoji: "📦", visible: true, sort_order: 2, category: "home" },
  { id: "s4", key: "foodie", label: "Foodie Front Row", emoji: "🍽️", visible: true, sort_order: 3, category: "home" },
  { id: "s5", key: "curated_packs", label: "Curated Packs", emoji: "✨", visible: true, sort_order: 4, category: "home" },
  { id: "s6", key: "all_listings", label: "All Listings Grid", emoji: "🏘️", visible: true, sort_order: 5, category: "home" },
];

let cachedSections: HomepageSection[] | null = null;
let listeners: Array<() => void> = [];
const notify = () => listeners.forEach(l => l());

async function loadSections(): Promise<HomepageSection[]> {
  const { data } = await (supabase as any)
    .from("app_config")
    .select("key, value")
    .eq("key", "homepage_sections")
    .maybeSingle();

  if (data?.value) {
    try {
      const parsed = JSON.parse(data.value) as HomepageSection[];
      cachedSections = parsed;
      notify();
      return parsed;
    } catch {
      // fall through to defaults
    }
  }
  cachedSections = DEFAULT_SECTIONS;
  notify();
  return DEFAULT_SECTIONS;
}

export function useHomepageSections(category: string = "home") {
  const [sections, setSections] = useState<HomepageSection[]>(cachedSections || DEFAULT_SECTIONS);

  useEffect(() => {
    if (!cachedSections) loadSections();
    const handler = () => {
      if (cachedSections) setSections([...cachedSections]);
    };
    listeners.push(handler);
    return () => { listeners = listeners.filter(l => l !== handler); };
  }, []);

  // Filter by category, only visible, sorted
  const visible = sections
    .filter(s => s.category === category && s.visible)
    .sort((a, b) => a.sort_order - b.sort_order);

  const isSectionVisible = (key: string) => visible.some(s => s.key === key);
  const getSortOrder = (key: string) => {
    const s = visible.find(sec => sec.key === key);
    return s ? s.sort_order : 999;
  };

  return { sections: visible, isSectionVisible, getSortOrder };
}
