import { motion } from "framer-motion";
import { Clock, ArrowRight, Sparkles } from "lucide-react";
import { hapticSelection } from "@/lib/haptics";
import type { ExperiencePack } from "@/components/home/CuratedPackCard";
import { AccentFrame } from "@/components/shared/AccentFrame";

// Pack images
import packChillNight from "@/assets/pack-chill-night.jpg";
import packRomanticNight from "@/assets/pack-romantic-night.jpg";
import packPartyScene from "@/assets/pack-party-scene.jpg";
import packBbqBonfire from "@/assets/pack-bbq-bonfire.jpg";
import packMovieNight from "@/assets/pack-movie-night.jpg";
import packGameNight from "@/assets/pack-game-night.jpg";
import packWorkEscape from "@/assets/pack-work-escape.jpg";
import packTeamWork from "@/assets/pack-team-work.jpg";

const packImageMap: Record<string, string> = {
  "ep-1": packChillNight,
  "ep-2": packRomanticNight,
  "ep-3": packPartyScene,
  "ep-4": packBbqBonfire,
  "ep-5": packMovieNight,
  "ep-6": packGameNight,
  "ep-7": packWorkEscape,
  "ep-8": packTeamWork,
};

interface CuratedPackListingProps {
  pack: ExperiencePack;
  index: number;
  onTap: (pack: ExperiencePack) => void;
}

export default function CuratedPackListing({ pack, index, onTap }: CuratedPackListingProps) {
  const savings = pack.originalPrice ? pack.originalPrice - pack.price : 0;
  const image = packImageMap[pack.id] || packChillNight;

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ delay: index * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileTap={{ scale: 0.97 }}
      onClick={() => { hapticSelection(); onTap(pack); }}
      className="w-full rounded-[20px] overflow-hidden text-left relative group"
      style={{
        border: "1px solid hsl(var(--foreground) / 0.08)",
        boxShadow: "0 8px 32px -8px rgba(0,0,0,0.5)",
      }}
    >
      {/* Image */}
      <div className="relative h-[220px] overflow-hidden">
        <img
          src={image}
          alt={pack.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
        <div className={`absolute inset-0 bg-gradient-to-br ${pack.gradient} opacity-40`} />

        {/* Accent frame */}
        <AccentFrame color="hsl(var(--primary))" />

        {/* Top badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <div className="flex gap-1.5">
            {pack.badge && (
              <span className="text-[9px] font-bold px-2.5 py-1 rounded-full bg-primary/90 text-primary-foreground flex items-center gap-1">
                <Sparkles size={9} /> {pack.badge}
              </span>
            )}
          </div>
          {savings > 0 && (
            <span className="text-[9px] font-bold px-2 py-1 rounded-full text-primary-foreground" style={{ background: "hsl(160 84% 39% / 0.9)" }}>
              Save ₹{savings}
            </span>
          )}
        </div>

        {/* Bottom text on image */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-end justify-between">
            <div className="flex-1 min-w-0">
              <span className="text-2xl">{pack.emoji}</span>
              <h3 className="text-lg font-bold text-white leading-tight mt-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {pack.name}
              </h3>
              <p className="text-[11px] text-white/60 mt-0.5 italic" style={{ fontFamily: "'Playfair Display', serif" }}>
                {pack.tagline}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content below image */}
      <div className="p-4" style={{ background: "hsl(var(--card))" }}>
        {/* Slot + includes */}
        <div className="flex items-center gap-1.5 mb-2.5">
          <Clock size={11} className="text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground font-medium">{pack.slot}</span>
        </div>

        {/* Includes chips */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {pack.includes.slice(0, 4).map((item, i) => (
            <span key={i} className="text-[9px] px-2 py-0.5 rounded-full bg-foreground/5 text-muted-foreground border border-foreground/6">
              {item}
            </span>
          ))}
          {pack.includes.length > 4 && (
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
              +{pack.includes.length - 4} more
            </span>
          )}
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between pt-2.5 border-t border-foreground/5">
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-foreground">₹{pack.price}</span>
            {pack.originalPrice && (
              <span className="text-[11px] text-muted-foreground line-through">₹{pack.originalPrice}</span>
            )}
          </div>
          <div className="flex items-center gap-1.5 bg-primary/90 text-primary-foreground px-4 py-2 rounded-full text-xs font-bold">
            Book Now <ArrowRight size={12} />
          </div>
        </div>
      </div>
    </motion.button>
  );
}
