import { useState, useRef, useCallback, useEffect } from "react";
import { ChevronRight, ChevronDown, ChevronUp, Star, Heart } from "lucide-react";
import type { Property } from "@/data/properties";
import type { CuratedCombo } from "@/data/properties";
import OptimizedImage from "@/components/shared/OptimizedImage";

/* ─── 3D Scroll Effect Hook ─── */
function use3DScrollEffect(scrollRef: React.RefObject<HTMLDivElement | null>) {
  const rafId = useRef(0);

  const applyEffects = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const centerX = containerRect.left + containerRect.width / 2;

    const columns = container.children;
    for (let i = 0; i < columns.length; i++) {
      const col = columns[i] as HTMLElement;
      const colRect = col.getBoundingClientRect();
      const colCenterX = colRect.left + colRect.width / 2;

      // Distance from center (-1 to 1)
      const dist = (colCenterX - centerX) / (containerRect.width / 2);
      const clampedDist = Math.max(-1, Math.min(1, dist));

      // 3D perspective rotation
      const rotateY = clampedDist * -8; // subtle rotation
      const scale = 1 - Math.abs(clampedDist) * 0.06;
      const translateZ = -Math.abs(clampedDist) * 15;
      // Brightness/opacity fade at edges
      const brightness = 1 - Math.abs(clampedDist) * 0.15;

      col.style.transform = `perspective(800px) rotateY(${rotateY}deg) scale(${scale}) translateZ(${translateZ}px)`;
      col.style.filter = `brightness(${brightness})`;
      col.style.transition = "transform 0.1s ease-out, filter 0.1s ease-out";
    }
  }, [scrollRef]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const onScroll = () => {
      cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(applyEffects);
    };

    // Initial apply
    requestAnimationFrame(applyEffects);
    container.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      container.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId.current);
    };
  }, [applyEffects]);
}

/* ─── Compact Property Card for grid ─── */
function CompactPropertyCard({ property, onTap, isWL, onToggleWishlist }: {
  property: Property; onTap: (p: Property) => void; isWL: boolean; onToggleWishlist?: (id: string) => void;
}) {
  const cheapest = Math.min(...property.slots.filter(s => s.available).map(s => s.price));
  return (
    <div className="shrink-0 w-[155px] cursor-pointer active:scale-[0.97] transition-transform" onClick={() => onTap(property)}>
      <div className="relative aspect-[3/4] rounded-xl overflow-hidden" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
        <OptimizedImage src={property.images[0]} alt={property.name} fill className="object-cover" sizes="155px" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        {/* Subtle edge reflection */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.03) 100%)",
        }} />
        {onToggleWishlist && (
          <button onClick={(e) => { e.stopPropagation(); onToggleWishlist(property.id); }}
            className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.3)", backdropFilter: "blur(6px)" }}>
            <Heart size={13} className={isWL ? "fill-primary text-primary" : "text-white"} strokeWidth={2} />
          </button>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-2">
          <h4 className="text-[11px] font-bold text-white leading-tight line-clamp-1">{property.name}</h4>
          <div className="flex items-center justify-between mt-0.5">
            <div className="flex items-center gap-0.5">
              <Star size={9} className="fill-yellow-400 text-yellow-400" />
              <span className="text-[9px] text-white/80">{property.rating}</span>
            </div>
            <span className="text-[11px] font-bold text-white">₹{cheapest.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Compact Curation Card ─── */
function CompactCurationCard({ combo, onTap }: { combo: CuratedCombo; onTap: (c: CuratedCombo) => void }) {
  return (
    <div className="shrink-0 w-[155px] cursor-pointer active:scale-[0.97] transition-transform" onClick={() => onTap(combo)}>
      <div className="relative aspect-[3/4] rounded-xl overflow-hidden" style={{ border: "1px solid hsl(var(--border) / 0.2)" }}>
        <img src={combo.image} alt={combo.name} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
        <div className={`absolute inset-0 bg-gradient-to-t ${combo.gradient} to-transparent opacity-40`} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
        {combo.popular && (
          <span className="absolute top-2 left-2 text-[7px] font-bold px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground">🔥 HOT</span>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-2">
          <span className="text-sm">{combo.emoji}</span>
          <h4 className="text-[11px] font-bold text-white leading-tight line-clamp-1 mt-0.5">{combo.name}</h4>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[9px] text-white/50">{combo.time}</span>
            <span className="text-[11px] font-bold text-white">₹{combo.priceRange[0].toLocaleString()}+</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   Mobile Compact Grid — 2-row swipeable
   with Show All / Collapse toggle
   ═══════════════════════════════════════ */

interface MobilePropertyGridProps {
  properties: Property[];
  onPropertyTap: (p: Property) => void;
  wishlist: string[];
  onToggleWishlist?: (id: string) => void;
  rows?: number;
  title?: string;
}

export function MobilePropertyGrid({ properties, onPropertyTap, wishlist, onToggleWishlist, rows = 2, title }: MobilePropertyGridProps) {
  const [showAll, setShowAll] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  if (properties.length === 0) return null;

  // For swipe mode: arrange in columns of `rows` items
  const columns: Property[][] = [];
  for (let i = 0; i < properties.length; i += rows) {
    columns.push(properties.slice(i, i + rows));
  }

  return (
    <div className="mt-4">
      {title && (
        <div className="flex items-center justify-between px-4 mb-3">
          <h2 className="text-base font-bold text-foreground">{title}</h2>
          <span className="text-[10px] text-muted-foreground">{properties.length} found</span>
        </div>
      )}

      {!showAll ? (
        <>
          <div ref={scrollRef} className="flex gap-3 overflow-x-auto hide-scrollbar px-4 pb-2"
            style={{ WebkitOverflowScrolling: "touch", scrollSnapType: "x proximity" }}>
            {columns.map((col, ci) => (
              <div key={ci} className="flex flex-col gap-3 shrink-0" style={{ scrollSnapAlign: "start" }}>
                {col.map(p => (
                  <CompactPropertyCard key={p.id} property={p} onTap={onPropertyTap}
                    isWL={wishlist.includes(p.id)} onToggleWishlist={onToggleWishlist} />
                ))}
              </div>
            ))}
          </div>
          <button
            onClick={() => setShowAll(true)}
            className="mx-4 mt-3 w-[calc(100%-2rem)] py-2.5 rounded-xl border border-border text-sm font-semibold text-foreground flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform"
            style={{ background: "hsl(var(--card))" }}
          >
            Show all {properties.length} <ChevronDown size={14} />
          </button>
        </>
      ) : (
        <>
          <div className="px-4 grid grid-cols-2 gap-3 pb-2">
            {properties.map(p => (
              <CompactPropertyCard key={p.id} property={p} onTap={onPropertyTap}
                isWL={wishlist.includes(p.id)} onToggleWishlist={onToggleWishlist} />
            ))}
          </div>
          <button
            onClick={() => setShowAll(false)}
            className="mx-4 mt-3 w-[calc(100%-2rem)] py-2.5 rounded-xl border border-border text-sm font-semibold text-foreground flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform"
            style={{ background: "hsl(var(--card))" }}
          >
            Show less <ChevronUp size={14} />
          </button>
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════
   Mobile Curation Grid — 2-3 row swipeable
   ═══════════════════════════════════════ */

interface MobileCurationGridProps {
  combos: CuratedCombo[];
  onComboTap: (c: CuratedCombo) => void;
  rows?: number;
  title?: string;
  subtitle?: string;
}

export function MobileCurationGrid({ combos, onComboTap, rows = 2, title, subtitle }: MobileCurationGridProps) {
  const [showAll, setShowAll] = useState(false);

  if (combos.length === 0) return null;

  const columns: CuratedCombo[][] = [];
  for (let i = 0; i < combos.length; i += rows) {
    columns.push(combos.slice(i, i + rows));
  }

  return (
    <div className="mt-2">
      {title && (
        <div className="px-4 mb-2">
          <h2 className="text-base font-bold text-foreground">{title}</h2>
          {subtitle && <p className="text-[10px] text-muted-foreground">{subtitle}</p>}
        </div>
      )}

      {!showAll ? (
        <>
          <div className="flex gap-3 overflow-x-auto hide-scrollbar px-4 pb-2"
            style={{ WebkitOverflowScrolling: "touch", scrollSnapType: "x proximity" }}>
            {columns.map((col, ci) => (
              <div key={ci} className="flex flex-col gap-3 shrink-0" style={{ scrollSnapAlign: "start" }}>
                {col.map(c => (
                  <CompactCurationCard key={c.id} combo={c} onTap={onComboTap} />
                ))}
              </div>
            ))}
          </div>
          {combos.length > rows * 2 && (
            <button
              onClick={() => setShowAll(true)}
              className="mx-4 mt-2 w-[calc(100%-2rem)] py-2.5 rounded-xl border border-border text-sm font-semibold text-foreground flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform"
              style={{ background: "hsl(var(--card))" }}
            >
              Show all {combos.length} <ChevronDown size={14} />
            </button>
          )}
        </>
      ) : (
        <>
          <div className="px-4 grid grid-cols-2 gap-3 pb-2">
            {combos.map(c => (
              <CompactCurationCard key={c.id} combo={c} onTap={onComboTap} />
            ))}
          </div>
          <button
            onClick={() => setShowAll(false)}
            className="mx-4 mt-2 w-[calc(100%-2rem)] py-2.5 rounded-xl border border-border text-sm font-semibold text-foreground flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform"
            style={{ background: "hsl(var(--card))" }}
          >
            Show less <ChevronUp size={14} />
          </button>
        </>
      )}
    </div>
  );
}
