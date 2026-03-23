import { Heart, Star, BadgeCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef, useCallback } from "react";
import type { Property } from "@/data/properties";
import OptimizedImage from "@/components/shared/OptimizedImage";

/**
 * PropertyCardStack — swipeable card deck.
 * Shows active card front-and-center; previous/next peek behind with depth.
 * Swipe or tap arrows to cycle through.
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
  const [imgLoaded, setImgLoaded] = useState<Record<number, boolean>>({});
  const touchRef = useRef<{ x: number; t: number } | null>(null);
  const swipedRef = useRef(false);

  const goNext = useCallback(() => setActive(i => (i + 1) % cards.length), [cards.length]);
  const goPrev = useCallback(() => setActive(i => (i - 1 + cards.length) % cards.length), [cards.length]);

  const getCardStyle = (idx: number) => {
    const diff = ((idx - active) + cards.length) % cards.length;
    if (diff === 0) return { zIndex: 30, x: 0, scale: 1, rotate: 0, opacity: 1 };
    if (diff === 1) return { zIndex: 20, x: 28, scale: 0.92, rotate: 4, opacity: 0.6 };
    return { zIndex: 10, x: -28, scale: 0.92, rotate: -4, opacity: 0.6 };
  };

  return (
    <div
      className="mx-5 relative"
      style={{ height: "320px", animationDelay: `${startIndex * 60}ms` }}
    >
      {/* Deck label */}
      <div className="absolute -top-1 right-0 z-40 flex items-center gap-1.5">
        <button
          onClick={(e) => { e.stopPropagation(); goPrev(); }}
          className="w-7 h-7 rounded-full flex items-center justify-center active:scale-90 transition-transform border border-border/30"
          style={{ background: "hsl(var(--card) / 0.9)", backdropFilter: "blur(8px)" }}
        >
          <ChevronLeft size={14} className="text-foreground" />
        </button>
        <span className="text-[10px] font-bold text-muted-foreground tabular-nums">
          {active + 1}/{cards.length}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); goNext(); }}
          className="w-7 h-7 rounded-full flex items-center justify-center active:scale-90 transition-transform border border-border/30"
          style={{ background: "hsl(var(--card) / 0.9)", backdropFilter: "blur(8px)" }}
        >
          <ChevronRight size={14} className="text-foreground" />
        </button>
      </div>

      {/* Card deck */}
      <div className="relative w-full h-full mt-3">
        {cards.map((property, idx) => {
          const s = getCardStyle(idx);
          const isFront = idx === active;

          return (
            <div
              key={property.id}
              className="absolute inset-0 rounded-3xl overflow-hidden border border-border/20"
              style={{
                zIndex: s.zIndex,
                transform: `translateX(${s.x}px) scale(${s.scale}) rotate(${s.rotate}deg)`,
                opacity: s.opacity,
                transition: "all 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)",
                boxShadow: isFront
                  ? "0 12px 40px hsl(var(--foreground) / 0.18)"
                  : "0 4px 16px hsl(var(--foreground) / 0.08)",
                pointerEvents: isFront ? "auto" : "none",
              }}
              onClick={() => { if (!swipedRef.current) onTap(property); }}
              onTouchStart={(e) => {
                touchRef.current = { x: e.touches[0].clientX, t: Date.now() };
                swipedRef.current = false;
              }}
              onTouchEnd={(e) => {
                if (!touchRef.current) return;
                const dx = e.changedTouches[0].clientX - touchRef.current.x;
                const dt = Date.now() - touchRef.current.t;
                if (Math.abs(dx) > 35 && dt < 400) {
                  swipedRef.current = true;
                  dx < 0 ? goNext() : goPrev();
                }
                touchRef.current = null;
              }}
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
                sizes="(max-width: 640px) 85vw, 360px"
                onImageLoad={() => setImgLoaded(prev => ({ ...prev, [idx]: true }))}
                showSkeleton={false}
              />

              {/* Gradient */}
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.35) 45%, transparent 70%)" }}
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

              {/* Swipe hint pill */}
              {isFront && (
                <div
                  className="absolute top-3 left-3 px-2.5 py-1 rounded-full z-10 flex items-center gap-1"
                  style={{ background: "hsl(var(--foreground) / 0.35)", backdropFilter: "blur(8px)" }}
                >
                  <span className="text-[9px] font-bold text-white">⟵ swipe ⟶</span>
                </div>
              )}

              {/* Bottom info */}
              <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-lg font-extrabold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {property.name}
                  </h3>
                  {property.verified && <BadgeCheck size={14} className="text-primary" />}
                </div>
                <p className="text-[12px] text-white/70 mt-0.5 line-clamp-1">{property.description}</p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1">
                    <Star size={12} className="fill-primary text-primary" />
                    <span className="text-sm font-bold text-white">{property.rating}</span>
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
