import { Heart, Star, Users, Clock, Zap, Shield, Flame, Swords, Crown } from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";
import type { Property } from "@/data/properties";
import OptimizedImage from "@/components/shared/OptimizedImage";

/**
 * PropertyCardCinematic — RPG-style collectible game card.
 * Interactive 3D tilt with holographic rainbow sheen, stat bars,
 * rarity badge, XP ring, and power-level flame effects.
 */

interface PropertyCardCinematicProps {
  property: Property;
  index: number;
  onTap: (property: Property) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (id: string) => void;
}

const RARITY_MAP: Record<string, { label: string; color: string; glow: string; icon: typeof Crown }> = {
  legendary: { label: "LEGENDARY", color: "hsl(45 100% 55%)", glow: "hsl(45 100% 55% / 0.4)", icon: Crown },
  epic: { label: "EPIC", color: "hsl(280 80% 60%)", glow: "hsl(280 80% 60% / 0.4)", icon: Flame },
  rare: { label: "RARE", color: "hsl(210 90% 60%)", glow: "hsl(210 90% 60% / 0.4)", icon: Shield },
  common: { label: "COMMON", color: "hsl(var(--muted-foreground))", glow: "hsl(var(--muted-foreground) / 0.2)", icon: Swords },
};

function getRarity(price: number): string {
  if (price >= 8000) return "legendary";
  if (price >= 4000) return "epic";
  if (price >= 1500) return "rare";
  return "common";
}

function StatBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="flex items-center gap-2">
      <span className="text-[8px] font-bold uppercase tracking-wider text-white/50 w-[32px]">{label}</span>
      <div className="flex-1 h-[5px] rounded-full overflow-hidden" style={{ background: "hsl(0 0% 100% / 0.08)" }}>
        <div
          className="h-full rounded-full"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}, ${color}aa)`,
            boxShadow: `0 0 6px ${color}60`,
            transition: "width 1s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        />
      </div>
      <span className="text-[8px] font-mono font-bold text-white/60 w-[20px] text-right">{value}</span>
    </div>
  );
}

function XpRing({ level, color }: { level: number; color: string }) {
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(level / 100, 1);
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="relative w-[40px] h-[40px] flex items-center justify-center">
      <svg width="40" height="40" className="absolute -rotate-90">
        <circle cx="20" cy="20" r={radius} fill="none" stroke="hsl(0 0% 100% / 0.08)" strokeWidth="3" />
        <circle
          cx="20" cy="20" r={radius} fill="none"
          stroke={color} strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.2s ease-out", filter: `drop-shadow(0 0 4px ${color}80)` }}
        />
      </svg>
      <span className="text-[11px] font-black text-white z-10">{level}</span>
    </div>
  );
}

export default function PropertyCardCinematic({ property, index, onTap, isWishlisted = false, onToggleWishlist }: PropertyCardCinematicProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isActive, setIsActive] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const rarity = getRarity(property.basePrice);
  const rarityInfo = RARITY_MAP[rarity];
  const RarityIcon = rarityInfo.icon;

  // Derived stats from property data
  const stats = {
    power: Math.min(Math.round(property.basePrice / 100), 99),
    vibe: Math.min(Math.round(property.rating * 20), 99),
    capacity: Math.min(property.capacity * 3, 99),
    demand: property.slotsLeft <= 3 ? 95 : property.slotsLeft <= 5 ? 70 : 40,
  };
  const totalPower = Math.round((stats.power + stats.vibe + stats.capacity + stats.demand) / 4);

  useEffect(() => {
    const timer = setTimeout(() => setShowStats(true), 200 + index * 100);
    return () => clearTimeout(timer);
  }, [index]);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((clientY - rect.top) / rect.height - 0.5) * 2;
    setTilt({ x: y * -15, y: x * 15 });
  }, []);

  const resetTilt = () => { setTilt({ x: 0, y: 0 }); setIsActive(false); };

  const holoX = 50 + tilt.y * 4;
  const holoY = 50 + tilt.x * 4;

  return (
    <div
      className="mx-5 cursor-pointer"
      onClick={() => onTap(property)}
      style={{ perspective: "1200px", animationDelay: `${index * 60}ms` }}
    >
      <div
        ref={cardRef}
        className="relative"
        onTouchStart={() => setIsActive(true)}
        onTouchMove={(e) => handleMove(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchEnd={resetTilt}
        onMouseEnter={() => setIsActive(true)}
        onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
        onMouseLeave={resetTilt}
        style={{
          height: "300px",
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${isActive ? 1.03 : 1})`,
          transition: isActive ? "transform 0.08s ease-out" : "transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Card frame with rarity border */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            borderRadius: "20px",
            border: `2px solid ${rarityInfo.color}60`,
            boxShadow: isActive
              ? `0 25px 70px ${rarityInfo.glow}, 0 0 0 1px ${rarityInfo.color}30, ${tilt.y * 2}px ${-tilt.x * 2}px 40px ${rarityInfo.glow}`
              : `0 12px 40px hsl(var(--foreground) / 0.2), 0 0 0 1px ${rarityInfo.color}20`,
          }}
        >
          {/* Background image */}
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

          {/* Holographic rainbow sheen — follows tilt */}
          <div
            className="absolute inset-0 pointer-events-none z-10 mix-blend-color-dodge"
            style={{
              background: `
                radial-gradient(circle at ${holoX}% ${holoY}%, hsl(0 100% 60% / 0.08) 0%, transparent 25%),
                radial-gradient(circle at ${holoX + 10}% ${holoY - 10}%, hsl(120 100% 50% / 0.06) 0%, transparent 30%),
                radial-gradient(circle at ${holoX - 15}% ${holoY + 15}%, hsl(240 100% 60% / 0.08) 0%, transparent 25%)
              `,
              opacity: isActive ? 1 : 0,
              transition: "opacity 0.3s",
            }}
          />

          {/* Scan-line effect */}
          {isActive && (
            <div
              className="absolute inset-0 pointer-events-none z-10"
              style={{
                background: "repeating-linear-gradient(0deg, transparent 0px, transparent 3px, hsl(0 0% 100% / 0.015) 3px, hsl(0 0% 100% / 0.015) 4px)",
              }}
            />
          )}

          {/* Dark overlay */}
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.4) 45%, rgba(0,0,0,0.15) 100%)" }} />

          {/* ── Top HUD ── */}
          <div className="absolute top-0 inset-x-0 z-20 p-3 flex items-start justify-between">
            {/* Rarity badge */}
            <div
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg"
              style={{
                background: `${rarityInfo.color}25`,
                border: `1px solid ${rarityInfo.color}40`,
                backdropFilter: "blur(10px)",
                transform: `translateZ(25px) translate(${tilt.y * 1.5}px, ${tilt.x * 1.5}px)`,
                boxShadow: `0 0 12px ${rarityInfo.glow}`,
              }}
            >
              <RarityIcon size={10} style={{ color: rarityInfo.color }} />
              <span className="text-[8px] font-black tracking-[0.2em]" style={{ color: rarityInfo.color }}>
                {rarityInfo.label}
              </span>
            </div>

            {/* Heart + XP Ring */}
            <div className="flex items-center gap-2" style={{ transform: `translateZ(20px) translate(${tilt.y}px, ${tilt.x}px)` }}>
              <button
                onClick={(e) => { e.stopPropagation(); onToggleWishlist?.(property.id); }}
                className="active:scale-125 transition-transform"
              >
                <Heart
                  size={18}
                  className={`drop-shadow-lg transition-colors ${isWishlisted ? "fill-primary text-primary" : "fill-foreground/20 text-white"}`}
                  strokeWidth={2}
                />
              </button>
              <XpRing level={totalPower} color={rarityInfo.color} />
            </div>
          </div>

          {/* ── Bottom content ── */}
          <div
            className="absolute bottom-0 left-0 right-0 p-4 z-20"
            style={{ transform: `translateZ(18px) translate(${tilt.y * 1.2}px, ${tilt.x * 1.2}px)` }}
          >
            {/* Name + rating */}
            <div className="flex items-center gap-1.5 mb-1">
              <Star size={12} className="fill-amber-400 text-amber-400" />
              <span className="text-[12px] font-bold text-white">{property.rating}</span>
              {property.slotsLeft > 0 && property.slotsLeft <= 5 && (
                <span className="flex items-center gap-0.5 ml-1 text-[8px] font-bold px-1.5 py-0.5 rounded" style={{ background: "hsl(0 80% 50% / 0.3)", color: "hsl(0 80% 70%)" }}>
                  <Zap size={8} /> HOT
                </span>
              )}
            </div>

            <h3 className="text-[16px] font-black text-white leading-tight tracking-tight">{property.name}</h3>
            <p className="text-[10px] text-white/45 mt-0.5 line-clamp-1">{property.location}</p>

            {/* Stat bars */}
            <div className="mt-3 space-y-1.5" style={{ opacity: showStats ? 1 : 0, transition: "opacity 0.5s" }}>
              <StatBar label="PWR" value={stats.power} max={99} color={rarityInfo.color} />
              <StatBar label="VIBE" value={stats.vibe} max={99} color="hsl(45 100% 55%)" />
              <StatBar label="SIZE" value={stats.capacity} max={99} color="hsl(160 70% 50%)" />
              <StatBar label="HYPE" value={stats.demand} max={99} color="hsl(0 80% 60%)" />
            </div>

            {/* Price + Book CTA */}
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-1">
                <Zap size={12} style={{ color: rarityInfo.color }} />
                <span className="text-[18px] font-black text-white">₹{property.basePrice.toLocaleString()}</span>
                <span className="text-[10px] text-white/40 ml-0.5">/session</span>
              </div>
              <div
                className="px-3 py-1.5 rounded-lg text-[10px] font-black text-white uppercase tracking-wider"
                style={{
                  background: `linear-gradient(135deg, ${rarityInfo.color}, ${rarityInfo.color}88)`,
                  boxShadow: `0 4px 15px ${rarityInfo.glow}`,
                }}
              >
                Deploy →
              </div>
            </div>
          </div>

          {/* Corner accents (game card frame lines) */}
          {["top-left", "top-right", "bottom-left", "bottom-right"].map((corner) => {
            const [v, h] = corner.split("-");
            return (
              <div
                key={corner}
                className="absolute w-6 h-6 pointer-events-none z-10"
                style={{
                  [v]: "6px",
                  [h]: "6px",
                  borderColor: `${rarityInfo.color}50`,
                  [`border${v === "top" ? "Top" : "Bottom"}Width`]: "1.5px",
                  [`border${h === "left" ? "Left" : "Right"}Width`]: "1.5px",
                  borderStyle: "solid",
                  borderRadius: corner === "top-left" ? "8px 0 0 0" : corner === "top-right" ? "0 8px 0 0" : corner === "bottom-left" ? "0 0 0 8px" : "0 0 8px 0",
                }}
              />
            );
          })}
        </div>

        {/* Ambient glow under card */}
        {isActive && (
          <div
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-4/5 h-6 rounded-full pointer-events-none blur-xl"
            style={{ background: rarityInfo.color, opacity: 0.25 }}
          />
        )}
      </div>
    </div>
  );
}
