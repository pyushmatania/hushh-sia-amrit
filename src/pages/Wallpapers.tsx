import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Download, Smartphone, Monitor, Sparkles, Image as ImageIcon } from "lucide-react";
import { wallpapers, appIconAsset, type WallpaperItem } from "@/data/wallpapers";

type Filter = "all" | "classic" | "cinematic";
type Format = "all" | "phone" | "desktop";

async function downloadImage(src: string, filename: string) {
  try {
    const resp = await fetch(src);
    const blob = await resp.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch {
    window.open(src, "_blank");
  }
}

function WallpaperCard({ item }: { item: WallpaperItem }) {
  const isPhone = item.format === "phone";
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`group relative rounded-2xl overflow-hidden cursor-pointer ${
        isPhone ? "aspect-[9/16]" : "aspect-video"
      }`}
      onClick={() => downloadImage(item.src, `hushh-${item.id}.${item.src.includes(".webp") ? "webp" : "jpg"}`)}
    >
      <img src={item.src} alt={item.label} className="w-full h-full object-cover" loading="lazy" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute bottom-0 inset-x-0 p-3 flex items-end justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div>
          <p className="text-xs font-semibold text-white">{item.emoji} {item.label}</p>
          <p className="text-[10px] text-white/60 flex items-center gap-1 mt-0.5">
            {isPhone ? <Smartphone className="w-3 h-3" /> : <Monitor className="w-3 h-3" />}
            {isPhone ? "Phone" : "Desktop"}
          </p>
        </div>
        <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <Download className="w-4 h-4 text-white" />
        </div>
      </div>
    </motion.div>
  );
}

export default function WallpapersPage({ onBack }: { onBack?: () => void }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [format, setFormat] = useState<Format>("all");

  const filtered = wallpapers.filter(
    (w) => (filter === "all" || w.variant === filter) && (format === "all" || w.format === format)
  );

  const phoneItems = filtered.filter((w) => w.format === "phone");
  const desktopItems = filtered.filter((w) => w.format === "desktop");

  const pillClass = useCallback(
    (active: boolean) =>
      `px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
        active
          ? "bg-primary text-primary-foreground shadow-lg"
          : "bg-muted text-muted-foreground hover:bg-muted/80"
      }`,
    []
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div className="flex-1">
            <h1 className="text-lg font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" /> Hushh Wallpapers
            </h1>
            <p className="text-xs text-muted-foreground">Tap any wallpaper to download</p>
          </div>
        </div>

        {/* Filters */}
        <div className="max-w-6xl mx-auto px-4 pb-3 flex flex-wrap gap-2">
          <button className={pillClass(filter === "all")} onClick={() => setFilter("all")}>All</button>
          <button className={pillClass(filter === "classic")} onClick={() => setFilter("classic")}>🎨 Classic</button>
          <button className={pillClass(filter === "cinematic")} onClick={() => setFilter("cinematic")}>🏝️ Cinematic</button>
          <div className="w-px h-6 bg-border self-center mx-1" />
          <button className={pillClass(format === "all")} onClick={() => setFormat("all")}>All Sizes</button>
          <button className={pillClass(format === "phone")} onClick={() => setFormat("phone")}>📱 Phone</button>
          <button className={pillClass(format === "desktop")} onClick={() => setFormat("desktop")}>🖥️ Desktop</button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-10">
        {/* App Icon */}
        <section>
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
            <ImageIcon className="w-4 h-4" /> App Icon
          </h2>
          <motion.div
            className="w-28 h-28 md:w-36 md:h-36 rounded-[28px] overflow-hidden shadow-2xl cursor-pointer group relative"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => downloadImage(appIconAsset.src, "hushh-app-icon.png")}
          >
            <img src={appIconAsset.src} alt="Hushh Icon" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Download className="w-6 h-6 text-white" />
            </div>
          </motion.div>
        </section>

        {/* Phone Wallpapers */}
        {(format === "all" || format === "phone") && phoneItems.length > 0 && (
          <section>
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
              <Smartphone className="w-4 h-4" /> Phone Wallpapers
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              <AnimatePresence mode="popLayout">
                {phoneItems.map((w) => <WallpaperCard key={w.id} item={w} />)}
              </AnimatePresence>
            </div>
          </section>
        )}

        {/* Desktop Wallpapers */}
        {(format === "all" || format === "desktop") && desktopItems.length > 0 && (
          <section>
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
              <Monitor className="w-4 h-4" /> Desktop Wallpapers
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence mode="popLayout">
                {desktopItems.map((w) => <WallpaperCard key={w.id} item={w} />)}
              </AnimatePresence>
            </div>
          </section>
        )}

        <p className="text-center text-xs text-muted-foreground py-8">
          🤫 You found the secret wallpaper gallery — enjoy!
        </p>
      </div>
    </div>
  );
}
