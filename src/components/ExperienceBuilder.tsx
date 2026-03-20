import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Minus, Check, ChefHat, Palette, Music, Gamepad2, Wifi, Armchair, Camera, Flame, Star, Sparkles } from "lucide-react";
import { useState, useMemo } from "react";
import type { Property } from "@/data/properties";
import { addons } from "@/data/properties";

const categoryIcons: Record<string, { icon: typeof ChefHat; color: string; gradient: string }> = {
  "Food & Drinks": { icon: ChefHat, color: "text-amber-400", gradient: "from-amber-600/60 to-orange-900/40" },
  "Decoration": { icon: Palette, color: "text-rose-400", gradient: "from-rose-600/60 to-pink-900/40" },
  "Music & Entertainment": { icon: Music, color: "text-violet-400", gradient: "from-violet-600/60 to-purple-900/40" },
  "Activities": { icon: Flame, color: "text-orange-400", gradient: "from-orange-600/60 to-red-900/40" },
  "Work Add-ons": { icon: Wifi, color: "text-emerald-400", gradient: "from-emerald-600/60 to-teal-900/40" },
  "Comfort Add-ons": { icon: Armchair, color: "text-sky-400", gradient: "from-sky-600/60 to-blue-900/40" },
  "Staff & Extras": { icon: Camera, color: "text-pink-400", gradient: "from-pink-600/60 to-rose-900/40" },
};

const defaultCatIcon = { icon: Star, color: "text-primary", gradient: "from-primary/60 to-accent/40" };

// Map individual add-on items to emojis for visual flair
const addonEmojis: Record<string, string> = {
  "Tribal Thali": "🍛", "BBQ Platter": "🍗", "Chai & Maggi Station": "☕", "Pizza Station": "🍕",
  "Dessert Bar": "🍰", "Beer Bucket (6)": "🍺", "Soft Drinks + Ice": "🥤", "Custom Cake": "🎂",
  "Romantic Setup": "🕯️", "Birthday Setup": "🎈", "Neon Sign": "💡", "Fog Machine": "🌫️", "Flower Wall": "🌸",
  "Bluetooth Speaker": "🔊", "DJ (2 hours)": "🎧", "Karaoke Setup": "🎤", "Live Acoustic": "🎸",
  "PS5 Console": "🎮", "Projector + Screen": "🎬",
  "Pool Access": "🏊", "Pickleball Court": "🏓", "Telescope Session": "🔭", "Tribal Dance Class": "💃", "Bonfire Setup": "🔥",
  "WiFi Boost": "⚡", "Work Desk Setup": "🖥️", "Unlimited Coffee": "☕", "Quiet Room Access": "🔇",
  "Extra Mattress": "🛏️", "AC Upgrade": "❄️", "Premium Seating": "🪑", "Extra Hour": "⏰",
  "Early Check-in": "🌅", "Late Checkout": "🌙",
  "Photographer": "📸", "Surprise Reveal": "🎁", "Candlelight Dinner": "🕯️", "Fireworks Mini": "✨",
  "Video Reel": "📹", "Private Chef": "👨‍🍳", "Cleanup Crew": "🧹", "Pickup & Drop": "🚗",
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-30 bg-mesh overflow-y-auto pb-36"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 glass px-5 py-3 border-b border-border">
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

      <div className="px-4 py-5 space-y-6">
        {Object.entries(addons).map(([category, items]) => {
          const catConfig = categoryIcons[category] || defaultCatIcon;
          const CatIcon = catConfig.icon;

          return (
            <div key={category}>
              {/* Category header with icon */}
              <div className="flex items-center gap-2.5 mb-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `linear-gradient(135deg, ${catConfig.gradient.includes("amber") ? "rgba(251,191,36,0.15)" : catConfig.gradient.includes("rose") ? "rgba(251,113,133,0.15)" : catConfig.gradient.includes("violet") ? "rgba(167,139,250,0.15)" : catConfig.gradient.includes("orange") ? "rgba(251,146,60,0.15)" : catConfig.gradient.includes("emerald") ? "rgba(52,211,153,0.15)" : catConfig.gradient.includes("sky") ? "rgba(56,189,248,0.15)" : "rgba(236,72,153,0.15)"}, transparent)` }}
                >
                  <CatIcon size={18} className={catConfig.color} />
                </div>
                <h3 className="font-bold text-[15px] text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {items[0].categoryEmoji} {category}
                </h3>
              </div>

              <div className="space-y-2.5">
                {items.map((item, idx) => {
                  const qty = selections[item.id] || 0;
                  const emoji = addonEmojis[item.name] || item.categoryEmoji;
                  const isFree = item.price === 0;

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className={`rounded-2xl border overflow-hidden transition-all duration-200 ${
                        qty > 0
                          ? "border-primary/40 bg-primary/[0.04] shadow-[0_0_20px_-6px_hsl(var(--primary)/0.15)]"
                          : "border-border hover:border-foreground/20"
                      }`}
                    >
                      <div className="flex items-center gap-3 p-3.5">
                        {/* Emoji/Icon circle */}
                        <div className="w-12 h-12 rounded-xl bg-foreground/[0.04] flex items-center justify-center text-2xl shrink-0 border border-foreground/[0.06]">
                          {emoji}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-sm text-foreground">{item.name}</span>
                            {qty > 0 && (
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-4 h-4 rounded-full bg-primary flex items-center justify-center"
                              >
                                <Check size={10} className="text-primary-foreground" />
                              </motion.span>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{item.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs font-bold ${isFree ? "text-emerald-400" : "text-foreground"}`}>
                              {isFree ? "Free" : `₹${item.price.toLocaleString()}`}
                            </span>
                            {item.perPerson && (
                              <span className="text-[10px] text-muted-foreground px-1.5 py-0.5 rounded-full bg-foreground/[0.04]">
                                per person
                              </span>
                            )}
                            {item.perPerson && qty > 0 && (
                              <span className="text-[10px] text-primary font-medium">
                                = ₹{(item.price * qty * guests).toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Quantity controls */}
                        {!isFree ? (
                          <div className="flex items-center gap-1.5 shrink-0">
                            <AnimatePresence>
                              {qty > 0 && (
                                <motion.div
                                  initial={{ width: 0, opacity: 0 }}
                                  animate={{ width: "auto", opacity: 1 }}
                                  exit={{ width: 0, opacity: 0 }}
                                  className="flex items-center gap-1.5 overflow-hidden"
                                >
                                  <button
                                    onClick={() => toggle(item.id, -1)}
                                    className="w-8 h-8 rounded-full border border-border flex items-center justify-center active:scale-90 transition-transform"
                                  >
                                    <Minus size={13} className="text-foreground" />
                                  </button>
                                  <span className="text-sm font-bold text-foreground w-5 text-center">{qty}</span>
                                </motion.div>
                              )}
                            </AnimatePresence>
                            <button
                              onClick={() => toggle(item.id, 1)}
                              className={`w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition-all ${
                                qty > 0
                                  ? "bg-primary/20 border border-primary/40"
                                  : "border border-border hover:border-foreground/30"
                              }`}
                            >
                              <Plus size={13} className={qty > 0 ? "text-primary" : "text-foreground"} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 shrink-0">
                            <Sparkles size={14} className="text-emerald-400" />
                            <span className="text-[10px] font-semibold text-emerald-400">Included</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 z-40">
        <div className="glass border-t border-border px-5 py-3.5">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>Base: ₹{slot.price.toLocaleString()}</span>
              {addonTotal > 0 && (
                <span className="text-primary font-medium">+ Add-ons: ₹{addonTotal.toLocaleString()}</span>
              )}
            </div>
            {selectedCount > 0 && (
              <span className="text-[10px] text-muted-foreground">{selectedCount} item{selectedCount !== 1 ? "s" : ""}</span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="font-bold text-xl text-foreground">₹{total.toLocaleString()}</span>
              {addonTotal > 0 && (
                <span className="text-[10px] text-muted-foreground ml-1">total</span>
              )}
            </div>
            <motion.button
              onClick={() => onContinue(selections, total)}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold text-sm glow-primary"
              whileTap={{ scale: 0.93 }}
            >
              Continue
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
