import { Heart, Star } from "lucide-react";
import { useState } from "react";
import type { Property } from "@/data/properties";
import OptimizedImage from "@/components/shared/OptimizedImage";

interface PropertyDuoRowProps {
  properties: [Property, Property];
  startIndex: number;
  onTap: (property: Property) => void;
  wishlist: string[];
  onToggleWishlist?: (id: string) => void;
}

function MiniCard({ property, onTap, isWishlisted, onToggleWishlist }: {
  property: Property;
  onTap: (p: Property) => void;
  isWishlisted: boolean;
  onToggleWishlist?: (id: string) => void;
}) {
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <div
      className="flex-1 min-w-0 cursor-pointer active:scale-[0.96] transition-transform"
      onClick={() => onTap(property)}
    >
      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden">
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
          sizes="(max-width: 640px) 45vw, 200px"
          onImageLoad={() => setImgLoaded(true)}
          showSkeleton={false}
        />

        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.15) 50%, transparent 100%)" }}
        />

        {/* Heart */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleWishlist?.(property.id); }}
          className="absolute top-2 right-2 active:scale-125 transition-transform z-10"
        >
          <Heart
            size={18}
            className={`transition-colors duration-200 drop-shadow-lg ${isWishlisted ? "fill-primary text-primary" : "fill-foreground/20 text-white"}`}
            strokeWidth={2}
          />
        </button>

        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 right-0 p-2.5 z-10">
          <h4 className="text-[12px] font-bold text-white leading-tight truncate">{property.name}</h4>
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-0.5">
              <Star size={10} className="fill-primary text-primary" />
              <span className="text-[10px] font-semibold text-white/90">{property.rating}</span>
            </div>
            <span className="text-[11px] font-extrabold text-white">₹{property.basePrice.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PropertyDuoRow({ properties, startIndex, onTap, wishlist, onToggleWishlist }: PropertyDuoRowProps) {
  return (
    <div className="flex gap-3 px-5" style={{ animationDelay: `${startIndex * 60}ms` }}>
      {properties.map((p) => (
        <MiniCard
          key={p.id}
          property={p}
          onTap={onTap}
          isWishlisted={wishlist.includes(p.id)}
          onToggleWishlist={onToggleWishlist}
        />
      ))}
    </div>
  );
}
