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

const PRIORITY_VIDEOS = [
  videoBonfire.url,
  videoPool.url,
  videoBbq.url,
  videoDj.url,
  videoRooftop.url,
];

const SECONDARY_VIDEOS = [
  videoThali.url,
  videoCandlelight.url,
  videoChai.url,
  videoCurationChill.url,
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
  const highPriorityCount = isSlowConnection ? 1 : 2;

  // Keep startup extremely light on mobile webview: warm only the first visible cards.
  PRIORITY_VIDEOS.slice(0, highPriorityCount).forEach((url) => appendVideoPreload(url, "high"));

  if (isSlowConnection) return;

  const deferredWarmups = [
    ...PRIORITY_VIDEOS.slice(highPriorityCount, highPriorityCount + 2),
    SECONDARY_VIDEOS[0],
  ].filter(Boolean) as string[];

  const schedule =
    typeof window !== "undefined" && "requestIdleCallback" in window
      ? (cb: () => void) => (window as any).requestIdleCallback(cb, { timeout: 2500 })
      : (cb: () => void) => window.setTimeout(cb, 1800);

  schedule(() => {
    deferredWarmups.forEach((url) => appendVideoPreload(url, "low"));
  });
}
