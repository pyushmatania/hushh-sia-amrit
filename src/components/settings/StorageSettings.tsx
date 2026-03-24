import { useState } from "react";
import { motion } from "framer-motion";
import { HardDrive, Database, Trash2, Download, Loader2, Image, Video, FileText, Wifi } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SettingRow, SectionHeader, ToggleSwitch } from "./SettingRow";

export default function StorageSettings() {
  const { toast } = useToast();
  const [clearing, setClearing] = useState(false);
  const [autoCache, setAutoCache] = useState(true);
  const [videoPreload, setVideoPreload] = useState(true);

  const storageItems = [
    { label: "Cached images", size: "12.4 MB", icon: Image, color: "text-blue-500 bg-blue-500/10" },
    { label: "Preloaded videos", size: "48.2 MB", icon: Video, color: "text-purple-500 bg-purple-500/10" },
    { label: "Offline data", size: "2.1 MB", icon: Database, color: "text-green-500 bg-green-500/10" },
    { label: "App data", size: "0.8 MB", icon: FileText, color: "text-orange-500 bg-orange-500/10" },
  ];

  const totalSize = 63.5;

  const handleClearCache = async () => {
    setClearing(true);
    try {
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
      }
      localStorage.removeItem("hushh_video_cache");
      await new Promise(r => setTimeout(r, 800));
      toast({ title: "Cache cleared ✨", description: "Freed up 63.5 MB of storage" });
    } finally { setClearing(false); }
  };

  return (
    <div className="space-y-1">
      {/* Usage overview */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl p-4 mb-4" style={{ background: "linear-gradient(145deg, hsl(var(--primary) / 0.12), hsl(var(--primary) / 0.04))", border: "1px solid hsl(var(--primary) / 0.15)" }}>
        <p className="text-xs text-muted-foreground mb-1">Total Storage Used</p>
        <p className="text-2xl font-bold text-foreground">{totalSize} MB</p>
        <div className="w-full h-2 rounded-full bg-muted mt-3 overflow-hidden">
          <div className="h-full rounded-full flex">
            <div className="bg-blue-500 h-full" style={{ width: "19.5%" }} />
            <div className="bg-purple-500 h-full" style={{ width: "75.9%" }} />
            <div className="bg-green-500 h-full" style={{ width: "3.3%" }} />
            <div className="bg-orange-500 h-full" style={{ width: "1.3%" }} />
          </div>
        </div>
        <div className="flex flex-wrap gap-3 mt-2">
          {storageItems.map(s => (
            <span key={s.label} className="text-[10px] text-muted-foreground flex items-center gap-1">
              <s.icon size={10} /> {s.size}
            </span>
          ))}
        </div>
      </motion.div>

      <SectionHeader title="Storage Breakdown" />
      {storageItems.map((item, i) => (
        <motion.div key={item.label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center gap-3 py-3.5 border-b border-border last:border-0">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${item.color}`}>
            <item.icon size={16} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">{item.label}</p>
          </div>
          <p className="text-sm font-semibold text-muted-foreground">{item.size}</p>
        </motion.div>
      ))}

      <SectionHeader title="Preferences" />
      <SettingRow icon={HardDrive} label="Auto-cache images" desc="Cache property images for faster loading" right={<ToggleSwitch enabled={autoCache} onChange={setAutoCache} />} />
      <SettingRow icon={Video} label="Preload videos on WiFi" desc="Download video previews when on WiFi" right={<ToggleSwitch enabled={videoPreload} onChange={setVideoPreload} />} />

      <SectionHeader title="Actions" />
      <SettingRow icon={Trash2} label="Clear all cache" desc="Remove cached images and videos" onClick={handleClearCache} right={clearing ? <Loader2 size={16} className="animate-spin text-primary" /> : undefined} />
      <SettingRow icon={Download} label="Download for offline" desc="Save property data for offline browsing" onClick={() => toast({ title: "Offline pack downloaded 📥" })} />

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="rounded-xl p-3 mt-4 flex items-start gap-2" style={{ background: "hsl(var(--muted) / 0.5)", border: "1px solid hsl(var(--border))" }}>
        <Wifi size={14} className="text-primary mt-0.5 shrink-0" />
        <p className="text-[11px] text-muted-foreground">
          💡 <span className="text-foreground font-medium">Tip:</span> Clearing cache won't affect your bookings or account data. Images and videos will reload on next visit.
        </p>
      </motion.div>
    </div>
  );
}
