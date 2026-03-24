// ── Wallpaper Asset Catalog ──
// All splash screen assets organized for the Easter egg gallery

// Classic (Variant 1) — Mobile (Portrait)
import classicMorning from "@/assets/splash-morning.webp";
import classicAfternoon from "@/assets/splash-afternoon.webp";
import classicEvening from "@/assets/splash-evening.webp";
import classicNight from "@/assets/splash-night.webp";

// Classic (Variant 1) — Desktop (Landscape)
import classicMorningDesktop from "@/assets/splash-morning-desktop.webp";
import classicAfternoonDesktop from "@/assets/splash-afternoon-desktop.webp";
import classicEveningDesktop from "@/assets/splash-evening-desktop.webp";
import classicNightDesktop from "@/assets/splash-night-desktop.webp";

// Cinematic (Variant 2) — Mobile (Portrait)
import cinematicDawn from "@/assets/splash2-dawn-v2.jpg";
import cinematicDay from "@/assets/splash2-day-v2.jpg";
import cinematicDusk from "@/assets/splash2-dusk-v2.jpg";
import cinematicNight from "@/assets/splash2-night-v2.jpg";

// Cinematic (Variant 2) — Desktop (Landscape)
import cinematicDawnDesktop from "@/assets/splash2-dawn-v2-desktop.jpg";
import cinematicDayDesktop from "@/assets/splash2-day-v2-desktop.jpg";
import cinematicDuskDesktop from "@/assets/splash2-dusk-v2-desktop.jpg";
import cinematicNightDesktop from "@/assets/splash2-night-v2-desktop.jpg";

// App Icon
import appIcon from "/pwa-icon-512.png";

export interface WallpaperItem {
  id: string;
  label: string;
  timeOfDay: string;
  variant: "classic" | "cinematic";
  format: "phone" | "desktop";
  src: string;
  emoji: string;
}

export const wallpapers: WallpaperItem[] = [
  // Classic Phone
  { id: "classic-morning-phone", label: "Classic Morning", timeOfDay: "Morning", variant: "classic", format: "phone", src: classicMorning, emoji: "☀️" },
  { id: "classic-afternoon-phone", label: "Classic Afternoon", timeOfDay: "Afternoon", variant: "classic", format: "phone", src: classicAfternoon, emoji: "🌤️" },
  { id: "classic-evening-phone", label: "Classic Evening", timeOfDay: "Evening", variant: "classic", format: "phone", src: classicEvening, emoji: "🌅" },
  { id: "classic-night-phone", label: "Classic Night", timeOfDay: "Night", variant: "classic", format: "phone", src: classicNight, emoji: "🌙" },

  // Classic Desktop
  { id: "classic-morning-desktop", label: "Classic Morning", timeOfDay: "Morning", variant: "classic", format: "desktop", src: classicMorningDesktop, emoji: "☀️" },
  { id: "classic-afternoon-desktop", label: "Classic Afternoon", timeOfDay: "Afternoon", variant: "classic", format: "desktop", src: classicAfternoonDesktop, emoji: "🌤️" },
  { id: "classic-evening-desktop", label: "Classic Evening", timeOfDay: "Evening", variant: "classic", format: "desktop", src: classicEveningDesktop, emoji: "🌅" },
  { id: "classic-night-desktop", label: "Classic Night", timeOfDay: "Night", variant: "classic", format: "desktop", src: classicNightDesktop, emoji: "🌙" },

  // Cinematic Phone
  { id: "cinematic-dawn-phone", label: "Island Dawn", timeOfDay: "Dawn", variant: "cinematic", format: "phone", src: cinematicDawn, emoji: "🌅" },
  { id: "cinematic-day-phone", label: "Island Day", timeOfDay: "Day", variant: "cinematic", format: "phone", src: cinematicDay, emoji: "☀️" },
  { id: "cinematic-dusk-phone", label: "Island Dusk", timeOfDay: "Dusk", variant: "cinematic", format: "phone", src: cinematicDusk, emoji: "🌇" },
  { id: "cinematic-night-phone", label: "Island Night", timeOfDay: "Night", variant: "cinematic", format: "phone", src: cinematicNight, emoji: "🌙" },

  // Cinematic Desktop
  { id: "cinematic-dawn-desktop", label: "Island Dawn", timeOfDay: "Dawn", variant: "cinematic", format: "desktop", src: cinematicDawnDesktop, emoji: "🌅" },
  { id: "cinematic-day-desktop", label: "Island Day", timeOfDay: "Day", variant: "cinematic", format: "desktop", src: cinematicDayDesktop, emoji: "☀️" },
  { id: "cinematic-dusk-desktop", label: "Island Dusk", timeOfDay: "Dusk", variant: "cinematic", format: "desktop", src: cinematicDuskDesktop, emoji: "🌇" },
  { id: "cinematic-night-desktop", label: "Island Night", timeOfDay: "Night", variant: "cinematic", format: "desktop", src: cinematicNightDesktop, emoji: "🌙" },
];

export const appIconAsset = {
  id: "app-icon",
  label: "Hushh App Icon",
  src: appIcon,
  emoji: "🏝️",
};
