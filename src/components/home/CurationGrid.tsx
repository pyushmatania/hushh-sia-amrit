import { motion } from "framer-motion";
import { Clock, Users, ArrowRight, Sparkles } from "lucide-react";
import type { CuratedCombo } from "@/data/properties";

interface CurationGridProps {
  combos: CuratedCombo[];
  onComboTap: (combo: CuratedCombo) => void;
}

export default function CurationGrid({ combos, onComboTap }: CurationGridProps) {
  if (combos.length === 0) return null;

  const hero = combos[0];
  const rest = combos.slice(1);

  return (
    <div className="space-y-4">
      {/* Hero — full-width minimal card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        onClick={() => onComboTap(hero)}
        className="mx-4 p-5 rounded-3xl cursor-pointer active:scale-[0.98] transition-transform relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(99,102,241,0.08) 100%)",
          border: "1px solid rgba(139,92,246,0.15)",
        }}
      >
        {hero.popular && (
          <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[9px] font-bold">
            <Sparkles size={9} /> POPULAR
          </div>
        )}

        <span className="text-4xl">{hero.emoji}</span>
        <h3 className="text-xl font-bold text-foreground mt-3 leading-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          {hero.name}
        </h3>
        <p className="text-sm text-muted-foreground mt-1 italic" style={{ fontFamily: "'Playfair Display', serif" }}>
          {hero.tagline}
        </p>

        {/* Includes — pill strip */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {hero.includes.slice(0, 4).map((item, i) => (
            <span key={i} className="text-[10px] px-2.5 py-1 rounded-full bg-foreground/5 text-foreground/70 border border-foreground/8">
              {item}
            </span>
          ))}
          {hero.includes.length > 4 && (
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-foreground/5 text-muted-foreground">
              +{hero.includes.length - 4}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock size={12} />
              <span className="text-xs">{hero.time}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-foreground">₹{hero.priceRange[0].toLocaleString()}</span>
            <span className="text-xs text-muted-foreground">onwards</span>
          </div>
        </div>
      </motion.div>

      {/* Grid — 2-column minimal cards */}
      <div className="grid grid-cols-2 gap-3 px-4">
        {rest.map((combo, i) => (
          <motion.div
            key={combo.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (i + 1) * 0.05, duration: 0.35 }}
            onClick={() => onComboTap(combo)}
            className="p-4 rounded-2xl cursor-pointer active:scale-[0.97] transition-transform relative"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {combo.popular && (
              <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-primary animate-pulse" />
            )}

            <span className="text-2xl">{combo.emoji}</span>
            <h4 className="text-[13px] font-bold text-foreground mt-2 leading-tight">{combo.name}</h4>
            <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{combo.tagline}</p>

            {/* Mini includes */}
            <div className="flex flex-wrap gap-1 mt-2">
              {combo.includes.slice(0, 2).map((item, j) => (
                <span key={j} className="text-[8px] px-1.5 py-0.5 rounded-full bg-foreground/5 text-foreground/60">
                  {item}
                </span>
              ))}
              {combo.includes.length > 2 && (
                <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-foreground/5 text-muted-foreground">
                  +{combo.includes.length - 2}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between mt-3">
              <span className="text-sm font-bold text-foreground">₹{combo.priceRange[0].toLocaleString()}<span className="text-[10px] font-normal text-muted-foreground">+</span></span>
              <ArrowRight size={12} className="text-primary" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
