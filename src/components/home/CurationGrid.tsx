import { motion } from "framer-motion";
import { Clock, Sparkles, ArrowRight } from "lucide-react";
import type { CuratedCombo } from "@/data/properties";

interface CurationGridProps {
  combos: CuratedCombo[];
  onComboTap: (combo: CuratedCombo) => void;
}

export default function CurationGrid({ combos, onComboTap }: CurationGridProps) {
  if (combos.length === 0) return null;

  const hero = combos[0];
  const pair = combos.slice(1, 3);
  const rest = combos.slice(3);

  return (
    <div className="space-y-4 md:space-y-8">
      {/* Hero — full-bleed editorial magazine card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        onClick={() => onComboTap(hero)}
        className="mx-4 rounded-3xl overflow-hidden cursor-pointer active:scale-[0.98] transition-all group relative md:mx-8 lg:mx-16 xl:mx-24 2xl:mx-32 md:hover:shadow-xl md:transition-shadow"
        style={{ height: 280 }}
      >
        {/* Desktop: taller hero */}
        <style>{`@media(min-width:768px){[data-curation-hero]{height:400px!important}}@media(min-width:1024px){[data-curation-hero]{height:460px!important}}`}</style>
        <div data-curation-hero className="absolute inset-0" style={{ height: "inherit" }} />
        <img
          src={hero.image}
          alt={hero.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className={`absolute inset-0 bg-gradient-to-t ${hero.gradient} to-transparent opacity-75`} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-br from-black/30 to-transparent" />

        {/* Top pills */}
        <div className="absolute top-4 left-4 right-4 md:top-6 md:left-8 md:right-8 flex items-center justify-between">
          <div className="flex gap-1.5 md:gap-2">
            {hero.popular && (
              <span className="text-[9px] md:text-xs font-bold px-2.5 py-1 md:px-3.5 md:py-1.5 rounded-full bg-primary/90 text-primary-foreground flex items-center gap-1 backdrop-blur-sm">
                <Sparkles size={9} className="md:w-3.5 md:h-3.5" /> POPULAR
              </span>
            )}
            {hero.tags.slice(0, 1).map((tag, i) => (
              <span key={i} className="text-[9px] md:text-xs font-medium px-2 py-1 md:px-3 md:py-1.5 rounded-full bg-white/15 text-white/90 backdrop-blur-sm">
                {tag}
              </span>
            ))}
          </div>
          <span className="text-[10px] md:text-xs text-white/70 bg-black/30 px-2.5 py-1 md:px-3.5 md:py-1.5 rounded-full backdrop-blur-sm flex items-center gap-1">
            <Clock size={10} className="md:w-3.5 md:h-3.5" /> {hero.time}
          </span>
        </div>

        {/* Bottom editorial */}
        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8 lg:p-10">
          <span className="text-3xl md:text-4xl">{hero.emoji}</span>
          <h3 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mt-1 md:mt-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {hero.name}
          </h3>
          <p className="text-sm md:text-base lg:text-lg text-white/65 mt-1 md:mt-2 italic" style={{ fontFamily: "'Playfair Display', serif" }}>
            {hero.tagline}
          </p>

          {/* Includes strip */}
          <div className="flex flex-wrap gap-1.5 md:gap-2 mt-3 md:mt-4">
            {hero.includes.slice(0, 4).map((item, i) => (
              <span key={i} className="text-[10px] md:text-xs px-2 py-0.5 md:px-3 md:py-1 rounded-full bg-white/10 text-white/85 backdrop-blur-sm border border-white/10">
                {item}
              </span>
            ))}
            {hero.includes.length > 4 && (
              <span className="text-[10px] md:text-xs px-2 py-0.5 md:px-3 md:py-1 rounded-full bg-white/10 text-white/70">
                +{hero.includes.length - 4}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between mt-4 md:mt-6">
            <div>
              <span className="text-xl md:text-2xl font-bold text-white">₹{hero.priceRange[0].toLocaleString()}</span>
              <span className="text-sm md:text-base text-white/40"> – ₹{hero.priceRange[1].toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-primary/90 text-primary-foreground px-4 py-2 md:px-6 md:py-3 rounded-full text-xs md:text-sm font-bold md:hover:bg-primary md:transition-colors md:cursor-pointer">
              Quick Book <ArrowRight size={12} className="md:w-4 md:h-4" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Pair — side-by-side landscape cards */}
      {pair.length > 0 && (
        <div className="grid grid-cols-2 gap-3 px-4 md:grid-cols-3 lg:grid-cols-4 md:gap-6 md:px-8 lg:px-16 xl:px-24 2xl:px-32">
          {pair.map((combo, i) => (
            <motion.div
              key={combo.id}
              initial={{ opacity: 0, x: i === 0 ? -12 : 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.08, duration: 0.4 }}
              onClick={() => onComboTap(combo)}
              className="rounded-2xl md:rounded-3xl overflow-hidden cursor-pointer active:scale-[0.97] transition-all group relative md:hover:shadow-elevated"
              style={{ height: 200 }}
            >
              <img
                src={combo.image}
                alt={combo.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${combo.gradient} to-transparent opacity-65`} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

              {combo.popular && (
                <span className="absolute top-2.5 right-2.5 md:top-3.5 md:right-3.5 text-[8px] md:text-[10px] font-bold px-1.5 py-0.5 md:px-2 md:py-1 rounded-full bg-primary/90 text-primary-foreground backdrop-blur-sm">
                  🔥
                </span>
              )}

              <div className="absolute bottom-0 left-0 right-0 p-3 md:p-5">
                <span className="text-lg md:text-2xl">{combo.emoji}</span>
                <h4 className="text-[13px] md:text-lg font-bold text-white leading-tight mt-0.5">{combo.name}</h4>
                <p className="text-[9px] md:text-sm text-white/55 mt-0.5 line-clamp-1 italic" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {combo.tagline}
                </p>
                <div className="flex flex-wrap gap-1 md:gap-1.5 mt-1.5 md:mt-2">
                  {combo.includes.slice(0, 2).map((item, j) => (
                    <span key={j} className="text-[8px] md:text-[10px] px-1.5 py-0.5 md:px-2 md:py-0.5 rounded-full bg-white/10 text-white/70 border border-white/8">
                      {item}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-2 md:mt-3">
                  <span className="text-[13px] md:text-base font-bold text-white">₹{combo.priceRange[0].toLocaleString()}<span className="text-[9px] md:text-xs font-normal text-white/40">+</span></span>
                  <ArrowRight size={11} className="text-primary md:w-4 md:h-4" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Remaining — Horizontal scroll strip (portrait mini-cards) → Desktop: grid */}
      {rest.length > 0 && (
        <div className="flex gap-3 overflow-x-auto hide-scrollbar px-4 pb-1 md:grid md:grid-cols-3 lg:grid-cols-4 md:overflow-visible md:px-8 lg:px-16 xl:px-24 2xl:px-32 md:gap-6">
          {rest.map((combo, i) => (
            <motion.div
              key={combo.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              onClick={() => onComboTap(combo)}
              className="shrink-0 w-[150px] md:w-full rounded-2xl md:rounded-3xl overflow-hidden cursor-pointer group relative md:hover:shadow-elevated transition-all"
              style={{ height: 210 }}
            >
              <img
                src={combo.image}
                alt={combo.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${combo.gradient} to-transparent opacity-60`} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />

              {combo.popular && (
                <span className="absolute top-2 right-2 md:top-3 md:right-3 text-[8px] md:text-[10px] font-bold px-1.5 py-0.5 md:px-2 md:py-1 rounded-full bg-primary/90 text-primary-foreground">
                  🔥
                </span>
              )}

              <div className="absolute bottom-0 left-0 right-0 p-2.5 md:p-4">
                <span className="text-lg md:text-xl">{combo.emoji}</span>
                <h4 className="text-[12px] md:text-base font-bold text-white leading-tight mt-0.5">{combo.name}</h4>
                <p className="text-[9px] md:text-sm text-white/50 mt-0.5 line-clamp-1">{combo.tagline}</p>
                <p className="text-[11px] md:text-sm font-bold text-white mt-1 md:mt-2">
                  ₹{combo.priceRange[0].toLocaleString()}<span className="font-normal text-white/40">+</span>
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
