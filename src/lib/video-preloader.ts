/**
 * Eagerly preloads video URLs into browser cache using link[rel=preload]
 * so they're instantly available when video cards scroll into view.
 */

// Spotlight videos
import videoBonfire from "@/assets/video-bonfire-night.mp4.asset.json";
import videoPool from "@/assets/video-pool-lights.mp4.asset.json";
import videoBbq from "@/assets/video-bbq-grill.mp4.asset.json";
import videoDj from "@/assets/video-dj-lights.mp4.asset.json";
import videoRooftop from "@/assets/video-rooftop-dinner.mp4.asset.json";

// Foodie videos
import videoThali from "@/assets/video-tribal-thali.mp4.asset.json";
import videoCandlelight from "@/assets/video-candlelight.mp4.asset.json";
import videoChai from "@/assets/video-chai-pour.mp4.asset.json";

// Curation videos
import videoCurationChill from "@/assets/video-curation-chill.mp4.asset.json";
import videoCurationParty from "@/assets/video-curation-party.mp4.asset.json";
import videoCurationRomantic from "@/assets/video-curation-romantic.mp4.asset.json";
import videoCurationBbq from "@/assets/video-curation-bbq.mp4.asset.json";

// First 3 spotlight videos (cards 0-2) are always immediately visible or one swipe away.
// First curated pack video is the first thing seen when scrolling to Curated Packs section.
const PRIORITY_VIDEOS = [
  videoBonfire.url,   // spotlight card 0 — critical
  videoPool.url,      // spotlight card 1 — one swipe away
  videoBbq.url,       // spotlight card 2 — two swipes away
  videoCurationChill.url, // first curated pack
];

const SECONDARY_VIDEOS = [
  videoDj.url,
  videoRooftop.url,
  videoThali.url,
  videoCandlelight.url,
  videoChai.url,
  videoCurationParty.url,
  videoCurationRomantic.url,
  videoCurationBbq.url,
];

let preloaded = false;

function hasSlowConnection() {
  if (typeof navigator === "undefined") return false;
  const connection = (navigator as Navigator & {
    connection?: { saveData?: boolean; effectiveType?: string };
  }).connection;

  if (!connection) return false;
  return connection.saveData === true || ["slow-2g", "2g"].includes(connection.effectiveType ?? "");
}

function appendVideoPreload(url: string, priority: "high" | "low") {
  const existing = document.head.querySelector(`link[rel="preload"][as="video"][href="${url}"]`);
  if (existing) return;

  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "video";
  link.href = url;
  link.setAttribute("fetchpriority", priority);
  document.head.appendChild(link);
}

export function preloadVideos() {
  if (preloaded) return;
  preloaded = true;

  const isSlowConnection = hasSlowConnection();

  if (isSlowConnection) {
    // On slow connections, only preload the very first card to save bandwidth.
    appendVideoPreload(PRIORITY_VIDEOS[0], "high");
    return;
  }

  // Fast connection: preload the first 3 spotlight + first curated pack with high priority.
  // These are always the first things the user sees on home and on curated packs scroll.
  PRIORITY_VIDEOS.forEach((url) => appendVideoPreload(url, "high"));

  // Defer secondary warmups until the browser is idle so they don't compete with initial render.
  const schedule =
    typeof window !== "undefined" && "requestIdleCallback" in window
      ? (cb: () => void) => (window as any).requestIdleCallback(cb, { timeout: 3000 })
      : (cb: () => void) => window.setTimeout(cb, 2000);

  schedule(() => {
    SECONDARY_VIDEOS.slice(0, 4).forEach((url) => appendVideoPreload(url, "low"));
  });
}
