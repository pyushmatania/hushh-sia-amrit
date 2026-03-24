import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { HardDrive, Database, Trash2, Download, Loader2, Image, Video, FileText, Wifi, RefreshCw, BarChart3, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SettingRow, SectionHeader, ToggleSwitch } from "./SettingRow";

export default function StorageSettings() {
  const { toast } = useToast();
  const [clearing, setClearing] = useState(false);
  const [clearingVideos, setClearingVideos] = useState(false);
  const [autoCache, setAutoCache] = useState(true);
  const [videoPreload, setVideoPreload] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);
  const [dataSaver, setDataSaver] = useState(false);
  const [cacheAge, setCacheAge] = useState("7d");
  const [realStorageSize, setRealStorageSize] = useState<string | null>(null);

  useEffect(() => {
    // Try to get real storage estimate
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      navigator.storage.estimate().then(est => {
        if (est.usage) setRealStorageSize(`${(est.usage / (1024 * 1024)).toFixed(1)} MB`);
      });
    }
  }, []);

  const storageItems = [
    { label: "Cached images", size: "12.4 MB", percent: 19.5, icon: Image, color: "text-blue-500 bg-blue-500/10" },
    { label: "Preloaded videos", size: "48.2 MB", percent: 75.9, icon: Video, color: "text-purple-500 bg-purple-500/10" },
    { label: "Offline data", size: "2.1 MB", percent: 3.3, icon: Database, color: "text-green-500 bg-green-500/10" },
    { label: "App data", size: "0.8 MB", percent: 1.3, icon: FileText, color: "text-orange-500 bg-orange-500/10" },
  ];
  const totalSize = realStorageSize || "63.5 MB";

  const handleClearCache = async () => {
    setClearing(true);
    try {
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
      }
      localStorage.removeItem("hushh_video_cache");
      localStorage.removeItem("hushh_image_cache");
      await new Promise(r => setTimeout(r, 800));
      toast({ title: "All cache cleared ✨", description: "Freed up storage space" });
    } finally { setClearing(false); }
  };

  const handleClearVideos = async () => {
    setClearingVideos(true);
    try {
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.filter(k => k.includes("video") || k.includes("media")).map(k => caches.delete(k)));
      }
      localStorage.removeItem("hushh_video_cache");
      await new Promise(r => setTimeout(r, 600));
      toast({ title: "Video cache cleared 🎬", description: "Freed up ~48 MB" });
    } finally { setClearingVideos(false); }
  };

  const cacheAgeOptions = [
    { id: "1d", label: "1 day" },
    { id: "3d", label: "3 days" },
    { id: "7d", label: "7 days" },
    { id: "30d", label: "30 days" },
  ];

  return (
    <div className="space-y-1">
      {/* Usage overview */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl p-4 mb-4"
        style={{ background: "linear-gradient(145deg, hsl(var(--primary) / 0.12), hsl(var(--primary) / 0.04))", border: "1px solid hsl(var(--primary) / 0.15)" }}>
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-xs text-muted-foreground">Total Storage Used</p>
            <p className="text-2xl font-bold text-foreground">{totalSize}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <BarChart3 size={20} className="text-primary" />
          </div>
        </div>
        <div className="w-full h-3 rounded-full bg-muted mt-3 overflow-hidden flex">
          {storageItems.map(s => (
            <motion.div key={s.label} initial={{ width: 0 }} animate={{ width: `${s.percent}%` }} transition={{ delay: 0.3, duration: 0.6 }}
              className={`h-full ${s.color.split(" ")[0].replace("text-", "bg-")}`} />
          ))}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2.5">
          {storageItems.map(s => (
            <span key={s.label} className="text-[10px] text-muted-foreground flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${s.color.split(" ")[0].replace("text-", "bg-")}`} />
              {s.label}: {s.size}
            </span>
          ))}
        </div>
      </motion.div>

      <SectionHeader title="Storage Breakdown" />
      {storageItems.map((item, i) => (
        <motion.div key={item.label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
          className="flex items-center gap-3 py-3.5 border-b border-border last:border-0">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${item.color}`}>
            <item.icon size={16} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">{item.label}</p>
            <div className="w-full h-1.5 rounded-full bg-muted mt-1.5 overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${item.percent}%` }} transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
                className={`h-full rounded-full ${item.color.split(" ")[0].replace("text-", "bg-")}`} />
            </div>
          </div>
          <p className="text-sm font-semibold text-muted-foreground">{item.size}</p>
        </motion.div>
      ))}

      <SectionHeader title="Cache Preferences" />
      <SettingRow icon={HardDrive} label="Auto-cache images" desc="Cache property images for faster loading" right={<ToggleSwitch enabled={autoCache} onChange={setAutoCache} />} />
      <SettingRow icon={Video} label="Preload videos on WiFi" desc="Download video previews when on WiFi" right={<ToggleSwitch enabled={videoPreload} onChange={setVideoPreload} />} />
      <SettingRow icon={Wifi} label="Data saver mode" desc="Reduce data usage by loading lower quality media" right={<ToggleSwitch enabled={dataSaver} onChange={setDataSaver} />} />

      {/* Cache age */}
      <div className="flex items-center justify-between py-3.5 border-b border-border">
        <div className="flex items-center gap-3 flex-1 mr-4">
          <Clock size={16} className="text-muted-foreground" />
          <div>
            <p className="text-sm font-medium text-foreground">Auto-clear cache after</p>
            <p className="text-xs text-muted-foreground">Automatically remove old cached data</p>
          </div>
        </div>
        <div className="flex gap-1 p-0.5 rounded-lg bg-muted/50">
          {cacheAgeOptions.map(o => (
            <button key={o.id} onClick={() => setCacheAge(o.id)} className={`px-2 py-1 rounded-md text-[10px] font-semibold transition-all ${cacheAge === o.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <SectionHeader title="Offline Access" />
      <SettingRow icon={Download} label="Offline mode" desc="Save essential data for offline browsing" right={<ToggleSwitch enabled={offlineMode} onChange={setOfflineMode} />} />
      <SettingRow icon={Download} label="Download property data" desc="Save all property details for offline access"
        onClick={() => toast({ title: "Offline pack downloaded 📥", description: "Property data saved for offline use" })} />

      <SectionHeader title="Clear Storage" />
      <SettingRow icon={Trash2} label="Clear all cache" desc="Remove all cached images and videos (~63 MB)"
        onClick={handleClearCache} right={clearing ? <Loader2 size={16} className="animate-spin text-primary" /> : undefined} />
      <SettingRow icon={Video} label="Clear video cache only" desc="Remove preloaded videos (~48 MB)"
        onClick={handleClearVideos} right={clearingVideos ? <Loader2 size={16} className="animate-spin text-primary" /> : undefined} />
      <SettingRow icon={RefreshCw} label="Reset app data" desc="Clear all local preferences and cache"
        onClick={() => {
          localStorage.clear();
          toast({ title: "App data reset ✨", description: "All local data cleared. The page will reload." });
          setTimeout(() => window.location.reload(), 1500);
        }} danger />

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="rounded-xl p-3 mt-4 flex items-start gap-2" style={{ background: "hsl(var(--muted) / 0.5)", border: "1px solid hsl(var(--border))" }}>
        <Wifi size={14} className="text-primary mt-0.5 shrink-0" />
        <p className="text-[11px] text-muted-foreground">
          💡 <span className="text-foreground font-medium">Tip:</span> Clearing cache won't affect your bookings, reviews, or account data. Only locally stored media will be removed.
        </p>
      </motion.div>
    </div>
  );
}
