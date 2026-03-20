import { motion, AnimatePresence, useMotionValue, animate } from "framer-motion";
import { useState, useCallback } from "react";
import { hapticSuccess } from "@/lib/haptics";

interface SpinWheelProps {
  onWin: (prize: Prize) => void;
  disabled?: boolean;
}

export interface Prize {
  label: string;
  points: number;
  emoji: string;
  color: string;
}

const prizes: Prize[] = [
  { label: "10 pts", points: 10, emoji: "⭐", color: "hsl(270 80% 65%)" },
  { label: "25 pts", points: 25, emoji: "🎁", color: "hsl(43 96% 56%)" },
  { label: "5 pts", points: 5, emoji: "✨", color: "hsl(160 60% 42%)" },
  { label: "50 pts", points: 50, emoji: "💎", color: "hsl(0 72% 55%)" },
  { label: "15 pts", points: 15, emoji: "🔥", color: "hsl(260 60% 50%)" },
  { label: "100 pts", points: 100, emoji: "👑", color: "hsl(40 90% 50%)" },
];

const SEGMENT_ANGLE = 360 / prizes.length;

// Neon-ring colors for the outer glow
const ringColors = [
  "hsl(270 80% 65%)",
  "hsl(43 96% 56%)",
  "hsl(160 60% 42%)",
  "hsl(330 80% 60%)",
  "hsl(200 80% 55%)",
  "hsl(40 90% 50%)",
];

export default function SpinWheel({ onWin, disabled }: SpinWheelProps) {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<Prize | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const rotation = useMotionValue(0);

  const handleSpin = useCallback(() => {
    if (spinning || disabled) return;
    setSpinning(true);
    setResult(null);
    setShowConfetti(false);

    const weights = [30, 25, 30, 5, 20, 2];
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let r = Math.random() * totalWeight;
    let winIdx = 0;
    for (let i = 0; i < weights.length; i++) {
      r -= weights[i];
      if (r <= 0) { winIdx = i; break; }
    }

    const targetAngle = 360 * 6 + (360 - winIdx * SEGMENT_ANGLE - SEGMENT_ANGLE / 2);

    animate(rotation, rotation.get() + targetAngle, {
      duration: 5,
      ease: [0.15, 0.85, 0.35, 1],
      onComplete: () => {
        hapticSuccess();
        setResult(prizes[winIdx]);
        setSpinning(false);
        setShowConfetti(true);
        onWin(prizes[winIdx]);
        setTimeout(() => setShowConfetti(false), 3000);
      },
    });
  }, [spinning, disabled, rotation, onWin]);

  // Generate confetti particles
  const confettiParticles = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 280,
    y: -(Math.random() * 200 + 60),
    rotate: Math.random() * 720 - 360,
    scale: Math.random() * 0.6 + 0.4,
    color: ringColors[i % ringColors.length],
    delay: Math.random() * 0.3,
    shape: i % 3, // 0=circle, 1=square, 2=star
  }));

  return (
    <div className="flex flex-col items-center gap-5 relative">
      {/* Confetti burst */}
      <AnimatePresence>
        {showConfetti && confettiParticles.map(p => (
          <motion.div
            key={p.id}
            initial={{ opacity: 1, x: 0, y: 0, scale: 0, rotate: 0 }}
            animate={{ opacity: 0, x: p.x, y: p.y, scale: p.scale, rotate: p.rotate }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, delay: p.delay, ease: "easeOut" }}
            className="absolute top-1/2 left-1/2 z-20 pointer-events-none"
            style={{
              width: p.shape === 0 ? 8 : 6,
              height: p.shape === 0 ? 8 : p.shape === 2 ? 10 : 6,
              borderRadius: p.shape === 0 ? "50%" : p.shape === 2 ? "0" : "2px",
              background: p.color,
              clipPath: p.shape === 2 ? "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)" : undefined,
            }}
          />
        ))}
      </AnimatePresence>

      {/* Wheel container with outer ring */}
      <div className="relative w-[260px] h-[260px]">
        {/* Animated outer glow ring */}
        <motion.div
          className="absolute -inset-3 rounded-full"
          animate={spinning ? { rotate: 360 } : {}}
          transition={spinning ? { duration: 2, repeat: Infinity, ease: "linear" } : {}}
          style={{
            background: `conic-gradient(${ringColors.join(", ")}, ${ringColors[0]})`,
            opacity: spinning ? 0.6 : 0.2,
          }}
        />
        <div className="absolute -inset-[9px] rounded-full bg-background" />

        {/* Outer ring dots */}
        {Array.from({ length: 20 }).map((_, i) => {
          const angle = (i / 20) * 360;
          const rad = (angle * Math.PI) / 180;
          const r = 134;
          return (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full z-[5]"
              style={{
                left: `calc(50% + ${Math.cos(rad) * r}px - 4px)`,
                top: `calc(50% + ${Math.sin(rad) * r}px - 4px)`,
                background: spinning
                  ? ringColors[i % ringColors.length]
                  : "hsl(var(--muted-foreground) / 0.3)",
              }}
              animate={spinning ? { opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] } : { opacity: 0.5 }}
              transition={spinning ? { duration: 0.6, repeat: Infinity, delay: i * 0.03 } : {}}
            />
          );
        })}

        {/* Pointer — triangular with glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
          <div
            className="relative"
            style={{
              width: 0,
              height: 0,
              borderLeft: "12px solid transparent",
              borderRight: "12px solid transparent",
              borderTop: "22px solid hsl(var(--gold))",
              filter: "drop-shadow(0 2px 8px hsl(var(--gold) / 0.5))",
            }}
          />
        </div>

        {/* Wheel */}
        <motion.div
          className="absolute inset-0 rounded-full overflow-hidden border-[3px] border-foreground/10"
          style={{
            rotate: rotation,
            boxShadow: spinning
              ? "0 0 40px hsl(var(--primary) / 0.3), inset 0 0 20px hsl(var(--primary) / 0.1)"
              : "0 0 20px hsl(var(--primary) / 0.1)",
          }}
        >
          <svg viewBox="0 0 200 200" className="w-full h-full">
            {prizes.map((prize, i) => {
              const startAngle = i * SEGMENT_ANGLE;
              const endAngle = startAngle + SEGMENT_ANGLE;
              const startRad = (Math.PI / 180) * (startAngle - 90);
              const endRad = (Math.PI / 180) * (endAngle - 90);
              const x1 = 100 + 100 * Math.cos(startRad);
              const y1 = 100 + 100 * Math.sin(startRad);
              const x2 = 100 + 100 * Math.cos(endRad);
              const y2 = 100 + 100 * Math.sin(endRad);
              const largeArc = SEGMENT_ANGLE > 180 ? 1 : 0;
              const midRad = (Math.PI / 180) * ((startAngle + endAngle) / 2 - 90);
              const emojiR = 55;
              const labelR = 72;
              const ex = 100 + emojiR * Math.cos(midRad);
              const ey = 100 + emojiR * Math.sin(midRad);
              const lx = 100 + labelR * Math.cos(midRad);
              const ly = 100 + labelR * Math.sin(midRad);
              const textAngle = (startAngle + endAngle) / 2;

              return (
                <g key={i}>
                  <path
                    d={`M100,100 L${x1},${y1} A100,100 0 ${largeArc},1 ${x2},${y2} Z`}
                    fill={i % 2 === 0 ? "hsl(260 18% 12%)" : "hsl(260 15% 16%)"}
                    stroke="hsl(var(--border) / 0.5)"
                    strokeWidth="0.5"
                  />
                  <text
                    x={ex} y={ey}
                    textAnchor="middle" dominantBaseline="middle"
                    fontSize="16"
                    transform={`rotate(${textAngle}, ${ex}, ${ey})`}
                  >
                    {prize.emoji}
                  </text>
                  <text
                    x={lx} y={ly}
                    textAnchor="middle" dominantBaseline="middle"
                    fontSize="8" fontWeight="700"
                    fill="hsl(var(--foreground) / 0.8)"
                    transform={`rotate(${textAngle}, ${lx}, ${ly})`}
                  >
                    {prize.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </motion.div>

        {/* Center button */}
        <motion.button
          onClick={handleSpin}
          disabled={spinning || disabled}
          whileTap={!spinning && !disabled ? { scale: 0.9 } : {}}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full z-10 flex items-center justify-center"
          style={{
            background: spinning || disabled
              ? "hsl(var(--muted))"
              : "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--gold)))",
            boxShadow: spinning || disabled
              ? "none"
              : "0 4px 20px hsl(var(--primary) / 0.4), 0 0 40px hsl(var(--gold) / 0.2)",
          }}
        >
          <motion.span
            className="text-sm font-black text-primary-foreground"
            animate={!spinning && !disabled ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {spinning ? "..." : "SPIN"}
          </motion.span>
        </motion.button>
      </div>

      {/* Status text */}
      <p className="text-xs text-muted-foreground text-center">
        {disabled ? "Come back tomorrow for another spin! 🌙" : spinning ? "Good luck! 🍀" : "Tap the wheel to spin!"}
      </p>

      {/* Result popup */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ type: "spring", damping: 15, stiffness: 300 }}
            className="rounded-2xl p-5 border border-gold/30 text-center"
            style={{
              background: "linear-gradient(135deg, hsl(var(--card)), hsl(var(--primary) / 0.1))",
              boxShadow: "0 8px 32px hsl(var(--gold) / 0.15)",
            }}
          >
            <motion.span
              className="text-5xl block mb-2"
              animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {result.emoji}
            </motion.span>
            <p className="text-base font-bold text-foreground">You won {result.label}!</p>
            <p className="text-[11px] text-muted-foreground mt-1">Points added to your balance ✨</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── MILESTONE REWARDS ───
export interface Milestone {
  id: string;
  title: string;
  emoji: string;
  requirement: string;
  rewardPts: number;
  achieved: boolean;
}

export const milestones: Milestone[] = [
  { id: "ms1", title: "First Booking", emoji: "🎉", requirement: "Complete your first booking", rewardPts: 50, achieved: false },
  { id: "ms2", title: "Explorer", emoji: "🗺️", requirement: "Book 3 different venues", rewardPts: 100, achieved: false },
  { id: "ms3", title: "Regular", emoji: "🔥", requirement: "Book 5 times", rewardPts: 150, achieved: false },
  { id: "ms4", title: "Reviewer", emoji: "⭐", requirement: "Write 3 reviews", rewardPts: 75, achieved: false },
  { id: "ms5", title: "Social Butterfly", emoji: "🦋", requirement: "Refer 2 friends", rewardPts: 200, achieved: false },
  { id: "ms6", title: "VIP", emoji: "👑", requirement: "Spend ₹10,000 total", rewardPts: 500, achieved: false },
];
