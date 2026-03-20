import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Minus, Check, ChefHat, Palette, Music, Gamepad2, Wifi, Armchair, Camera, Flame, Star, Sparkles, X, ChevronRight, Search } from "lucide-react";
import { useState, useMemo, useRef } from "react";
import type { Property } from "@/data/properties";
import { addons } from "@/data/properties";

const categoryConfig: Record<string, { icon: typeof ChefHat; emoji: string; bg: string }> = {
  "Food & Drinks": { icon: ChefHat, emoji: "🍽️", bg: "bg-amber-500/15 text-amber-400 border-amber-500/20" },
  "Decoration": { icon: Palette, emoji: "🎨", bg: "bg-rose-500/15 text-rose-400 border-rose-500/20" },
  "Music & Entertainment": { icon: Music, emoji: "🎵", bg: "bg-violet-500/15 text-violet-400 border-violet-500/20" },
  "Activities": { icon: Flame, emoji: "🏊", bg: "bg-orange-500/15 text-orange-400 border-orange-500/20" },
  "Work Add-ons": { icon: Wifi, emoji: "💻", bg: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" },
  "Comfort Add-ons": { icon: Armchair, emoji: "🛏️", bg: "bg-sky-500/15 text-sky-400 border-sky-500/20" },
  "Staff & Extras": { icon: Camera, emoji: "📸", bg: "bg-pink-500/15 text-pink-400 border-pink-500/20" },
};

const addonImages: Record<string, string> = {
  "Tribal Thali": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=200&h=200&fit=crop",
  "BBQ Platter": "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=200&h=200&fit=crop",
  "Chai & Maggi Station": "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=200&h=200&fit=crop",
  "Pizza Station": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&h=200&fit=crop",
  "Dessert Bar": "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=200&h=200&fit=crop",
  "Beer Bucket (6)": "https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=200&h=200&fit=crop",
  "Soft Drinks + Ice": "https://images.unsplash.com/photo-1527960471264-932f39eb5846?w=200&h=200&fit=crop",
  "Custom Cake": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200&h=200&fit=crop",
  "Romantic Setup": "https://images.unsplash.com/photo-1529636798458-92182e662485?w=200&h=200&fit=crop",
  "Birthday Setup": "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=200&h=200&fit=crop",
  "Neon Sign": "https://images.unsplash.com/photo-1563281577-a3c3ab4e3b1c?w=200&h=200&fit=crop",
  "Fog Machine": "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=200&h=200&fit=crop",
  "Flower Wall": "https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=200&h=200&fit=crop",
  "Bluetooth Speaker": "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=200&h=200&fit=crop",
  "DJ (2 hours)": "https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=200&h=200&fit=crop",
  "Karaoke Setup": "https://images.unsplash.com/photo-1516280440614-37b910d0616e?w=200&h=200&fit=crop",
  "Live Acoustic": "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=200&h=200&fit=crop",
  "PS5 Console": "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=200&h=200&fit=crop",
  "Projector + Screen": "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=200&h=200&fit=crop",
  "Pool Access": "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=200&h=200&fit=crop",
  "Pickleball Court": "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=200&h=200&fit=crop",
  "Telescope Session": "https://images.unsplash.com/photo-1532978379173-523e16f371f2?w=200&h=200&fit=crop",
  "Tribal Dance Class": "https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=200&h=200&fit=crop",
  "Bonfire Setup": "https://images.unsplash.com/photo-1475483768296-6163e08872a1?w=200&h=200&fit=crop",
  "WiFi Boost": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=200&h=200&fit=crop",
  "Work Desk Setup": "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=200&h=200&fit=crop",
  "Unlimited Coffee": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200&h=200&fit=crop",
  "Quiet Room Access": "https://images.unsplash.com/photo-1497366216548-37526070297c?w=200&h=200&fit=crop",
  "Extra Mattress": "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=200&h=200&fit=crop",
  "AC Upgrade": "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=200&h=200&fit=crop",
  "Premium Seating": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200&h=200&fit=crop",
  "Extra Hour": "https://images.unsplash.com/photo-1501139083538-0139583c060f?w=200&h=200&fit=crop",
  "Early Check-in": "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=200&h=200&fit=crop",
  "Late Checkout": "https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=200&h=200&fit=crop",
  "Photographer": "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=200&h=200&fit=crop",
  "Surprise Reveal": "https://images.unsplash.com/photo-1549465220-1a8b9238f4e1?w=200&h=200&fit=crop",
  "Candlelight Dinner": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=200&h=200&fit=crop",
  "Fireworks Mini": "https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=200&h=200&fit=crop",
  "Video Reel": "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=200&h=200&fit=crop",
  "Private Chef": "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=200&h=200&fit=crop",
  "Cleanup Crew": "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=200&h=200&fit=crop",
  "Pickup & Drop": "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=200&h=200&fit=crop",
};

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
  const [selections, setSelections] = useState<Record<string, number>>({});
  const slot = property.slots.find((s) => s.id === slotId)!;
  const categories = Object.keys(addons);
  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const tabsRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const toggle = (id: string, delta: number) => {
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

  // Build selected items list for the top section
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

  // Extras from property detail
  const extrasTotal = (extras || []).reduce((sum, ext) => {
    const cheapest = ext.slots.filter(s => s.available).sort((a, b) => a.price - b.price)[0];
    return sum + (cheapest?.price || ext.basePrice);
  }, 0);

  // Popular/recommended add-ons
  const popularIds = new Set(["f1", "f2", "d1", "d2", "m4", "a5", "e1", "e3"]);
  const popularItems = useMemo(() =>
    Object.values(addons).flat().filter(item => popularIds.has(item.id)),
  []);

  // Filter items based on search query — when searching, show across all categories
  const isSearching = searchQuery.trim().length > 0;
  const activeItems = isSearching
    ? Object.values(addons).flat().filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : addons[activeCategory] || [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-30 bg-mesh flex flex-col"
    >
      {/* Header */}
      <div className="shrink-0 glass px-5 py-3 border-b border-border z-10">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-9 h-9 rounded-full border border-border flex items-center justify-center">
            <ArrowLeft size={16} className="text-foreground" />
          </button>
          <div className="flex-1">
            <h2 className="font-semibold text-base text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Curate your experience</h2>
            <p className="text-xs text-muted-foreground">{slot.label} · {slot.time} · {guests} people</p>
          </div>
          {selectedCount > 0 && (
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-primary/20 text-primary font-bold">
              {selectedCount} added
            </span>
          )}
        </div>
      </div>

      {/* Selected extras from detail page */}
      <AnimatePresence>
        {extras && extras.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="shrink-0 px-4 pt-3 pb-1 border-b border-border/50"
          >
            <p className="text-[10px] font-semibold text-primary uppercase tracking-wider mb-2">Pre-selected extras</p>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {extras.map((ext) => {
                const cheapest = ext.slots.filter(s => s.available).sort((a, b) => a.price - b.price)[0];
                return (
                  <div key={ext.id} className="shrink-0 flex items-center gap-2 bg-primary/[0.06] border border-primary/20 rounded-xl px-3 py-2">
                    <img src={ext.images[0]} alt="" className="w-8 h-8 rounded-lg object-cover" />
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold text-foreground truncate max-w-[100px]">{ext.name}</p>
                      <p className="text-[10px] text-primary font-medium">₹{(cheapest?.price || ext.basePrice).toLocaleString()}</p>
                    </div>
                    <Check size={12} className="text-primary shrink-0" />
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected add-ons summary strip */}
      <AnimatePresence>
        {selectedCount > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="shrink-0 px-4 pt-2 pb-1 border-b border-border/50"
          >
            <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide">
              {selectedItems.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="shrink-0 flex items-center gap-1.5 bg-foreground/[0.05] border border-border rounded-full px-2.5 py-1.5"
                >
                  <span className="text-xs">{item.emoji}</span>
                  <span className="text-[10px] font-medium text-foreground whitespace-nowrap">{item.name}</span>
                  {item.qty > 1 && <span className="text-[9px] text-primary font-bold">×{item.qty}</span>}
                  <button
                    onClick={() => toggle(item.id, -selections[item.id])}
                    className="w-4 h-4 rounded-full bg-foreground/10 flex items-center justify-center"
                  >
                    <X size={8} className="text-muted-foreground" />
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search bar */}
      <div className="shrink-0 px-4 pt-3 pb-2">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search add-ons..."
            className="w-full bg-secondary rounded-xl pl-9 pr-8 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none border border-transparent focus:border-primary/30 transition-colors"
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

      {/* Popular picks — horizontal scroll */}
      {!isSearching && (
        <div className="shrink-0 px-4 pt-2 pb-3 border-b border-border/30">
          <div className="flex items-center gap-1.5 mb-2">
            <Flame size={13} className="text-primary" />
            <span className="text-[11px] font-bold text-foreground uppercase tracking-wider">Popular picks</span>
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {popularItems.map((item) => {
              const qty = selections[item.id] || 0;
              const imgUrl = addonImages[item.name];
              return (
                <button
                  key={item.id}
                  onClick={() => toggle(item.id, qty > 0 ? 0 : 1)}
                  className={`shrink-0 w-[120px] rounded-xl border overflow-hidden transition-all ${
                    qty > 0
                      ? "border-primary/40 bg-primary/[0.04]"
                      : "border-border hover:border-foreground/20"
                  }`}
                >
                  <div className="relative aspect-[3/2] overflow-hidden bg-secondary">
                    {imgUrl ? (
                      <img src={imgUrl} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl bg-foreground/[0.03]">{item.categoryEmoji}</div>
                    )}
                    {qty > 0 && (
                      <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check size={10} className="text-primary-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="px-2 py-2">
                    <p className="text-[10px] font-semibold text-foreground truncate">{item.name}</p>
                    <p className="text-[10px] font-bold text-primary mt-0.5">
                      {item.price === 0 ? "Free" : `₹${item.price.toLocaleString()}`}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Category tabs — horizontally scrollable (hidden when searching) */}
      {!isSearching && (
        <div ref={tabsRef} className="shrink-0 flex gap-1.5 overflow-x-auto px-4 py-2 scrollbar-hide border-b border-border/30">
          {categories.map((cat) => {
            const conf = categoryConfig[cat];
            const isActive = activeCategory === cat;
            const catItemCount = addons[cat].filter(a => selections[a.id]).length;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-semibold transition-all border ${
                  isActive
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-foreground/[0.02] text-muted-foreground hover:border-foreground/20"
                }`}
              >
                <span>{conf?.emoji || "✦"}</span>
                <span className="whitespace-nowrap">{cat}</span>
                {catItemCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground text-[8px] flex items-center justify-center font-bold">
                    {catItemCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {isSearching && (
        <div className="shrink-0 px-4 py-1.5 border-b border-border/30">
          <p className="text-[11px] text-muted-foreground">
            {activeItems.length} result{activeItems.length !== 1 ? "s" : ""} for "<span className="text-foreground font-medium">{searchQuery}</span>"
          </p>
        </div>
      )}

      {/* Add-on cards — scrollable area */}
      <div className="flex-1 overflow-y-auto pb-36 px-4 pt-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={isSearching ? `search-${searchQuery}` : activeCategory}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="grid grid-cols-2 gap-3"
          >
            {activeItems.map((item) => {
              const qty = selections[item.id] || 0;
              const isFree = item.price === 0;
              const imgUrl = addonImages[item.name];

              return (
                <motion.div
                  key={item.id}
                  className={`rounded-2xl border overflow-hidden transition-all ${
                    qty > 0
                      ? "border-primary/40 bg-primary/[0.04] shadow-[0_0_20px_-6px_hsl(var(--primary)/0.15)]"
                      : "border-border hover:border-foreground/20"
                  }`}
                >
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
                    {imgUrl ? (
                      <img src={imgUrl} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl bg-foreground/[0.03]">
                        {item.categoryEmoji}
                      </div>
                    )}
                    {qty > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                      >
                        <Check size={12} className="text-primary-foreground" />
                      </motion.div>
                    )}
                    {isFree && (
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-emerald-500/90 text-[9px] font-bold text-white">
                        FREE
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3 space-y-1.5">
                    <h4 className="text-[13px] font-semibold text-foreground leading-tight line-clamp-1">{item.name}</h4>
                    <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">{item.description}</p>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-bold ${isFree ? "text-emerald-400" : "text-foreground"}`}>
                        {isFree ? "Included" : `₹${item.price.toLocaleString()}`}
                      </span>
                      {item.perPerson && (
                        <span className="text-[9px] text-muted-foreground px-1.5 py-0.5 rounded-full bg-foreground/[0.04]">
                          /person
                        </span>
                      )}
                    </div>

                    {/* Action row */}
                    {!isFree ? (
                      <div className="flex items-center justify-between pt-1">
                        {qty > 0 ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggle(item.id, -1)}
                              className="w-7 h-7 rounded-full border border-border flex items-center justify-center active:scale-90 transition-transform"
                            >
                              <Minus size={12} className="text-foreground" />
                            </button>
                            <span className="text-sm font-bold text-foreground w-4 text-center">{qty}</span>
                            <button
                              onClick={() => toggle(item.id, 1)}
                              className="w-7 h-7 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center active:scale-90 transition-transform"
                            >
                              <Plus size={12} className="text-primary" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => toggle(item.id, 1)}
                            className="w-full flex items-center justify-center gap-1 py-2 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/[0.04] transition-all text-[11px] font-semibold text-foreground"
                          >
                            <Plus size={12} /> Add
                          </button>
                        )}
                        {qty > 0 && item.perPerson && (
                          <span className="text-[9px] text-primary font-medium">
                            ₹{(item.price * qty * guests).toLocaleString()}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 pt-1">
                        <Sparkles size={12} className="text-emerald-400" />
                        <span className="text-[10px] font-semibold text-emerald-400">Included with booking</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Compact Footer */}
      <div className="fixed bottom-0 left-0 right-0 z-40">
        <div className="glass border-t border-border px-4 py-2.5 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="font-bold text-lg text-foreground">₹{(total + extrasTotal).toLocaleString()}</span>
            {selectedCount > 0 && (
              <span className="text-[10px] text-muted-foreground ml-1.5">{selectedCount} add-on{selectedCount !== 1 ? "s" : ""}</span>
            )}
          </div>
          <motion.button
            onClick={() => onContinue(selections, total)}
            className="bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-semibold text-sm glow-primary flex items-center gap-1.5 shrink-0"
            whileTap={{ scale: 0.93 }}
          >
            Continue <ChevronRight size={14} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
