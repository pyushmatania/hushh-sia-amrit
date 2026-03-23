import { Heart, Star, BadgeCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef, useCallback } from "react";
import type { Property } from "@/data/properties";
import OptimizedImage from "@/components/shared/OptimizedImage";

/**
 * PropertyCardStack — a 3D fanned card deck with smooth swipe.
 * Uses perspective transforms for real depth, glowing borders, and
 * prevents page horizontal scroll via touch-action CSS.
 */

interface PropertyCardStackProps {
  properties: Property[];
  startIndex: number;
  onTap: (property: Property) => void;
  wishlist: string[];
  onToggleWishlist?: (id: string) => void;
}

export default function PropertyCardStack({ properties, startIndex, onTap, wishlist, onToggleWishlist }: PropertyCardStackProps) {
  const cards = properties.slice(0, 3);
  const [active, setActive] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [imgLoaded, setImgLoaded] = useState<Record<number, boolean>>({});
  const touchRef = useRef<{ x: number; t: number } | null>(null);
  const swipedRef = useRef(false);

  const goNext = useCallback(() => setActive(i => (i + 1) % cards.length), [cards.length]);
  const goPrev = useCallback(() => setActive(i => (i - 1 + cards.length) % cards.length), [cards.length]);

  const getCardStyle = (idx: number): React.CSSProperties => {
    const diff = ((idx - active) + cards.length) % cards.length;
    const isFront = diff === 0;

    // Add drag offset only to front card
    const extraX = isFront ? dragX * 0.4 : 0;
    const extraRotate = isFront ? dragX * 0.04 : 0;

    if (diff === 0) return {
      zIndex: 30,
      transform: `perspective(800px) translateX(${extraX}px) translateZ(0px) rotateY(${extraRotate}deg) scale(1)`,
      opacity: 1,
      filter: "brightness(1)",
    };
    if (diff === 1) return {
      zIndex: 20,
      transform: `perspective(800px) translateX(${35 + extraX * 0.2}px) translateZ(-60px) rotateY(-8deg) scale(0.88)`,
      opacity: 0.7,
      filter: "brightness(0.7)",
    };
    return {
      zIndex: 10,
      transform: `perspective(800px) translateX(${-35 + extraX * 0.2}px) translateZ(-60px) rotateY(8deg) scale(0.88)`,
      opacity: 0.7,
      filter: "brightness(0.7)",
    };
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchRef.current = { x: e.touches[0].clientX, t: Date.now() };
    swipedRef.current = false;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchRef.current) return;
    const dx = e.touches[0].clientX - touchRef.current.x;
    setDragX(dx);
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

  return (
    <div
      className="mx-5 relative"
      style={{
        height: "340px",
        animationDelay: `${startIndex * 60}ms`,
        touchAction: "pan-y",          // prevent horizontal page scroll
        perspective: "1000px",
      }}
    >
      {/* Navigation header */}
      <div className="absolute -top-1 right-0 z-40 flex items-center gap-1.5">
        <button
          onClick={(e) => { e.stopPropagation(); goPrev(); }}
          className="w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition-transform"
          style={{
            background: "hsl(var(--card) / 0.85)",
            backdropFilter: "blur(12px)",
            border: "1px solid hsl(var(--primary) / 0.2)",
            boxShadow: "0 2px 12px hsl(var(--primary) / 0.1)",
          }}
        >
          <ChevronLeft size={14} className="text-foreground" />
        </button>
        <div className="flex gap-1">
          {cards.map((_, i) => (
            <div
              key={i}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: i === active ? "16px" : "6px",
                background: i === active ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.3)",
              }}
            />
          ))}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); goNext(); }}
          className="w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition-transform"
          style={{
            background: "hsl(var(--card) / 0.85)",
            backdropFilter: "blur(12px)",
            border: "1px solid hsl(var(--primary) / 0.2)",
            boxShadow: "0 2px 12px hsl(var(--primary) / 0.1)",
          }}
        >
          <ChevronRight size={14} className="text-foreground" />
        </button>
      </div>

      {/* 3D Card deck */}
      <div className="relative w-full h-full mt-4" style={{ transformStyle: "preserve-3d" }}>
        {cards.map((property, idx) => {
          const isFront = idx === active;
          const cardStyle = getCardStyle(idx);

          return (
            <div
              key={property.id}
              className="absolute inset-0 overflow-hidden"
              style={{
                ...cardStyle,
                borderRadius: "24px",
                transition: isDragging ? "none" : "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
                boxShadow: isFront
                  ? "0 16px 48px hsl(var(--foreground) / 0.25), 0 0 0 1px hsl(var(--primary) / 0.15), inset 0 1px 0 hsl(var(--card) / 0.5)"
                  : "0 6px 20px hsl(var(--foreground) / 0.1), 0 0 0 1px hsl(var(--border) / 0.15)",
                pointerEvents: isFront ? "auto" : "none",
                transformStyle: "preserve-3d",
              }}
              onClick={() => { if (!swipedRef.current) onTap(property); }}
              onTouchStart={isFront ? handleTouchStart : undefined}
              onTouchMove={isFront ? handleTouchMove : undefined}
              onTouchEnd={isFront ? handleTouchEnd : undefined}
            >
              {/* Glowing border on front card */}
              {isFront && (
                <div
                  className="absolute inset-0 z-0 rounded-[24px] pointer-events-none"
                  style={{
                    background: "linear-gradient(135deg, hsl(var(--primary) / 0.15), transparent 40%, hsl(var(--primary) / 0.08))",
                  }}
                />
              )}

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
                sizes="(max-width: 640px) 85vw, 360px"
                onImageLoad={() => setImgLoaded(prev => ({ ...prev, [idx]: true }))}
                showSkeleton={false}
              />

              {/* Dark gradient */}
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.4) 40%, transparent 65%)" }}
              />

              {/* Heart */}
              <button
                onClick={(e) => { e.stopPropagation(); onToggleWishlist?.(property.id); }}
                className="absolute top-3 right-3 active:scale-125 transition-transform z-10"
              >
                <Heart
                  size={22}
                  className={`drop-shadow-lg transition-colors ${wishlist.includes(property.id) ? "fill-primary text-primary" : "fill-foreground/20 text-white"}`}
                  strokeWidth={2}
                />
              </button>

              {/* Drag hint */}
              {isFront && !isDragging && (
                <div
                  className="absolute top-3 left-3 px-3 py-1.5 rounded-full z-10 flex items-center gap-1.5"
                  style={{ background: "hsl(var(--primary) / 0.25)", backdropFilter: "blur(10px)", border: "1px solid hsl(var(--primary) / 0.3)" }}
                >
                  <span className="text-[9px] font-bold text-white tracking-wide">⟵ swipe ⟶</span>
                </div>
              )}

              {/* Bottom info */}
              <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-extrabold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {property.name}
                  </h3>
                  {property.verified && <BadgeCheck size={15} className="text-primary" />}
                </div>
                <p className="text-[12px] text-white/65 mt-1 line-clamp-1">{property.description}</p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-1.5">
                    <Star size={12} className="fill-primary text-primary" />
                    <span className="text-sm font-bold text-white">{property.rating}</span>
                    <span className="text-[11px] text-white/50">· {property.location}</span>
                  </div>
                  <span className="text-lg font-extrabold text-white">₹{property.basePrice.toLocaleString()}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
