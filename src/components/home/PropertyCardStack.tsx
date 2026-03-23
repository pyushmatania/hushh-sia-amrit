import { Heart, Star, BadgeCheck, MapPin, Users, ChevronLeft, ChevronRight, Sparkles, Ticket, Calendar, Clock } from "lucide-react";
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

/** SVG clip-path for a ticket/boarding-pass shape with scalloped notches */
const TICKET_CLIP = `polygon(
  0% 0%, 100% 0%,
  100% 58%,
  96% 58%, 96% 56%, 100% 56%,
  100% 100%, 0% 100%,
  0% 56%, 4% 56%, 4% 58%,
  0% 58%
)`;

function TicketNotch({ side, color }: { side: "left" | "right"; color: string }) {
  return (
    <div
      className="absolute z-30 pointer-events-none"
      style={{
        [side]: "-8px",
        top: "56%",
        width: "16px",
        height: "16px",
        borderRadius: "50%",
        background: "hsl(var(--background))",
        boxShadow: `inset ${side === "left" ? "3px" : "-3px"} 0 6px ${color}20`,
      }}
    />
  );
}

function PerforationLine({ color }: { color: string }) {
  return (
    <div className="absolute left-[12%] right-[12%] z-20 pointer-events-none" style={{ top: "57%" }}>
      <svg width="100%" height="3" className="overflow-visible">
        <line
          x1="0" y1="1.5" x2="100%" y2="1.5"
          stroke={`${color}40`}
          strokeWidth="1.5"
          strokeDasharray="4 4"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

function TicketBarcode() {
  const bars = [3, 1, 2, 1, 3, 2, 1, 1, 3, 1, 2, 3, 1, 2, 1, 1, 3, 2, 1, 3, 1, 2, 1, 3, 2];
  return (
    <div className="flex items-end gap-[1px] h-[22px] opacity-30">
      {bars.map((h, i) => (
        <div
          key={i}
          className="rounded-[0.5px]"
          style={{
            width: `${h}px`,
            height: `${40 + h * 15}%`,
            background: "hsl(var(--foreground))",
          }}
        />
      ))}
    </div>
  );
}

export default function PropertyCardStack({ properties, startIndex, onTap, wishlist, onToggleWishlist }: PropertyCardStackProps) {
  const cards = properties.slice(0, 5).length >= 3 ? properties.slice(0, 5) : properties.slice(0, 3);
  const [active, setActive] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [imgLoaded, setImgLoaded] = useState<Record<number, boolean>>({});
  const [entered, setEntered] = useState(false);
  const [progress, setProgress] = useState(0);
  const touchRef = useRef<{ x: number; t: number } | null>(null);
  const swipedRef = useRef(false);
  const blockTapUntilRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const lastTickRef = useRef<number>(0);

  const goNext = useCallback(() => { setActive(i => (i + 1) % cards.length); setProgress(0); progressRef.current = 0; }, [cards.length]);
  const goPrev = useCallback(() => { setActive(i => (i - 1 + cards.length) % cards.length); setProgress(0); progressRef.current = 0; }, [cards.length]);

  useEffect(() => {
    if (!entered || isDragging) return;
    lastTickRef.current = performance.now();
    const tick = (now: number) => {
      const dt = now - lastTickRef.current;
      lastTickRef.current = now;
      progressRef.current += dt / 3000;
      if (progressRef.current >= 1) { setActive(i => (i + 1) % cards.length); progressRef.current = 0; }
      setProgress(progressRef.current);
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
    const scale = isFront ? 1.05 : 0.75 - absDiff * 0.03;
    const rotateY = isFront ? extraR : diff * -14;
    const zShift = isFront ? 80 : -50 * absDiff;

    return {
      zIndex: 30 - absDiff * 10,
      transform: `translateX(${xOffset}px) translateZ(${zShift}px) rotateY(${rotateY}deg) scale(${scale})`,
      opacity: isFront ? 1 : Math.max(0.4, 0.75 - absDiff * 0.2),
      filter: isFront ? "brightness(1) saturate(1.1)" : "brightness(0.5) saturate(0.7)",
      pointerEvents: "auto",
    };
  };

  const handleTouchStart = (e: React.TouchEvent) => { touchRef.current = { x: e.touches[0].clientX, t: Date.now() }; swipedRef.current = false; setIsDragging(true); };
  const handleTouchMove = (e: React.TouchEvent) => { if (!touchRef.current) return; setDragX(e.touches[0].clientX - touchRef.current.x); };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchRef.current) { setDragX(0); setIsDragging(false); return; }
    const dx = e.changedTouches[0].clientX - touchRef.current.x;
    const dt = Date.now() - touchRef.current.t;
    if (Math.abs(dx) > 35 || (Math.abs(dx) > 18 && dt < 250)) { swipedRef.current = true; blockTapUntilRef.current = Date.now() + 280; dx < 0 ? goNext() : goPrev(); }
    touchRef.current = null; setDragX(0); setIsDragging(false);
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

  return (
    <div
      ref={containerRef}
      className="relative overflow-visible"
      style={{ height: "460px", touchAction: "pan-y", perspective: "1200px", perspectiveOrigin: "50% 40%" }}
    >
      {/* Section label */}
      <div className="flex items-center gap-2 px-5 mb-3">
        <Ticket size={14} style={{ color: accentColor }} />
        <span className="text-[13px] font-bold text-foreground tracking-wide">Boarding Passes</span>
        <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, ${accentColor}, transparent)` }} />
      </div>

      {/* 3D Carousel */}
      <div
        className="relative w-full flex items-center justify-center select-none"
        style={{ height: "330px", transformStyle: "preserve-3d", cursor: isDragging ? "grabbing" : "grab" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => { if (mouseRef.current) { mouseRef.current = null; setDragX(0); setIsDragging(false); } }}
      >
        {cards.map((property, idx) => {
          const isFront = idx === active;
          const cardStyle = getCardStyle(idx);

          return (
            <div
              key={property.id}
              className="absolute"
              style={{
                ...cardStyle,
                width: "220px",
                height: "320px",
                left: "50%",
                marginLeft: "-110px",
                transition: isDragging ? "none" : "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
                transformStyle: "preserve-3d",
              }}
              onClick={() => { if (Date.now() < blockTapUntilRef.current) return; onTap(property); }}
              onTouchStart={isFront ? handleTouchStart : undefined}
              onTouchMove={isFront ? handleTouchMove : undefined}
              onTouchEnd={isFront ? handleTouchEnd : undefined}
            >
              {/* Ticket body with notches */}
              <div
                className="relative w-full h-full overflow-hidden"
                style={{
                  borderRadius: "20px",
                  boxShadow: isFront
                    ? `0 28px 70px hsl(var(--foreground) / 0.35), 0 0 0 2px ${accentColor}50, 0 0 30px ${accentColor}15`
                    : "0 8px 24px hsl(var(--foreground) / 0.12)",
                }}
              >
                {/* Image section (top 57%) */}
                <div className="absolute inset-x-0 top-0 overflow-hidden" style={{ height: "57%", borderRadius: "20px 20px 0 0" }}>
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
                    sizes="220px"
                    onImageLoad={() => setImgLoaded(prev => ({ ...prev, [idx]: true }))}
                    showSkeleton={false}
                  />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)" }} />

                  {isFront && <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(160deg, hsl(0 0% 100% / 0.15) 0%, transparent 40%)" }} />}

                  {/* Category badge */}
                  <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full" style={{ background: `${accentColor}cc`, backdropFilter: "blur(8px)" }}>
                    <span className="text-[8px] font-black text-white uppercase tracking-widest">
                      {Array.isArray(property.category) ? property.category[0] : property.category}
                    </span>
                  </div>

                  {/* Heart */}
                  <button
                    onClick={(e) => { e.stopPropagation(); onToggleWishlist?.(property.id); }}
                    className="absolute top-3 right-3 active:scale-125 transition-transform z-10"
                  >
                    <Heart
                      size={18}
                      className={`drop-shadow-lg transition-colors ${wishlist.includes(property.id) ? "fill-primary text-primary" : "fill-foreground/20 text-white"}`}
                      strokeWidth={2}
                    />
                  </button>

                  {/* Name overlay on image */}
                  <div className="absolute bottom-2 left-3 right-3 z-10">
                    <h3 className="text-[14px] font-extrabold text-white leading-tight line-clamp-1">{property.name}</h3>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star size={10} className="fill-amber-400 text-amber-400" />
                      <span className="text-[10px] font-bold text-white">{property.rating}</span>
                      <span className="text-[10px] text-white/50 mx-0.5">·</span>
                      <MapPin size={9} className="text-white/50" />
                      <span className="text-[10px] text-white/60 truncate">{property.location}</span>
                    </div>
                  </div>
                </div>

                {/* Ticket notches */}
                <TicketNotch side="left" color={accentColor} />
                <TicketNotch side="right" color={accentColor} />
                <PerforationLine color={accentColor} />

                {/* Ticket stub section (bottom 43%) */}
                <div
                  className="absolute inset-x-0 bottom-0 px-4 pt-5 pb-3 flex flex-col justify-between"
                  style={{
                    height: "43%",
                    borderRadius: "0 0 20px 20px",
                    background: "hsl(var(--card))",
                    borderTop: "none",
                  }}
                >
                  {/* Ticket details grid */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    <div>
                      <div className="flex items-center gap-1 mb-0.5">
                        <Calendar size={8} className="text-muted-foreground" />
                        <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider">Date</span>
                      </div>
                      <span className="text-[11px] font-bold text-foreground">Any Day</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 mb-0.5">
                        <Clock size={8} className="text-muted-foreground" />
                        <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider">Slot</span>
                      </div>
                      <span className="text-[11px] font-bold text-foreground">Open</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 mb-0.5">
                        <Users size={8} className="text-muted-foreground" />
                        <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider">Capacity</span>
                      </div>
                      <span className="text-[11px] font-bold text-foreground">{property.capacity} guests</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 mb-0.5">
                        <Ticket size={8} className="text-muted-foreground" />
                        <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider">Price</span>
                      </div>
                      <span className="text-[11px] font-extrabold" style={{ color: accentColor }}>₹{property.basePrice.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Barcode */}
                  <div className="flex items-end justify-between mt-auto pt-1">
                    <TicketBarcode />
                    <span className="text-[7px] font-mono text-muted-foreground/40 uppercase tracking-widest">
                      HUSHH-{property.id.slice(0, 6).toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom glow */}
              {isFront && (
                <div
                  className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-8 rounded-full pointer-events-none blur-xl"
                  style={{ background: accentColor, opacity: 0.2 }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2 mt-2">
        <button onClick={(e) => { e.stopPropagation(); goPrev(); }} className="w-7 h-7 rounded-full flex items-center justify-center active:scale-90 transition-transform bg-muted">
          <ChevronLeft size={13} className="text-foreground" />
        </button>
        <div className="flex gap-1.5 items-center">
          {cards.map((_, i) => (
            <div key={i} className="relative rounded-full overflow-hidden" style={{ width: i === active ? "22px" : "6px", height: "6px", background: "hsl(var(--muted-foreground) / 0.2)", transition: "width 0.4s ease" }}>
              {i === active && <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${progress * 100}%`, background: accentColor, transition: "none" }} />}
              {i !== active && i < active && <div className="absolute inset-0 rounded-full" style={{ background: `${accentColor}60` }} />}
            </div>
          ))}
        </div>
        <button onClick={(e) => { e.stopPropagation(); goNext(); }} className="w-7 h-7 rounded-full flex items-center justify-center active:scale-90 transition-transform bg-muted">
          <ChevronRight size={13} className="text-foreground" />
        </button>
      </div>
    </div>
  );
}
