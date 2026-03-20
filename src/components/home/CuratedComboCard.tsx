import { motion } from "framer-motion";
import type { CuratedCombo } from "@/data/properties";

interface CuratedComboCardProps {
  combo: CuratedCombo;
  index: number;
  onTap?: (combo: CuratedCombo) => void;
}

export default function CuratedComboCard({ combo, index, onTap }: CuratedComboCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      onClick={() => onTap?.(combo)}
      className="relative overflow-hidden rounded-2xl cursor-pointer group min-w-[260px] max-w-[280px] shrink-0"
      style={{ height: "320px" }}
    >
      {/* Background Image */}
      <img
        src={combo.image}
        alt={combo.name}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />

      {/* Gradient Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-t ${combo.gradient} to-transparent`} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      {/* Popular Badge */}
      {combo.popular && (
        <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-primary/90 text-primary-foreground text-[10px] font-bold">
          🔥 POPULAR
        </div>
      )}

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="text-2xl mb-1">{combo.emoji}</div>
        <h3 className="text-lg font-bold text-white mb-0.5">{combo.name}</h3>
        <p className="text-xs text-white/80 mb-2">{combo.tagline}</p>

        {/* Includes pills */}
        <div className="flex flex-wrap gap-1 mb-3">
          {combo.includes.slice(0, 3).map((item, i) => (
            <span key={i} className="text-[9px] px-2 py-0.5 rounded-full bg-white/15 text-white/90 backdrop-blur-sm">
              {item}
            </span>
          ))}
          {combo.includes.length > 3 && (
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/15 text-white/90 backdrop-blur-sm">
              +{combo.includes.length - 3} more
            </span>
          )}
        </div>

        {/* Price + Time */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-base font-bold text-white">₹{combo.priceRange[0].toLocaleString()}</span>
            <span className="text-xs text-white/60"> – ₹{combo.priceRange[1].toLocaleString()}</span>
          </div>
          <span className="text-[10px] text-white/70 bg-white/10 px-2 py-1 rounded-full">
            ⏰ {combo.time}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
