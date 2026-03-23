import { Heart, Star, BadgeCheck, MapPin, Users, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const lastTickRef = useRef<number>(0);

  const goNext = useCallback(() => {
    setActive(i => (i + 1) % cards.length);
    setProgress(0);
    progressRef.current = 0;
  }, [cards.length]);

  const goPrev = useCallback(() => {
    setActive(i => (i - 1 + cards.length) % cards.length);
    setProgress(0);
    progressRef.current = 0;
  }, [cards.length]);

  // Auto-rotate with progress bar
  useEffect(() => {
    if (!entered || isDragging) return;
    lastTickRef.current = performance.now();

    const tick = (now: number) => {
      const dt = now - lastTickRef.current;
      lastTickRef.current = now;
      progressRef.current += dt / 3000;
      if (progressRef.current >= 1) {
        setActive(i => (i + 1) % cards.length);
        progressRef.current = 0;
      }
      setProgress(progressRef.current);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [entered, isDragging, cards.length, active]);

  // Entrance
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
      filter: isFront ? "brightness(1) saturate(1.1)" : `brightness(0.5) saturate(0.7)`,
      pointerEvents: isFront ? "auto" : "none",
    };
  };

  /* ── Touch / Swipe ── */
  const handleTouchStart = (e: React.TouchEvent) => {
    touchRef.current = { x: e.touches[0].clientX, t: Date.now() };
    swipedRef.current = false;
    setIsDragging(true);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchRef.current) return;
    setDragX(e.touches[0].clientX - touchRef.current.x);
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchRef.current) { setDragX(0); setIsDragging(false); return; }
    const dx = e.changedTouches[0].clientX - touchRef.current.x;
    const dt = Date.now() - touchRef.current.t;
    if (Math.abs(dx) > 35 || (Math.abs(dx) > 18 && dt < 250)) {
      swipedRef.current = true;
      dx < 0 ? goNext() : goPrev();
    }
    touchRef.current = null;
    setDragX(0);
    setIsDragging(false);
  };

  /* ── Mouse drag for desktop ── */
  const mouseRef = useRef<{ x: number; t: number } | null>(null);
  const handleMouseDown = (e: React.MouseEvent) => {
    mouseRef.current = { x: e.clientX, t: Date.now() };
    swipedRef.current = false;
    setIsDragging(true);
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!mouseRef.current) return;
    setDragX(e.clientX - mouseRef.current.x);
  };
  const handleMouseUp = (e: React.MouseEvent) => {
    if (!mouseRef.current) { setDragX(0); setIsDragging(false); return; }
    const dx = e.clientX - mouseRef.current.x;
    const dt = Date.now() - mouseRef.current.t;
    if (Math.abs(dx) > 35 || (Math.abs(dx) > 18 && dt < 250)) {
      swipedRef.current = true;
      dx < 0 ? goNext() : goPrev();
    }
    mouseRef.current = null;
    setDragX(0);
    setIsDragging(false);
  };

  const frontProp = cards[active];
  const catKey = Array.isArray(frontProp.category) ? frontProp.category[0] : frontProp.category;
  const accentColor = categoryColors[catKey] || categoryColors.default;

  return (
    <div
      ref={containerRef}
      className="relative overflow-visible"
      style={{ height: "420px", touchAction: "pan-y", perspective: "1200px", perspectiveOrigin: "50% 40%" }}
    >
      {/* Section label */}
      <div className="flex items-center gap-2 px-5 mb-3">
        <Sparkles size={14} style={{ color: accentColor }} />
        <span className="text-[13px] font-bold text-foreground tracking-wide">Top Picks</span>
        <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, ${accentColor}, transparent)` }} />
      </div>

      {/* 3D Carousel */}
      <div
        className="relative w-full flex items-center justify-center select-none"
        style={{ height: "290px", transformStyle: "preserve-3d", cursor: isDragging ? "grabbing" : "grab" }}
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
              className="absolute overflow-hidden"
              style={{
                ...cardStyle,
                width: "210px",
                height: "280px",
                borderRadius: "24px",
                left: "50%",
                marginLeft: "-105px",
                transition: isDragging ? "none" : "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
                boxShadow: isFront
                  ? `0 28px 70px hsl(var(--foreground) / 0.35), 0 0 0 2.5px ${accentColor}40, 0 0 40px ${accentColor}15`
                  : "0 8px 24px hsl(var(--foreground) / 0.12), 0 0 0 1px hsl(var(--border) / 0.1)",
                transformStyle: "preserve-3d",
              }}
              onClick={() => { if (isFront && !swipedRef.current) onTap(property); }}
              onTouchStart={isFront ? handleTouchStart : undefined}
              onTouchMove={isFront ? handleTouchMove : undefined}
              onTouchEnd={isFront ? handleTouchEnd : undefined}
            >
              {/* Image */}
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
                sizes="210px"
                onImageLoad={() => setImgLoaded(prev => ({ ...prev, [idx]: true }))}
                showSkeleton={false}
              />

              {/* Bottom vignette */}
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 40%, transparent 65%)" }} />

              {/* Top sheen on front */}
              {isFront && (
                <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(160deg, hsl(0 0% 100% / 0.12) 0%, transparent 40%)" }} />
              )}

              {/* Category pill */}
              <div
                className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full flex items-center gap-1"
                style={{ background: `${accentColor}cc`, backdropFilter: "blur(8px)" }}
              >
                <span className="text-[8px] font-black text-white uppercase tracking-widest">{Array.isArray(property.category) ? property.category[0] : property.category}</span>
              </div>

              {/* Heart */}
              <button
                onClick={(e) => { e.stopPropagation(); onToggleWishlist?.(property.id); }}
                className="absolute top-3 right-3 active:scale-125 transition-transform z-10"
              >
                <Heart
                  size={20}
                  className={`drop-shadow-lg transition-colors ${wishlist.includes(property.id) ? "fill-primary text-primary" : "fill-foreground/20 text-white"}`}
                  strokeWidth={2}
                />
              </button>

              {/* Card bottom info */}
              <div className="absolute bottom-0 left-0 right-0 p-3.5 z-10">
                <h3 className="text-[13px] font-bold text-white leading-tight line-clamp-1">{property.name}</h3>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex items-center gap-0.5">
                    <Star size={9} className="fill-amber-400 text-amber-400" />
                    <span className="text-[10px] font-bold text-white">{property.rating}</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <Users size={9} className="text-white/60" />
                    <span className="text-[10px] text-white/60">{property.capacity}</span>
                  </div>
                </div>
              </div>

              {/* Reflection glow at bottom edge */}
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

      {/* Info panel */}
      <div className="mx-auto mt-2 px-5" style={{ maxWidth: "320px" }}>
        <div
          className="rounded-2xl p-3.5 flex items-center justify-between"
          style={{
            background: "hsl(var(--card))",
            border: "1px solid hsl(var(--border) / 0.5)",
            boxShadow: "0 4px 20px hsl(var(--foreground) / 0.06)",
          }}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-[15px] font-extrabold text-foreground leading-tight truncate">{frontProp.name}</h3>
              {frontProp.verified && <BadgeCheck size={13} className="text-primary shrink-0" />}
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <MapPin size={10} className="text-muted-foreground shrink-0" />
              <span className="text-[11px] text-muted-foreground truncate">{frontProp.location}</span>
              <span className="text-[11px] text-muted-foreground">·</span>
              <Star size={10} className="fill-primary text-primary shrink-0" />
              <span className="text-[11px] font-semibold text-foreground">{frontProp.rating}</span>
            </div>
          </div>
          <div
            className="ml-3 px-3.5 py-2 rounded-xl shrink-0"
            style={{ background: `${accentColor}18`, border: `1px solid ${accentColor}30` }}
          >
            <span className="text-[14px] font-extrabold" style={{ color: accentColor }}>₹{frontProp.basePrice.toLocaleString()}</span>
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mt-3">
          <button onClick={(e) => { e.stopPropagation(); goPrev(); }} className="w-7 h-7 rounded-full flex items-center justify-center active:scale-90 transition-transform bg-muted">
            <ChevronLeft size={13} className="text-foreground" />
          </button>
          <div className="flex gap-1.5 items-center">
            {cards.map((_, i) => (
              <div key={i} className="relative rounded-full overflow-hidden" style={{ width: i === active ? "22px" : "6px", height: "6px", background: "hsl(var(--muted-foreground) / 0.2)", transition: "width 0.4s ease" }}>
                {i === active && (
                  <div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{ width: `${progress * 100}%`, background: accentColor, transition: "none" }}
                  />
                )}
                {i !== active && i < active && (
                  <div className="absolute inset-0 rounded-full" style={{ background: `${accentColor}60` }} />
                )}
              </div>
            ))}
          </div>
          <button onClick={(e) => { e.stopPropagation(); goNext(); }} className="w-7 h-7 rounded-full flex items-center justify-center active:scale-90 transition-transform bg-muted">
            <ChevronRight size={13} className="text-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}
