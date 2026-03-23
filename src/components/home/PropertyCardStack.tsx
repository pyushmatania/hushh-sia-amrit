import { Heart, Star, BadgeCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";
import type { Property } from "@/data/properties";
import OptimizedImage from "@/components/shared/OptimizedImage";

/**
 * PropertyCardStack — App-Store-style 3D carousel.
 * Center card is large & elevated; side cards are smaller, tilted & dimmed.
 * Swipe or tap arrows to navigate.
 */

interface PropertyCardStackProps {
  properties: Property[];
  startIndex: number;
  onTap: (property: Property) => void;
  wishlist: string[];
  onToggleWishlist?: (id: string) => void;
}

export default function PropertyCardStack({ properties, startIndex, onTap, wishlist, onToggleWishlist }: PropertyCardStackProps) {
  const cards = properties.slice(0, 5).length >= 3 ? properties.slice(0, 5) : properties.slice(0, 3);
  const [active, setActive] = useState(Math.floor(cards.length / 2));
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [imgLoaded, setImgLoaded] = useState<Record<number, boolean>>({});
  const [entered, setEntered] = useState(false);
  const touchRef = useRef<{ x: number; t: number } | null>(null);
  const swipedRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const goNext = useCallback(() => setActive(i => Math.min(i + 1, cards.length - 1)), [cards.length]);
  const goPrev = useCallback(() => setActive(i => Math.max(i - 1, 0)), []);

  // Auto-rotate every 3s when visible & not dragging
  useEffect(() => {
    if (!entered || isDragging) return;
    const timer = setInterval(() => {
      setActive(i => (i + 1) % cards.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [entered, isDragging, cards.length]);

  // Entrance animation
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setEntered(true); }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const getCardStyle = (idx: number): React.CSSProperties => {
    const diff = idx - active;
    const absDiff = Math.abs(diff);
    const isFront = diff === 0;

    const extraX = isFront ? dragX * 0.35 : 0;
    const extraR = isFront ? dragX * 0.02 : 0;

    // Entrance stagger
    if (!entered) return {
      zIndex: 1,
      transform: `translateX(${diff * 60}px) translateY(80px) scale(0.7)`,
      opacity: 0,
    };

    if (absDiff > 2) return { zIndex: 0, opacity: 0, transform: "scale(0.5)", pointerEvents: "none" };

    const xOffset = diff * 110 + extraX;
    const scale = isFront ? 1 : 0.78 - absDiff * 0.04;
    const rotateY = isFront ? extraR : diff * -12;
    const zShift = isFront ? 60 : -40 * absDiff;
    const brightness = isFront ? 1 : 0.55;
    const cardOpacity = isFront ? 1 : Math.max(0.5, 0.8 - absDiff * 0.15);

    return {
      zIndex: 30 - absDiff * 10,
      transform: `translateX(${xOffset}px) translateZ(${zShift}px) rotateY(${rotateY}deg) scale(${scale})`,
      opacity: cardOpacity,
      filter: `brightness(${brightness})`,
      pointerEvents: isFront ? "auto" : "none",
    };
  };

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
    if (Math.abs(dx) > 40 || (Math.abs(dx) > 20 && dt < 250)) {
      swipedRef.current = true;
      dx < 0 ? goNext() : goPrev();
    }
    touchRef.current = null;
    setDragX(0);
    setIsDragging(false);
  };

  const frontProp = cards[active];

  return (
    <div
      ref={containerRef}
      className="relative overflow-visible"
      style={{
        height: "380px",
        touchAction: "pan-y",
        perspective: "1200px",
        perspectiveOrigin: "50% 45%",
      }}
    >
      {/* 3D card carousel */}
      <div
        className="relative w-full flex items-center justify-center"
        style={{ height: "280px", transformStyle: "preserve-3d" }}
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
                width: "220px",
                height: "270px",
                borderRadius: "28px",
                left: "50%",
                marginLeft: "-110px",
                transition: isDragging
                  ? "none"
                  : `all 0.55s cubic-bezier(0.34, 1.56, 0.64, 1)${!entered ? `, opacity 0.4s ease ${idx * 0.08}s, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${idx * 0.08}s` : ""}`,
                boxShadow: isFront
                  ? "0 24px 64px hsl(var(--foreground) / 0.35), 0 0 0 2px hsl(var(--primary) / 0.2), inset 0 1px 0 hsl(var(--card) / 0.4)"
                  : "0 8px 24px hsl(var(--foreground) / 0.15), 0 0 0 1px hsl(var(--border) / 0.12)",
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
                sizes="220px"
                onImageLoad={() => setImgLoaded(prev => ({ ...prev, [idx]: true }))}
                showSkeleton={false}
              />

              {/* Gradient overlay */}
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.25) 45%, transparent 70%)" }}
              />

              {/* Sheen highlight on front card */}
              {isFront && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: "linear-gradient(135deg, hsl(var(--card) / 0.15) 0%, transparent 50%)",
                  }}
                />
              )}

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

              {/* Minimal card title */}
              <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                <h3 className="text-[14px] font-bold text-white leading-tight line-clamp-1">
                  {property.name}
                </h3>
                <div className="flex items-center gap-1 mt-1">
                  <Star size={10} className="fill-primary text-primary" />
                  <span className="text-[11px] font-semibold text-white/90">{property.rating}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info panel below — like the reference image */}
      <div className="mx-auto mt-3 px-6" style={{ maxWidth: "280px" }}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-[16px] font-extrabold text-foreground leading-tight line-clamp-1">
                {frontProp.name}
              </h3>
              {frontProp.verified && <BadgeCheck size={14} className="text-primary" />}
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <Star size={11} className="fill-primary text-primary" />
              <span className="text-[12px] font-semibold text-foreground">{frontProp.rating}</span>
              <span className="text-[11px] text-muted-foreground">· {frontProp.location}</span>
            </div>
          </div>
          <div
            className="px-3 py-1.5 rounded-xl"
            style={{
              background: "hsl(var(--primary) / 0.12)",
              border: "1px solid hsl(var(--primary) / 0.2)",
            }}
          >
            <span className="text-[14px] font-extrabold text-primary">₹{frontProp.basePrice.toLocaleString()}</span>
          </div>
        </div>

        {/* Nav dots + arrows */}
        <div className="flex items-center justify-center gap-2 mt-3">
          <button
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            className="w-7 h-7 rounded-full flex items-center justify-center active:scale-90 transition-transform"
            style={{
              background: "hsl(var(--muted))",
              opacity: active === 0 ? 0.3 : 1,
            }}
            disabled={active === 0}
          >
            <ChevronLeft size={13} className="text-foreground" />
          </button>
          <div className="flex gap-1.5">
            {cards.map((_, i) => (
              <div
                key={i}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === active ? "18px" : "6px",
                  height: "6px",
                  background: i === active ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.25)",
                }}
              />
            ))}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            className="w-7 h-7 rounded-full flex items-center justify-center active:scale-90 transition-transform"
            style={{
              background: "hsl(var(--muted))",
              opacity: active === cards.length - 1 ? 0.3 : 1,
            }}
            disabled={active === cards.length - 1}
          >
            <ChevronRight size={13} className="text-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}
