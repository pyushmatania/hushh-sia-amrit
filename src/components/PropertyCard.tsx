import { Heart, Star, BadgeCheck, Zap, Flame, Sparkles } from "lucide-react";
import { useState, useCallback, useRef, useMemo } from "react";
import type { Property } from "@/data/properties";

// Creative accent styles applied to select listings
type CardAccent = {
  borderGradient: string;
  tag: { label: string; bg: string; text: string; icon?: React.ReactNode };
} | null;

function getCardAccent(property: Property, index: number): CardAccent {
  // Only accent ~40% of cards for variety
  if (property.slotsLeft <= 2 && property.slotsLeft > 0) {
    return {
      borderGradient: "linear-gradient(135deg, hsl(0 85% 55%), hsl(35 95% 55%), hsl(50 95% 60%))",
      tag: {
        label: "SELLING FAST",
        bg: "linear-gradient(135deg, hsl(0 85% 55%), hsl(35 95% 55%))",
        text: "white",
        icon: <Flame size={11} className="text-white" />,
      },
    };
  }
  if (property.rating >= 4.9) {
    return {
      borderGradient: "linear-gradient(135deg, hsl(270 80% 65%), hsl(320 80% 60%), hsl(270 60% 80%))",
      tag: {
        label: "HUSHH PICK",
        bg: "linear-gradient(135deg, hsl(270 80% 65%), hsl(320 80% 60%))",
        text: "white",
        icon: <Sparkles size={11} className="text-white" />,
      },
    };
  }
  if (property.category.includes("party") && index % 3 === 0) {
    return {
      borderGradient: "linear-gradient(135deg, hsl(280 90% 60%), hsl(200 90% 55%), hsl(170 80% 50%))",
      tag: {
        label: "HUSHH LIVE",
        bg: "linear-gradient(135deg, hsl(280 90% 60%), hsl(200 90% 55%))",
        text: "white",
        icon: <Zap size={11} className="text-white" />,
      },
    };
  }
  if (property.basePrice >= 1500 && index % 2 === 1) {
    return {
      borderGradient: "linear-gradient(135deg, hsl(43 96% 56%), hsl(30 90% 50%), hsl(43 96% 66%))",
      tag: {
        label: "PREMIUM",
        bg: "linear-gradient(135deg, hsl(43 96% 50%), hsl(30 90% 45%))",
        text: "white",
      },
    };
  }
  return null;
}

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
    <div
      className="cursor-pointer px-5 group active:scale-[0.97] transition-transform"
      onClick={handleClick}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Image container with optional gradient border */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={accent ? {
          padding: "2px",
          background: accent.borderGradient,
          borderRadius: "18px",
        } : undefined}
      >
        <div
          className={`relative aspect-[4/3] overflow-hidden ${accent ? "rounded-[16px]" : "rounded-2xl"}`}
          style={accent ? { background: "hsl(260 20% 6%)" } : undefined}
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

          {/* Creative accent tag (top-left) */}
          {accent?.tag && (
            <span
              className="absolute top-3 left-3 text-[10px] font-bold tracking-wider px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg"
              style={{
                background: accent.tag.bg,
                color: accent.tag.text,
                letterSpacing: "0.08em",
              }}
            >
              {accent.tag.icon}
              {accent.tag.label}
            </span>
          )}

          {/* Guest favourite (only if no accent tag) */}
          {!accent?.tag && property.rating >= 4.8 && (
            <span className="absolute top-3 left-3 text-[11px] font-semibold glass px-3 py-1.5 rounded-full text-foreground">
              Guest favourite
            </span>
          )}

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
