import { motion } from "framer-motion";
import { ChefHat, Palette, Car, Music, Star, ArrowRight, Clock, TrendingUp, Zap, Sparkles, Crown, Heart, Users, MapPin } from "lucide-react";
import type { Property } from "@/data/properties";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";

const serviceIconMap: Record<string, { icon: typeof ChefHat; color: string; gradient: string }> = {
  "Chef Service": { icon: ChefHat, color: "text-amber-400", gradient: "from-amber-600/80 to-orange-900/60" },
  "Decoration": { icon: Palette, color: "text-rose-400", gradient: "from-rose-600/80 to-pink-900/60" },
  "Transport": { icon: Car, color: "text-sky-400", gradient: "from-sky-600/80 to-blue-900/60" },
  "Entertainment": { icon: Music, color: "text-violet-400", gradient: "from-violet-600/80 to-purple-900/60" },
};
const defaultIcon = { icon: Star, color: "text-primary", gradient: "from-primary/80 to-accent/60" };

interface ServiceGridProps {
  services: Property[];
  onServiceTap: (service: Property) => void;
}

/* ─── Mobile-only: Holographic 3D Card ─── */
function MobileHoloCard({ service, onTap, index }: { service: Property; onTap: (s: Property) => void; index: number }) {
  const config = serviceIconMap[service.propertyType || ""] || defaultIcon;
  const Icon = config.icon;
  const cheapest = Math.min(...service.slots.filter(s => s.available).map(s => s.price));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, rotateY: -8 }}
      animate={{ opacity: 1, y: 0, rotateY: 0 }}
      transition={{ delay: index * 0.07, duration: 0.5 }}
      onClick={() => onTap(service)}
      className="shrink-0 w-[200px] cursor-pointer active:scale-[0.95] transition-transform select-none"
      style={{ perspective: "800px" }}
    >
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          height: 260,
          background: "linear-gradient(145deg, hsl(var(--card)) 0%, hsl(var(--muted)) 100%)",
          border: "1px solid hsl(var(--border) / 0.3)",
          boxShadow: "0 8px 32px hsl(var(--primary) / 0.15), inset 0 1px 0 hsl(var(--foreground) / 0.05)",
        }}
      >
        <div className="absolute inset-0 pointer-events-none z-10" style={{ background: "linear-gradient(125deg, transparent 30%, hsl(var(--primary) / 0.08) 45%, hsl(280 80% 60% / 0.06) 55%, transparent 70%)" }} />
        <div className="relative h-[140px] overflow-hidden">
          <img src={service.images[0]} alt={service.name} className="w-full h-full object-cover" loading="lazy" />
          <div className={`absolute inset-0 bg-gradient-to-t ${config.gradient} to-transparent opacity-40`} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute top-2 left-2 w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "hsl(var(--primary) / 0.8)", backdropFilter: "blur(8px)" }}>
            <Icon size={14} className="text-primary-foreground" />
          </div>
          <div className="absolute top-2 right-2 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full" style={{ background: "hsl(var(--foreground) / 0.3)", backdropFilter: "blur(6px)" }}>
            <Star size={8} className="fill-amber-400 text-amber-400" />
            <span className="text-[9px] font-bold text-white">{service.rating}</span>
          </div>
        </div>
        <div className="p-3 relative z-20">
          <span className="text-[8px] font-bold tracking-widest text-muted-foreground uppercase">{service.propertyType}</span>
          <h4 className="text-[13px] font-bold text-foreground leading-tight mt-0.5 line-clamp-1">{service.name}</h4>
          <p className="text-[9px] text-muted-foreground line-clamp-1 mt-0.5">{service.description}</p>
          <div className="flex items-center justify-between mt-2.5">
            <span className="text-[14px] font-bold text-foreground">₹{cheapest.toLocaleString()}<span className="text-[9px] font-normal text-muted-foreground">+</span></span>
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
              <ArrowRight size={10} className="text-primary" />
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, transparent, hsl(var(--primary)), hsl(280 80% 60%), transparent)" }} />
      </div>
    </motion.div>
  );
}

/* ─── Mobile-only: Game Stat Card ─── */
function MobileGameCard({ service, onTap, index }: { service: Property; onTap: (s: Property) => void; index: number }) {
  const cheapest = Math.min(...service.slots.filter(s => s.available).map(s => s.price));
  const openSlots = service.slots.filter(s => s.available).length;
  const valueScore = Math.min(99, Math.round((service.rating / 5) * 80 + openSlots * 5));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      onClick={() => onTap(service)}
      className="rounded-2xl overflow-hidden cursor-pointer active:scale-[0.96] transition-transform relative"
      style={{ height: 200, background: "linear-gradient(160deg, hsl(var(--card)) 0%, hsl(var(--muted) / 0.8) 100%)", border: "1px solid hsl(var(--border) / 0.3)" }}
    >
      <img src={service.images[0]} alt={service.name} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
      <div className="absolute top-0 left-0 right-0 px-2.5 py-1.5 flex items-center justify-between" style={{ background: "linear-gradient(180deg, hsl(var(--primary) / 0.3) 0%, transparent 100%)" }}>
        <span className="text-[8px] font-black tracking-widest text-white/70 uppercase">{service.propertyType}</span>
        <div className="flex items-center gap-1">
          <div className="text-[8px] font-mono font-bold text-amber-400 px-1.5 py-0.5 rounded" style={{ background: "hsl(var(--foreground) / 0.2)" }}>PWR {valueScore}</div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <h4 className="text-[13px] font-bold text-white leading-tight">{service.name}</h4>
        <div className="flex gap-2 mt-2">
          <div className="flex-1">
            <div className="text-[7px] font-bold text-white/50 uppercase mb-0.5">Rating</div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(var(--foreground) / 0.2)" }}>
              <div className="h-full rounded-full" style={{ width: `${(service.rating / 5) * 100}%`, background: "linear-gradient(90deg, hsl(var(--primary)), hsl(280 80% 60%))" }} />
            </div>
          </div>
          <div className="flex-1">
            <div className="text-[7px] font-bold text-white/50 uppercase mb-0.5">Avail</div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(var(--foreground) / 0.2)" }}>
              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.min(100, openSlots * 25)}%` }} />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-[14px] font-bold text-white">₹{cheapest.toLocaleString()}<span className="text-[9px] text-white/40">+</span></span>
          <ArrowRight size={12} className="text-primary" />
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   DESKTOP-ONLY: Single consistent card
   ═══════════════════════════════════════════════ */

function DesktopServiceCard({ service, onTap, index }: { service: Property; onTap: (s: Property) => void; index: number }) {
  const config = serviceIconMap[service.propertyType || ""] || defaultIcon;
  const Icon = config.icon;
  const cheapest = Math.min(...service.slots.filter(s => s.available).map(s => s.price));
  const openSlots = service.slots.filter(s => s.available).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.35 }}
      onClick={() => onTap(service)}
      className="rounded-2xl overflow-hidden cursor-pointer group"
      style={{
        background: "hsl(var(--card))",
        border: "1px solid hsl(var(--border) / 0.25)",
        boxShadow: "0 2px 12px hsl(var(--foreground) / 0.04)",
      }}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={service.images[0]} alt={service.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <div className="absolute top-3 left-3 w-8 h-8 rounded-lg flex items-center justify-center border border-white/15" style={{ background: "hsl(var(--foreground) / 0.2)", backdropFilter: "blur(10px)" }}>
          <Icon size={14} className={config.color} />
        </div>
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full border border-white/15" style={{ background: "hsl(var(--foreground) / 0.2)", backdropFilter: "blur(8px)" }}>
          <Star size={10} className="fill-amber-400 text-amber-400" />
          <span className="text-[11px] font-bold text-white">{service.rating}</span>
        </div>
      </div>
      <div className="p-4">
        <span className="text-[9px] font-bold tracking-[0.15em] text-muted-foreground uppercase">{service.propertyType}</span>
        <h4 className="text-sm font-bold text-foreground leading-tight mt-1 line-clamp-1">{service.name}</h4>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{service.description}</p>
        <div className="flex items-center justify-between mt-3 pt-3 border-t" style={{ borderColor: "hsl(var(--border) / 0.3)" }}>
          <div>
            <span className="text-base font-bold text-foreground">₹{cheapest.toLocaleString()}</span>
            <span className="text-[10px] text-muted-foreground">+</span>
          </div>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock size={10} />{openSlots} slots</span>
        </div>
      </div>
    </motion.div>
  );
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

export default function ServiceGrid({ services, onServiceTap }: ServiceGridProps) {
  const isMobile = useIsMobile();
  if (services.length === 0) return null;

  const trending = services.filter(s => s.slotsLeft > 0 && s.slotsLeft <= 3).slice(0, 6);
  const topRated = [...services].sort((a, b) => b.rating - a.rating).slice(0, 8);
  const budget = [...services].sort((a, b) => a.basePrice - b.basePrice).slice(0, 6);
  const featured = services[0];
  const popular = services.filter(s => s.rating >= 4.5).slice(0, 8);

  return (
    <div className="space-y-2 md:space-y-0 md:px-8 lg:px-16 xl:px-24 2xl:px-32">

      {/* ━━ INTRO BENTO (desktop: 3-card mosaic instead of hero) / FEATURED HERO (mobile) ━━ */}
      {isMobile ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          onClick={() => onServiceTap(featured)}
          className="mx-4 rounded-3xl overflow-hidden cursor-pointer active:scale-[0.98] transition-all group relative"
          style={{ height: 220 }}
        >
          <img src={featured.images[0]} alt={featured.name} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
          <div className={`absolute inset-0 bg-gradient-to-t ${(serviceIconMap[featured.propertyType || ""] || defaultIcon).gradient} to-transparent opacity-70`} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
          <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full flex items-center gap-1.5" style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(280 80% 55%))" }}>
            <Crown size={12} className="text-primary-foreground" />
            <span className="text-[10px] font-bold text-primary-foreground">FEATURED</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <span className="text-[9px] font-bold tracking-widest text-white/50 uppercase">{featured.propertyType}</span>
            <h3 className="text-xl font-bold text-white mt-0.5 leading-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{featured.name}</h3>
            <p className="text-[12px] text-white/60 mt-0.5 line-clamp-1">{featured.description}</p>
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-white/60"><Star size={11} className="fill-amber-400 text-amber-400" /><span className="text-[11px] font-bold text-white">{featured.rating}</span></div>
                <div className="flex items-center gap-1 text-white/60"><Clock size={11} /><span className="text-[10px]">{featured.slots.filter(s => s.available).length} slots</span></div>
              </div>
              <div className="flex items-center gap-2 bg-primary/90 text-primary-foreground px-3.5 py-1.5 rounded-full">
                <span className="text-[12px] font-bold">₹{Math.min(...featured.slots.filter(s => s.available).map(s => s.price)).toLocaleString()}+</span>
                <ArrowRight size={12} />
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        /* Desktop: 3-card intro mosaic */
        <div className="grid grid-cols-4 gap-4" style={{ height: 300 }}>
          {services.slice(0, 3).map((s, idx) => {
            const cfg = serviceIconMap[s.propertyType || ""] || defaultIcon;
            const Icon = cfg.icon;
            const cheapest = Math.min(...s.slots.filter(sl => sl.available).map(sl => sl.price));
            const isFirst = idx === 0;
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className={`relative rounded-2xl overflow-hidden cursor-pointer group ${isFirst ? "col-span-2" : ""}`}
                onClick={() => onServiceTap(s)}
              >
                <img src={s.images[0]} alt={s.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/5 group-hover:from-black/95 transition-all duration-500" />
                
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center border border-white/15" style={{ background: "hsl(var(--foreground) / 0.2)", backdropFilter: "blur(12px)" }}>
                    <Icon size={16} className={cfg.color} />
                  </div>
                  {isFirst && (
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full text-primary-foreground" style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))" }}>
                      TOP PICK
                    </span>
                  )}
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <span className="text-[9px] font-bold tracking-[0.2em] text-white/50 uppercase">{s.propertyType}</span>
                  <h3 className={`font-bold text-white leading-tight mt-1 ${isFirst ? "text-2xl" : "text-lg"}`} style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{s.name}</h3>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1"><Star size={12} className="fill-amber-400 text-amber-400" /><span className="text-sm font-bold text-white">{s.rating}</span></div>
                    <span className="text-xs text-white/50">{s.location}</span>
                    <span className="ml-auto text-base font-bold text-white">₹{cheapest.toLocaleString()}<span className="text-xs text-white/40">+</span></span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ━━ TRENDING ━━ */}
      {trending.length > 0 && (
        <>
          <SectionHeader icon={TrendingUp} title="🔥 Trending Now" subtitle="Slots filling up fast" accent="hsl(0 80% 55% / 0.15)" />
          {isMobile ? (
            <div className="flex gap-3 overflow-x-auto hide-scrollbar px-4 pb-2" style={{ WebkitOverflowScrolling: "touch" }}>
              {trending.map((s, i) => <MobileHoloCard key={s.id} service={s} onTap={onServiceTap} index={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-5">
              {trending.map((s, i) => <DesktopServiceCard key={s.id} service={s} onTap={onServiceTap} index={i} />)}
            </div>
          )}
        </>
      )}

      {/* ━━ TOP RATED ━━ */}
      <SectionHeader icon={Star} title="⭐ Top Rated" subtitle="Loved by guests" accent="hsl(45 90% 50% / 0.15)" />
      {isMobile ? (
        <div className="px-4 grid grid-cols-2 gap-3">
          {topRated.map((s, i) => <MobileGameCard key={s.id} service={s} onTap={onServiceTap} index={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-5">
          {topRated.map((s, i) => <DesktopServiceCard key={s.id} service={s} onTap={onServiceTap} index={i} />)}
        </div>
      )}

      {/* ━━ BUDGET PICKS ━━ */}
      {budget.length > 0 && (
        <>
          <SectionHeader icon={Zap} title="💸 Budget Friendly" subtitle="Great value services" accent="hsl(160 80% 40% / 0.15)" />
          {isMobile ? (
            <div className="flex gap-3 overflow-x-auto hide-scrollbar px-4 pb-2" style={{ WebkitOverflowScrolling: "touch" }}>
              {budget.map((s, i) => <MobileHoloCard key={s.id} service={s} onTap={onServiceTap} index={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-5">
              {budget.map((s, i) => <DesktopServiceCard key={s.id} service={s} onTap={onServiceTap} index={i} />)}
            </div>
          )}
        </>
      )}

      {/* ━━ ALL SERVICES ━━ */}
      <SectionHeader icon={Sparkles} title="✨ All Services" subtitle={`${services.length} available`} />
      {isMobile ? (
        <div className="px-4 grid grid-cols-2 gap-3 pb-4">
          {services.slice(0, 12).map((s, i) => <MobileGameCard key={s.id} service={s} onTap={onServiceTap} index={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-5 pb-6">
          {services.map((s, i) => <DesktopServiceCard key={s.id} service={s} onTap={onServiceTap} index={i} />)}
        </div>
      )}
    </div>
  );
}
