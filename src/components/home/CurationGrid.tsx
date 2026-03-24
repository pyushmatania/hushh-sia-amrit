import { motion } from "framer-motion";
import { Clock, Sparkles, ArrowRight, TrendingUp, Heart, Star, Crown, Zap, Flame, MapPin, Users } from "lucide-react";
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

/* ─── Mobile: Glass Prism Card (unchanged) ─── */
function MobilePrismCard({ combo, onTap, index }: { combo: CuratedCombo; onTap: (c: CuratedCombo) => void; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, rotateX: 5 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ delay: index * 0.06, duration: 0.45 }}
      onClick={() => onTap(combo)}
      className="shrink-0 w-[220px] cursor-pointer active:scale-[0.95] transition-transform select-none"
    >
      <div className="relative rounded-[20px] overflow-hidden" style={{ height: 290, border: "1px solid hsl(var(--border) / 0.3)", boxShadow: "0 12px 40px hsl(var(--primary) / 0.12), 0 2px 8px hsl(var(--foreground) / 0.06)" }}>
        <img src={combo.image} alt={combo.name} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
        <div className={`absolute inset-0 bg-gradient-to-t ${combo.gradient} to-transparent opacity-50`} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
        <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, hsl(var(--primary)), hsl(280 80% 60%), hsl(190 80% 50%), hsl(var(--primary)))" }} />
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          {combo.popular && (
            <span className="text-[8px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5" style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(280 80% 55%))" }}>
              <Flame size={8} className="text-primary-foreground" /><span className="text-primary-foreground">HOT</span>
            </span>
          )}
          <span className="text-[9px] text-white/70 bg-black/30 px-2 py-0.5 rounded-full backdrop-blur-sm flex items-center gap-0.5 ml-auto"><Clock size={8} /> {combo.time}</span>
        </div>
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
            <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "hsl(var(--primary) / 0.8)" }}><ArrowRight size={12} className="text-primary-foreground" /></div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Mobile: Neon Game Card (unchanged) ─── */
function MobileNeonCard({ combo, onTap, index }: { combo: CuratedCombo; onTap: (c: CuratedCombo) => void; index: number }) {
  const valueScore = Math.min(99, Math.round(60 + combo.priceRange[0] / 100));
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      onClick={() => onTap(combo)}
      className="rounded-2xl overflow-hidden cursor-pointer active:scale-[0.96] transition-transform relative"
      style={{ height: 220, border: "1px solid hsl(var(--border) / 0.2)", boxShadow: "0 4px 20px hsl(var(--primary) / 0.1)" }}
    >
      <img src={combo.image} alt={combo.name} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
      <div className={`absolute inset-0 bg-gradient-to-t ${combo.gradient} to-transparent opacity-40`} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
      <div className="absolute top-0 left-0 right-0 px-2.5 py-1.5 flex items-center justify-between" style={{ background: "linear-gradient(180deg, hsl(var(--primary) / 0.25) 0%, transparent 100%)" }}>
        <div className="flex items-center gap-1">
          <span className="text-sm">{combo.emoji}</span>
          <span className="text-[8px] font-black tracking-widest text-white/60 uppercase">{combo.tags[0]}</span>
        </div>
        <div className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded" style={{ background: "hsl(var(--primary) / 0.3)", color: "hsl(var(--primary))" }}>LV.{valueScore}</div>
      </div>
      {combo.popular && (<div className="absolute top-7 right-2"><Heart size={12} className="fill-rose-500 text-rose-500" /></div>)}
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <h4 className="text-[13px] font-bold text-white leading-tight">{combo.name}</h4>
        <p className="text-[9px] text-white/50 mt-0.5 line-clamp-1">{combo.tagline}</p>
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

/* ═══════════════════════════════════════════════
   DESKTOP-ONLY: Single consistent card
   ═══════════════════════════════════════════════ */

function DesktopCurationCard({ combo, onTap, index }: { combo: CuratedCombo; onTap: (c: CuratedCombo) => void; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.35 }}
      onClick={() => onTap(combo)}
      className="rounded-2xl overflow-hidden cursor-pointer group"
      style={{
        background: "hsl(var(--card))",
        border: "1px solid hsl(var(--border) / 0.25)",
        boxShadow: "0 2px 12px hsl(var(--foreground) / 0.04)",
      }}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={combo.image} alt={combo.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
        <div className={`absolute inset-0 bg-gradient-to-t ${combo.gradient} to-transparent opacity-25`} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className="text-xl">{combo.emoji}</span>
          {combo.popular && (
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full text-primary-foreground" style={{ background: "hsl(var(--primary) / 0.85)" }}>
              <Sparkles size={8} className="inline mr-0.5" />Popular
            </span>
          )}
        </div>
        <span className="absolute top-3 right-3 text-[10px] text-white/80 px-2 py-0.5 rounded-full flex items-center gap-1 border border-white/15" style={{ background: "hsl(var(--foreground) / 0.2)", backdropFilter: "blur(8px)" }}>
          <Clock size={9} /> {combo.time}
        </span>
      </div>
      <div className="p-4">
        <h4 className="text-sm font-bold text-foreground leading-tight line-clamp-1">{combo.name}</h4>
        <p className="text-xs text-muted-foreground mt-1 italic line-clamp-1" style={{ fontFamily: "'Playfair Display', serif" }}>{combo.tagline}</p>
        <div className="flex flex-wrap gap-1 mt-2.5">
          {combo.includes.slice(0, 3).map((item, i) => (
            <span key={i} className="text-[8px] px-2 py-0.5 rounded-full border text-muted-foreground" style={{ borderColor: "hsl(var(--border) / 0.5)", background: "hsl(var(--muted) / 0.5)" }}>{item}</span>
          ))}
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t" style={{ borderColor: "hsl(var(--border) / 0.3)" }}>
          <div>
            <span className="text-base font-bold text-foreground">₹{combo.priceRange[0].toLocaleString()}</span>
            <span className="text-[10px] text-muted-foreground"> – ₹{combo.priceRange[1].toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            Book <ArrowRight size={12} />
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

      {/* ━━ INTRO: Mobile=Hero, Desktop=3-card bento ━━ */}
      {isMobile ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          onClick={() => onComboTap(hero)}
          className="mx-4 rounded-3xl overflow-hidden cursor-pointer active:scale-[0.98] transition-all group relative"
          style={{ height: 280 }}
        >
          <img src={hero.image} alt={hero.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className={`absolute inset-0 bg-gradient-to-t ${hero.gradient} to-transparent opacity-75`} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-br from-black/30 to-transparent" />
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <div className="flex gap-1.5">
              {hero.popular && (
                <span className="text-[9px] font-bold px-2.5 py-1 rounded-full text-primary-foreground flex items-center gap-1 backdrop-blur-sm" style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(280 80% 55%))" }}>
                  <Crown size={10} /> EDITOR'S PICK
                </span>
              )}
            </div>
            <span className="text-[10px] text-white/70 bg-black/30 px-2.5 py-1 rounded-full backdrop-blur-sm flex items-center gap-1"><Clock size={10} /> {hero.time}</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <span className="text-3xl">{hero.emoji}</span>
            <h3 className="text-2xl font-bold text-white leading-tight mt-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{hero.name}</h3>
            <p className="text-sm text-white/65 mt-1 italic" style={{ fontFamily: "'Playfair Display', serif" }}>{hero.tagline}</p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {hero.includes.slice(0, 4).map((item, i) => (
                <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/85 backdrop-blur-sm border border-white/10">{item}</span>
              ))}
            </div>
            <div className="flex items-center justify-between mt-4">
              <div>
                <span className="text-xl font-bold text-white">₹{hero.priceRange[0].toLocaleString()}</span>
                <span className="text-sm text-white/40"> – ₹{hero.priceRange[1].toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-primary/90 text-primary-foreground px-4 py-2 rounded-full text-xs font-bold">Quick Book <ArrowRight size={12} /></div>
            </div>
          </div>
        </motion.div>
      ) : (
        /* Desktop: 3-card bento intro */
        <div className="grid grid-cols-4 gap-4" style={{ height: 320 }}>
          {combos.slice(0, 3).map((c, idx) => {
            const isFirst = idx === 0;
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className={`relative rounded-2xl overflow-hidden cursor-pointer group ${isFirst ? "col-span-2" : ""}`}
                onClick={() => onComboTap(c)}
              >
                <img src={c.image} alt={c.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                <div className={`absolute inset-0 bg-gradient-to-t ${c.gradient} to-transparent opacity-35 group-hover:opacity-50 transition-opacity duration-500`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/5" />
                
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="text-xl">{c.emoji}</span>
                  {isFirst && c.popular && (
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full text-primary-foreground" style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))" }}>
                      EDITOR'S PICK
                    </span>
                  )}
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className={`font-bold text-white leading-tight ${isFirst ? "text-2xl" : "text-lg"}`} style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{c.name}</h3>
                  <p className="text-sm text-white/55 mt-1 italic" style={{ fontFamily: "'Playfair Display', serif" }}>{c.tagline}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-white/50 flex items-center gap-1"><Clock size={11} />{c.time}</span>
                    <span className="ml-auto text-base font-bold text-white">₹{c.priceRange[0].toLocaleString()}<span className="text-xs text-white/40">+</span></span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

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
              {popular.slice(0, 8).map((c, i) => {
                if (i === 0) return <DesktopPanoCurationCard key={c.id} combo={c} onTap={onComboTap} index={i} />;
                if (i % 3 === 0) return <DesktopImmersiveCard key={c.id} combo={c} onTap={onComboTap} index={i} />;
                return <DesktopGlassCurationCard key={c.id} combo={c} onTap={onComboTap} index={i} />;
              })}
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
              {romantic.slice(0, 4).map((c, i) => {
                if (i === 1) return <DesktopPanoCurationCard key={c.id} combo={c} onTap={onComboTap} index={i} />;
                return <DesktopImmersiveCard key={c.id} combo={c} onTap={onComboTap} index={i} />;
              })}
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
              {party.slice(0, 8).map((c, i) => {
                if (i % 4 === 0) return <DesktopPanoCurationCard key={c.id} combo={c} onTap={onComboTap} index={i} />;
                return <DesktopGlassCurationCard key={c.id} combo={c} onTap={onComboTap} index={i} />;
              })}
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
          {budget.map((c, i) => <DesktopCompactCard key={c.id} combo={c} onTap={onComboTap} index={i} />)}
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
              {combos.slice(6).map((c, i) => {
                if (i % 7 === 0) return <DesktopPanoCurationCard key={c.id} combo={c} onTap={onComboTap} index={i} />;
                if (i % 5 === 0) return <DesktopImmersiveCard key={c.id} combo={c} onTap={onComboTap} index={i} />;
                if (i % 3 === 0) return <DesktopGlassCurationCard key={c.id} combo={c} onTap={onComboTap} index={i} />;
                return <DesktopCompactCard key={c.id} combo={c} onTap={onComboTap} index={i} />;
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
