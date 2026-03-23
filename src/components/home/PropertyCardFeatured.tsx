import { Heart, Star, BadgeCheck, ArrowRight, Sparkles } from "lucide-react";
import { useState, useCallback, useRef } from "react";
import type { Property } from "@/data/properties";
import { AccentFrame, AccentTag } from "@/components/shared/AccentFrame";
import OptimizedImage from "@/components/shared/OptimizedImage";

interface PropertyCardFeaturedProps {
  property: Property;
  index: number;
  onTap: (property: Property) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (id: string) => void;
}

const taglines = [
  "Editor's Pick",
  "Guest Favourite",
  "Most Loved",
  "Staff Pick",
  "Top Rated",
  "Best Seller",
];

export default function PropertyCardFeatured({ property, index, onTap, isWishlisted = false, onToggleWishlist }: PropertyCardFeaturedProps) {
  const [imgIndex, setImgIndex] = useState(0);
  const [imgLoaded, setImgLoaded] = useState(false);
  const touchStart = useRef<{ x: number } | null>(null);
  const swiping = useRef(false);

  const tagline = taglines[index % taglines.length];

  return (
    <div
      className="cursor-pointer mx-5 group active:scale-[0.97] transition-transform"
      onClick={() => { if (!swiping.current) onTap(property); }}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Tall hero card */}
      <div className="relative overflow-hidden" style={{ borderRadius: "24px", height: "420px" }}>
        <AccentFrame color="hsl(270 80% 65%)" radius="24px" glowAlpha={0.1} />

        <div
          className="relative w-full h-full overflow-hidden"
          style={{ borderRadius: "24px" }}
          onTouchStart={(e) => { touchStart.current = { x: e.touches[0].clientX }; swiping.current = false; }}
          onTouchEnd={(e) => {
            if (!touchStart.current) return;
            const dx = e.changedTouches[0].clientX - touchStart.current.x;
            if (Math.abs(dx) > 40) {
              swiping.current = true;
              setImgIndex(i => dx < 0 ? (i === property.images.length - 1 ? 0 : i + 1) : (i === 0 ? property.images.length - 1 : i - 1));
            }
            touchStart.current = null;
          }}
        >
          {!imgLoaded && (
            <div className="absolute inset-0 bg-secondary animate-pulse">
              <div className="absolute inset-0 shimmer-bg" />
            </div>
          )}
          <OptimizedImage
            src={property.images[imgIndex]}
            alt={property.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 500px"
            onImageLoad={() => setImgLoaded(true)}
            showSkeleton={false}
          />

          {/* Top bar */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 z-10">
            <AccentTag
              tag={{
                label: tagline.toUpperCase(),
                bg: "linear-gradient(135deg, hsl(270 80% 65%), hsl(320 80% 60%))",
                icon: <Sparkles size={11} className="text-primary-foreground" />,
              }}
            />
            <button
              onClick={(e) => { e.stopPropagation(); onToggleWishlist?.(property.id); }}
              className="w-9 h-9 rounded-full flex items-center justify-center active:scale-125 transition-transform"
              style={{ background: "hsl(var(--foreground) / 0.3)", backdropFilter: "blur(8px)" }}
            >
              <Heart
                size={18}
                className={`transition-colors duration-200 ${isWishlisted ? "fill-primary text-primary" : "fill-white/30 text-white"}`}
                strokeWidth={2}
              />
            </button>
          </div>

          {/* Dots */}
          <div className="absolute top-16 left-1/2 -translate-x-1/2 flex gap-1 z-10">
            {property.images.slice(0, 5).map((_, i) => (
              <span
                key={i}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === imgIndex ? 18 : 5,
                  height: 5,
                  backgroundColor: i === imgIndex ? "white" : "rgba(255,255,255,0.35)",
                }}
              />
            ))}
          </div>

          {/* Bottom overlay */}
          <div
            className="absolute bottom-0 left-0 right-0 p-5 z-10"
            style={{
              background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 50%, transparent 100%)",
            }}
          >
            <div className="flex items-center gap-1.5 mb-1">
              {property.verified && <BadgeCheck size={14} className="text-primary" />}
              <h3
                className="text-xl font-extrabold text-white leading-tight"
                style={{ fontFamily: "'Space Grotesk', sans-serif", textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}
              >
                {property.name}
              </h3>
            </div>

            <p
              className="text-[13px] text-white/70 italic leading-snug mt-0.5"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {property.description}
            </p>

            {/* Amenity chips */}
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {property.amenities.slice(0, 3).map((a, i) => (
                <span
                  key={i}
                  className="text-[9px] px-2 py-1 rounded-full text-white/85 font-medium border border-white/15"
                  style={{ background: "hsl(var(--foreground) / 0.2)", backdropFilter: "blur(4px)" }}
                >
                  {a}
                </span>
              ))}
            </div>

            {/* Price + CTA row */}
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-baseline gap-1.5">
                <Star size={13} className="fill-primary text-primary" />
                <span className="text-white text-sm font-bold">{property.rating}</span>
                <span className="text-white/40 text-xs">·</span>
                <span className="text-xl font-extrabold text-white">₹{property.basePrice.toLocaleString()}</span>
              </div>
              <div
                className="flex items-center gap-1 bg-primary text-primary-foreground px-4 py-2 rounded-full text-[12px] font-bold active:scale-95 transition-transform"
                style={{ boxShadow: "0 4px 16px hsl(var(--primary) / 0.4)" }}
              >
                View <ArrowRight size={12} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
