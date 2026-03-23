import { Heart, Star, Zap, Shield, Flame, Swords, Crown, ChevronUp } from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";
import type { Property } from "@/data/properties";
import OptimizedImage from "@/components/shared/OptimizedImage";
import { hapticLight, hapticMedium, hapticHeavy } from "@/lib/haptics";

interface PropertyCardCinematicProps {
  property: Property;
  index: number;
  onTap: (property: Property) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (id: string) => void;
}

const RARITY_MAP: Record<string, { label: string; color: string; glow: string; bg: string; icon: typeof Crown }> = {
  legendary: { label: "LEGENDARY", color: "hsl(45 100% 55%)", glow: "hsl(45 100% 55% / 0.5)", bg: "hsl(45 100% 55% / 0.08)", icon: Crown },
  epic: { label: "EPIC", color: "hsl(280 80% 60%)", glow: "hsl(280 80% 60% / 0.5)", bg: "hsl(280 80% 60% / 0.08)", icon: Flame },
  rare: { label: "RARE", color: "hsl(210 90% 60%)", glow: "hsl(210 90% 60% / 0.5)", bg: "hsl(210 90% 60% / 0.08)", icon: Shield },
  common: { label: "COMMON", color: "hsl(var(--muted-foreground))", glow: "hsl(var(--muted-foreground) / 0.3)", bg: "hsl(var(--muted-foreground) / 0.05)", icon: Swords },
};

function getRarity(price: number): string {
  if (price >= 8000) return "legendary";
  if (price >= 4000) return "epic";
  if (price >= 1500) return "rare";
  return "common";
}

function StatBar({ label, value, max, color, animate }: { label: string; value: number; max: number; color: string; animate: boolean }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="flex items-center gap-2">
      <span className="text-[8px] font-bold uppercase tracking-wider text-white/50 w-[32px]">{label}</span>
      <div className="flex-1 h-[5px] rounded-full overflow-hidden" style={{ background: "hsl(0 0% 100% / 0.08)" }}>
        <div
          className="h-full rounded-full"
          style={{
            width: animate ? `${pct}%` : "0%",
            background: `linear-gradient(90deg, ${color}, ${color}aa)`,
            boxShadow: animate ? `0 0 8px ${color}60` : "none",
            transition: "width 1s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        />
      </div>
      <span className="text-[8px] font-mono font-bold text-white/60 w-[20px] text-right" style={{ opacity: animate ? 1 : 0, transition: "opacity 0.5s" }}>{value}</span>
    </div>
  );
}

function XpRing({ level, color, revealed }: { level: number; color: string; revealed: boolean }) {
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(level / 100, 1);
  const dashOffset = revealed ? circumference * (1 - progress) : circumference;

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
          style={{ transition: "stroke-dashoffset 1.2s ease-out", filter: `drop-shadow(0 0 6px ${color})` }}
        />
      </svg>
      <span className="text-[11px] font-black text-white z-10" style={{ opacity: revealed ? 1 : 0.3, transition: "opacity 0.5s" }}>{level}</span>
    </div>
  );
}

function FloatingParticles({ color, active }: { color: string; active: boolean }) {
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    left: `${8 + (i * 7.5) % 84}%`,
    delay: `${i * 0.3}s`,
    duration: `${2 + (i % 3)}s`,
    size: 2 + (i % 3),
  }));

  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden" style={{ opacity: active ? 1 : 0, transition: "opacity 0.5s" }}>
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: p.left,
            bottom: "-8px",
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: color,
            boxShadow: `0 0 ${p.size * 3}px ${color}, 0 0 ${p.size * 6}px ${color}80`,
            animation: active ? `floatUp ${p.duration} ${p.delay} ease-out infinite` : "none",
          }}
        />
      ))}
    </div>
  );
}

function LightRays({ color, active }: { color: string; active: boolean }) {
  return (
    <div className="absolute inset-0 pointer-events-none z-0" style={{ opacity: active ? 0.6 : 0, transition: "opacity 0.8s ease" }}>
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ width: "140%", height: "140%", background: `radial-gradient(ellipse at center, ${color}20 0%, ${color}08 35%, transparent 70%)`, animation: "pulseGlow 3s ease-in-out infinite" }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: "130%", height: "130%", borderRadius: "50%", animation: "spinSlow 12s linear infinite",
          background: `conic-gradient(from 0deg, transparent 0deg, ${color}10 30deg, transparent 60deg, transparent 90deg, ${color}08 120deg, transparent 150deg, transparent 180deg, ${color}10 210deg, transparent 240deg, transparent 270deg, ${color}08 300deg, transparent 330deg, transparent 360deg)`,
        }}
      />
    </div>
  );
}

function EdgeGlow({ color, active }: { color: string; active: boolean }) {
  return (
    <div
      className="absolute inset-0 pointer-events-none z-20 rounded-[20px]"
      style={{
        opacity: active ? 1 : 0, transition: "opacity 0.5s",
        boxShadow: `inset 0 0 20px ${color}15, inset 0 0 40px ${color}08`,
        animation: active ? "borderPulse 2s ease-in-out infinite" : "none",
      }}
    />
  );
}

/* Charging ring indicator shown during hold */
function ChargingRing({ progress, color }: { progress: number; color: string }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - progress);
  return (
    <div className="absolute inset-0 z-40 pointer-events-none flex items-center justify-center" style={{ opacity: progress > 0 && progress < 1 ? 1 : 0, transition: "opacity 0.3s" }}>
      <svg width="64" height="64" className="-rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" stroke="hsl(0 0% 100% / 0.1)" strokeWidth="3" />
        <circle
          cx="32" cy="32" r={r} fill="none"
          stroke={color} strokeWidth="3"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 8px ${color})`, transition: "stroke-dashoffset 0.1s linear" }}
        />
      </svg>
      <span className="absolute text-[9px] font-black text-white/80 tracking-widest">HOLD</span>
    </div>
  );
}

const HOLD_DURATION = 500; // ms to fully reveal

export default function PropertyCardCinematic({ property, index, onTap, isWishlisted = false, onToggleWishlist }: PropertyCardCinematicProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isActive, setIsActive] = useState(false);

  // Hold-to-reveal state
  const [revealed, setRevealed] = useState(false);
  const [chargeProgress, setChargeProgress] = useState(0);
  const holdTimerRef = useRef<number | null>(null);
  const chargeIntervalRef = useRef<number | null>(null);
  const holdStartRef = useRef<number>(0);
  const touchStartXRef = useRef<number>(0);
  const touchStartYRef = useRef<number>(0);
  const isHoldingRef = useRef(false);
  const hasSwipedRef = useRef(false);
  const holdCancelledRef = useRef(false);
  const didRevealRef = useRef(false);

  const cardRef = useRef<HTMLDivElement>(null);

  const rarity = getRarity(property.basePrice);
  const rarityInfo = RARITY_MAP[rarity];
  const RarityIcon = rarityInfo.icon;

  const stats = {
    power: Math.min(Math.round(property.basePrice / 100), 99),
    vibe: Math.min(Math.round(property.rating * 20), 99),
    capacity: Math.min(property.capacity * 3, 99),
    demand: property.slotsLeft <= 3 ? 95 : property.slotsLeft <= 5 ? 70 : 40,
  };
  const totalPower = Math.round((stats.power + stats.vibe + stats.capacity + stats.demand) / 4);

  const holoX = 50 + tilt.y * 4;
  const holoY = 50 + tilt.x * 4;

  const clearTimers = useCallback(() => {
    if (holdTimerRef.current) { clearTimeout(holdTimerRef.current); holdTimerRef.current = null; }
    if (chargeIntervalRef.current) { clearInterval(chargeIntervalRef.current); chargeIntervalRef.current = null; }
  }, []);

  const doReveal = useCallback(() => {
    setRevealed(true);
    setChargeProgress(1);
    didRevealRef.current = true;
    hapticHeavy();
  }, []);

  const doRelease = useCallback(() => {
    setRevealed(false);
    setChargeProgress(0);
    setIsActive(false);
    setTilt({ x: 0, y: 0 });
    isHoldingRef.current = false;
    didRevealRef.current = false;
    clearTimers();
  }, [clearTimers]);

  // Touch handlers — do NOT preventDefault on start so scrolling works
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartXRef.current = touch.clientX;
    touchStartYRef.current = touch.clientY;
    holdStartRef.current = Date.now();
    isHoldingRef.current = true;
    hasSwipedRef.current = false;
    didRevealRef.current = false;
    holdCancelledRef.current = false;
    setIsActive(true);

    const startTime = Date.now();
    chargeIntervalRef.current = window.setInterval(() => {
      if (holdCancelledRef.current) return;
      const elapsed = Date.now() - startTime;
      const p = Math.min(elapsed / HOLD_DURATION, 1);
      setChargeProgress(p);
      if (p >= 0.5 && p < 0.55) hapticLight();
    }, 16);

    holdTimerRef.current = window.setTimeout(() => {
      if (isHoldingRef.current && !holdCancelledRef.current) {
        doReveal();
      }
    }, HOLD_DURATION);
  }, [doReveal]);

  const onTouchMoveHandler = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];

    // If not yet revealed, check if user is scrolling — cancel hold
    if (!didRevealRef.current) {
      const dx = Math.abs(touch.clientX - touchStartXRef.current);
      const dy = Math.abs(touch.clientY - touchStartYRef.current);
      if (dx > 10 || dy > 10) {
        holdCancelledRef.current = true;
        isHoldingRef.current = false;
        clearTimers();
        setChargeProgress(0);
        setIsActive(false);
        return;
      }
    }

    // Tilt effect while revealed
    if (cardRef.current && didRevealRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const x = ((touch.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((touch.clientY - rect.top) / rect.height - 0.5) * 2;
      setTilt({ x: y * -18, y: x * 18 });
    }

    if (!didRevealRef.current) return;

    // Once revealed, prevent scrolling so swipe gestures work
    e.preventDefault();

    const deltaY = touchStartYRef.current - touch.clientY;

    // Swipe up while revealed → open detail
    if (deltaY > 60 && !hasSwipedRef.current) {
      hasSwipedRef.current = true;
      hapticMedium();
      doRelease();
      onTap(property);
      return;
    }

    // Swipe down while revealed → release
    if (deltaY < -60 && !hasSwipedRef.current) {
      hasSwipedRef.current = true;
      hapticLight();
      doRelease();
    }
  }, [property, onTap, doRelease]);

  const onTouchEndHandler = useCallback(() => {
    clearTimers();
    isHoldingRef.current = false;

    // If not revealed yet, treat as tap (if short press)
    const elapsed = Date.now() - holdStartRef.current;
    if (!didRevealRef.current) {
      setChargeProgress(0);
      setIsActive(false);
      setTilt({ x: 0, y: 0 });
      if (elapsed < 200 && !hasSwipedRef.current) {
        // short tap — do nothing special or open
      }
      return;
    }

    // If revealed and no swipe, keep revealed briefly then release
    if (!hasSwipedRef.current) {
      // Stay revealed for a moment
      setTimeout(() => {
        doRelease();
      }, 300);
    }
  }, [clearTimers, doRelease]);

  // Mouse hold (desktop)
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    holdStartRef.current = Date.now();
    isHoldingRef.current = true;
    hasSwipedRef.current = false;
    didRevealRef.current = false;
    setIsActive(true);

    const startTime = Date.now();
    chargeIntervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      setChargeProgress(Math.min(elapsed / HOLD_DURATION, 1));
    }, 16);

    holdTimerRef.current = window.setTimeout(() => {
      if (isHoldingRef.current) doReveal();
    }, HOLD_DURATION);
  }, [doReveal]);

  const onMouseUp = useCallback(() => {
    clearTimers();
    isHoldingRef.current = false;
    const elapsed = Date.now() - holdStartRef.current;
    if (!didRevealRef.current) {
      setChargeProgress(0);
      setIsActive(false);
      setTilt({ x: 0, y: 0 });
      if (elapsed < 200) onTap(property);
    } else {
      setTimeout(() => doRelease(), 300);
    }
  }, [clearTimers, doRelease, onTap, property]);

  const onMouseMoveHandler = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setTilt({ x: y * -18, y: x * 18 });
  }, []);

  const onMouseLeave = useCallback(() => {
    clearTimers();
    isHoldingRef.current = false;
    doRelease();
  }, [clearTimers, doRelease]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  return (
    <div
      className="mx-5 relative"
      style={{
        perspective: "1200px",
        userSelect: "none",
        WebkitUserSelect: "none",
        WebkitTouchCallout: "none",
      } as React.CSSProperties}
    >
      <LightRays color={rarityInfo.color} active={revealed} />

      {/* Ambient glow */}
      <div
        className="absolute inset-0 -m-8 pointer-events-none z-0 rounded-[40px]"
        style={{
          background: `radial-gradient(ellipse at 50% 60%, ${rarityInfo.glow} 0%, transparent 70%)`,
          opacity: revealed ? 0.6 : isActive ? 0.2 : 0.05,
          transition: "opacity 0.6s ease",
          filter: "blur(20px)",
        }}
      />

      <div
        ref={cardRef}
        className="relative"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMoveHandler}
        onTouchEnd={onTouchEndHandler}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseMove={onMouseMoveHandler}
        onMouseLeave={onMouseLeave}
        onContextMenu={(e) => e.preventDefault()}
        style={{
          height: "320px",
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${revealed ? 1.06 : isActive ? 1.02 : 1})`,
          transition: revealed ? "transform 0.08s ease-out" : "transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
          transformStyle: "preserve-3d",
          cursor: "grab",
        }}
      >
        {/* Card frame */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            borderRadius: "20px",
            border: `2px solid ${revealed ? rarityInfo.color + "90" : rarityInfo.color + "30"}`,
            boxShadow: revealed
              ? `0 30px 80px ${rarityInfo.glow}, 0 0 0 1px ${rarityInfo.color}50, 0 0 80px ${rarityInfo.color}30, ${tilt.y * 2}px ${-tilt.x * 2}px 50px ${rarityInfo.glow}`
              : `0 12px 40px hsl(var(--foreground) / 0.15), 0 0 0 1px ${rarityInfo.color}15`,
            transition: "border-color 0.5s, box-shadow 0.5s",
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

          {/* Holographic sheen — only during reveal */}
          <div
            className="absolute inset-0 pointer-events-none z-10 mix-blend-color-dodge"
            style={{
              background: `
                radial-gradient(circle at ${holoX}% ${holoY}%, hsl(0 100% 60% / 0.12) 0%, transparent 25%),
                radial-gradient(circle at ${holoX + 10}% ${holoY - 10}%, hsl(120 100% 50% / 0.1) 0%, transparent 30%),
                radial-gradient(circle at ${holoX - 15}% ${holoY + 15}%, hsl(240 100% 60% / 0.12) 0%, transparent 25%),
                radial-gradient(circle at ${holoX - 5}% ${holoY + 5}%, ${rarityInfo.color}15 0%, transparent 35%)
              `,
              opacity: revealed ? 1 : 0,
              transition: "opacity 0.5s",
            }}
          />

          {/* Light streak */}
          <div
            className="absolute inset-0 pointer-events-none z-10"
            style={{
              background: `linear-gradient(${105 + tilt.y * 3}deg, transparent 30%, hsl(0 0% 100% / ${revealed ? 0.1 : 0}) 50%, transparent 70%)`,
            }}
          />

          {/* Scan-lines during reveal */}
          {revealed && (
            <div className="absolute inset-0 pointer-events-none z-10" style={{ background: "repeating-linear-gradient(0deg, transparent 0px, transparent 3px, hsl(0 0% 100% / 0.012) 3px, hsl(0 0% 100% / 0.012) 4px)" }} />
          )}

          <EdgeGlow color={rarityInfo.color} active={revealed} />

          {/* Dark overlay — darker when not revealed to hide stats */}
          <div
            className="absolute inset-0"
            style={{
              background: revealed
                ? "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.4) 45%, rgba(0,0,0,0.12) 100%)"
                : "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.08) 100%)",
              transition: "background 0.5s",
            }}
          />

          <FloatingParticles color={rarityInfo.color} active={revealed} />
          <ChargingRing progress={chargeProgress} color={rarityInfo.color} />

          {/* ── Top HUD ── */}
          <div className="absolute top-0 inset-x-0 z-20 p-3 flex items-start justify-between">
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
              style={{
                background: `${rarityInfo.color}20`,
                border: `1px solid ${rarityInfo.color}40`,
                backdropFilter: "blur(12px)",
                transform: `translateZ(25px) translate(${tilt.y * 1.5}px, ${tilt.x * 1.5}px)`,
                boxShadow: revealed ? `0 0 20px ${rarityInfo.glow}, 0 0 40px ${rarityInfo.color}15` : `0 0 8px ${rarityInfo.color}10`,
                transition: "box-shadow 0.5s",
              }}
            >
              <RarityIcon size={10} style={{ color: rarityInfo.color, filter: `drop-shadow(0 0 4px ${rarityInfo.color})` }} />
              <span className="text-[8px] font-black tracking-[0.2em]" style={{ color: rarityInfo.color, textShadow: `0 0 10px ${rarityInfo.glow}` }}>
                {rarityInfo.label}
              </span>
            </div>

            <div className="flex items-center gap-2" style={{ transform: `translateZ(20px) translate(${tilt.y}px, ${tilt.x}px)` }}>
              <button
                onClick={(e) => { e.stopPropagation(); e.preventDefault(); onToggleWishlist?.(property.id); }}
                onTouchStart={(e) => e.stopPropagation()}
                className="active:scale-125 transition-transform"
              >
                <Heart
                  size={18}
                  className={`drop-shadow-lg transition-colors ${isWishlisted ? "fill-primary text-primary" : "fill-foreground/20 text-white"}`}
                  strokeWidth={2}
                />
              </button>
              <XpRing level={totalPower} color={rarityInfo.color} revealed={revealed} />
            </div>
          </div>

          {/* ── Bottom content ── */}
          <div
            className="absolute bottom-0 left-0 right-0 p-4 z-20"
            style={{ transform: `translateZ(18px) translate(${tilt.y * 1.2}px, ${tilt.x * 1.2}px)` }}
          >
            {/* Basic info — always visible */}
            <div className="flex items-center gap-1.5 mb-1">
              <Star size={12} className="fill-amber-400 text-amber-400" style={{ filter: "drop-shadow(0 0 4px hsl(45 100% 55%))" }} />
              <span className="text-[12px] font-bold text-white">{property.rating}</span>
              {property.slotsLeft > 0 && property.slotsLeft <= 5 && (
                <span className="flex items-center gap-0.5 ml-1 text-[8px] font-bold px-1.5 py-0.5 rounded" style={{ background: "hsl(0 80% 50% / 0.3)", color: "hsl(0 80% 70%)", boxShadow: "0 0 8px hsl(0 80% 50% / 0.2)" }}>
                  <Zap size={8} /> HOT
                </span>
              )}
            </div>

            <h3 className="text-[16px] font-black text-white leading-tight tracking-tight" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>{property.name}</h3>
            <p className="text-[10px] text-white/45 mt-0.5 line-clamp-1">{property.location}</p>

            {/* Stats — hidden until revealed */}
            <div
              style={{
                maxHeight: revealed ? "120px" : "0px",
                opacity: revealed ? 1 : 0,
                overflow: "hidden",
                transition: "max-height 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease",
              }}
            >
              <div className="mt-3 space-y-1.5">
                <StatBar label="PWR" value={stats.power} max={99} color={rarityInfo.color} animate={revealed} />
                <StatBar label="VIBE" value={stats.vibe} max={99} color="hsl(45 100% 55%)" animate={revealed} />
                <StatBar label="SIZE" value={stats.capacity} max={99} color="hsl(160 70% 50%)" animate={revealed} />
                <StatBar label="HYPE" value={stats.demand} max={99} color="hsl(0 80% 60%)" animate={revealed} />
              </div>
            </div>

            {/* Price + action row */}
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-1">
                <Zap size={12} style={{ color: rarityInfo.color, filter: `drop-shadow(0 0 4px ${rarityInfo.color})` }} />
                <span className="text-[18px] font-black text-white" style={{ textShadow: `0 0 12px ${rarityInfo.color}40` }}>₹{property.basePrice.toLocaleString()}</span>
                <span className="text-[10px] text-white/40 ml-0.5">/session</span>
              </div>

              {/* Swipe hint when revealed */}
              {revealed ? (
                <div className="flex flex-col items-center" style={{ animation: "floatUp 1.5s ease-in-out infinite alternate" }}>
                  <ChevronUp size={14} className="text-white/60" />
                  <span className="text-[7px] font-bold text-white/40 tracking-wider">SWIPE</span>
                </div>
              ) : (
                <div
                  className="px-3.5 py-1.5 rounded-lg text-[10px] font-black text-white/60 uppercase tracking-wider"
                  style={{ background: `${rarityInfo.color}20`, border: `1px solid ${rarityInfo.color}30` }}
                >
                  Hold ✋
                </div>
              )}
            </div>
          </div>

          {/* Corner accents */}
          {["top-left", "top-right", "bottom-left", "bottom-right"].map((corner) => {
            const [v, h] = corner.split("-");
            return (
              <div
                key={corner}
                className="absolute w-6 h-6 pointer-events-none z-10"
                style={{
                  [v]: "6px",
                  [h]: "6px",
                  borderColor: revealed ? `${rarityInfo.color}80` : `${rarityInfo.color}30`,
                  [`border${v === "top" ? "Top" : "Bottom"}Width`]: "1.5px",
                  [`border${h === "left" ? "Left" : "Right"}Width`]: "1.5px",
                  borderStyle: "solid",
                  borderRadius: corner === "top-left" ? "8px 0 0 0" : corner === "top-right" ? "0 8px 0 0" : corner === "bottom-left" ? "0 0 0 8px" : "0 0 8px 0",
                  boxShadow: revealed ? `0 0 12px ${rarityInfo.color}40` : "none",
                  transition: "border-color 0.5s, box-shadow 0.5s",
                }}
              />
            );
          })}
        </div>

        {/* Bottom ambient glow */}
        <div
          className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-4/5 h-12 rounded-full pointer-events-none blur-2xl"
          style={{
            background: rarityInfo.color,
            opacity: revealed ? 0.45 : 0.05,
            transition: "opacity 0.5s ease",
          }}
        />
      </div>
    </div>
  );
}
