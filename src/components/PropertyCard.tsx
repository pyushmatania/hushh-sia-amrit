import { Heart, Star, BadgeCheck, Zap, Flame, Sparkles } from "lucide-react";
import { useState, useCallback, useRef, useMemo, memo } from "react";
import type { Property } from "@/data/properties";
import { AccentFrame, AccentTag } from "@/components/shared/AccentFrame";
import OptimizedImage from "@/components/shared/OptimizedImage";
import SpotlightCard from "@/components/shared/SpotlightCard";

// Accent config — color + tag
type CardAccent = {
  color: string;
  tag: { label: string; bg: string; icon?: React.ReactNode };
};

function getCardAccent(property: Property, index: number): CardAccent {
  if (property.slotsLeft <= 2 && property.slotsLeft > 0) {
    return {
      color: "hsl(0 85% 55%)",
      tag: {
        label: "SELLING FAST",
        bg: "linear-gradient(135deg, hsl(0 85% 55%), hsl(35 95% 55%))",
        icon: <Flame size={11} className="text-primary-foreground" />,
      },
    };
  }

  if (property.rating >= 4.9) {
    return {
      color: "hsl(270 80% 65%)",
      tag: {
        label: "HUSHH PICK",
        bg: "linear-gradient(135deg, hsl(270 80% 65%), hsl(320 80% 60%))",
        icon: <Sparkles size={11} className="text-primary-foreground" />,
      },
    };
  }

  if (property.category.includes("party") && index % 3 === 0) {
    return {
      color: "hsl(280 90% 60%)",
      tag: {
        label: "HUSHH LIVE",
        bg: "linear-gradient(135deg, hsl(280 90% 60%), hsl(200 90% 55%))",
        icon: <Zap size={11} className="text-primary-foreground" />,
      },
    };
  }

  if (property.basePrice >= 1500 && index % 2 === 1) {
    return {
      color: "hsl(43 96% 56%)",
      tag: {
        label: "PREMIUM",
        bg: "linear-gradient(135deg, hsl(43 96% 50%), hsl(30 90% 45%))",
      },
    };
  }

  return {
    color: "hsl(var(--primary))",
    tag: {
      label: "CURATED",
      bg: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))",
      icon: <Sparkles size={11} className="text-primary-foreground" />,
    },
  };
}

interface PropertyCardProps {
  property: Property;
  index: number;
  onTap: (property: Property) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (id: string) => void;
}

export default memo(function PropertyCard({ property, index, onTap, isWishlisted = false, onToggleWishlist }: PropertyCardProps) {
  const [imgIndex, setImgIndex] = useState(0);
  const liked = isWishlisted;
  const [imgLoaded, setImgLoaded] = useState(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const swiping = useRef(false);

  const accent = useMemo(() => getCardAccent(property, index), [property, index]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    swiping.current = false;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
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
    <SpotlightCard
      className="cursor-pointer px-5 md:px-0 group active:scale-[0.97] transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] md:hover:opacity-95 md:hover:-translate-y-1 rounded-2xl"
      spotlightColor="rgba(168, 85, 247, 0.06)"
      borderColor="rgba(168, 85, 247, 0.12)"
    >
    <div
      onClick={handleClick}
    >
      {/* Image */}
      <div className="relative aspect-[4/3]">
        <AccentFrame color={accent.color} radius="1rem" glowAlpha={0.08} />
        <div
          className="relative w-full h-full rounded-2xl overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >

        {!imgLoaded && (
          <div className="absolute inset-0 bg-secondary animate-pulse rounded-2xl">
            <div className="absolute inset-0 shimmer-bg" />
          </div>
        )}
        <OptimizedImage
          src={property.images[imgIndex]}
          alt={property.name}
          fill
          className="object-cover touch-pan-y group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 90vw, 380px"
          onImageLoad={() => setImgLoaded(true)}
          showSkeleton={false}
        />

        <AccentTag tag={accent.tag} className="absolute top-3 left-3 z-10" />

        {/* Heart */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist?.(property.id);
          }}
          className="absolute top-3 right-3 active:scale-125 transition-transform"
        >
          <Heart
            size={24}
            className={`transition-colors duration-200 drop-shadow-lg ${liked ? "fill-primary text-primary" : "fill-foreground/20 text-background"}`}
            strokeWidth={2}
          />
        </button>

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
      </div>
      {/* Info */}
      <div className="pt-2.5 pb-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-[15px] md:text-base text-foreground flex items-center gap-1">
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
          <span className="font-semibold text-gradient-warm">₹{(() => {
            const availableSlots = property.slots?.filter(s => s.available);
            if (availableSlots?.length) return Math.min(...availableSlots.map(s => s.price)).toLocaleString();
            return property.basePrice.toLocaleString();
          })()}</span>
          <span className="text-muted-foreground"> {property.slots?.length ? "onwards" : "/ 2 hours"}</span>
        </p>
      </div>
    </div>
    </SpotlightCard>
  );
});
