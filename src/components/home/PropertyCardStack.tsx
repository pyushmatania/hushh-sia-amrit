import { Heart, Star, MapPin, Users, ChevronLeft, ChevronRight, Ticket, Calendar, Clock, Plane } from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";
import type { Property } from "@/data/properties";
import OptimizedImage from "@/components/shared/OptimizedImage";

interface PropertyCardStackProps {
  properties: Property[];
  startIndex: number;
  onTap: (property: Property) => void;
  wishlist: string[];
  onToggleWishlist?: (id: string) => void;
}

const categoryColors: Record<string, string> = {
  farmhouse: "hsl(142 60% 45%)",
  villa: "hsl(262 60% 55%)",
  rooftop: "hsl(25 85% 55%)",
  default: "hsl(var(--primary))",
};

/* ── Ticket sub-components ─────────────────────────────── */

function TicketNotch({ side, color }: { side: "left" | "right"; color: string }) {
  return (
    <div
      className="absolute z-30 pointer-events-none"
      style={{
        [side]: "-10px",
        top: "54%",
        width: "20px",
        height: "20px",
        borderRadius: "50%",
        background: "hsl(var(--background))",
        boxShadow: `inset ${side === "left" ? "4px" : "-4px"} 0 8px ${color}15`,
      }}
    />
  );
}

function PerforationLine({ color }: { color: string }) {
  return (
    <div className="absolute left-[14%] right-[14%] z-20 pointer-events-none" style={{ top: "55.5%" }}>
      <svg width="100%" height="4" className="overflow-visible">
        <line
          x1="0" y1="2" x2="100%" y2="2"
          stroke={`${color}30`}
          strokeWidth="1"
          strokeDasharray="6 5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

function TicketBarcode() {
  const bars = [3, 1, 2, 1, 3, 2, 1, 1, 3, 1, 2, 3, 1, 2, 1, 1, 3, 2, 1, 3, 1, 2, 1, 3, 2, 1, 3, 1, 2, 1];
  return (
    <div className="flex items-end gap-[0.5px] h-[28px] opacity-20">
      {bars.map((h, i) => (
        <div
          key={i}
          className="rounded-[0.3px]"
          style={{
            width: `${h}px`,
            height: `${35 + h * 18}%`,
            background: "hsl(var(--foreground))",
          }}
        />
      ))}
    </div>
  );
}

function QRCode({ color }: { color: string }) {
  const pattern = [
    [1,1,1,0,1,0,1,1,1],
    [1,0,1,0,0,0,1,0,1],
    [1,1,1,0,1,0,1,1,1],
    [0,0,0,0,1,0,0,0,0],
    [1,0,1,1,0,1,1,0,1],
    [0,0,0,0,1,0,0,0,0],
    [1,1,1,0,0,0,1,1,1],
    [1,0,1,0,1,0,1,0,1],
    [1,1,1,0,1,0,1,1,1],
  ];
  return (
    <div className="flex flex-col gap-[1px]" style={{ opacity: 0.25 }}>
      {pattern.map((row, ri) => (
        <div key={ri} className="flex gap-[1px]">
          {row.map((cell, ci) => (
            <div
              key={ci}
              style={{
                width: "3px",
                height: "3px",
                borderRadius: "0.5px",
                background: cell ? "hsl(var(--foreground))" : "transparent",
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/* Embossed texture overlay for paper feel */
function PaperTexture() {
  return (
    <div
      className="absolute inset-0 pointer-events-none z-10 mix-blend-soft-light"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E")`,
        opacity: 0.4,
      }}
    />
  );
}

/* ── Main component ─────────────────────────────────────── */

export default function PropertyCardStack({ properties, startIndex, onTap, wishlist, onToggleWishlist }: PropertyCardStackProps) {
  const SWIPE_DISTANCE = 12;
  const FLICK_DISTANCE = 6;
  const FLICK_TIME = 260;
  const TAP_DISTANCE = 12;
  const TAP_TIME = 300;

  const cards = properties.slice(0, 5).length >= 3 ? properties.slice(0, 5) : properties.slice(0, 3);
  const [active, setActive] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [imgLoaded, setImgLoaded] = useState<Record<number, boolean>>({});
  const [entered, setEntered] = useState(false);
  const touchRef = useRef<{ x: number; y: number; t: number; mode: "pending" | "horizontal" | "vertical" } | null>(null);
  const swipedRef = useRef(false);
  const blockTapUntilRef = useRef(0);
  const controlTapBlockUntilRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<number>(0);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const lastTickRef = useRef<number>(0);

  const resetProgress = useCallback(() => {
    progressRef.current = 0;
    if (progressBarRef.current) progressBarRef.current.style.width = "0%";
  }, []);

  const goNext = useCallback(() => { setActive(i => (i + 1) % cards.length); resetProgress(); }, [cards.length, resetProgress]);
  const goPrev = useCallback(() => { setActive(i => (i - 1 + cards.length) % cards.length); resetProgress(); }, [cards.length, resetProgress]);

  const blockCardTapBriefly = useCallback((ms = 420) => {
    const until = Date.now() + ms;
    blockTapUntilRef.current = until;
    controlTapBlockUntilRef.current = until;
  }, []);

  useEffect(() => {
    if (!entered || isDragging) return;
    lastTickRef.current = performance.now();
    const tick = (now: number) => {
      const dt = now - lastTickRef.current;
      lastTickRef.current = now;
      progressRef.current += dt / 4000;
      // Update progress bar directly via DOM — avoids 60fps React re-renders
      if (progressBarRef.current) {
        progressBarRef.current.style.width = `${Math.min(progressRef.current * 100, 100)}%`;
      }
      if (progressRef.current >= 1) {
        setActive(i => (i + 1) % cards.length);
        progressRef.current = 0;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [entered, isDragging, cards.length, active]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setEntered(true); }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const getCardStyle = (idx: number): React.CSSProperties => {
    const len = cards.length;
    let diff = idx - active;
    if (diff > Math.floor(len / 2)) diff -= len;
    if (diff < -Math.floor(len / 2)) diff += len;
    const absDiff = Math.abs(diff);
    const isFront = diff === 0;
    const extraX = isFront ? dragX * 0.4 : 0;
    const extraR = isFront ? dragX * 0.025 : 0;

    if (!entered) return { zIndex: 1, transform: `translateX(${diff * 50}px) translateY(60px) scale(0.6)`, opacity: 0 };
    if (absDiff > 2) return { zIndex: 0, opacity: 0, transform: "scale(0.5)", pointerEvents: "none" };

    const xOffset = diff * 95 + extraX;
    const scale = isFront ? 1.0 : 0.78 - absDiff * 0.03;
    const rotateY = isFront ? extraR : diff * -14;
    const zShift = isFront ? 80 : -50 * absDiff;

    return {
      zIndex: 30 - absDiff * 10,
      transform: `translateX(${xOffset}px) translateZ(${zShift}px) rotateY(${rotateY}deg) scale(${scale})`,
      opacity: isFront ? 1 : Math.max(0.4, 0.75 - absDiff * 0.2),
      filter: isFront ? "brightness(1) saturate(1.1)" : "brightness(0.5) saturate(0.7)",
      pointerEvents: isFront ? "auto" : "none",
    };
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      t: Date.now(),
      mode: "pending",
    };
    swipedRef.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchRef.current) return;

    const dx = e.touches[0].clientX - touchRef.current.x;
    const dy = e.touches[0].clientY - touchRef.current.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (touchRef.current.mode === "pending") {
      if (absX < 4 && absY < 4) return;

      // Treat diagonal movement as horizontal swipe (more forgiving)
      // Only treat as vertical if Y is clearly dominant (>2x horizontal)
      if (absY > 10 && absY > absX * 2.5) {
        touchRef.current.mode = "vertical";
        setIsDragging(false);
        setDragX(0);
        return;
      }

      // Any horizontal component at all → treat as swipe
      if (absX >= 6 || (absX >= 4 && absX >= absY * 0.4)) {
        touchRef.current.mode = "horizontal";
      } else {
        return;
      }
    }

    if (touchRef.current.mode !== "horizontal") return;

    e.stopPropagation();
    e.preventDefault();
    setDragX(dx);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchRef.current) { setDragX(0); setIsDragging(false); return; }

    const dx = e.changedTouches[0].clientX - touchRef.current.x;
    const dt = Date.now() - touchRef.current.t;
    const mode = touchRef.current.mode;

    if (mode === "vertical") {
      touchRef.current = null;
      setDragX(0);
      setIsDragging(false);
      return;
    }

    if (Math.abs(dx) > SWIPE_DISTANCE || (Math.abs(dx) > FLICK_DISTANCE && dt < FLICK_TIME)) {
      swipedRef.current = true;
      blockTapUntilRef.current = Date.now() + 320;
      dx < 0 ? goNext() : goPrev();
      touchRef.current = null;
      setDragX(0);
      setIsDragging(false);
      return;
    }

    if (
      Math.abs(dx) <= TAP_DISTANCE &&
      dt <= TAP_TIME &&
      Date.now() >= blockTapUntilRef.current &&
      Date.now() >= controlTapBlockUntilRef.current
    ) {
      blockTapUntilRef.current = Date.now() + 320;
      onTap(cards[active]);
    }

    touchRef.current = null;
    setDragX(0);
    setIsDragging(false);
  };

  const handleTouchCancel = () => {
    touchRef.current = null;
    setDragX(0);
    setIsDragging(false);
  };

  const mouseRef = useRef<{ x: number; t: number } | null>(null);
  const handleMouseDown = (e: React.MouseEvent) => { mouseRef.current = { x: e.clientX, t: Date.now() }; swipedRef.current = false; setIsDragging(true); };
  const handleMouseMove = (e: React.MouseEvent) => { if (!mouseRef.current) return; setDragX(e.clientX - mouseRef.current.x); };
  const handleMouseUp = (e: React.MouseEvent) => {
    if (!mouseRef.current) { setDragX(0); setIsDragging(false); return; }
    const dx = e.clientX - mouseRef.current.x;
    const dt = Date.now() - mouseRef.current.t;
    if (Math.abs(dx) > 35 || (Math.abs(dx) > 18 && dt < 250)) { swipedRef.current = true; blockTapUntilRef.current = Date.now() + 280; dx < 0 ? goNext() : goPrev(); }
    mouseRef.current = null; setDragX(0); setIsDragging(false);
  };

  const frontProp = cards[active];
  const catKey = Array.isArray(frontProp.category) ? frontProp.category[0] : frontProp.category;
  const accentColor = categoryColors[catKey] || categoryColors.default;
  const sectionLabel = frontProp.primaryCategory === "stay" ? "Stay Cards" : "Experience Cards";

  return (
    <div
      ref={containerRef}
      className="relative overflow-visible"
      data-no-pull-refresh="true"
      style={{ height: "480px", touchAction: "pan-y pinch-zoom", perspective: "1200px", perspectiveOrigin: "50% 40%" }}
    >
      {/* Section label */}
      <div className="flex items-center gap-2 px-5 mb-3">
        <Plane size={14} style={{ color: accentColor, transform: "rotate(-45deg)" }} />
        <span className="text-[13px] font-bold text-foreground tracking-wide">{sectionLabel}</span>
        <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, ${accentColor}60, transparent)` }} />
      </div>

      {/* 3D Carousel */}
      <div
        className="relative w-full flex items-center justify-center select-none"
        style={{ height: "350px", transformStyle: "preserve-3d", cursor: isDragging ? "grabbing" : "grab", touchAction: "none" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => { if (mouseRef.current) { mouseRef.current = null; setDragX(0); setIsDragging(false); } }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
      >
        {cards.map((property, idx) => {
          const isFront = idx === active;
          const cardStyle = getCardStyle(idx);
          const cat = Array.isArray(property.category) ? property.category[0] : property.category;
          const accent = categoryColors[cat] || categoryColors.default;

          return (
            <div
              key={property.id}
              className="absolute"
              style={{
                ...cardStyle,
                width: "230px",
                height: "340px",
                left: "50%",
                marginLeft: "-115px",
                transition: isDragging ? "none" : "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                transformStyle: "preserve-3d",
                willChange: "transform, opacity",
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (!isFront || isDragging || swipedRef.current) return;
                if (Date.now() < blockTapUntilRef.current || Date.now() < controlTapBlockUntilRef.current) return;
                onTap(property);
              }}
            >
              {/* Main ticket body */}
              <div
                className="relative w-full h-full overflow-hidden"
                style={{
                  borderRadius: "16px",
                  border: isFront ? `1.5px solid ${accent}35` : "1px solid hsl(var(--border) / 0.3)",
                  boxShadow: isFront
                    ? `0 20px 60px hsl(var(--foreground) / 0.25), 0 0 0 1px ${accent}20, inset 0 1px 0 hsl(0 0% 100% / 0.1)`
                    : "0 6px 20px hsl(var(--foreground) / 0.08)",
                }}
              >
                {/* Paper texture overlay */}
                <PaperTexture />

                {/* Ticket top edge decoration */}
                <div className="absolute top-0 inset-x-0 h-[3px] z-20" style={{ background: `linear-gradient(90deg, ${accent}, ${accent}80, ${accent})` }} />

                {/* Image section (top 55%) */}
                <div className="absolute inset-x-0 top-0 overflow-hidden" style={{ height: "55%", borderRadius: "14px 14px 0 0" }}>
                  {!imgLoaded[idx] && (
                    <div className="absolute inset-0 bg-secondary animate-pulse">
                      <div className="absolute inset-0 shimmer-bg" />
                    </div>
                  )}
                  <OptimizedImage
                    src={property.images[0]}
                    alt={property.name}
                    fill
                    className="object-cover"
                    sizes="230px"
                    onImageLoad={() => setImgLoaded(prev => ({ ...prev, [idx]: true }))}
                    showSkeleton={false}
                  />
                  {/* Vignette */}
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 40%, transparent 70%)" }} />

                  {/* Foil shine */}
                  {isFront && (
                    <div className="absolute inset-0 pointer-events-none" style={{
                      background: "linear-gradient(135deg, hsl(0 0% 100% / 0.18) 0%, transparent 35%, transparent 65%, hsl(0 0% 100% / 0.06) 100%)",
                    }} />
                  )}

                  {/* Category pill */}
                  <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1 px-2 py-0.5 rounded-md" style={{
                    background: `${accent}dd`,
                    backdropFilter: "blur(8px)",
                    boxShadow: `0 2px 8px ${accent}40`,
                  }}>
                    <Ticket size={8} className="text-white" />
                    <span className="text-[7px] font-black text-white uppercase tracking-[0.15em]">
                      {cat}
                    </span>
                  </div>

                  {/* Serial number */}
                  <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5">
                    <span className="text-[7px] font-mono text-white/40 tracking-wider">
                      №{(startIndex + idx + 1).toString().padStart(3, "0")}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); onToggleWishlist?.(property.id); }}
                      className="active:scale-125 transition-transform"
                    >
                      <Heart
                        size={16}
                        className={`drop-shadow-lg transition-colors ${wishlist.includes(property.id) ? "fill-primary text-primary" : "fill-foreground/20 text-white"}`}
                        strokeWidth={2}
                      />
                    </button>
                  </div>

                  {/* Name overlay */}
                  <div className="absolute bottom-2 left-3 right-3 z-10">
                    <h3 className="text-[15px] font-extrabold text-white leading-tight line-clamp-1 drop-shadow-md">{property.name}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Star size={10} className="fill-amber-400 text-amber-400" />
                      <span className="text-[10px] font-bold text-white">{property.rating}</span>
                      <span className="text-[8px] text-white/30">•</span>
                      <MapPin size={8} className="text-white/50" />
                      <span className="text-[9px] text-white/60 truncate">{property.location}</span>
                    </div>
                  </div>
                </div>

                {/* Scalloped notches */}
                <TicketNotch side="left" color={accent} />
                <TicketNotch side="right" color={accent} />
                <PerforationLine color={accent} />

                {/* Ticket stub (bottom 45%) */}
                <div
                  className="absolute inset-x-0 bottom-0 px-3.5 pt-4 pb-2.5 flex flex-col justify-between"
                  style={{
                    height: "45%",
                    borderRadius: "0 0 14px 14px",
                    background: "hsl(var(--card))",
                  }}
                >
                  {/* Subtle linen texture line */}
                  <div className="absolute top-0 inset-x-3 h-px" style={{ background: `${accent}12` }} />

                  {/* Ticket info grid */}
                  <div className="grid grid-cols-3 gap-y-2.5 gap-x-2">
                    <div>
                      <span className="text-[7px] font-bold text-muted-foreground/60 uppercase tracking-[0.12em] flex items-center gap-0.5">
                        <Calendar size={7} /> Date
                      </span>
                      <span className="text-[10px] font-bold text-foreground block mt-0.5">Any Day</span>
                    </div>
                    <div>
                      <span className="text-[7px] font-bold text-muted-foreground/60 uppercase tracking-[0.12em] flex items-center gap-0.5">
                        <Clock size={7} /> Slot
                      </span>
                      <span className="text-[10px] font-bold text-foreground block mt-0.5">Open</span>
                    </div>
                    <div>
                      <span className="text-[7px] font-bold text-muted-foreground/60 uppercase tracking-[0.12em] flex items-center gap-0.5">
                        <Users size={7} /> Guests
                      </span>
                      <span className="text-[10px] font-bold text-foreground block mt-0.5">Up to {property.capacity}</span>
                    </div>
                  </div>

                  {/* Price row */}
                  <div className="flex items-center justify-between mt-1.5 pt-1.5" style={{ borderTop: `1px dashed ${accent}15` }}>
                    <div>
                      <span className="text-[7px] font-bold text-muted-foreground/50 uppercase tracking-[0.12em]">Fare</span>
                      <div className="flex items-baseline gap-0.5">
                        <span className="text-[16px] font-black tracking-tight" style={{ color: accent }}>
                          ₹{property.basePrice.toLocaleString()}
                        </span>
                        <span className="text-[8px] text-muted-foreground/50">/session</span>
                      </div>
                    </div>
                    <QRCode color={accent} />
                  </div>

                  {/* Bottom barcode strip */}
                  <div className="flex items-end justify-between mt-1 pt-1" style={{ borderTop: "1px solid hsl(var(--border) / 0.08)" }}>
                    <TicketBarcode />
                    <span className="text-[6px] font-mono text-muted-foreground/30 uppercase tracking-[0.2em]">
                      HUSHH-{property.id.slice(0, 6).toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Ambient glow under card */}
              {isFront && (
                <div
                  className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-2/3 h-10 rounded-full pointer-events-none blur-2xl"
                  style={{ background: accent, opacity: 0.15 }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Navigation dots */}
      <div className="relative z-40 flex items-center justify-center gap-2.5 mt-3" style={{ touchAction: "manipulation" }}>
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            e.stopPropagation();
            blockCardTapBriefly();
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            e.stopPropagation();
            blockCardTapBriefly();
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            blockCardTapBriefly();
            goPrev();
          }}
          className="w-7 h-7 rounded-full flex items-center justify-center active:scale-90 transition-transform bg-muted/60 backdrop-blur-sm"
        >
          <ChevronLeft size={13} className="text-foreground" />
        </button>
        <div className="flex gap-1.5 items-center">
          {cards.map((_, i) => (
            <div key={i} className="relative rounded-full overflow-hidden" style={{ width: i === active ? "24px" : "5px", height: "5px", background: "hsl(var(--muted-foreground) / 0.15)", transition: "width 0.4s ease" }}>
              {i === active && <div ref={progressBarRef} className="absolute inset-y-0 left-0 rounded-full" style={{ width: "0%", background: accentColor, transition: "none" }} />}
              {i !== active && i < active && <div className="absolute inset-0 rounded-full" style={{ background: `${accentColor}50` }} />}
            </div>
          ))}
        </div>
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            e.stopPropagation();
            blockCardTapBriefly();
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            e.stopPropagation();
            blockCardTapBriefly();
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            blockCardTapBriefly();
            goNext();
          }}
          className="w-7 h-7 rounded-full flex items-center justify-center active:scale-90 transition-transform bg-muted/60 backdrop-blur-sm"
        >
          <ChevronRight size={13} className="text-foreground" />
        </button>
      </div>
    </div>
  );
}
