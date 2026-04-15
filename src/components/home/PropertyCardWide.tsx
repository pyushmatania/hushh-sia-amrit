import { Heart, Star, BadgeCheck, MapPin } from "lucide-react";
import { useState, useCallback } from "react";
import type { Property } from "@/data/properties";
import OptimizedImage from "@/components/shared/OptimizedImage";

interface PropertyCardWideProps {
  property: Property;
  index: number;
  onTap: (property: Property) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (id: string) => void;
}

export default function PropertyCardWide({ property, index, onTap, isWishlisted = false, onToggleWishlist }: PropertyCardWideProps) {
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <div
      className="cursor-pointer mx-5 group active:scale-[0.98] transition-transform"
      onClick={() => onTap(property)}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div
        className="flex rounded-2xl overflow-hidden border border-border/30"
        style={{
          background: "linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--card) / 0.8) 100%)",
          height: "140px",
        }}
      >
        {/* Left image */}
        <div className="relative w-[42%] shrink-0">
          {!imgLoaded && (
            <div className="absolute inset-0 bg-secondary animate-pulse">
              <div className="absolute inset-0 shimmer-bg" />
            </div>
          )}
          <OptimizedImage
            src={property.images?.[0] || "/placeholder.svg"}
            alt={property.name}
            fill
            className="object-cover"
            sizes="180px"
            onImageLoad={() => setImgLoaded(true)}
            showSkeleton={false}
          />
          <button
            onClick={(e) => { e.stopPropagation(); onToggleWishlist?.(property.id); }}
            className="absolute top-2.5 left-2.5 active:scale-125 transition-transform"
          >
            <Heart
              size={20}
              className={`transition-colors duration-200 drop-shadow-lg ${isWishlisted ? "fill-primary text-primary" : "fill-foreground/20 text-background"}`}
              strokeWidth={2}
            />
          </button>
        </div>

        {/* Right content */}
        <div className="flex-1 p-3.5 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-[14px] text-foreground truncate">
                {property.name}
              </h3>
              {property.verified && <BadgeCheck size={13} className="text-primary shrink-0" />}
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin size={11} className="text-muted-foreground shrink-0" />
              <p className="text-[11px] text-muted-foreground truncate">{property.location}</p>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{property.description}</p>
          </div>

          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center gap-1">
              <Star size={11} className="fill-primary text-primary" />
              <span className="text-[12px] font-semibold text-foreground">{property.rating}</span>
              {property.slotsLeft <= 3 && property.slotsLeft > 0 && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold ml-1" style={{ background: "hsl(0 85% 55% / 0.15)", color: "hsl(0 85% 55%)" }}>
                  {property.slotsLeft} left
                </span>
              )}
            </div>
            <span className="text-[14px] font-extrabold text-gradient-warm">
              ₹{property.basePrice.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
