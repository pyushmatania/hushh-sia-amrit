import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Minus, Check } from "lucide-react";
import { useState } from "react";
import type { Property } from "@/data/properties";
import { addons } from "@/data/properties";

interface ExperienceBuilderProps {
  property: Property;
  slotId: string;
  guests: number;
  onBack: () => void;
  onContinue: (selections: Record<string, number>, total: number) => void;
}

export default function ExperienceBuilder({ property, slotId, guests, onBack, onContinue }: ExperienceBuilderProps) {
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

  const addonTotal = Object.entries(selections).reduce((sum, [id, qty]) => {
    for (const group of Object.values(addons)) {
      const item = group.find((a) => a.id === id);
      if (item) return sum + item.price * qty * (item.perPerson ? guests : 1);
    }
    return sum;
  }, 0);

  const total = slot.price + addonTotal;

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ type: "spring", stiffness: 260, damping: 25 }}
      className="fixed inset-0 z-30 bg-background overflow-y-auto pb-28"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 glass-surface border-b border-border/50 px-4 py-3">
        <div className="flex items-center gap-3">
          <motion.button whileTap={{ scale: 0.9 }} onClick={onBack} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
            <ArrowLeft size={18} className="text-foreground" />
          </motion.button>
          <div>
            <h2 className="font-display text-lg font-bold text-foreground">Curate your experience</h2>
            <p className="text-xs text-muted-foreground">{slot.label} · {slot.time} · {guests} people</p>
          </div>
        </div>
      </div>

      {/* Add-on sections */}
      <div className="px-4 py-4 space-y-6">
        {Object.entries(addons).map(([category, items]) => (
          <div key={category}>
            <h3 className="font-display text-base font-bold mb-3 text-foreground">
              {items[0].categoryEmoji} {category}
            </h3>
            <div className="space-y-2">
              {items.map((item) => {
                const qty = selections[item.id] || 0;
                return (
                  <motion.div
                    key={item.id}
                    whileTap={{ scale: 0.98 }}
                    className={`glass-card p-4 flex items-center justify-between transition-all ${
                      qty > 0 ? "border-primary/30" : ""
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-foreground">{item.name}</span>
                        {qty > 0 && (
                          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}>
                            <Check size={14} className="text-success" />
                          </motion.span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                      <span className="text-xs font-medium text-accent">
                        {item.price === 0 ? "Free" : `₹${item.price}`}
                        {item.perPerson ? "/person" : ""}
                      </span>
                    </div>
                    {item.price > 0 && (
                      <div className="flex items-center gap-2 ml-3">
                        {qty > 0 && (
                          <motion.button
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => toggle(item.id, -1)}
                            className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center"
                          >
                            <Minus size={14} className="text-foreground" />
                          </motion.button>
                        )}
                        {qty > 0 && (
                          <motion.span
                            key={qty}
                            initial={{ scale: 1.3 }}
                            animate={{ scale: 1 }}
                            className="text-sm font-bold text-foreground min-w-[1.5ch] text-center"
                          >
                            {qty}
                          </motion.span>
                        )}
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => toggle(item.id, 1)}
                          className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center"
                        >
                          <Plus size={14} className="text-primary" />
                        </motion.button>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Sticky footer */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 glass-surface border-t border-border/50 p-4 z-40"
      >
        <div className="flex items-center justify-between mb-2 text-xs text-muted-foreground">
          <span>Base: ₹{slot.price.toLocaleString()}</span>
          {addonTotal > 0 && <span>Add-ons: ₹{addonTotal.toLocaleString()}</span>}
        </div>
        <div className="flex items-center justify-between">
          <div>
            <motion.span
              key={total}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className="text-accent font-bold text-2xl"
            >
              ₹{total.toLocaleString()}
            </motion.span>
            <span className="text-muted-foreground text-sm ml-1">total</span>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onContinue(selections, total)}
            className="bg-primary text-primary-foreground px-8 py-3 rounded-2xl font-bold text-sm shimmer-btn"
          >
            Continue
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
