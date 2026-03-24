/**
 * Native data caching layer using Capacitor Preferences.
 * Caches API responses locally so the app loads instantly on native,
 * showing cached data while fresh data loads in the background.
 */
import { getPreference, setPreference, removePreference } from "./native-preferences";

interface CacheEntry<T = unknown> {
  data: T;
  ts: number;     // timestamp when cached
  ttl: number;    // time-to-live in ms
}

const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

/** Store data in native cache with TTL */
export async function cacheSet<T>(key: string, data: T, ttlMs = DEFAULT_TTL): Promise<void> {
  const entry: CacheEntry<T> = { data, ts: Date.now(), ttl: ttlMs };
  try {
    await setPreference(`cache_${key}`, JSON.stringify(entry));
  } catch {
    // Storage full or unavailable — silently fail
  }
}

/** Retrieve cached data. Returns null if expired or missing. */
export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const raw = await getPreference(`cache_${key}`);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    if (Date.now() - entry.ts > entry.ttl) {
      // Expired — clean up
      removePreference(`cache_${key}`).catch(() => {});
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

/** Remove a specific cache entry */
export async function cacheRemove(key: string): Promise<void> {
  await removePreference(`cache_${key}`);
}

/** 
 * Stale-while-revalidate pattern:
 * Returns cached data immediately, then fetches fresh data in background.
 * Calls onFresh when new data arrives.
 */
export async function cacheWithRevalidate<T>(
  key: string,
  fetcher: () => Promise<T>,
  opts?: { ttl?: number; onFresh?: (data: T) => void }
): Promise<T> {
  const ttl = opts?.ttl ?? DEFAULT_TTL;
  
  // Try cache first
  const cached = await cacheGet<T>(key);
  
  if (cached !== null) {
    // Return cached immediately, revalidate in background
    fetcher().then(async (fresh) => {
      await cacheSet(key, fresh, ttl);
      opts?.onFresh?.(fresh);
    }).catch(() => {});
    return cached;
  }
  
  // No cache — must fetch
  const data = await fetcher();
  await cacheSet(key, data, ttl);
  return data;
}

/**
 * Prefetch critical data on app startup.
 * Call from App.tsx after native plugin init.
 */
export async function prefetchCriticalData(): Promise<void> {
  try {
    const { supabase } = await import("@/integrations/supabase/client");
    
    // Prefetch in parallel — these are the most viewed on app open
    await Promise.allSettled([
      // Properties (home feed)
      supabase.from("host_listings").select("*").eq("status", "active").order("sort_order").limit(20)
        .then(({ data }) => { if (data) cacheSet("listings_active", data, 10 * 60 * 1000); }),
      
      // Curations
      supabase.from("curations").select("*").eq("active", true).order("sort_order").limit(10)
        .then(({ data }) => { if (data) cacheSet("curations_active", data, 10 * 60 * 1000); }),
      
      // Experience packages
      supabase.from("experience_packages").select("*").eq("active", true).order("sort_order")
        .then(({ data }) => { if (data) cacheSet("packages_active", data, 15 * 60 * 1000); }),
      
      // App config
      supabase.from("app_config").select("*")
        .then(({ data }) => { if (data) cacheSet("app_config", data, 30 * 60 * 1000); }),
    ]);
  } catch {
    // Non-critical — app works without prefetch
  }
}
