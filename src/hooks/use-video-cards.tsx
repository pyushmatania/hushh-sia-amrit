import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface VideoCardConfig {
  id: string;
  category: string;
  video_url: string;
  overlay_text: string;
  tag_label: string;
  tag_color: string;
  sort_order: number;
  active: boolean;
}

let cachedCards: VideoCardConfig[] | null = null;
let listeners: Array<() => void> = [];
const notify = () => listeners.forEach(l => l());

async function loadVideoCards(): Promise<VideoCardConfig[]> {
  const { data } = await (supabase as any)
    .from("app_config")
    .select("key, value")
    .eq("key", "homepage_video_cards")
    .maybeSingle();

  if (data?.value) {
    try {
      const parsed = JSON.parse(data.value) as VideoCardConfig[];
      cachedCards = parsed;
      notify();
      return parsed;
    } catch {
      // fall through
    }
  }
  cachedCards = [];
  notify();
  return [];
}

export function useVideoCards(category: string = "home") {
  const [cards, setCards] = useState<VideoCardConfig[]>(cachedCards || []);

  useEffect(() => {
    if (!cachedCards) loadVideoCards();
    const handler = () => {
      if (cachedCards) setCards([...cachedCards]);
    };
    listeners.push(handler);
    return () => { listeners = listeners.filter(l => l !== handler); };
  }, []);

  return cards
    .filter(c => c.category === category && c.active)
    .sort((a, b) => a.sort_order - b.sort_order);
}
