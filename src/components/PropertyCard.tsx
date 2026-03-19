import { Heart, Star, BadgeCheck } from "lucide-react";
import { useState, useCallback, useRef } from "react";
import type { Property } from "@/data/properties";

interface PropertyCardProps {
  property: Property;
  index: number;
  onTap: (property: Property) => void;
}

export default function PropertyCard({ property, index, onTap }: PropertyCardProps) {
  const [imgIndex, setImgIndex] = useState(0);
  const [liked, setLiked] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const swiping = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    swiping.current = false;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    // Only swipe if horizontal movement is dominant and exceeds threshold
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      swiping.current = true;
      if (dx < 0) {
        setImgIndex((i) => (i === property.images.length - 1 ? 0 : i + 1));
      } else {
        setImgIndex((i) => (i === 0 ? property.images.length - 1 : i - 1));
      }
    }
    touchStart.current = null;
  }, [property.images.length]);

  const handleClick = useCallback(() => {
    if (!swiping.current) onTap(property);
  }, [onTap, property]);

  return (
    <div
      className="cursor-pointer px-5 group active:scale-[0.97] transition-transform"
      onClick={handleClick}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Image */}
      <div
        className="relative aspect-[4/3] rounded-2xl overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {!imgLoaded && (
          <div className="absolute inset-0 bg-secondary animate-pulse rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-muted/50 to-transparent animate-[shimmer_1.5s_infinite]" />
          </div>
        )}
        <img
          src={property.images[imgIndex]}
          alt={property.name}
          className="w-full h-full object-cover touch-pan-y"
          onLoad={() => setImgLoaded(true)}
          loading="lazy"
        />
        {/* Heart */}
        <button
          onClick={(e) => { e.stopPropagation(); setLiked(!liked); }}
          className="absolute top-3 right-3 active:scale-125 transition-transform"
        >
          <Heart
            size={24}
            className={`transition-colors duration-200 drop-shadow-lg ${liked ? "fill-primary text-primary" : "fill-foreground/20 text-background"}`}
            strokeWidth={2}
          />
        </button>
        {/* Badge */}
        {property.rating >= 4.8 && (
          <span className="absolute top-3 left-3 text-[11px] font-semibold glass px-3 py-1.5 rounded-full text-foreground">
            Guest favourite
          </span>
        )}
        {/* Dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {property.images.map((_, i) => (
            <span
              key={i}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === imgIndex ? 16 : 6,
                height: 6,
                backgroundColor: i === imgIndex ? "hsl(270 80% 65%)" : "hsla(0 0% 96% / 0.3)",
              }}
            />
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="pt-2.5 pb-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-[15px] text-foreground flex items-center gap-1">
              {property.name}
              {property.verified && <BadgeCheck size={14} className="text-primary shrink-0" />}
            </h3>
            <p className="text-sm text-muted-foreground">{property.description}</p>
            <p className="text-sm text-muted-foreground">
              {property.slotsLeft > 0 ? `${property.slotsLeft} slots left today` : "Fully booked"}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0 pt-0.5">
            <Star size={12} className="fill-primary text-primary" />
            <span className="text-sm font-medium text-foreground">{property.rating}</span>
          </div>
        </div>
        <p className="text-sm mt-0.5">
          <span className="font-semibold text-gradient-warm">₹{property.basePrice.toLocaleString()}</span>
          <span className="text-muted-foreground"> / 2 hours</span>
        </p>
      </div>
    </div>
  );
}
