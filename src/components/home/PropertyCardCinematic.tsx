import { Heart, Star, Users, Clock, Eye } from "lucide-react";
import { useState, useRef, useCallback } from "react";
import type { Property } from "@/data/properties";
import OptimizedImage from "@/components/shared/OptimizedImage";

/**
 * PropertyCardCinematic — interactive 3D tilt card.
 * Follows finger/mouse position with gyroscope-style rotateX/Y.
 * Features holographic glow, floating stats, and depth layers.
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
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isActive, setIsActive] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width - 0.5) * 2;  // -1 to 1
    const y = ((clientY - rect.top) / rect.height - 0.5) * 2;
    setTilt({ x: y * -12, y: x * 12 });
  }, []);

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX, e.touches[0].clientY);
  };

  const resetTilt = () => {
    setTilt({ x: 0, y: 0 });
    setIsActive(false);
  };

  return (
    <div
      className="mx-5 cursor-pointer"
      onClick={() => onTap(property)}
      style={{
        perspective: "1000px",
        animationDelay: `${index * 60}ms`,
      }}
    >
      <div
        ref={cardRef}
        className="relative overflow-hidden"
        onTouchStart={() => setIsActive(true)}
        onTouchMove={handleTouchMove}
        onTouchEnd={resetTilt}
        onMouseEnter={() => setIsActive(true)}
        onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
        onMouseLeave={resetTilt}
        style={{
          borderRadius: "24px",
          height: "240px",
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${isActive ? 1.02 : 1})`,
          transition: isActive ? "transform 0.1s ease-out" : "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
          transformStyle: "preserve-3d",
          boxShadow: isActive
            ? `0 20px 60px hsl(var(--primary) / 0.25), 0 0 0 1px hsl(var(--primary) / 0.2), ${tilt.y * 2}px ${-tilt.x * 2}px 30px hsl(var(--primary) / 0.1)`
            : "0 10px 40px hsl(var(--foreground) / 0.15), 0 0 0 1px hsl(var(--border) / 0.15)",
        }}
      >
        {/* Full background image */}
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

        {/* Holographic sheen overlay — moves with tilt */}
        <div
          className="absolute inset-0 pointer-events-none z-10 mix-blend-overlay"
          style={{
            background: `radial-gradient(circle at ${50 + tilt.y * 3}% ${50 + tilt.x * 3}%, hsl(var(--primary) / 0.3) 0%, transparent 60%)`,
            transition: isActive ? "background 0.1s" : "background 0.5s",
          }}
        />

        {/* Dark gradient bottom */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.1) 100%)" }}
        />

        {/* "3D" label that floats above */}
        <div
          className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
          style={{
            background: "hsl(var(--foreground) / 0.3)",
            backdropFilter: "blur(12px)",
            border: "1px solid hsl(var(--primary) / 0.25)",
            transform: `translateZ(20px) translate(${tilt.y * 1.5}px, ${tilt.x * 1.5}px)`,
          }}
        >
          <Eye size={10} className="text-primary" />
          <span className="text-[9px] font-bold text-white/90 tracking-wider uppercase">
            Interactive
          </span>
        </div>

        {/* Heart */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleWishlist?.(property.id); }}
          className="absolute top-3 right-3 active:scale-125 transition-transform z-20"
          style={{ transform: `translateZ(20px) translate(${tilt.y * 1}px, ${tilt.x * 1}px)` }}
        >
          <Heart
            size={20}
            className={`drop-shadow-lg transition-colors ${isWishlisted ? "fill-primary text-primary" : "fill-foreground/20 text-white"}`}
            strokeWidth={2}
          />
        </button>

        {/* Floating stat pills — move with parallax */}
        <div
          className="absolute top-14 right-3 z-20 flex flex-col gap-1.5"
          style={{ transform: `translateZ(30px) translate(${tilt.y * 2}px, ${tilt.x * 2}px)` }}
        >
          <span
            className="flex items-center gap-1 text-[9px] font-bold px-2.5 py-1 rounded-full text-white"
            style={{ background: "hsl(var(--primary) / 0.35)", backdropFilter: "blur(8px)", border: "1px solid hsl(var(--primary) / 0.2)" }}
          >
            <Users size={10} /> {property.capacity}
          </span>
          {property.slotsLeft > 0 && property.slotsLeft <= 5 && (
            <span
              className="flex items-center gap-1 text-[9px] font-bold px-2.5 py-1 rounded-full"
              style={{ background: "hsl(0 85% 55% / 0.3)", backdropFilter: "blur(8px)", color: "hsl(0 85% 70%)", border: "1px solid hsl(0 85% 55% / 0.2)" }}
            >
              <Clock size={10} /> {property.slotsLeft} left
            </span>
          )}
        </div>

        {/* Bottom content — parallax offset */}
        <div
          className="absolute bottom-0 left-0 right-0 p-5 z-20"
          style={{ transform: `translateZ(15px) translate(${tilt.y * 1.2}px, ${tilt.x * 1.2}px)` }}
        >
          <div className="flex items-center gap-1.5 mb-1">
            <Star size={13} className="fill-primary text-primary" />
            <span className="text-sm font-bold text-white">{property.rating}</span>
          </div>

          <h3
            className="text-[17px] font-extrabold text-white leading-tight"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {property.name}
          </h3>

          <p className="text-[11px] text-white/55 mt-1 line-clamp-1">{property.description}</p>

          <div className="flex items-center justify-between mt-2.5">
            <span className="text-[11px] text-white/50">{property.location}</span>
            <span className="text-[17px] font-extrabold text-gradient-warm">
              ₹{property.basePrice.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
