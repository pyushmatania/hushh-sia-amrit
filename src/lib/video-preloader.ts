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

export function preloadVideos() {
  if (preloaded) return;
  preloaded = true;

  // Priority: fetch first 2 spotlight videos eagerly into cache
  PRIORITY_VIDEOS.slice(0, 2).forEach((url) => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "video";
    link.href = url;
    link.setAttribute("fetchpriority", "high");
    document.head.appendChild(link);
  });
  // Remaining priority videos at low priority
  PRIORITY_VIDEOS.slice(2).forEach((url) => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "video";
    link.href = url;
    link.setAttribute("fetchpriority", "low");
    document.head.appendChild(link);
  });

  // Secondary: fetch into cache after a short delay
  setTimeout(() => {
    SECONDARY_VIDEOS.forEach((url) => {
      fetch(url, { priority: "low" } as RequestInit).catch(() => {});
    });
  }, 3000);
}
