import { motion } from "framer-motion";
import { Clock, Sparkles, ArrowRight } from "lucide-react";
import type { CuratedCombo } from "@/data/properties";

interface CurationHeroCardProps {
  combo: CuratedCombo;
  index: number;
  onTap?: (combo: CuratedCombo) => void;
}

export function CurationHeroCard({ combo, index, onTap }: CurationHeroCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      onClick={() => onTap?.(combo)}
      className="relative mx-5 mb-5 rounded-3xl overflow-hidden cursor-pointer group"
      style={{ minHeight: "260px" }}
    >
      {/* Full background image */}
      <img
        src={combo.image}
        alt={combo.name}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />

      {/* Multi-layer gradient */}
      <div className={`absolute inset-0 bg-gradient-to-t ${combo.gradient} to-transparent opacity-80`} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />

      {/* Top tags */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
        <div className="flex gap-1.5">
          {combo.popular && (
            <span className="text-[9px] font-bold px-2.5 py-1 rounded-full bg-primary/90 text-primary-foreground flex items-center gap-1 backdrop-blur-sm">
              <Sparkles size={9} /> POPULAR
            </span>
          )}
          {combo.tags.slice(0, 1).map((tag, i) => (
            <span key={i} className="text-[9px] font-medium px-2 py-1 rounded-full bg-white/15 text-white/90 backdrop-blur-sm">
              {tag}
            </span>
          ))}
        </div>
        <span className="text-[10px] text-white/70 bg-black/30 px-2.5 py-1 rounded-full backdrop-blur-sm flex items-center gap-1">
          <Clock size={10} /> {combo.time}
        </span>
      </div>

      {/* Bottom editorial content */}
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <div className="text-3xl mb-2">{combo.emoji}</div>
        <h3 className="text-2xl font-bold text-white leading-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          {combo.name}
        </h3>
        <p
          className="text-sm text-white/70 mt-1 italic"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {combo.tagline}
        </p>

        {/* Includes row */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {combo.includes.slice(0, 4).map((item, i) => (
            <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/85 backdrop-blur-sm border border-white/10">
              {item}
            </span>
          ))}
          {combo.includes.length > 4 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/85">
              +{combo.includes.length - 4}
            </span>
          )}
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between mt-4">
          <div>
            <span className="text-xl font-bold text-white">₹{combo.priceRange[0].toLocaleString()}</span>
            <span className="text-sm text-white/50"> – ₹{combo.priceRange[1].toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-primary/90 text-primary-foreground px-4 py-2 rounded-full text-xs font-bold">
            Quick Book <ArrowRight size={12} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function CurationMiniCard({ combo, index, onTap }: CurationHeroCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => onTap?.(combo)}
      className="shrink-0 w-[160px] cursor-pointer group"
    >
      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden">
        <img
          src={combo.image}
          alt={combo.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className={`absolute inset-0 bg-gradient-to-t ${combo.gradient} to-transparent opacity-70`} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

        {combo.popular && (
          <span className="absolute top-2 right-2 text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-primary/90 text-primary-foreground">
            🔥
          </span>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-2.5">
          <span className="text-lg">{combo.emoji}</span>
          <h4 className="text-[12px] font-bold text-white leading-tight mt-0.5">{combo.name}</h4>
          <p className="text-[9px] text-white/60 mt-0.5 line-clamp-1">{combo.tagline}</p>
          <p className="text-[11px] font-bold text-white mt-1">₹{combo.priceRange[0].toLocaleString()}<span className="font-normal text-white/50">+</span></p>
        </div>
      </div>
    </motion.div>
  );
}
