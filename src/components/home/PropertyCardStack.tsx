import { Heart, Star, BadgeCheck } from "lucide-react";
import { useState } from "react";
import type { Property } from "@/data/properties";
import OptimizedImage from "@/components/shared/OptimizedImage";

/**
 * PropertyCardStack — shows 3 properties as fanned/stacked cards.
 * The top card is fully visible; the ones behind peek out with rotation + offset.
 * Tapping navigates to the front card.
 */

interface PropertyCardStackProps {
  properties: Property[];
  startIndex: number;
  onTap: (property: Property) => void;
  wishlist: string[];
  onToggleWishlist?: (id: string) => void;
}

const stackStyles = [
  { zIndex: 30, rotate: 0, translateX: 0, translateY: 0, scale: 1, opacity: 1 },
  { zIndex: 20, rotate: 3.5, translateX: 12, translateY: -8, scale: 0.94, opacity: 0.7 },
  { zIndex: 10, rotate: -2.5, translateX: -10, translateY: -14, scale: 0.88, opacity: 0.45 },
];

export default function PropertyCardStack({ properties, startIndex, onTap, wishlist, onToggleWishlist }: PropertyCardStackProps) {
  const cards = properties.slice(0, 3);
  const front = cards[0];
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <div
      className="mx-5 cursor-pointer active:scale-[0.97] transition-transform"
      onClick={() => onTap(front)}
      style={{ animationDelay: `${startIndex * 60}ms` }}
    >
      {/* Stack container */}
      <div className="relative" style={{ height: "280px" }}>
        {cards.map((property, idx) => {
          const s = stackStyles[idx] || stackStyles[2];
          return (
            <div
              key={property.id}
              className="absolute inset-0 rounded-3xl overflow-hidden border border-border/20 shadow-lg"
              style={{
                zIndex: s.zIndex,
                transform: `rotate(${s.rotate}deg) translateX(${s.translateX}px) translateY(${s.translateY}px) scale(${s.scale})`,
                opacity: s.opacity,
                transition: "transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
              }}
            >
              {idx === 0 ? (
                <>
                  {!imgLoaded && (
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
                    onImageLoad={() => setImgLoaded(true)}
                    showSkeleton={false}
                  />
                  {/* Gradient overlay */}
                  <div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 40%, transparent 70%)" }}
                  />
                  {/* Heart */}
                  <button
                    onClick={(e) => { e.stopPropagation(); onToggleWishlist?.(front.id); }}
                    className="absolute top-3 right-3 active:scale-125 transition-transform z-10"
                  >
                    <Heart
                      size={22}
                      className={`drop-shadow-lg transition-colors ${wishlist.includes(front.id) ? "fill-primary text-primary" : "fill-foreground/20 text-white"}`}
                      strokeWidth={2}
                    />
                  </button>
                  {/* Stack count badge */}
                  <div
                    className="absolute top-3 left-3 px-2.5 py-1 rounded-full z-10 flex items-center gap-1"
                    style={{ background: "hsl(var(--foreground) / 0.4)", backdropFilter: "blur(8px)" }}
                  >
                    <span className="text-[10px] font-bold text-white">📚 {cards.length} places</span>
                  </div>
                  {/* Bottom info */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-lg font-extrabold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        {property.name}
                      </h3>
                      {property.verified && <BadgeCheck size={14} className="text-primary" />}
                    </div>
                    <p className="text-[12px] text-white/70 mt-0.5">{property.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1">
                        <Star size={12} className="fill-primary text-primary" />
                        <span className="text-sm font-bold text-white">{property.rating}</span>
                      </div>
                      <span className="text-lg font-extrabold text-white">₹{property.basePrice.toLocaleString()}</span>
                    </div>
                  </div>
                </>
              ) : (
                <OptimizedImage
                  src={property.images[0]}
                  alt={property.name}
                  fill
                  className="object-cover"
                  sizes="100px"
                  showSkeleton
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
