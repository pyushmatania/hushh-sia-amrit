import { Heart, Star, Zap, Shield, Flame, Swords, Crown, ChevronUp, ChevronDown, MapPin, Users, Sparkles } from "lucide-react";
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

/* Animated counter hook — counts from 0 to target */
function useCountUp(target: number, active: boolean, duration = 800, delay = 0): number {
  const [val, setVal] = useState(0);
  const rafRef = useRef<number>(0);
  useEffect(() => {
    if (!active) { setVal(0); return; }
    let start: number | null = null;
    const animate = (ts: number) => {
      if (start === null) start = ts;
      const elapsed = ts - start - delay;
      if (elapsed < 0) { rafRef.current = requestAnimationFrame(animate); return; }
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, target, duration, delay]);
  return val;
}

function StatBar({ label, value, max, color, revealed, icon, delay = 0 }: { label: string; value: number; max: number; color: string; revealed: boolean; icon?: React.ReactNode; delay?: number }) {
  const pct = Math.min((value / max) * 100, 100);
  const displayVal = useCountUp(value, revealed, 700, delay);
  const [barActive, setBarActive] = useState(false);

  useEffect(() => {
    if (!revealed) { setBarActive(false); return; }
    const t = setTimeout(() => setBarActive(true), delay);
    return () => clearTimeout(t);
  }, [revealed, delay]);

  return (
    <div className="flex items-center gap-2" style={{ opacity: barActive || !revealed ? 1 : 0.5, transition: "opacity 0.3s" }}>
      {icon && <span className="w-3 flex-shrink-0" style={{ filter: barActive ? `drop-shadow(0 0 6px ${color})` : "none", transition: "filter 0.4s" }}>{icon}</span>}
      <span className="text-[7px] font-black uppercase tracking-[0.15em] w-8 flex-shrink-0" style={{ color: `${color}cc` }}>{label}</span>
      <div className="flex-1 h-[5px] rounded-full overflow-hidden relative" style={{ background: "hsl(0 0% 100% / 0.06)" }}>
        <div
          className="h-full rounded-full relative"
          style={{
            width: barActive ? `${pct}%` : "15%",
            background: `linear-gradient(90deg, ${color}40, ${color})`,
            boxShadow: barActive ? `0 0 16px ${color}90, 0 0 6px ${color}` : `0 0 4px ${color}15`,
            transition: `width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}ms, box-shadow 0.5s ease ${delay}ms`,
          }}
        />
        {/* Energy tip glow */}
        {barActive && (
          <div
            className="absolute top-0 h-full w-3 rounded-full"
            style={{
              right: `${100 - pct}%`,
              background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
              filter: `blur(3px)`,
              animation: "energyPulse 1.2s ease-in-out infinite",
            }}
          />
        )}
      </div>
      <span
        className="text-[9px] font-mono font-black w-6 text-right tabular-nums"
        style={{
          color: barActive ? color : `${color}50`,
          transition: `color 0.4s ease ${delay}ms`,
          textShadow: barActive ? `0 0 10px ${color}80, 0 0 20px ${color}40` : "none",
        }}
      >
        {revealed ? displayVal : "--"}
      </span>
    </div>
  );
}

function XpRing({ level, color, revealed }: { level: number; color: string; revealed: boolean }) {
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(level / 100, 1);
  const dashOffset = revealed ? circumference * (1 - progress) : circumference * (1 - progress * 0.3);

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
          style={{
            transition: "stroke-dashoffset 1.2s ease-out",
            filter: revealed ? `drop-shadow(0 0 8px ${color})` : `drop-shadow(0 0 3px ${color}40)`,
          }}
        />
      </svg>
      <span className="text-[11px] font-black text-white z-10" style={{ opacity: revealed ? 1 : 0.5, transition: "opacity 0.5s", textShadow: revealed ? `0 0 8px ${color}` : "none" }}>{level}</span>
    </div>
  );
}

function FloatingParticles({ color, active }: { color: string; active: boolean }) {
  const particles = Array.from({ length: 16 }, (_, i) => ({
    id: i,
    left: `${5 + (i * 6) % 90}%`,
    delay: `${i * 0.2}s`,
    duration: `${1.5 + (i % 4) * 0.5}s`,
    size: 2 + (i % 4),
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
            boxShadow: `0 0 ${p.size * 4}px ${color}, 0 0 ${p.size * 8}px ${color}60`,
            animation: active ? `floatUp ${p.duration} ${p.delay} ease-out infinite` : "none",
          }}
        />
      ))}
    </div>
  );
}

function LightRays({ color, active }: { color: string; active: boolean }) {
  return (
    <div className="absolute inset-0 pointer-events-none z-0" style={{ opacity: active ? 0.7 : 0, transition: "opacity 0.8s ease" }}>
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ width: "160%", height: "160%", background: `radial-gradient(ellipse at center, ${color}25 0%, ${color}0a 35%, transparent 70%)`, animation: "pulseGlow 2.5s ease-in-out infinite" }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: "140%", height: "140%", borderRadius: "50%", animation: "spinSlow 10s linear infinite",
          background: `conic-gradient(from 0deg, transparent 0deg, ${color}12 30deg, transparent 60deg, transparent 90deg, ${color}0a 120deg, transparent 150deg, transparent 180deg, ${color}12 210deg, transparent 240deg, transparent 270deg, ${color}0a 300deg, transparent 330deg, transparent 360deg)`,
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
        boxShadow: `inset 0 0 30px ${color}20, inset 0 0 60px ${color}10`,
        animation: active ? "borderPulse 1.5s ease-in-out infinite" : "none",
      }}
    />
  );
}

/* Charging ring indicator shown during hold */
function ChargingRing({ progress, color }: { progress: number; color: string }) {
  const r = 30;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - progress);
  if (progress <= 0 || progress >= 1) return null;
  return (
    <div className="absolute inset-0 z-40 pointer-events-none flex items-center justify-center">
      <div className="relative">
        <svg width="68" height="68" className="-rotate-90">
          <circle cx="34" cy="34" r={r} fill="none" stroke="hsl(0 0% 100% / 0.08)" strokeWidth="3" />
          <circle
            cx="34" cy="34" r={r} fill="none"
            stroke={color} strokeWidth="3.5"
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 10px ${color})`, transition: "stroke-dashoffset 0.08s linear" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Sparkles size={12} style={{ color, filter: `drop-shadow(0 0 6px ${color})` }} />
          <span className="text-[7px] font-black text-white/90 tracking-[0.3em] mt-0.5">HOLD</span>
        </div>
      </div>
    </div>
  );
}

/* Fullscreen blur overlay when card is revealed */
function BlurOverlay({ active, onRelease }: { active: boolean; onRelease: () => void }) {
  if (!active) return null;
  return (
    <div
      className="fixed inset-0 z-[9998]"
      onClick={onRelease}
      style={{
        background: "hsl(0 0% 0% / 0.7)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        animation: "fade-in 0.3s ease-out",
      }}
    />
  );
}

const HOLD_DURATION = 600;

export default function PropertyCardCinematic({ property, index, onTap, isWishlisted = false, onToggleWishlist }: PropertyCardCinematicProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isActive, setIsActive] = useState(false);

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

  const discount = property.discountLabel || (property.basePrice >= 3000 ? "20% OFF" : null);
  const maskedPrice = "₹X,XXX";
  const showGestureHints = revealed;

  const clearTimers = useCallback(() => {
    if (holdTimerRef.current) { clearTimeout(holdTimerRef.current); holdTimerRef.current = null; }
    if (chargeIntervalRef.current) { clearInterval(chargeIntervalRef.current); chargeIntervalRef.current = null; }
  }, []);

  const [revealFlash, setRevealFlash] = useState(false);

  const doReveal = useCallback(() => {
    setRevealed(true);
    setChargeProgress(1);
    didRevealRef.current = true;
    setRevealFlash(true);
    hapticHeavy();
    setTimeout(() => setRevealFlash(false), 600);
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

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartXRef.current = touch.clientX;
    touchStartYRef.current = touch.clientY;
    holdStartRef.current = Date.now();
    isHoldingRef.current = true;
    hasSwipedRef.current = false;
    didRevealRef.current = false;
    holdCancelledRef.current = false;
    setTilt({ x: 0, y: 0 });
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
    const deltaX = touch.clientX - touchStartXRef.current;
    const deltaY = touchStartYRef.current - touch.clientY;

    if (!didRevealRef.current) {
      if (Math.abs(deltaX) > 14 || Math.abs(deltaY) > 14) {
        holdCancelledRef.current = true;
        isHoldingRef.current = false;
        clearTimers();
        setChargeProgress(0);
        setIsActive(false);
      }
      return;
    }

    e.preventDefault();

    if (Math.abs(deltaX) > 64 && Math.abs(deltaX) > Math.abs(deltaY)) {
      return;
    }

    if (deltaY > 70 && !hasSwipedRef.current) {
      hasSwipedRef.current = true;
      hapticMedium();
      doRelease();
      onTap(property);
      return;
    }

    if (deltaY < -70 && !hasSwipedRef.current) {
      hasSwipedRef.current = true;
      hapticLight();
      doRelease();
    }
  }, [property, onTap, doRelease, clearTimers]);

  const onTouchEndHandler = useCallback(() => {
    clearTimers();
    isHoldingRef.current = false;

    if (!didRevealRef.current) {
      setChargeProgress(0);
      setIsActive(false);
      setTilt({ x: 0, y: 0 });
      return;
    }

    if (!hasSwipedRef.current) {
      hapticLight();
      doRelease();
    }
  }, [clearTimers, doRelease]);

  // Mouse hold (desktop)
  const onMouseDown = useCallback(() => {
    holdStartRef.current = Date.now();
    isHoldingRef.current = true;
    hasSwipedRef.current = false;
    didRevealRef.current = false;
    holdCancelledRef.current = false;
    setTilt({ x: 0, y: 0 });
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

    if (didRevealRef.current) {
      doRelease();
      return;
    }

    setChargeProgress(0);
    setIsActive(false);
    setTilt({ x: 0, y: 0 });
  }, [clearTimers, doRelease]);

  const onMouseMoveHandler = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current || isHoldingRef.current || revealed) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setTilt({ x: y * -18, y: x * 18 });
  }, [revealed]);

  const onMouseLeave = useCallback(() => {
    clearTimers();
    isHoldingRef.current = false;
    if (didRevealRef.current) return;
    setIsActive(false);
    setTilt({ x: 0, y: 0 });
    setChargeProgress(0);
  }, [clearTimers]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const { body } = document;
    const prevOverflow = body.style.overflow;
    const prevTouchAction = body.style.touchAction;

    if (revealed) {
      body.style.overflow = "hidden";
      body.style.touchAction = "none";
    }

    return () => {
      body.style.overflow = prevOverflow;
      body.style.touchAction = prevTouchAction;
    };
  }, [revealed]);

  return (
    <>
      {/* Blur overlay when revealed */}
      <BlurOverlay active={revealed} onRelease={doRelease} />

      <div
        className="mx-5 relative overflow-x-clip"
        style={{
          perspective: "1200px",
          userSelect: "none",
          WebkitUserSelect: "none",
          WebkitTouchCallout: "none",
          zIndex: revealed ? 9999 : "auto",
        } as React.CSSProperties}
      >
        <LightRays color={rarityInfo.color} active={revealed} />

        {/* Ambient glow */}
        <div
          className="absolute inset-0 -m-10 pointer-events-none z-0 rounded-[40px]"
          style={{
            background: `radial-gradient(ellipse at 50% 60%, ${rarityInfo.glow} 0%, transparent 70%)`,
            opacity: revealed ? 0.8 : isActive ? 0.25 : 0.08,
            transition: "opacity 0.6s ease",
            filter: "blur(24px)",
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
            height: revealed ? "380px" : "340px",
            transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${revealed ? 1.03 : isActive ? 1.01 : 1})`,
            transition: revealed ? "transform 0.08s ease-out, height 0.5s cubic-bezier(0.34,1.56,0.64,1)" : "transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), height 0.5s ease",
            transformStyle: "preserve-3d",
            cursor: "grab",
            touchAction: revealed ? "none" : "pan-y",
          }}
        >
          {/* Card frame */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{
              borderRadius: "20px",
              border: `2px solid ${revealed ? rarityInfo.color + "aa" : rarityInfo.color + "25"}`,
              boxShadow: revealed
                ? `0 40px 100px ${rarityInfo.glow}, 0 0 0 1px ${rarityInfo.color}60, 0 0 100px ${rarityInfo.color}40, ${tilt.y * 2}px ${-tilt.x * 2}px 60px ${rarityInfo.glow}`
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

            {/* Holographic sheen */}
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
                background: `linear-gradient(${105 + tilt.y * 3}deg, transparent 30%, hsl(0 0% 100% / ${revealed ? 0.12 : 0}) 50%, transparent 70%)`,
              }}
            />

            {/* Scan-lines during reveal */}
            {revealed && (
              <div className="absolute inset-0 pointer-events-none z-10" style={{ background: "repeating-linear-gradient(0deg, transparent 0px, transparent 3px, hsl(0 0% 100% / 0.015) 3px, hsl(0 0% 100% / 0.015) 4px)" }} />
            )}

            <EdgeGlow color={rarityInfo.color} active={revealed} />

            {/* Dark overlay */}
            <div
              className="absolute inset-0"
              style={{
                background: revealed
                  ? "linear-gradient(to top, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.7) 40%, rgba(0,0,0,0.2) 70%, rgba(0,0,0,0.1) 100%)"
                  : "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.4) 45%, rgba(0,0,0,0.1) 100%)",
                transition: "background 0.5s",
              }}
            />

            <FloatingParticles color={rarityInfo.color} active={revealed} />
            <ChargingRing progress={chargeProgress} color={rarityInfo.color} />

            {/* ── HOLD text in center (when not revealed, not charging) ── */}
            {!revealed && chargeProgress === 0 && (
              <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center">
                <div className="flex flex-col items-center gap-1" style={{ animation: "pulseGlow 3s ease-in-out infinite" }}>
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center"
                    style={{
                      background: `${rarityInfo.color}15`,
                      border: `1.5px solid ${rarityInfo.color}30`,
                      boxShadow: `0 0 20px ${rarityInfo.color}15, inset 0 0 15px ${rarityInfo.color}10`,
                    }}
                  >
                    <span className="text-lg">✋</span>
                  </div>
                  <span
                    className="text-[9px] font-black tracking-[0.35em] uppercase"
                    style={{ color: `${rarityInfo.color}90`, textShadow: `0 0 10px ${rarityInfo.color}40` }}
                  >
                    HOLD
                  </span>
                </div>
              </div>
            )}

            {/* ── Top HUD ── */}
            <div className="absolute top-0 inset-x-0 z-20 p-3 flex items-start justify-between">
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                style={{
                  background: `${rarityInfo.color}18`,
                  border: `1px solid ${rarityInfo.color}35`,
                  backdropFilter: "blur(12px)",
                  transform: `translateZ(25px) translate(${tilt.y * 1.5}px, ${tilt.x * 1.5}px)`,
                  boxShadow: revealed ? `0 0 25px ${rarityInfo.glow}, 0 0 50px ${rarityInfo.color}15` : `0 0 8px ${rarityInfo.color}10`,
                  transition: "box-shadow 0.5s",
                }}
              >
                <RarityIcon size={10} style={{ color: rarityInfo.color, filter: `drop-shadow(0 0 4px ${rarityInfo.color})` }} />
                <span className="text-[8px] font-black tracking-[0.2em]" style={{ color: rarityInfo.color, textShadow: `0 0 10px ${rarityInfo.glow}` }}>
                  {rarityInfo.label}
                </span>
              </div>

              <div className="flex items-center gap-2" style={{ transform: `translateZ(20px) translate(${tilt.y}px, ${tilt.x}px)` }}>
                {discount && (
                  <div
                    className="px-2 py-0.5 rounded-md text-[8px] font-black tracking-wider"
                    style={{
                      background: "hsl(var(--success) / 0.25)",
                      color: "hsl(var(--success) / 1)",
                      border: "1px solid hsl(var(--success) / 0.3)",
                      boxShadow: revealed ? "0 0 12px hsl(var(--success) / 0.35)" : "none",
                      transform: revealed ? "translateY(0) scale(1)" : "translateY(1px) scale(0.96)",
                      opacity: revealed ? 1 : 0.75,
                      transition: "box-shadow 0.45s, transform 0.45s cubic-bezier(0.34,1.56,0.64,1), opacity 0.35s",
                    }}
                  >
                    {revealed ? discount : "X% OFF"}
                  </div>
                )}
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
              </div>
            </div>

            {/* ── Bottom content — always visible ── */}
            <div
              className="absolute bottom-0 left-0 right-0 p-4 z-20"
              style={{ transform: `translateZ(18px) translate(${tilt.y * 1.2}px, ${tilt.x * 1.2}px)` }}
            >
              {/* Rating + Hot badge */}
              <div className="flex items-center gap-1.5 mb-1">
                <Star size={12} className="fill-amber-400 text-amber-400" style={{ filter: "drop-shadow(0 0 4px hsl(45 100% 55%))" }} />
                <span className="text-[12px] font-bold text-white">{property.rating}</span>
                <span className="text-[9px] text-white/35">({property.reviewCount})</span>
                {property.slotsLeft > 0 && property.slotsLeft <= 5 && (
                  <span className="flex items-center gap-0.5 ml-1 text-[8px] font-bold px-1.5 py-0.5 rounded" style={{ background: "hsl(0 80% 50% / 0.3)", color: "hsl(0 80% 70%)", boxShadow: "0 0 8px hsl(0 80% 50% / 0.2)" }}>
                    <Zap size={8} /> HOT
                  </span>
                )}
              </div>

              {/* Name */}
              <h3 className="text-[17px] font-black text-white leading-tight tracking-tight" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.6)" }}>{property.name}</h3>

              {/* Location + Capacity — always visible */}
              <div className="flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1 text-[10px] text-white/50">
                  <MapPin size={9} />
                  {property.location}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-white/50">
                  <Users size={9} />
                  {property.capacity} guests
                </span>
              </div>

              {/* Price — counting counter reveal */}
              <div className="flex items-center gap-2 mt-2">
                <Zap
                  size={13}
                  style={{
                    color: rarityInfo.color,
                    filter: `drop-shadow(0 0 ${revealed ? "8px" : "4px"} ${rarityInfo.color})`,
                    animation: revealed ? "energyPulse 1s ease-in-out infinite" : "none",
                    transition: "filter 0.5s",
                  }}
                />
                <div className="relative h-7 min-w-[106px]">
                  <span
                    className="absolute left-0 top-0 text-[20px] font-black text-white tabular-nums"
                    style={{
                      textShadow: `0 0 14px ${rarityInfo.color}40`,
                      transform: revealed ? "translateY(-8px) scale(0.8) rotateX(40deg)" : "translateY(0px) scale(1)",
                      opacity: revealed ? 0 : 1,
                      transition: "all 0.35s cubic-bezier(0.34,1.56,0.64,1)",
                    }}
                  >
                    {maskedPrice}
                  </span>
                  <PriceCounter price={property.basePrice} revealed={revealed} color={rarityInfo.color} />
                </div>
                <span className="text-[10px] text-white/35 ml-0.5">/session</span>
                <XpRing level={totalPower} color={rarityInfo.color} revealed={revealed} />
              </div>

              {/* Stats — always visible, values count up after hold with staggered delays */}
              <div
                style={{
                  maxHeight: "130px",
                  opacity: 1,
                  overflow: "hidden",
                  transition: "opacity 0.4s ease",
                }}
              >
                <div className="mt-3 space-y-1.5 pt-2" style={{ borderTop: `1px solid ${rarityInfo.color}20` }}>
                  <StatBar label="PWR" value={stats.power} max={99} color={rarityInfo.color} revealed={revealed} delay={0} icon={<Zap size={9} style={{ color: rarityInfo.color }} />} />
                  <StatBar label="VIBE" value={stats.vibe} max={99} color="hsl(45 100% 55%)" revealed={revealed} delay={120} icon={<Star size={9} style={{ color: "hsl(45 100% 55%)" }} />} />
                  <StatBar label="SIZE" value={stats.capacity} max={99} color="hsl(var(--success))" revealed={revealed} delay={240} icon={<Users size={9} style={{ color: "hsl(var(--success))" }} />} />
                  <StatBar label="HYPE" value={stats.demand} max={99} color="hsl(var(--destructive))" revealed={revealed} delay={360} icon={<Flame size={9} style={{ color: "hsl(var(--destructive))" }} />} />
                </div>
              </div>

              {/* Swipe hints during reveal */}
              {showGestureHints && (
                <div
                  className="flex items-center justify-center gap-6 mt-3 pt-2"
                  style={{
                    borderTop: `1px solid ${rarityInfo.color}15`,
                    animation: "fade-in 0.4s ease-out",
                  }}
                >
                  <div className="flex items-center gap-1.5 text-white/50">
                    <ChevronUp size={13} style={{ color: rarityInfo.color, animation: "float 1.5s ease-in-out infinite" }} />
                    <span className="text-[8px] font-black tracking-[0.2em] uppercase" style={{ color: `${rarityInfo.color}aa` }}>Swipe up to open</span>
                  </div>
                  <div className="w-px h-3" style={{ background: `${rarityInfo.color}30` }} />
                  <div className="flex items-center gap-1.5 text-white/50">
                    <ChevronDown size={13} style={{ color: "hsl(0 0% 60%)", animation: "float 1.5s ease-in-out infinite reverse" }} />
                    <span className="text-[8px] font-black tracking-[0.2em] uppercase text-white/40">Release</span>
                  </div>
                </div>
              )}
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
                    borderColor: revealed ? `${rarityInfo.color}90` : `${rarityInfo.color}25`,
                    [`border${v === "top" ? "Top" : "Bottom"}Width`]: "1.5px",
                    [`border${h === "left" ? "Left" : "Right"}Width`]: "1.5px",
                    borderStyle: "solid",
                    borderRadius: corner === "top-left" ? "8px 0 0 0" : corner === "top-right" ? "0 8px 0 0" : corner === "bottom-left" ? "0 0 0 8px" : "0 0 8px 0",
                    boxShadow: revealed ? `0 0 15px ${rarityInfo.color}50` : "none",
                    transition: "border-color 0.5s, box-shadow 0.5s",
                  }}
                />
              );
            })}
          </div>

          {/* Bottom ambient glow */}
          <div
            className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-4/5 h-14 rounded-full pointer-events-none blur-2xl"
            style={{
              background: rarityInfo.color,
              opacity: revealed ? 0.5 : 0.06,
              transition: "opacity 0.5s ease",
            }}
          />
        </div>
      </div>
    </>
  );
}
