import { Heart, Star, Zap } from "lucide-react";
import { useState } from "react";
import type { Property } from "@/data/properties";
import OptimizedImage from "@/components/shared/OptimizedImage";

/**
 * PropertyCardPolaroid — a Polaroid/instant-camera style card
 * with a slight tilt and a handwritten-style caption area.
 */

interface PropertyCardPolaroidProps {
  property: Property;
  index: number;
  onTap: (property: Property) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (id: string) => void;
}

const tilts = [-2.5, 1.8, -1.2, 2.8, -0.5, 1.5];

export default function PropertyCardPolaroid({ property, index, onTap, isWishlisted = false, onToggleWishlist }: PropertyCardPolaroidProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const tilt = tilts[index % tilts.length];

  return (
    <div
      className="mx-auto cursor-pointer active:scale-[0.95] transition-transform"
      onClick={() => onTap(property)}
      style={{
        width: "78%",
        maxWidth: "320px",
        transform: `rotate(${tilt}deg)`,
        animationDelay: `${index * 60}ms`,
      }}
    >
      <div
        className="rounded-lg overflow-hidden shadow-xl"
        style={{
          background: "hsl(var(--card))",
          padding: "10px 10px 0 10px",
          border: "1px solid hsl(var(--border) / 0.3)",
          boxShadow: "0 8px 32px hsl(var(--foreground) / 0.15), 0 2px 8px hsl(var(--foreground) / 0.1)",
        }}
      >
        {/* Photo area */}
        <div className="relative aspect-square rounded-md overflow-hidden">
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
            sizes="(max-width: 640px) 78vw, 320px"
            onImageLoad={() => setImgLoaded(true)}
            showSkeleton={false}
          />

          {/* Heart */}
          <button
            onClick={(e) => { e.stopPropagation(); onToggleWishlist?.(property.id); }}
            className="absolute top-2 right-2 active:scale-125 transition-transform z-10"
          >
            <Heart
              size={20}
              className={`drop-shadow-lg transition-colors ${isWishlisted ? "fill-primary text-primary" : "fill-foreground/20 text-white"}`}
              strokeWidth={2}
            />
          </button>

          {/* Flash badge */}
          {property.rating >= 4.8 && (
            <div
              className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full z-10"
              style={{ background: "hsl(var(--primary) / 0.85)", backdropFilter: "blur(4px)" }}
            >
              <Zap size={10} className="text-primary-foreground" />
              <span className="text-[9px] font-bold text-primary-foreground">TOP RATED</span>
            </div>
          )}
        </div>

        {/* Caption area — Polaroid style */}
        <div className="py-3.5 px-1">
          <h3
            className="text-[15px] font-bold text-foreground"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {property.name}
          </h3>
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-1">
              <Star size={11} className="fill-primary text-primary" />
              <span className="text-[12px] font-semibold text-foreground">{property.rating}</span>
              <span className="text-[11px] text-muted-foreground ml-1">{property.location}</span>
            </div>
            <span className="text-[14px] font-extrabold text-gradient-warm">₹{property.basePrice.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
