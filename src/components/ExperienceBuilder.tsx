import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Minus, Check } from "lucide-react";
import { useState } from "react";
import type { Property } from "@/data/properties";
import { addons } from "@/data/properties";

interface ExperienceBuilderProps {
  property: Property;
  slotId: string;
  guests: number;
  date: Date;
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-30 bg-mesh overflow-y-auto pb-32"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 glass px-5 py-3">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-9 h-9 rounded-full border border-border flex items-center justify-center">
            <ArrowLeft size={16} className="text-foreground" />
          </button>
          <div>
            <h2 className="font-semibold text-base text-foreground">Curate your experience</h2>
            <p className="text-xs text-muted-foreground">{slot.label} · {slot.time} · {guests} people</p>
          </div>
        </div>
      </div>

      <div className="px-5 py-4 space-y-6">
        {Object.entries(addons).map(([category, items]) => (
          <div key={category}>
            <h3 className="font-semibold text-base text-foreground mb-3">
              {items[0].categoryEmoji} {category}
            </h3>
            <div className="space-y-2">
              {items.map((item) => {
                const qty = selections[item.id] || 0;
                return (
                  <div
                    key={item.id}
                    className={`rounded-xl border p-4 flex items-center justify-between transition-all ${
                      qty > 0 ? "border-foreground/30 bg-foreground/[0.02]" : "border-border"
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-foreground">{item.name}</span>
                        {qty > 0 && <Check size={14} className="text-success" />}
                      </div>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                      <span className="text-xs font-medium text-foreground">
                        {item.price === 0 ? "Free" : `₹${item.price}`}
                        {item.perPerson ? "/person" : ""}
                      </span>
                    </div>
                    {item.price > 0 && (
                      <div className="flex items-center gap-2 ml-3">
                        {qty > 0 && (
                          <button onClick={() => toggle(item.id, -1)} className="w-7 h-7 rounded-full border border-muted-foreground flex items-center justify-center">
                            <Minus size={12} className="text-foreground" />
                          </button>
                        )}
                        {qty > 0 && <span className="text-sm font-semibold text-foreground w-4 text-center">{qty}</span>}
                        <button onClick={() => toggle(item.id, 1)} className="w-7 h-7 rounded-full border border-muted-foreground flex items-center justify-center">
                          <Plus size={12} className="text-foreground" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 glass px-5 py-3.5 z-40">
        <div className="flex items-center justify-between mb-1 text-xs text-muted-foreground">
          <span>Base: ₹{slot.price.toLocaleString()}</span>
          {addonTotal > 0 && <span>Add-ons: ₹{addonTotal.toLocaleString()}</span>}
        </div>
        <div className="flex items-center justify-between">
          <span className="font-semibold text-xl text-foreground">₹{total.toLocaleString()}</span>
          <button onClick={() => onContinue(selections, total)} className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold text-sm glow-primary">
            Continue
          </button>
        </div>
      </div>
    </motion.div>
  );
}
