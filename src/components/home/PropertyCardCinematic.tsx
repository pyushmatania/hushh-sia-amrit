import { Heart, Star, Clock, Users } from "lucide-react";
import { useState } from "react";
import type { Property } from "@/data/properties";
import OptimizedImage from "@/components/shared/OptimizedImage";

/**
 * PropertyCardCinematic — a diagonal split card with a tilted image
 * and floating stats. Feels editorial / magazine-like.
 */

interface PropertyCardCinematicProps {
  property: Property;
  index: number;
  onTap: (property: Property) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (id: string) => void;
}

export default function PropertyCardCinematic({ property, index, onTap, isWishlisted = false, onToggleWishlist }: PropertyCardCinematicProps) {
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <div
      className="mx-5 cursor-pointer active:scale-[0.97] transition-transform"
      onClick={() => onTap(property)}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div
        className="relative overflow-hidden"
        style={{
          borderRadius: "28px",
          height: "220px",
          background: "linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--muted)) 100%)",
        }}
      >
        {/* Diagonal image — takes ~60% with a clip */}
        <div
          className="absolute inset-0"
          style={{
            clipPath: "polygon(0 0, 72% 0, 52% 100%, 0 100%)",
          }}
        >
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
            sizes="(max-width: 640px) 70vw, 300px"
            onImageLoad={() => setImgLoaded(true)}
            showSkeleton={false}
          />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(135deg, transparent 30%, hsl(var(--card) / 0.5) 100%)" }}
          />
        </div>

        {/* Heart */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleWishlist?.(property.id); }}
          className="absolute top-3 left-3 active:scale-125 transition-transform z-10"
        >
          <Heart
            size={20}
            className={`drop-shadow-lg transition-colors ${isWishlisted ? "fill-primary text-primary" : "fill-foreground/20 text-background"}`}
            strokeWidth={2}
          />
        </button>

        {/* Right content — sits on the exposed right side */}
        <div className="absolute right-0 top-0 bottom-0 flex flex-col justify-center px-4" style={{ width: "55%" }}>
          <div className="flex items-center gap-1 mb-1">
            <Star size={12} className="fill-primary text-primary" />
            <span className="text-xs font-bold text-foreground">{property.rating}</span>
          </div>

          <h3
            className="text-[15px] font-extrabold text-foreground leading-tight"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {property.name}
          </h3>

          <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{property.description}</p>

          {/* Floating stat pills */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            <span className="flex items-center gap-1 text-[9px] font-semibold px-2 py-1 rounded-full bg-primary/10 text-primary">
              <Users size={10} /> {property.capacity}
            </span>
            {property.slotsLeft > 0 && property.slotsLeft <= 5 && (
              <span className="flex items-center gap-1 text-[9px] font-semibold px-2 py-1 rounded-full" style={{ background: "hsl(0 85% 55% / 0.12)", color: "hsl(0 85% 55%)" }}>
                <Clock size={10} /> {property.slotsLeft} left
              </span>
            )}
          </div>

          <p className="text-[16px] font-extrabold text-gradient-warm mt-2.5">
            ₹{property.basePrice.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
