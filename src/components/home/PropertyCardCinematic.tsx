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

function useCountUp(target: number, active: boolean, duration = 600, delay = 0): number {
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

function StatBar({ label, value, max, color, revealed, isCharging, icon, delay = 0 }: { label: string; value: number; max: number; color: string; revealed: boolean; isCharging?: boolean; icon?: React.ReactNode; delay?: number }) {
  const pct = Math.min((value / max) * 100, 100);
  const active = revealed || !!isCharging;
  const displayVal = useCountUp(value, active, 500, delay);
  const [barActive, setBarActive] = useState(false);

  useEffect(() => {
    if (!active) { setBarActive(false); return; }
    const t = setTimeout(() => setBarActive(true), delay);
    return () => clearTimeout(t);
  }, [active, delay]);

  return (
    <div className="flex items-center gap-2">
      {icon && <span className="w-3.5 flex-shrink-0" style={{ filter: barActive ? `drop-shadow(0 0 8px ${color})` : `drop-shadow(0 0 2px ${color}50)`, transition: "filter 0.3s" }}>{icon}</span>}
      <span className="text-[8px] font-black uppercase tracking-[0.15em] w-9 flex-shrink-0" style={{ color: barActive ? color : `${color}99`, transition: "color 0.2s", textShadow: barActive ? `0 0 8px ${color}80` : "none" }}>{label}</span>
      <div className="flex-1 h-[6px] rounded-full overflow-hidden relative" style={{ background: `linear-gradient(90deg, ${color}12, ${color}08)`, border: `1px solid ${color}15` }}>
        <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${15}%`, background: `linear-gradient(90deg, ${color}25, ${color}15)`, opacity: barActive ? 0 : 1, transition: "opacity 0.2s" }} />
        <div
          className="h-full rounded-full relative"
          style={{
            width: barActive ? `${pct}%` : `15%`,
            background: barActive ? `linear-gradient(90deg, ${color}60, ${color}cc, ${color})` : `linear-gradient(90deg, ${color}30, ${color}20)`,
            boxShadow: barActive ? `0 0 20px ${color}90, 0 0 8px ${color}, inset 0 1px 0 hsl(0 0% 100% / 0.3)` : `0 0 4px ${color}10`,
            transition: `width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}ms, background 0.3s ease ${delay}ms, box-shadow 0.3s ease ${delay}ms`,
          }}
        />
        {barActive && <div className="absolute top-0 h-full w-4 rounded-full" style={{ right: `${100 - pct}%`, background: `radial-gradient(circle, ${color} 0%, transparent 70%)`, filter: `blur(3px)`, animation: "energyPulse 1s ease-in-out infinite" }} />}
        {barActive && <div className="absolute inset-0 rounded-full" style={{ background: `linear-gradient(90deg, transparent 0%, hsl(0 0% 100% / 0.35) 50%, transparent 100%)`, animation: "shimmer 1s ease-out 1" }} />}
      </div>
      <span className="text-[10px] font-mono font-black w-6 text-right tabular-nums" style={{ color: barActive ? color : `${color}40`, transition: `color 0.3s ease ${delay}ms`, textShadow: barActive ? `0 0 14px ${color}90, 0 0 28px ${color}50` : "none" }}>
        {active ? displayVal : "--"}
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
        <circle cx="20" cy="20" r={radius} fill="none" stroke={color} strokeWidth="3" strokeDasharray={circumference} strokeDashoffset={dashOffset} strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.8s ease-out", filter: revealed ? `drop-shadow(0 0 10px ${color})` : `drop-shadow(0 0 3px ${color}40)` }} />
      </svg>
      <span className="text-[11px] font-black text-white z-10" style={{ opacity: revealed ? 1 : 0.5, transition: "opacity 0.3s", textShadow: revealed ? `0 0 10px ${color}` : "none" }}>{level}</span>
    </div>
  );
}

/* Sci-fi data stream particles */
function DataStreamParticles({ color, active }: { color: string; active: boolean }) {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: `${2 + (i * 3.3) % 96}%`,
    delay: `${i * 0.12}s`,
    duration: `${0.8 + (i % 4) * 0.3}s`,
    size: 1 + (i % 3),
    isSquare: i % 4 === 0,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden" style={{ opacity: active ? 1 : 0, transition: "opacity 0.3s" }}>
      {particles.map((p) => (
        <div
          key={p.id}
          className={p.isSquare ? "absolute" : "absolute rounded-full"}
          style={{
            left: p.left,
            bottom: "-4px",
            width: `${p.size}px`,
            height: `${p.isSquare ? p.size * 3 : p.size}px`,
            background: p.isSquare ? `linear-gradient(to top, ${color}, transparent)` : color,
            boxShadow: `0 0 ${p.size * 3}px ${color}, 0 0 ${p.size * 6}px ${color}50`,
            animation: active ? `floatUp ${p.duration} ${p.delay} ease-out infinite` : "none",
          }}
        />
      ))}
    </div>
  );
}

/* HUD scan line that sweeps down during hold */
function HudScanLine({ active, color, speed }: { active: boolean; color: string; speed: number }) {
  if (!active) return null;
  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden rounded-[20px]">
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          height: "2px",
          background: `linear-gradient(90deg, transparent 0%, ${color}80 20%, ${color} 50%, ${color}80 80%, transparent 100%)`,
          boxShadow: `0 0 20px ${color}, 0 0 40px ${color}50, 0 -10px 30px ${color}30, 0 10px 30px ${color}30`,
          animation: `scanDown ${speed}s linear infinite`,
        }}
      />
      {/* Secondary dimmer scan */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          height: "1px",
          background: `linear-gradient(90deg, transparent, ${color}40, transparent)`,
          boxShadow: `0 0 15px ${color}40`,
          animation: `scanDown ${speed * 0.7}s linear infinite 0.3s`,
        }}
      />
    </div>
  );
}

/* Hex grid overlay for sci-fi feel */
function HexGridOverlay({ active, color, intensity }: { active: boolean; color: string; intensity: number }) {
  if (!active) return null;
  return (
    <div className="absolute inset-0 pointer-events-none z-[8] rounded-[20px] overflow-hidden" style={{ opacity: intensity * 0.4, transition: "opacity 0.2s" }}>
      <svg width="100%" height="100%" className="absolute inset-0">
        <defs>
          <pattern id="hexGrid" width="30" height="52" patternUnits="userSpaceOnUse" patternTransform="scale(1.2)">
            <path d="M15 0 L30 13 L30 39 L15 52 L0 39 L0 13 Z" fill="none" stroke={color} strokeWidth="0.4" opacity="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hexGrid)" />
      </svg>
    </div>
  );
}

/* Circuit lines that pulse with energy */
function CircuitLines({ active, color, intensity }: { active: boolean; color: string; intensity: number }) {
  if (!active) return null;
  return (
    <div className="absolute inset-0 pointer-events-none z-[9] rounded-[20px] overflow-hidden">
      <svg width="100%" height="100%" viewBox="0 0 350 400" preserveAspectRatio="none" style={{ opacity: 0.15 + intensity * 0.5, transition: "opacity 0.2s" }}>
        {/* Left circuit */}
        <path d="M0 200 L20 200 L35 185 L35 120 L50 105 L50 60" fill="none" stroke={color} strokeWidth="1.2" strokeDasharray="80 400" strokeDashoffset="0">
          <animate attributeName="stroke-dashoffset" values="480;0" dur="1.5s" repeatCount="indefinite" />
        </path>
        {/* Right circuit */}
        <path d="M350 180 L330 180 L315 195 L315 260 L300 275 L300 340" fill="none" stroke={color} strokeWidth="1.2" strokeDasharray="80 400" strokeDashoffset="0">
          <animate attributeName="stroke-dashoffset" values="480;0" dur="1.8s" repeatCount="indefinite" />
        </path>
        {/* Bottom circuit */}
        <path d="M80 400 L80 370 L100 350 L180 350 L200 330 L250 330 L270 350 L350 350" fill="none" stroke={color} strokeWidth="1" strokeDasharray="60 300" strokeDashoffset="0">
          <animate attributeName="stroke-dashoffset" values="360;0" dur="2s" repeatCount="indefinite" />
        </path>
        {/* Top circuit */}
        <path d="M50 0 L50 30 L70 50 L150 50 L170 30 L170 0" fill="none" stroke={color} strokeWidth="1" strokeDasharray="50 250" strokeDashoffset="0">
          <animate attributeName="stroke-dashoffset" values="300;0" dur="1.4s" repeatCount="indefinite" />
        </path>
        {/* Circuit nodes */}
        {[[50, 60], [300, 340], [100, 350], [170, 30], [35, 120], [315, 260]].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="3" fill={color} opacity={0.4 + intensity * 0.6}>
            <animate attributeName="r" values="2;4;2" dur={`${1 + i * 0.2}s`} repeatCount="indefinite" />
            <animate attributeName="opacity" values={`${0.3 + intensity * 0.3};${0.6 + intensity * 0.4};${0.3 + intensity * 0.3}`} dur={`${1 + i * 0.2}s`} repeatCount="indefinite" />
          </circle>
        ))}
      </svg>
    </div>
  );
}

/* Glitch effect on card border */
function GlitchBorder({ active, color }: { active: boolean; color: string }) {
  if (!active) return null;
  return (
    <div className="absolute inset-0 pointer-events-none z-20 rounded-[20px]" style={{ animation: "glitchFlicker 3s steps(1) infinite" }}>
      <div className="absolute inset-0 rounded-[20px]" style={{ boxShadow: `inset 0 0 40px ${color}20, inset 0 0 80px ${color}08, 0 0 30px ${color}15`, animation: "borderPulse 1.2s ease-in-out infinite" }} />
    </div>
  );
}

/* Energy field around card edges */
function EnergyField({ active, color, intensity }: { active: boolean; color: string; intensity: number }) {
  if (!active) return null;
  return (
    <div className="absolute -inset-1 pointer-events-none z-[-1] rounded-[24px]" style={{ opacity: intensity, transition: "opacity 0.2s" }}>
      {/* Outer energy ring */}
      <div className="absolute inset-0 rounded-[24px]" style={{
        background: `linear-gradient(135deg, ${color}20 0%, transparent 30%, ${color}15 50%, transparent 70%, ${color}20 100%)`,
        animation: "borderPulse 1.5s ease-in-out infinite",
      }} />
      {/* Corner energy flares */}
      {[{ top: "-4px", left: "-4px" }, { top: "-4px", right: "-4px" }, { bottom: "-4px", left: "-4px" }, { bottom: "-4px", right: "-4px" }].map((pos, i) => (
        <div key={i} className="absolute w-3 h-3" style={{
          ...pos,
          background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
          filter: `blur(2px)`,
          animation: `energyPulse ${1 + i * 0.3}s ease-in-out infinite ${i * 0.2}s`,
        }} />
      ))}
    </div>
  );
}

/* Bottom HUD readout bar */
function HudReadout({ active, color, intensity }: { active: boolean; color: string; intensity: number }) {
  if (!active) return null;
  return (
    <div className="absolute bottom-0 left-0 right-0 h-1 z-30 rounded-b-[20px] overflow-hidden">
      <div style={{
        height: "100%",
        width: `${intensity * 100}%`,
        background: `linear-gradient(90deg, transparent, ${color}60, ${color}, ${color}60, transparent)`,
        boxShadow: `0 0 15px ${color}, 0 0 30px ${color}50`,
        transition: "width 0.1s linear",
      }} />
    </div>
  );
}

function PrismaticEnergyRails({ active, intensity }: { active: boolean; intensity: number }) {
  if (!active) return null;
  return (
    <div
      className="absolute inset-0 pointer-events-none z-[12] rounded-[20px] overflow-hidden"
      style={{ opacity: 0.35 + intensity * 0.45, transition: "opacity 0.2s" }}
    >
      <div
        className="absolute left-5 right-5 top-[26%] h-px"
        style={{
          background: "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.95), hsl(var(--gold) / 0.95), hsl(var(--success) / 0.95), transparent)",
          boxShadow: "0 0 10px hsl(var(--primary) / 0.7), 0 0 18px hsl(var(--gold) / 0.5)",
          animation: "energyPulse 1.1s ease-in-out infinite",
        }}
      />
      <div
        className="absolute left-7 right-7 bottom-[22%] h-px"
        style={{
          background: "linear-gradient(90deg, transparent, hsl(var(--success) / 0.95), hsl(var(--accent) / 0.95), hsl(var(--primary) / 0.95), transparent)",
          boxShadow: "0 0 10px hsl(var(--success) / 0.7), 0 0 16px hsl(var(--accent) / 0.45)",
          animation: "energyPulse 1.4s ease-in-out infinite",
        }}
      />
      <div
        className="absolute top-10 bottom-12 left-[18%] w-px"
        style={{
          background: "linear-gradient(180deg, transparent, hsl(var(--primary) / 0.8), hsl(var(--accent) / 0.8), transparent)",
          boxShadow: "0 0 8px hsl(var(--primary) / 0.65)",
        }}
      />
      <div
        className="absolute top-8 bottom-14 right-[18%] w-px"
        style={{
          background: "linear-gradient(180deg, transparent, hsl(var(--gold) / 0.85), hsl(var(--success) / 0.85), transparent)",
          boxShadow: "0 0 8px hsl(var(--gold) / 0.65)",
        }}
      />
    </div>
  );
}

function ChargingRing({ progress, color }: { progress: number; color: string }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - progress);
  if (progress <= 0 || progress >= 1) return null;
  return (
    <div className="absolute inset-0 z-40 pointer-events-none flex items-center justify-center">
      <div className="relative" style={{ animation: "pulseGlow 1s ease-in-out infinite" }}>
        <svg width="64" height="64" className="-rotate-90">
          <circle cx="32" cy="32" r={r} fill="none" stroke="hsl(0 0% 100% / 0.06)" strokeWidth="2.5" />
          <circle cx="32" cy="32" r={r} fill="none" stroke={color} strokeWidth="3" strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 12px ${color})`, transition: "stroke-dashoffset 0.06s linear" }} />
        </svg>
        {/* Inner spinning indicator */}
        <svg width="40" height="40" className="absolute top-3 left-3" style={{ animation: "spinSlow 1.5s linear infinite" }}>
          <circle cx="20" cy="20" r="14" fill="none" stroke={color} strokeWidth="0.8" strokeDasharray="6 10" opacity="0.5" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Zap size={14} style={{ color, filter: `drop-shadow(0 0 8px ${color})`, animation: "energyPulse 0.6s ease-in-out infinite" }} />
          <span className="text-[6px] font-black text-white/80 tracking-[0.4em] mt-0.5">{Math.round(progress * 100)}%</span>
        </div>
      </div>
    </div>
  );
}

function useScramblePrice(price: number, isCharging: boolean, revealed: boolean): string {
  const [display, setDisplay] = useState("X,XXX");
  const rafRef = useRef<number>(0);
  const priceStr = price.toLocaleString();

  useEffect(() => {
    if (revealed) {
      const duration = 700;
      let start: number | null = null;
      const animate = (ts: number) => {
        if (start === null) start = ts;
        const progress = Math.min((ts - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplay(Math.round(eased * price).toLocaleString());
        if (progress < 1) rafRef.current = requestAnimationFrame(animate);
      };
      rafRef.current = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(rafRef.current);
    }
    if (isCharging) {
      const digits = priceStr.length;
      const scramble = () => {
        let s = "";
        for (let i = 0; i < digits; i++) {
          if (priceStr[i] === ",") { s += ","; continue; }
          s += Math.floor(Math.random() * 10).toString();
        }
        setDisplay(s);
        rafRef.current = requestAnimationFrame(scramble);
      };
      rafRef.current = requestAnimationFrame(scramble);
      return () => cancelAnimationFrame(rafRef.current);
    }
    setDisplay("X,XXX");
    return () => cancelAnimationFrame(rafRef.current);
  }, [isCharging, revealed, price, priceStr]);

  return display;
}

function PriceCounter({ price, revealed, color, isCharging }: { price: number; revealed: boolean; color: string; isCharging: boolean }) {
  const displayPrice = useScramblePrice(price, isCharging, revealed);
  const isAnimating = isCharging || revealed;
  return (
    <span className="absolute left-0 top-0 text-[20px] font-black text-white tabular-nums" style={{
      textShadow: isAnimating ? `0 0 20px ${color}80, 0 0 40px ${color}40` : `0 0 14px ${color}40`,
      transition: "text-shadow 0.2s ease",
      letterSpacing: isCharging && !revealed ? "0.05em" : "0",
      fontFamily: "monospace, 'Space Grotesk'",
    }}>
      ₹{displayPrice}
    </span>
  );
}

function RevealFlash({ active, color }: { active: boolean; color: string }) {
  if (!active) return null;
  return (
    <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden rounded-[20px]">
      <div style={{ position: "absolute", inset: "-50%", background: `radial-gradient(circle at 50% 50%, ${color}70 0%, ${color}20 30%, transparent 60%)`, animation: "revealBurst 0.5s ease-out forwards" }} />
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, hsl(0 0% 100% / 0.2) 0%, transparent 50%)`, animation: "revealFlash 0.3s ease-out forwards" }} />
    </div>
  );
}

function BlurOverlay({ active, onRelease }: { active: boolean; onRelease: () => void }) {
  if (!active) return null;
  return (
    <div className="fixed inset-0 z-[9998]" onClick={onRelease} style={{ background: "hsl(0 0% 0% / 0.88)", backdropFilter: "blur(28px) saturate(0.4)", WebkitBackdropFilter: "blur(28px) saturate(0.4)", animation: "fade-in 0.25s ease-out" }} />
  );
}

function ChargingBlurOverlay({ active, intensity }: { active: boolean; intensity: number }) {
  if (!active) return null;
  return (
    <div className="fixed inset-0 z-[9997] pointer-events-none" style={{ background: `hsl(0 0% 0% / ${0.35 + intensity * 0.4})`, backdropFilter: `blur(${Math.round(intensity * 20)}px)`, WebkitBackdropFilter: `blur(${Math.round(intensity * 20)}px)`, transition: "background 0.1s, backdrop-filter 0.1s" }} />
  );
}

const HOLD_DURATION = 500; // Faster hold
const TAP_MAX_DURATION = 200;
const TAP_MAX_MOVE = 10;

export default function PropertyCardCinematic({ property, index, onTap, isWishlisted = false, onToggleWishlist }: PropertyCardCinematicProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
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
    value: Math.max(22, Math.min(Math.round(120 - property.basePrice / 65), 99)),
    rating: Math.min(Math.round(property.rating * 20), 99),
    group: Math.min(property.capacity * 3, 99),
    availability: property.slotsLeft <= 2 ? 20 : property.slotsLeft <= 5 ? 45 : 82,
  };
  const totalScore = Math.round((stats.value + stats.rating + stats.group + stats.availability) / 4);

  const isCharging = chargeProgress > 0 && !revealed;
  const discount = property.discountLabel || (property.basePrice >= 3000 ? "20% OFF" : null);
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
    setTimeout(() => setRevealFlash(false), 500);
  }, []);

  const doRelease = useCallback(() => {
    setRevealed(false);
    setChargeProgress(0);
    setIsActive(false);
    isHoldingRef.current = false;
    didRevealRef.current = false;
    clearTimers();
  }, [clearTimers]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
    clearTimers();
    const touch = e.touches[0];
    touchStartXRef.current = touch.clientX;
    touchStartYRef.current = touch.clientY;
    holdStartRef.current = Date.now();
    isHoldingRef.current = true;
    hasSwipedRef.current = false;
    didRevealRef.current = false;
    holdCancelledRef.current = false;
    setChargeProgress(0);
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
      if (isHoldingRef.current && !holdCancelledRef.current) doReveal();
    }, HOLD_DURATION);
  }, [clearTimers, doReveal]);

  const onTouchMoveHandler = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
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

  const onTouchEndHandler = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
    const touch = e.changedTouches[0];
    const moveX = Math.abs(touch.clientX - touchStartXRef.current);
    const moveY = Math.abs(touch.clientY - touchStartYRef.current);
    const pressDuration = Date.now() - holdStartRef.current;

    clearTimers();
    isHoldingRef.current = false;

    if (!didRevealRef.current) {
      setChargeProgress(0);
      setIsActive(false);
      if (!holdCancelledRef.current && pressDuration <= TAP_MAX_DURATION && moveX <= TAP_MAX_MOVE && moveY <= TAP_MAX_MOVE) {
        hapticLight();
        onTap(property);
      }
      return;
    }
    if (!hasSwipedRef.current) {
      hapticLight();
      doRelease();
    }
  }, [clearTimers, doRelease, onTap, property]);

  const onTouchCancelHandler = useCallback(() => {
    holdCancelledRef.current = true;
    isHoldingRef.current = false;
    hasSwipedRef.current = false;
    didRevealRef.current = false;
    clearTimers();
    setChargeProgress(0);
    setIsActive(false);
    setRevealed(false);
  }, [clearTimers]);

  const onMouseDown = useCallback(() => {
    clearTimers();
    holdStartRef.current = Date.now();
    isHoldingRef.current = true;
    hasSwipedRef.current = false;
    didRevealRef.current = false;
    holdCancelledRef.current = false;
    setChargeProgress(0);
    setIsActive(true);
    const startTime = Date.now();
    chargeIntervalRef.current = window.setInterval(() => {
      setChargeProgress(Math.min((Date.now() - startTime) / HOLD_DURATION, 1));
    }, 16);
    holdTimerRef.current = window.setTimeout(() => {
      if (isHoldingRef.current) doReveal();
    }, HOLD_DURATION);
  }, [clearTimers, doReveal]);

  const onMouseUp = useCallback(() => {
    clearTimers();
    isHoldingRef.current = false;
    if (didRevealRef.current) { doRelease(); return; }
    setChargeProgress(0);
    setIsActive(false);
  }, [clearTimers, doRelease]);

  const onMouseLeave = useCallback(() => {
    clearTimers();
    isHoldingRef.current = false;
    if (didRevealRef.current) return;
    setIsActive(false);
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
      <BlurOverlay active={revealed} onRelease={doRelease} />
      <ChargingBlurOverlay active={isCharging} intensity={chargeProgress} />

      <div
        className="mx-5 relative"
        data-no-pull-refresh="true"
        style={{
          userSelect: "none",
          WebkitUserSelect: "none",
          WebkitTouchCallout: "none",
          zIndex: revealed ? 9999 : isCharging ? 9998 : "auto",
          overflow: "visible",
        } as React.CSSProperties}
      >
        {/* Ambient energy glow */}
        <div className="absolute inset-0 -m-10 pointer-events-none z-0 rounded-[36px]" style={{
          background: `radial-gradient(ellipse at 50% 60%, ${rarityInfo.glow} 0%, ${rarityInfo.color}15 40%, transparent 70%)`,
          opacity: revealed ? 1 : isCharging ? 0.3 + chargeProgress * 0.6 : isActive ? 0.1 : 0.04,
          transition: "opacity 0.2s ease",
          filter: "blur(25px)",
        }} />

        {/* Energy field around card */}
        <EnergyField active={revealed || isCharging} color={rarityInfo.color} intensity={revealed ? 1 : chargeProgress} />

        <div
          ref={cardRef}
          className="relative"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMoveHandler}
          onTouchEnd={onTouchEndHandler}
          onTouchCancel={onTouchCancelHandler}
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseLeave}
          onContextMenu={(e) => e.preventDefault()}
          style={{
            height: revealed ? "390px" : "340px",
            transform: `scale(${revealed ? 1.04 : isCharging ? 1.01 + chargeProgress * 0.02 : 1})`,
            transition: revealed
              ? "transform 0.35s cubic-bezier(0.34,1.56,0.64,1), height 0.4s cubic-bezier(0.34,1.56,0.64,1)"
              : "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), height 0.3s ease",
            cursor: "grab",
            touchAction: revealed ? "none" : "pan-y",
          }}
        >
          {/* Card frame */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{
              borderRadius: "20px",
              border: `2px solid ${revealed ? rarityInfo.color + "cc" : isCharging ? rarityInfo.color + "60" : rarityInfo.color + "25"}`,
              boxShadow: revealed
                ? `0 0 60px ${rarityInfo.glow}, 0 0 0 1px ${rarityInfo.color}80, 0 20px 60px ${rarityInfo.color}40, 0 0 100px ${rarityInfo.color}25`
                : isCharging
                  ? `0 0 ${15 + chargeProgress * 35}px ${rarityInfo.color}${Math.round(15 + chargeProgress * 35).toString(16).padStart(2, '0')}, 0 0 0 1px ${rarityInfo.color}30, 0 15px 50px hsl(var(--foreground) / 0.2)`
                  : `0 10px 35px hsl(var(--foreground) / 0.15), 0 0 0 1px ${rarityInfo.color}15`,
              transition: "border-color 0.2s, box-shadow 0.2s",
            }}
          >
            {/* Background image */}
            {!imgLoaded && <div className="absolute inset-0 bg-secondary animate-pulse"><div className="absolute inset-0 shimmer-bg" /></div>}
            <OptimizedImage src={property.images[0]} alt={property.name} fill className="object-cover" sizes="(max-width: 640px) 85vw, 360px" onImageLoad={() => setImgLoaded(true)} showSkeleton={false} />

            {/* Holographic sheen */}
            <div className="absolute inset-0 pointer-events-none z-10 mix-blend-color-dodge" style={{
              background: "radial-gradient(circle at 20% 30%, hsl(var(--primary) / 0.18) 0%, transparent 26%), radial-gradient(circle at 80% 26%, hsl(var(--gold) / 0.16) 0%, transparent 32%), radial-gradient(circle at 48% 72%, hsl(var(--success) / 0.16) 0%, transparent 30%), radial-gradient(circle at 68% 58%, hsl(var(--accent) / 0.14) 0%, transparent 28%)",
              opacity: revealed ? 1 : isCharging ? chargeProgress * 0.7 : 0,
              transition: "opacity 0.3s",
            }} />

            {/* Scan-lines */}
            {(revealed || isCharging) && <div className="absolute inset-0 pointer-events-none z-10" style={{ background: "repeating-linear-gradient(0deg, transparent 0px, transparent 2px, hsl(0 0% 100% / 0.02) 2px, hsl(0 0% 100% / 0.02) 3px)" }} />}

            {/* Sci-fi overlays */}
            <HexGridOverlay active={revealed || isCharging} color={rarityInfo.color} intensity={revealed ? 1 : chargeProgress} />
            <CircuitLines active={revealed || isCharging} color={rarityInfo.color} intensity={revealed ? 1 : chargeProgress} />
            <PrismaticEnergyRails active={revealed || isCharging} intensity={revealed ? 1 : chargeProgress} />
            <HudScanLine active={isCharging || revealed} color={rarityInfo.color} speed={revealed ? 2.5 : 1.2} />
            <GlitchBorder active={revealed || isCharging} color={rarityInfo.color} />
            <HudReadout active={isCharging || revealed} color={rarityInfo.color} intensity={revealed ? 1 : chargeProgress} />

            {/* Dark overlay */}
            <div className="absolute inset-0" style={{
              background: revealed
                ? "linear-gradient(to top, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.7) 40%, rgba(0,0,0,0.15) 70%, rgba(0,0,0,0.08) 100%)"
                : "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.4) 45%, rgba(0,0,0,0.1) 100%)",
              transition: "background 0.3s",
            }} />

            <DataStreamParticles color={rarityInfo.color} active={revealed || isCharging} />
            <ChargingRing progress={chargeProgress} color={rarityInfo.color} />
            <RevealFlash active={revealFlash} color={rarityInfo.color} />

            {/* HOLD prompt */}
            {!revealed && chargeProgress === 0 && (
              <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center">
                <div className="flex flex-col items-center gap-1" style={{ animation: "pulseGlow 2.5s ease-in-out infinite" }}>
                  <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{
                    background: `${rarityInfo.color}12`,
                    border: `1.5px solid ${rarityInfo.color}30`,
                    boxShadow: `0 0 25px ${rarityInfo.color}15, inset 0 0 15px ${rarityInfo.color}08`,
                  }}>
                    <Zap size={20} style={{ color: rarityInfo.color, filter: `drop-shadow(0 0 6px ${rarityInfo.color})` }} />
                  </div>
                  <span className="text-[8px] font-black tracking-[0.4em] uppercase" style={{ color: `${rarityInfo.color}90`, textShadow: `0 0 12px ${rarityInfo.color}50` }}>HOLD TO SCAN</span>
                </div>
              </div>
            )}

            {/* Top HUD */}
            <div className="absolute top-0 inset-x-0 z-20 p-3 flex items-start justify-between">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{
                background: `${rarityInfo.color}18`,
                border: `1px solid ${rarityInfo.color}35`,
                backdropFilter: "blur(12px)",
                boxShadow: revealed || isCharging ? `0 0 25px ${rarityInfo.glow}, 0 0 50px ${rarityInfo.color}15` : `0 0 8px ${rarityInfo.color}10`,
                transition: "box-shadow 0.3s",
              }}>
                <RarityIcon size={10} style={{ color: rarityInfo.color, filter: `drop-shadow(0 0 4px ${rarityInfo.color})` }} />
                <span className="text-[8px] font-black tracking-[0.2em]" style={{ color: rarityInfo.color, textShadow: `0 0 10px ${rarityInfo.glow}` }}>{rarityInfo.label}</span>
              </div>
              <div className="flex items-center gap-2">
                {discount && (
                  <div className="px-2 py-0.5 rounded-md text-[8px] font-black tracking-wider" style={{
                    background: "hsl(var(--success) / 0.25)",
                    color: "hsl(var(--success) / 1)",
                    border: "1px solid hsl(var(--success) / 0.3)",
                    boxShadow: (revealed || isCharging) ? "0 0 14px hsl(var(--success) / 0.4)" : "none",
                    opacity: (revealed || isCharging) ? 1 : 0.75,
                    transition: "box-shadow 0.3s, opacity 0.2s",
                  }}>
                    {(revealed || isCharging) ? discount : "X% OFF"}
                  </div>
                )}
                <button onClick={(e) => { e.stopPropagation(); e.preventDefault(); onToggleWishlist?.(property.id); }} onTouchStart={(e) => e.stopPropagation()} className="active:scale-125 transition-transform">
                  <Heart size={18} className={`drop-shadow-lg transition-colors ${isWishlisted ? "fill-primary text-primary" : "fill-foreground/20 text-white"}`} strokeWidth={2} />
                </button>
              </div>
            </div>

            {/* Bottom content */}
            <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
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

              <h3 className="text-[17px] font-black text-white leading-tight tracking-tight" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.6)" }}>{property.name}</h3>

              <div className="flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1 text-[10px] text-white/50"><MapPin size={9} />{property.location}</span>
                <span className="flex items-center gap-1 text-[10px] text-white/50"><Users size={9} />{property.capacity} guests</span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-2 mt-2">
                <Zap size={13} style={{
                  color: rarityInfo.color,
                  filter: `drop-shadow(0 0 ${(revealed || isCharging) ? "10px" : "4px"} ${rarityInfo.color})`,
                  animation: (revealed || isCharging) ? "energyPulse 0.8s ease-in-out infinite" : "none",
                  transition: "filter 0.3s",
                }} />
                <div className="relative h-7 min-w-[106px]">
                  <PriceCounter price={property.basePrice} revealed={revealed} color={rarityInfo.color} isCharging={isCharging} />
                </div>
                <span className="text-[10px] text-white/35 ml-0.5">/session</span>
                <XpRing level={totalScore} color={rarityInfo.color} revealed={revealed || isCharging} />
              </div>

              {/* Stats */}
              <div style={{ maxHeight: "130px", opacity: 1, overflow: "hidden" }}>
                <div className="mt-3 space-y-1.5 pt-2" style={{ borderTop: `1px solid ${rarityInfo.color}20` }}>
                  <StatBar label="VALUE" value={stats.value} max={99} color="hsl(var(--primary))" revealed={revealed} isCharging={isCharging} delay={0} icon={<Sparkles size={9} style={{ color: "hsl(var(--primary))" }} />} />
                  <StatBar label="RATING" value={stats.rating} max={99} color="hsl(var(--gold))" revealed={revealed} isCharging={isCharging} delay={60} icon={<Star size={9} style={{ color: "hsl(var(--gold))" }} />} />
                  <StatBar label="GROUP" value={stats.group} max={99} color="hsl(var(--success))" revealed={revealed} isCharging={isCharging} delay={120} icon={<Users size={9} style={{ color: "hsl(var(--success))" }} />} />
                  <StatBar label="AVAIL" value={stats.availability} max={99} color="hsl(var(--accent))" revealed={revealed} isCharging={isCharging} delay={180} icon={<Zap size={9} style={{ color: "hsl(var(--accent))" }} />} />
                </div>
              </div>

              {/* Gesture hints */}
              {showGestureHints && (
                <div className="flex items-center justify-center gap-6 mt-3 pt-2" style={{ borderTop: `1px solid ${rarityInfo.color}15`, animation: "fade-in 0.3s ease-out" }}>
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
                <div key={corner} className="absolute w-6 h-6 pointer-events-none z-10" style={{
                  [v]: "6px", [h]: "6px",
                  borderColor: revealed ? `${rarityInfo.color}90` : isCharging ? `${rarityInfo.color}50` : `${rarityInfo.color}25`,
                  [`border${v === "top" ? "Top" : "Bottom"}Width`]: "1.5px",
                  [`border${h === "left" ? "Left" : "Right"}Width`]: "1.5px",
                  borderStyle: "solid",
                  borderRadius: corner === "top-left" ? "8px 0 0 0" : corner === "top-right" ? "0 8px 0 0" : corner === "bottom-left" ? "0 0 0 8px" : "0 0 8px 0",
                  boxShadow: (revealed || isCharging) ? `0 0 15px ${rarityInfo.color}50` : "none",
                  transition: "border-color 0.3s, box-shadow 0.3s",
                }} />
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
