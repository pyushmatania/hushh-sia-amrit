import { Heart, Star, Camera } from "lucide-react";
import { useState } from "react";
import type { Property } from "@/data/properties";
import OptimizedImage from "@/components/shared/OptimizedImage";

/**
 * PropertyCardPolaroid — styled like a real instant photo pinned to a board.
 * Features: thick white border, tape strip on top, slight tilt, shadow depth,
 * handwritten-style caption with a date stamp.
 */

interface PropertyCardPolaroidProps {
  property: Property;
  index: number;
  onTap: (property: Property) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (id: string) => void;
}

const tilts = [-3, 2.2, -1.5, 3, -0.8, 1.8];
const tapeColors = [
  "hsl(43 85% 75% / 0.7)",
  "hsl(200 60% 80% / 0.6)",
  "hsl(340 50% 80% / 0.6)",
  "hsl(120 40% 75% / 0.6)",
  "hsl(270 50% 80% / 0.6)",
  "hsl(30 70% 78% / 0.65)",
];
const captions = [
  "memories here ✨",
  "can't wait to go back",
  "best spot ever 🌿",
  "golden hour vibes ☀️",
  "our happy place 💛",
  "weekend escape 🎶",
];

export default function PropertyCardPolaroid({ property, index, onTap, isWishlisted = false, onToggleWishlist }: PropertyCardPolaroidProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const tilt = tilts[index % tilts.length];
  const tape = tapeColors[index % tapeColors.length];
  const caption = captions[index % captions.length];

  return (
    <div
      className="mx-auto cursor-pointer active:scale-[0.94] transition-transform"
      onClick={() => onTap(property)}
      style={{
        width: "74%",
        maxWidth: "300px",
        transform: `rotate(${tilt}deg)`,
        animationDelay: `${index * 60}ms`,
      }}
    >
      {/* Tape strip */}
      <div
        className="mx-auto relative z-10"
        style={{
          width: "60px",
          height: "16px",
          background: tape,
          borderRadius: "2px",
          transform: `rotate(${-tilt * 0.5}deg) translateY(8px)`,
          boxShadow: "0 1px 3px hsl(var(--foreground) / 0.1)",
        }}
      />

      {/* Photo card */}
      <div
        className="relative overflow-visible"
        style={{
          background: "hsl(var(--card))",
          padding: "10px 10px 0 10px",
          borderRadius: "4px",
          boxShadow:
            "0 10px 40px hsl(var(--foreground) / 0.15), 0 2px 8px hsl(var(--foreground) / 0.1), inset 0 0 0 1px hsl(var(--border) / 0.15)",
        }}
      >
        {/* Photo area */}
        <div className="relative aspect-[4/3] overflow-hidden" style={{ borderRadius: "2px" }}>
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
            sizes="(max-width: 640px) 74vw, 300px"
            onImageLoad={() => setImgLoaded(true)}
            showSkeleton={false}
          />

          {/* Heart */}
          <button
            onClick={(e) => { e.stopPropagation(); onToggleWishlist?.(property.id); }}
            className="absolute top-2 right-2 active:scale-125 transition-transform z-10"
          >
            <Heart
              size={18}
              className={`drop-shadow-lg transition-colors ${isWishlisted ? "fill-primary text-primary" : "fill-foreground/20 text-white"}`}
              strokeWidth={2}
            />
          </button>

          {/* Camera icon + date */}
          <div
            className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full z-10"
            style={{ background: "hsl(var(--foreground) / 0.4)", backdropFilter: "blur(6px)" }}
          >
            <Camera size={9} className="text-white" />
            <span className="text-[8px] text-white/80 font-mono">
              {new Date().toLocaleDateString("en-US", { month: "short", year: "2-digit" })}
            </span>
          </div>
        </div>

        {/* Caption area */}
        <div className="py-3 px-1">
          <h3
            className="text-[14px] font-bold text-foreground leading-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {property.name}
          </h3>

          {/* Handwritten caption */}
          <p
            className="text-[11px] text-muted-foreground mt-1 italic"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            "{caption}"
          </p>

          <div className="flex items-center justify-between mt-1.5">
            <div className="flex items-center gap-1">
              <Star size={10} className="fill-primary text-primary" />
              <span className="text-[11px] font-semibold text-foreground">{property.rating}</span>
              <span className="text-[10px] text-muted-foreground ml-0.5">{property.location}</span>
            </div>
            <span className="text-[13px] font-extrabold text-gradient-warm">₹{property.basePrice.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
