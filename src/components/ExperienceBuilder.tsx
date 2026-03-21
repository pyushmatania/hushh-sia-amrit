import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Minus, Check, ChefHat, Palette, Music, Wifi, Armchair, Camera, Flame, Sparkles, X, ChevronRight, Search, Star, Zap } from "lucide-react";
import { useState, useMemo, useRef } from "react";
import type { Property } from "@/data/properties";
import { usePropertiesData } from "@/contexts/PropertiesContext";

const categoryConfig: Record<string, { icon: typeof ChefHat; emoji: string; accent: string }> = {
  "Food & Drinks": { icon: ChefHat, emoji: "🍽️", accent: "from-amber-500/20 to-orange-500/10" },
  "Decoration": { icon: Palette, emoji: "🎨", accent: "from-rose-500/20 to-pink-500/10" },
  "Music & Entertainment": { icon: Music, emoji: "🎵", accent: "from-violet-500/20 to-purple-500/10" },
  "Activities": { icon: Flame, emoji: "🏊", accent: "from-orange-500/20 to-red-500/10" },
  "Work Add-ons": { icon: Wifi, emoji: "💻", accent: "from-emerald-500/20 to-teal-500/10" },
  "Comfort Add-ons": { icon: Armchair, emoji: "🛏️", accent: "from-sky-500/20 to-blue-500/10" },
  "Staff & Extras": { icon: Camera, emoji: "📸", accent: "from-pink-500/20 to-fuchsia-500/10" },
};

const addonImages: Record<string, string> = {
  "Tribal Thali": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop&q=75",
  "BBQ Platter": "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=400&h=300&fit=crop&q=75",
  "Chai & Maggi Station": "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop&q=75",
  "Pizza Station": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop&q=75",
  "Dessert Bar": "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop&q=75",
  "Beer Bucket (6)": "https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=400&h=300&fit=crop&q=75",
  "Soft Drinks + Ice": "https://images.unsplash.com/photo-1527960471264-932f39eb5846?w=400&h=300&fit=crop&q=75",
  "Custom Cake": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop&q=75",
  "Romantic Setup": "https://images.unsplash.com/photo-1529636798458-92182e662485?w=400&h=300&fit=crop&q=75",
  "Birthday Setup": "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&h=300&fit=crop&q=75",
  "Neon Sign": "https://images.unsplash.com/photo-1563281577-a3c3ab4e3b1c?w=400&h=300&fit=crop&q=75",
  "Fog Machine": "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&h=300&fit=crop&q=75",
  "Flower Wall": "https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=400&h=300&fit=crop&q=75",
  "Bluetooth Speaker": "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=300&fit=crop&q=75",
  "DJ (2 hours)": "https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=400&h=300&fit=crop&q=75",
  "Karaoke Setup": "https://images.unsplash.com/photo-1516280440614-37b910d0616e?w=400&h=300&fit=crop&q=75",
  "Live Acoustic": "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&h=300&fit=crop&q=75",
  "PS5 Console": "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=300&fit=crop&q=75",
  "Projector + Screen": "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&h=300&fit=crop&q=75",
  "Pool Access": "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=400&h=300&fit=crop&q=75",
  "Pickleball Court": "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400&h=300&fit=crop&q=75",
  "Telescope Session": "https://images.unsplash.com/photo-1532978379173-523e16f371f2?w=400&h=300&fit=crop&q=75",
  "Tribal Dance Class": "https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=400&h=300&fit=crop&q=75",
  "Bonfire Setup": "https://images.unsplash.com/photo-1475483768296-6163e08872a1?w=400&h=300&fit=crop&q=75",
  "WiFi Boost": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=300&fit=crop&q=75",
  "Work Desk Setup": "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&h=300&fit=crop&q=75",
  "Unlimited Coffee": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop&q=75",
  "Quiet Room Access": "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop&q=75",
  "Extra Mattress": "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=300&fit=crop&q=75",
  "AC Upgrade": "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&h=300&fit=crop&q=75",
  "Premium Seating": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop&q=75",
  "Extra Hour": "https://images.unsplash.com/photo-1501139083538-0139583c060f?w=400&h=300&fit=crop&q=75",
  "Early Check-in": "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=400&h=300&fit=crop&q=75",
  "Late Checkout": "https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=400&h=300&fit=crop&q=75",
  "Photographer": "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=400&h=300&fit=crop&q=75",
  "Surprise Reveal": "https://images.unsplash.com/photo-1549465220-1a8b9238f4e1?w=400&h=300&fit=crop&q=75",
  "Candlelight Dinner": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop&q=75",
  "Fireworks Mini": "https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=400&h=300&fit=crop&q=75",
  "Video Reel": "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400&h=300&fit=crop&q=75",
  "Private Chef": "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&h=300&fit=crop&q=75",
  "Cleanup Crew": "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop&q=75",
  "Pickup & Drop": "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400&h=300&fit=crop&q=75",
  "Coca-Cola": "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&h=300&fit=crop&q=75",
  "Bud Light": "https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=400&h=300&fit=crop&q=75",
  "Marshmallows": "https://images.unsplash.com/photo-1514517220017-8ce97a34a7b6?w=400&h=300&fit=crop&q=75",
};

function AddonImage({ src, alt, className }: { src?: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return <div className={`${className} flex items-center justify-center text-2xl bg-secondary`}>🍽️</div>;
  }
  return <img src={src} alt={alt} className={className} loading="lazy" onError={() => setFailed(true)} />;
}

interface ExperienceBuilderProps {
  property: Property;
  slotId: string;
  guests: number;
  date: Date;
  onBack: () => void;
  onContinue: (selections: Record<string, number>, total: number) => void;
  extras?: Property[];
}

export default function ExperienceBuilder({ property, slotId, guests, date, onBack, onContinue, extras }: ExperienceBuilderProps) {
  const { addons } = usePropertiesData();
  const [selections, setSelections] = useState<Record<string, number>>({});
  const [hapticId, setHapticId] = useState<string | null>(null);
  const slot = property.slots.find((s) => s.id === slotId)!;
  const categories = Object.keys(addons);
  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const tabsRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const triggerHaptic = (id: string, isAdd: boolean) => {
    if (navigator.vibrate) {
      navigator.vibrate(isAdd ? [15, 30, 15] : [10]);
    }
    setHapticId(id);
    setTimeout(() => setHapticId(null), 400);
  };

  const toggle = (id: string, delta: number) => {
    triggerHaptic(id, delta > 0);
    setSelections((prev) => {
      const next = { ...prev };
      const val = (next[id] || 0) + delta;
      if (val <= 0) delete next[id];
      else next[id] = val;
      return next;
    });
  };

  const addonTotal = useMemo(() => Object.entries(selections).reduce((sum, [id, qty]) => {
    for (const group of Object.values(addons)) {
      const item = group.find((a) => a.id === id);
      if (item) return sum + item.price * qty * (item.perPerson ? guests : 1);
    }
    return sum;
  }, 0), [selections, guests]);

  const selectedCount = Object.keys(selections).length;
  const total = slot.price + addonTotal;

  const selectedItems = useMemo(() => {
    const items: { id: string; name: string; emoji: string; qty: number; price: number; perPerson?: boolean }[] = [];
    Object.entries(selections).forEach(([id, qty]) => {
      for (const group of Object.values(addons)) {
        const item = group.find((a) => a.id === id);
        if (item) {
          items.push({ id: item.id, name: item.name, emoji: item.categoryEmoji, qty, price: item.price, perPerson: item.perPerson });
        }
      }
    });
    return items;
  }, [selections]);

  const extrasTotal = (extras || []).reduce((sum, ext) => {
    const cheapest = ext.slots.filter(s => s.available).sort((a, b) => a.price - b.price)[0];
    return sum + (cheapest?.price || ext.basePrice);
  }, 0);

  const popularIds = new Set(["f1", "f2", "d1", "d2", "m4", "a5", "e1", "e3"]);
  const popularItems = useMemo(() =>
    Object.values(addons).flat().filter(item => popularIds.has(item.id)),
  []);

  const isSearching = searchQuery.trim().length > 0;
  const activeItems = isSearching
    ? Object.values(addons).flat().filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : addons[activeCategory] || [];

  const activeCatConfig = categoryConfig[activeCategory];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-30 flex flex-col"
      style={{ background: "linear-gradient(180deg, hsl(var(--background)) 0%, hsl(260 20% 8%) 100%)" }}
    >
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[200px] rounded-full pointer-events-none opacity-30"
        style={{ background: "radial-gradient(ellipse, hsl(var(--primary) / 0.4) 0%, transparent 70%)", filter: "blur(60px)" }}
      />

      {/* Header — minimal & elegant */}
      <div className="shrink-0 relative z-10 px-5 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-10 h-10 rounded-2xl bg-foreground/[0.06] border border-border/50 flex items-center justify-center backdrop-blur-sm active:scale-95 transition-transform">
            <ArrowLeft size={18} className="text-foreground" />
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-lg text-foreground tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Build your vibe
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] text-muted-foreground">{slot.label}</span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
              <span className="text-[11px] text-muted-foreground">{slot.time}</span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
              <span className="text-[11px] text-primary font-medium">{guests} guests</span>
            </div>
          </div>
          {selectedCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-9 h-9 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center"
            >
              <span className="text-xs font-bold text-primary">{selectedCount}</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Selected add-ons — compact chips */}
      <AnimatePresence>
        {selectedCount > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="shrink-0 px-5 pb-2 overflow-hidden"
          >
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
              {selectedItems.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="shrink-0 flex items-center gap-1.5 bg-primary/[0.08] border border-primary/20 rounded-full px-2.5 py-1"
                >
                  <span className="text-[10px]">{item.emoji}</span>
                  <span className="text-[10px] font-medium text-foreground whitespace-nowrap">{item.name}</span>
                  {item.qty > 1 && <span className="text-[9px] text-primary font-bold">×{item.qty}</span>}
                  <button
                    onClick={() => toggle(item.id, -selections[item.id])}
                    className="w-3.5 h-3.5 rounded-full bg-foreground/10 flex items-center justify-center"
                  >
                    <X size={7} className="text-muted-foreground" />
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pre-selected extras */}
      <AnimatePresence>
        {extras && extras.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="shrink-0 px-5 pb-2 overflow-hidden"
          >
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {extras.map((ext) => {
                const cheapest = ext.slots.filter(s => s.available).sort((a, b) => a.price - b.price)[0];
                return (
                  <div key={ext.id} className="shrink-0 flex items-center gap-2 bg-primary/[0.05] border border-primary/15 rounded-xl px-3 py-1.5">
                    <img src={ext.images[0]} alt="" className="w-7 h-7 rounded-lg object-cover" />
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold text-foreground truncate max-w-[90px]">{ext.name}</p>
                      <p className="text-[9px] text-primary font-medium">₹{(cheapest?.price || ext.basePrice).toLocaleString()}</p>
                    </div>
                    <Check size={10} className="text-primary shrink-0" />
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search — sleeker */}
      <div className="shrink-0 px-5 pb-3">
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search add-ons…"
            className="w-full rounded-2xl pl-10 pr-9 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-all border border-border/40 focus:border-primary/40"
            style={{
              background: "linear-gradient(135deg, hsla(0,0%,100%,0.03) 0%, hsla(0,0%,100%,0.01) 100%)",
              backdropFilter: "blur(12px)",
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-foreground/10 flex items-center justify-center"
            >
              <X size={10} className="text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto overscroll-contain pb-24" style={{ WebkitOverflowScrolling: "touch" }}>

        {/* Smart Nudges — people also added */}
        {!isSearching && selectedCount > 0 && (
          <div className="px-5 pb-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-emerald-400/20 to-green-500/20 flex items-center justify-center">
                <Sparkles size={11} className="text-emerald-400" />
              </div>
              <span className="text-xs font-bold text-foreground tracking-wide">People also added</span>
              <div className="flex-1 h-[1px] bg-gradient-to-r from-border/50 to-transparent ml-2" />
            </div>
            <div className="space-y-2">
              {(() => {
                // Smart suggestions based on what's selected
                const selectedIds = new Set(Object.keys(selections));
                const nudges: { item: typeof activeItems[0]; reason: string; savings?: number }[] = [];
                
                // Beer + BBQ combo
                if (selectedIds.has("f2") && !selectedIds.has("f6")) {
                  const beer = Object.values(addons).flat().find(a => a.id === "f6");
                  if (beer) nudges.push({ item: beer, reason: "🍺 Add beer for ₹299 — perfect with BBQ!", savings: 100 });
                }
                // Romantic setup + candle dinner
                if (selectedIds.has("d1") && !selectedIds.has("e3")) {
                  const candle = Object.values(addons).flat().find(a => a.id === "e3");
                  if (candle) nudges.push({ item: candle, reason: "🕯️ Add Candlelight Dinner — complete the vibe", savings: 200 });
                }
                // Speaker + DJ combo
                if (selectedIds.has("m1") && !selectedIds.has("m2")) {
                  const dj = Object.values(addons).flat().find(a => a.id === "m2");
                  if (dj) nudges.push({ item: dj, reason: "🎧 Add DJ — upgrade the party!", savings: 300 });
                }
                // Bonfire + marshmallow
                if (selectedIds.has("a5") && !selectedIds.has("f1")) {
                  const maggi = Object.values(addons).flat().find(a => a.id === "f1");
                  if (maggi) nudges.push({ item: maggi, reason: "🍜 Add Maggi Station — bonfire essential!" });
                }
                // Fallback nudges
                if (nudges.length === 0) {
                  const unselected = Object.values(addons).flat().filter(a => !selectedIds.has(a.id) && popularIds.has(a.id)).slice(0, 2);
                  unselected.forEach(item => nudges.push({ item, reason: `${item.categoryEmoji} Popular with your picks` }));
                }
                
                return nudges.slice(0, 2).map(({ item, reason, savings }) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 rounded-2xl p-3"
                    style={{
                      background: "linear-gradient(135deg, hsl(var(--primary) / 0.06) 0%, hsl(var(--success) / 0.04) 100%)",
                      border: "1px solid hsl(var(--primary) / 0.15)",
                    }}
                  >
                    <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0">
                      <AddonImage src={addonImages[item.name]} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-foreground font-medium leading-tight">{reason}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] font-bold text-foreground">₹{item.price}</span>
                        {savings && (
                          <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                            Save ₹{savings}
                          </span>
                        )}
                      </div>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggle(item.id, 1)}
                      className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-[10px] font-bold shrink-0"
                    >
                      + Add
                    </motion.button>
                  </motion.div>
                ));
              })()}
            </div>
          </div>
        )}

        {/* Popular picks — editorial style */}
        {!isSearching && (
          <div className="px-5 pb-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-amber-400/20 to-orange-500/20 flex items-center justify-center">
                <Zap size={11} className="text-amber-400" />
              </div>
              <span className="text-xs font-bold text-foreground tracking-wide">Quick adds</span>
              <div className="flex-1 h-[1px] bg-gradient-to-r from-border/50 to-transparent ml-2" />
            </div>
            <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-1">
              {popularItems.map((item) => {
                const qty = selections[item.id] || 0;
                const imgUrl = addonImages[item.name];
                return (
                  <motion.button
                    key={item.id}
                    onClick={() => toggle(item.id, qty > 0 ? -qty : 1)}
                    whileTap={{ scale: 0.95 }}
                    className={`shrink-0 w-[100px] rounded-2xl overflow-hidden transition-all ${
                      qty > 0
                        ? "ring-2 ring-primary/50 ring-offset-1 ring-offset-background"
                        : ""
                    }`}
                    style={{
                      boxShadow: qty > 0
                        ? "0 4px 20px -4px hsl(var(--primary) / 0.3)"
                        : "0 2px 8px -2px hsla(0,0%,0%,0.3)",
                    }}
                  >
                    <div className="relative aspect-square overflow-hidden">
                      <AddonImage src={imgUrl} alt={item.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      {qty > 0 && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                          style={{ boxShadow: "0 2px 8px hsl(var(--primary) / 0.5)" }}
                        >
                          <Check size={10} className="text-primary-foreground" />
                        </motion.div>
                      )}
                      {/* Name overlay on image */}
                      <div className="absolute bottom-0 left-0 right-0 p-2">
                        <p className="text-[10px] font-bold text-white leading-tight line-clamp-1">{item.name}</p>
                        <p className="text-[10px] font-semibold text-primary-foreground/80 mt-0.5">
                          {item.price === 0 ? "Free" : `₹${item.price}`}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}

        {/* Category tabs — pill style */}
        {!isSearching && (
          <div ref={tabsRef} className="shrink-0 flex gap-2 overflow-x-auto px-5 pb-4 scrollbar-hide">
            {categories.map((cat) => {
              const conf = categoryConfig[cat];
              const isActive = activeCategory === cat;
              const catItemCount = addons[cat].filter(a => selections[a.id]).length;
              return (
                <motion.button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  whileTap={{ scale: 0.95 }}
                  className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-[11px] font-semibold transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-[0_4px_16px_-4px_hsl(var(--primary)/0.5)]"
                      : "bg-foreground/[0.04] text-muted-foreground border border-border/30 hover:bg-foreground/[0.06]"
                  }`}
                >
                  <span className="text-sm">{conf?.emoji || "✦"}</span>
                  <span className="whitespace-nowrap">{cat}</span>
                  {catItemCount > 0 && (
                    <span className={`w-4 h-4 rounded-full text-[8px] flex items-center justify-center font-bold ${
                      isActive
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-primary text-primary-foreground"
                    }`}>
                      {catItemCount}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
        )}

        {isSearching && (
          <div className="px-5 pb-3">
            <p className="text-[11px] text-muted-foreground">
              {activeItems.length} result{activeItems.length !== 1 ? "s" : ""} for "<span className="text-foreground font-medium">{searchQuery}</span>"
            </p>
          </div>
        )}

        {/* Category accent gradient behind items */}
        {!isSearching && activeCatConfig && (
          <div className="px-5 pb-2">
            <div className={`rounded-2xl bg-gradient-to-r ${activeCatConfig.accent} px-4 py-2.5 flex items-center gap-2`}>
              <span className="text-lg">{activeCatConfig.emoji}</span>
              <span className="text-xs font-semibold text-foreground">{activeCategory}</span>
              <span className="text-[10px] text-muted-foreground ml-auto">{activeItems.length} items</span>
            </div>
          </div>
        )}

        {/* Add-on cards */}
        <div className="px-5 pt-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={isSearching ? `search-${searchQuery}` : activeCategory}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="space-y-3"
            >
              {activeItems.map((item, idx) => {
                const qty = selections[item.id] || 0;
                const isFree = item.price === 0;
                const imgUrl = addonImages[item.name];

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    // Haptic bounce
                    {...(hapticId === item.id ? {
                      animate: { scale: [1, 1.02, 0.98, 1], opacity: 1, y: 0 },
                      transition: { duration: 0.35, ease: "easeOut" },
                    } : {})}
                    className={`flex gap-3 rounded-2xl p-2.5 transition-all ${
                      qty > 0
                        ? "bg-primary/[0.06] border border-primary/25"
                        : "bg-foreground/[0.02] border border-border/30"
                    }`}
                    style={{
                      boxShadow: qty > 0
                        ? "0 4px 20px -6px hsl(var(--primary) / 0.15), inset 0 1px 0 hsla(0,0%,100%,0.04)"
                        : "0 1px 4px -1px hsla(0,0%,0%,0.15), inset 0 1px 0 hsla(0,0%,100%,0.03)",
                    }}
                  >
                    {/* Thumbnail */}
                    <div className="relative w-[88px] h-[88px] rounded-xl overflow-hidden shrink-0">
                      <AddonImage src={imgUrl} alt={item.name} className="w-full h-full object-cover" />
                      {qty > 0 && (
                        <motion.div
                          initial={{ scale: 0, rotate: -90 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", stiffness: 500, damping: 15 }}
                          className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                          style={{ boxShadow: "0 2px 8px hsl(var(--primary) / 0.4)" }}
                        >
                          <Check size={10} className="text-primary-foreground" />
                        </motion.div>
                      )}
                      {isFree && (
                        <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-emerald-500/90 text-[8px] font-bold text-white">
                          FREE
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                      <div>
                        <h4 className="text-[13px] font-bold text-foreground leading-tight line-clamp-1">{item.name}</h4>
                        <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed mt-0.5">{item.description}</p>
                      </div>

                      <div className="flex items-center justify-between mt-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-sm font-bold ${isFree ? "text-emerald-400" : "text-foreground"}`}>
                            {isFree ? "Free" : `₹${item.price.toLocaleString()}`}
                          </span>
                          {item.perPerson && (
                            <span className="text-[9px] text-muted-foreground/70">/person</span>
                          )}
                        </div>

                        {!isFree ? (
                          qty > 0 ? (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => toggle(item.id, -1)}
                                className="w-7 h-7 rounded-xl bg-foreground/[0.06] border border-border/50 flex items-center justify-center active:scale-90 transition-transform"
                              >
                                <Minus size={12} className="text-foreground" />
                              </button>
                              <span className="text-sm font-bold text-foreground w-5 text-center">{qty}</span>
                              <button
                                onClick={() => toggle(item.id, 1)}
                                className="w-7 h-7 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center active:scale-90 transition-transform"
                              >
                                <Plus size={12} className="text-primary" />
                              </button>
                            </div>
                          ) : (
                            <motion.button
                              onClick={() => toggle(item.id, 1)}
                              whileTap={{ scale: 0.9 }}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/25 text-[11px] font-semibold text-primary hover:bg-primary/15 transition-colors"
                            >
                              <Plus size={11} /> Add
                            </motion.button>
                          )
                        ) : (
                          <div className="flex items-center gap-1">
                            <Sparkles size={10} className="text-emerald-400" />
                            <span className="text-[9px] font-semibold text-emerald-400">Included</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Footer — frosted glass */}
      <div className="fixed bottom-0 left-0 right-0 z-40">
        {/* Gradient fade above footer */}
        <div className="h-6 pointer-events-none" style={{ background: "linear-gradient(to top, hsl(var(--background)), transparent)" }} />
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-border/30"
          style={{
            background: "hsla(var(--background) / 0.85)",
            backdropFilter: "blur(20px) saturate(1.5)",
          }}
        >
          <div className="min-w-0">
            <div className="flex items-baseline gap-1">
              <span className="font-bold text-xl text-foreground">₹{(total + extrasTotal).toLocaleString()}</span>
              {addonTotal > 0 && (
                <span className="text-[10px] text-primary font-medium">+{selectedCount}</span>
              )}
            </div>
            <span className="text-[10px] text-muted-foreground">
              Base ₹{slot.price.toLocaleString()}{addonTotal > 0 ? ` + ₹${addonTotal.toLocaleString()} add-ons` : ""}
            </span>
          </div>
          <motion.button
            onClick={() => onContinue(selections, total)}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-1.5 shrink-0"
            style={{ boxShadow: "0 4px 20px -4px hsl(var(--primary) / 0.5)" }}
            whileTap={{ scale: 0.95 }}
          >
            Continue <ChevronRight size={14} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
