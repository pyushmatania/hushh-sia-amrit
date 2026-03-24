import { motion } from "framer-motion";
import { Clock, Sparkles, ArrowRight, TrendingUp, Heart, Star, Crown, Zap, Flame } from "lucide-react";
import type { CuratedCombo } from "@/data/properties";
import { useIsMobile } from "@/hooks/use-mobile";

interface CurationGridProps {
  combos: CuratedCombo[];
  onComboTap: (combo: CuratedCombo) => void;
}

/* ─── Section header ─── */
function SectionHeader({ icon: IconComp, title, subtitle, accent }: { icon: typeof TrendingUp; title: string; subtitle?: string; accent?: string }) {
  return (
    <div className="flex items-center gap-2.5 px-4 pt-5 pb-2 md:px-0 md:pt-8 md:pb-4">
      <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center" style={{ background: accent || "hsl(var(--primary) / 0.15)" }}>
        <IconComp size={16} className="text-primary md:w-5 md:h-5" />
      </div>
      <div>
        <h2 className="text-base font-bold text-foreground md:text-xl">{title}</h2>
        {subtitle && <p className="text-[10px] text-muted-foreground md:text-xs">{subtitle}</p>}
      </div>
    </div>
  );
}

/* ─── Mobile: Glass Prism Card ─── */
function MobilePrismCard({ combo, onTap, index }: { combo: CuratedCombo; onTap: (c: CuratedCombo) => void; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, rotateX: 5 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ delay: index * 0.06, duration: 0.45 }}
      onClick={() => onTap(combo)}
      className="shrink-0 w-[220px] cursor-pointer active:scale-[0.95] transition-transform select-none"
    >
      <div
        className="relative rounded-[20px] overflow-hidden"
        style={{
          height: 290,
          border: "1px solid hsl(var(--border) / 0.3)",
          boxShadow: "0 12px 40px hsl(var(--primary) / 0.12), 0 2px 8px hsl(var(--foreground) / 0.06)",
        }}
      >
        <img src={combo.image} alt={combo.name} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
        <div className={`absolute inset-0 bg-gradient-to-t ${combo.gradient} to-transparent opacity-50`} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

        {/* Prismatic edge */}
        <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, hsl(var(--primary)), hsl(280 80% 60%), hsl(190 80% 50%), hsl(var(--primary)))" }} />

        {/* Tags */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          {combo.popular && (
            <span className="text-[8px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5" style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(280 80% 55%))" }}>
              <Flame size={8} className="text-primary-foreground" />
              <span className="text-primary-foreground">HOT</span>
            </span>
          )}
          <span className="text-[9px] text-white/70 bg-black/30 px-2 py-0.5 rounded-full backdrop-blur-sm flex items-center gap-0.5 ml-auto">
            <Clock size={8} /> {combo.time}
          </span>
        </div>

        {/* Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-3.5">
          <span className="text-2xl">{combo.emoji}</span>
          <h4 className="text-[15px] font-bold text-white leading-tight mt-1">{combo.name}</h4>
          <p className="text-[10px] text-white/50 mt-0.5 line-clamp-1 italic" style={{ fontFamily: "'Playfair Display', serif" }}>{combo.tagline}</p>

          <div className="flex flex-wrap gap-1 mt-2">
            {combo.includes.slice(0, 3).map((item, i) => (
              <span key={i} className="text-[8px] px-1.5 py-0.5 rounded-full bg-white/10 text-white/70 border border-white/8">{item}</span>
            ))}
          </div>

          <div className="flex items-center justify-between mt-2.5">
            <span className="text-[15px] font-bold text-white">₹{combo.priceRange[0].toLocaleString()}<span className="text-[9px] text-white/40">+</span></span>
            <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "hsl(var(--primary) / 0.8)" }}>
              <ArrowRight size={12} className="text-primary-foreground" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Mobile: Neon Game Card ─── */
function MobileNeonCard({ combo, onTap, index }: { combo: CuratedCombo; onTap: (c: CuratedCombo) => void; index: number }) {
  const valueScore = Math.min(99, Math.round(60 + combo.priceRange[0] / 100));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      onClick={() => onTap(combo)}
      className="rounded-2xl overflow-hidden cursor-pointer active:scale-[0.96] transition-transform relative"
      style={{
        height: 220,
        border: "1px solid hsl(var(--border) / 0.2)",
        boxShadow: "0 4px 20px hsl(var(--primary) / 0.1)",
      }}
    >
      <img src={combo.image} alt={combo.name} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
      <div className={`absolute inset-0 bg-gradient-to-t ${combo.gradient} to-transparent opacity-40`} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />

      {/* HUD bar */}
      <div className="absolute top-0 left-0 right-0 px-2.5 py-1.5 flex items-center justify-between" style={{ background: "linear-gradient(180deg, hsl(var(--primary) / 0.25) 0%, transparent 100%)" }}>
        <div className="flex items-center gap-1">
          <span className="text-sm">{combo.emoji}</span>
          <span className="text-[8px] font-black tracking-widest text-white/60 uppercase">{combo.tags[0]}</span>
        </div>
        <div className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded" style={{ background: "hsl(var(--primary) / 0.3)", color: "hsl(var(--primary))" }}>
          LV.{valueScore}
        </div>
      </div>

      {combo.popular && (
        <div className="absolute top-7 right-2">
          <Heart size={12} className="fill-rose-500 text-rose-500" />
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-3">
        <h4 className="text-[13px] font-bold text-white leading-tight">{combo.name}</h4>
        <p className="text-[9px] text-white/50 mt-0.5 line-clamp-1">{combo.tagline}</p>

        {/* Stat bars */}
        <div className="flex gap-2 mt-2">
          <div className="flex-1">
            <div className="text-[7px] font-bold text-white/40 uppercase mb-0.5">Value</div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(var(--foreground) / 0.15)" }}>
              <div className="h-full rounded-full" style={{ width: `${valueScore}%`, background: "linear-gradient(90deg, hsl(var(--primary)), hsl(280 80% 60%))" }} />
            </div>
          </div>
          <div className="flex-1">
            <div className="text-[7px] font-bold text-white/40 uppercase mb-0.5">Vibe</div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(var(--foreground) / 0.15)" }}>
              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.min(100, combo.includes.length * 15)}%` }} />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-2">
          <span className="text-[14px] font-bold text-white">₹{combo.priceRange[0].toLocaleString()}<span className="text-[9px] text-white/40">+</span></span>
          <ArrowRight size={12} className="text-primary" />
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Desktop: Consistent elegant card ─── */
function DesktopCurationCard({ combo, onTap, index }: { combo: CuratedCombo; onTap: (c: CuratedCombo) => void; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
      onClick={() => onTap(combo)}
      className="rounded-2xl overflow-hidden cursor-pointer group relative hover:shadow-elevated transition-all duration-300"
      style={{
        background: "hsl(var(--card))",
        border: "1px solid hsl(var(--border) / 0.3)",
      }}
    >
      <div className="relative h-[220px] overflow-hidden">
        <img src={combo.image} alt={combo.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
        <div className={`absolute inset-0 bg-gradient-to-t ${combo.gradient} to-transparent opacity-40`} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />

        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          {combo.popular && (
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-primary/90 text-primary-foreground flex items-center gap-1 backdrop-blur-sm">
              <Sparkles size={10} /> Popular
            </span>
          )}
          <span className="text-[10px] text-white/70 bg-black/30 px-2.5 py-1 rounded-full backdrop-blur-sm flex items-center gap-1 ml-auto">
            <Clock size={10} /> {combo.time}
          </span>
        </div>

        <div className="absolute bottom-3 left-3">
          <span className="text-2xl">{combo.emoji}</span>
        </div>
      </div>

      <div className="p-4">
        <h4 className="text-base font-bold text-foreground leading-tight">{combo.name}</h4>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-1 italic" style={{ fontFamily: "'Playfair Display', serif" }}>{combo.tagline}</p>

        <div className="flex items-center justify-between mt-3">
          <div>
            <span className="text-lg font-bold text-foreground">₹{combo.priceRange[0].toLocaleString()}</span>
            <span className="text-xs text-muted-foreground"> – ₹{combo.priceRange[1].toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1.5 rounded-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors text-xs font-bold">
            Book <ArrowRight size={12} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Desktop: Wide editorial curation card ─── */
function DesktopCurationWide({ combo, onTap, index }: { combo: CuratedCombo; onTap: (c: CuratedCombo) => void; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
      onClick={() => onTap(combo)}
      className="col-span-2 rounded-2xl overflow-hidden cursor-pointer group relative hover:shadow-elevated transition-all duration-300 flex"
      style={{
        background: "hsl(var(--card))",
        border: "1px solid hsl(var(--border) / 0.3)",
        height: 220,
      }}
    >
      <div className="relative w-[300px] shrink-0 overflow-hidden">
        <img src={combo.image} alt={combo.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
        <div className={`absolute inset-0 bg-gradient-to-r ${combo.gradient} to-transparent opacity-30`} />
        <div className="absolute bottom-4 left-4">
          <span className="text-3xl">{combo.emoji}</span>
        </div>
        {combo.popular && (
          <div className="absolute top-4 left-4 text-[10px] font-bold px-2.5 py-1 rounded-full bg-primary/90 text-primary-foreground flex items-center gap-1">
            <Crown size={10} /> Editor's Pick
          </div>
        )}
      </div>
      <div className="flex-1 p-5 flex flex-col justify-center">
        <div className="flex items-center gap-2">
          {combo.tags.slice(0, 2).map((tag, i) => (
            <span key={i} className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{tag}</span>
          ))}
        </div>
        <h4 className="text-xl font-bold text-foreground leading-tight mt-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{combo.name}</h4>
        <p className="text-sm text-muted-foreground mt-1 italic" style={{ fontFamily: "'Playfair Display', serif" }}>{combo.tagline}</p>
        <div className="flex flex-wrap gap-1.5 mt-2.5">
          {combo.includes.slice(0, 4).map((item, i) => (
            <span key={i} className="text-[9px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/50">{item}</span>
          ))}
          {combo.includes.length > 4 && (
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">+{combo.includes.length - 4}</span>
          )}
        </div>
        <div className="flex items-center justify-between mt-auto pt-3">
          <div>
            <span className="text-lg font-bold text-foreground">₹{combo.priceRange[0].toLocaleString()}</span>
            <span className="text-xs text-muted-foreground"> – ₹{combo.priceRange[1].toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-4 py-2 rounded-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors text-sm font-bold">
            Quick Book <ArrowRight size={13} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function CurationGrid({ combos, onComboTap }: CurationGridProps) {
  const isMobile = useIsMobile();
  if (combos.length === 0) return null;

  const hero = combos[0];
  const popular = combos.filter(c => c.popular);
  const romantic = combos.filter(c => c.tags.some(t => t.includes("Couple") || t.includes("Romantic")));
  const party = combos.filter(c => c.tags.some(t => t.includes("Party") || t.includes("Fun") || t.includes("Celebration")));
  const budget = [...combos].sort((a, b) => a.priceRange[0] - b.priceRange[0]).slice(0, 6);

  return (
    <div className="space-y-2 md:space-y-0 md:px-8 lg:px-16 xl:px-24 2xl:px-32">

      {/* ━━ HERO ━━ */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        onClick={() => onComboTap(hero)}
        className="mx-4 rounded-3xl overflow-hidden cursor-pointer active:scale-[0.98] transition-all group relative md:mx-0 md:hover:shadow-xl"
        style={{ height: isMobile ? 280 : 420 }}
      >
        <img src={hero.image} alt={hero.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className={`absolute inset-0 bg-gradient-to-t ${hero.gradient} to-transparent opacity-75`} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-br from-black/30 to-transparent" />

        <div className="absolute top-4 left-4 right-4 md:top-6 md:left-8 md:right-8 flex items-center justify-between">
          <div className="flex gap-1.5 md:gap-2">
            {hero.popular && (
              <span className="text-[9px] md:text-xs font-bold px-2.5 py-1 md:px-3.5 md:py-1.5 rounded-full text-primary-foreground flex items-center gap-1 backdrop-blur-sm" style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(280 80% 55%))" }}>
                <Crown size={10} className="md:w-3.5 md:h-3.5" /> EDITOR'S PICK
              </span>
            )}
          </div>
          <span className="text-[10px] md:text-xs text-white/70 bg-black/30 px-2.5 py-1 md:px-3.5 md:py-1.5 rounded-full backdrop-blur-sm flex items-center gap-1">
            <Clock size={10} className="md:w-3.5 md:h-3.5" /> {hero.time}
          </span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8 lg:p-10">
          <span className="text-3xl md:text-4xl">{hero.emoji}</span>
          <h3 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mt-1 md:mt-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{hero.name}</h3>
          <p className="text-sm md:text-base lg:text-lg text-white/65 mt-1 md:mt-2 italic" style={{ fontFamily: "'Playfair Display', serif" }}>{hero.tagline}</p>
          <div className="flex flex-wrap gap-1.5 md:gap-2 mt-3 md:mt-4">
            {hero.includes.slice(0, 4).map((item, i) => (
              <span key={i} className="text-[10px] md:text-xs px-2 py-0.5 md:px-3 md:py-1 rounded-full bg-white/10 text-white/85 backdrop-blur-sm border border-white/10">{item}</span>
            ))}
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

      {/* ━━ POPULAR / TRENDING ━━ */}
      {popular.length > 0 && (
        <>
          <SectionHeader icon={TrendingUp} title="🔥 Trending Curations" subtitle="Most booked this week" accent="hsl(0 80% 55% / 0.15)" />
          {isMobile ? (
            <div className="flex gap-3 overflow-x-auto hide-scrollbar px-4 pb-2" style={{ WebkitOverflowScrolling: "touch" }}>
              {popular.slice(0, 8).map((c, i) => <MobilePrismCard key={c.id} combo={c} onTap={onComboTap} index={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-5">
              {popular.slice(0, 8).map((c, i) => i === 0 ? <DesktopCurationWide key={c.id} combo={c} onTap={onComboTap} index={i} /> : <DesktopCurationCard key={c.id} combo={c} onTap={onComboTap} index={i} />)}
            </div>
          )}
        </>
      )}

      {/* ━━ ROMANTIC ━━ */}
      {romantic.length > 0 && (
        <>
          <SectionHeader icon={Heart} title="💕 Date Night Specials" subtitle="Curated for couples" accent="hsl(340 75% 55% / 0.15)" />
          {isMobile ? (
            <div className="px-4 grid grid-cols-2 gap-3">
              {romantic.slice(0, 6).map((c, i) => <MobileNeonCard key={c.id} combo={c} onTap={onComboTap} index={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-5">
              {romantic.slice(0, 4).map((c, i) => i === 1 ? <DesktopCurationWide key={c.id} combo={c} onTap={onComboTap} index={i} /> : <DesktopCurationCard key={c.id} combo={c} onTap={onComboTap} index={i} />)}
            </div>
          )}
        </>
      )}

      {/* ━━ PARTY ━━ */}
      {party.length > 0 && (
        <>
          <SectionHeader icon={Zap} title="🎉 Party & Celebrations" subtitle="Get the party started" accent="hsl(35 95% 50% / 0.15)" />
          {isMobile ? (
            <div className="flex gap-3 overflow-x-auto hide-scrollbar px-4 pb-2" style={{ WebkitOverflowScrolling: "touch" }}>
              {party.slice(0, 8).map((c, i) => <MobilePrismCard key={c.id} combo={c} onTap={onComboTap} index={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-5">
              {party.slice(0, 8).map((c, i) => i % 4 === 0 ? <DesktopCurationWide key={c.id} combo={c} onTap={onComboTap} index={i} /> : <DesktopCurationCard key={c.id} combo={c} onTap={onComboTap} index={i} />)}
            </div>
          )}
        </>
      )}

      {/* ━━ BUDGET ━━ */}
      <SectionHeader icon={Sparkles} title="💸 Budget Combos" subtitle="Starting under ₹999" accent="hsl(160 80% 40% / 0.15)" />
      {isMobile ? (
        <div className="px-4 grid grid-cols-2 gap-3 pb-2">
          {budget.map((c, i) => <MobileNeonCard key={c.id} combo={c} onTap={onComboTap} index={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-5">
          {budget.map((c, i) => <DesktopCurationCard key={c.id} combo={c} onTap={onComboTap} index={i} />)}
        </div>
      )}

      {/* ━━ ALL CURATIONS ━━ */}
      {combos.length > 6 && (
        <>
          <SectionHeader icon={Star} title="✨ All Curations" subtitle={`${combos.length} bundles`} />
          {isMobile ? (
            <div className="px-4 grid grid-cols-2 gap-3 pb-4">
              {combos.slice(6).map((c, i) => <MobileNeonCard key={c.id} combo={c} onTap={onComboTap} index={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-5 pb-6">
              {combos.slice(6).map((c, i) => i % 5 === 0 ? <DesktopCurationWide key={c.id} combo={c} onTap={onComboTap} index={i} /> : <DesktopCurationCard key={c.id} combo={c} onTap={onComboTap} index={i} />)}
            </div>
          )}
        </>
      )}
    </div>
  );
}
