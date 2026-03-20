import { motion, useMotionValue, useTransform, animate } from "framer-motion";
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
  { label: "10 pts", points: 10, emoji: "⭐", color: "hsl(var(--primary))" },
  { label: "25 pts", points: 25, emoji: "🎁", color: "hsl(var(--gold))" },
  { label: "5 pts", points: 5, emoji: "✨", color: "hsl(var(--success))" },
  { label: "50 pts", points: 50, emoji: "💎", color: "hsl(var(--destructive))" },
  { label: "15 pts", points: 15, emoji: "🔥", color: "hsl(260 60% 50%)" },
  { label: "100 pts", points: 100, emoji: "👑", color: "hsl(40 90% 50%)" },
];

const SEGMENT_ANGLE = 360 / prizes.length;

export default function SpinWheel({ onWin, disabled }: SpinWheelProps) {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<Prize | null>(null);
  const rotation = useMotionValue(0);

  const handleSpin = useCallback(() => {
    if (spinning || disabled) return;
    setSpinning(true);
    setResult(null);

    // Pick random prize (weighted toward smaller)
    const weights = [30, 25, 30, 5, 20, 2]; // sum doesn't need to be 100
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let r = Math.random() * totalWeight;
    let winIdx = 0;
    for (let i = 0; i < weights.length; i++) {
      r -= weights[i];
      if (r <= 0) { winIdx = i; break; }
    }

    const targetAngle = 360 * 5 + (360 - winIdx * SEGMENT_ANGLE - SEGMENT_ANGLE / 2);

    animate(rotation, rotation.get() + targetAngle, {
      duration: 4,
      ease: [0.32, 0.94, 0.6, 1],
      onComplete: () => {
        hapticSuccess();
        setResult(prizes[winIdx]);
        setSpinning(false);
        onWin(prizes[winIdx]);
      },
    });
  }, [spinning, disabled, rotation, onWin]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-[240px] h-[240px]">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10 w-0 h-0"
          style={{ borderLeft: "10px solid transparent", borderRight: "10px solid transparent", borderTop: "18px solid hsl(var(--primary))" }}
        />

        {/* Wheel */}
        <motion.div
          className="w-full h-full rounded-full overflow-hidden border-4 border-foreground/10"
          style={{ rotate: rotation, boxShadow: "0 0 30px hsl(var(--primary) / 0.15)" }}
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
              const tx = 100 + 60 * Math.cos(midRad);
              const ty = 100 + 60 * Math.sin(midRad);
              const textAngle = (startAngle + endAngle) / 2;

              return (
                <g key={i}>
                  <path
                    d={`M100,100 L${x1},${y1} A100,100 0 ${largeArc},1 ${x2},${y2} Z`}
                    fill={i % 2 === 0 ? "hsl(var(--card))" : "hsl(var(--secondary))"}
                    stroke="hsl(var(--border))"
                    strokeWidth="0.5"
                  />
                  <text
                    x={tx}
                    y={ty}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="10"
                    fontWeight="bold"
                    fill="hsl(var(--foreground))"
                    transform={`rotate(${textAngle}, ${tx}, ${ty})`}
                  >
                    {prize.emoji} {prize.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </motion.div>

        {/* Center dot */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-primary border-2 border-primary-foreground/20 flex items-center justify-center z-10"
          style={{ boxShadow: "0 2px 12px hsl(var(--primary) / 0.4)" }}>
          <span className="text-xs font-bold text-primary-foreground">GO</span>
        </div>
      </div>

      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={handleSpin}
        disabled={spinning || disabled}
        className={`px-8 py-3 rounded-2xl text-sm font-bold transition-all ${
          spinning || disabled
            ? "bg-muted text-muted-foreground"
            : "bg-primary text-primary-foreground"
        }`}
        style={{ boxShadow: spinning || disabled ? "none" : "0 4px 20px hsl(var(--primary) / 0.3)" }}
      >
        {spinning ? "Spinning…" : disabled ? "Come back tomorrow!" : "🎰 Spin to Win!"}
      </motion.button>

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="text-center rounded-2xl p-4 border border-primary/20"
            style={{ background: "hsl(var(--primary) / 0.08)" }}
          >
            <span className="text-3xl">{result.emoji}</span>
            <p className="text-sm font-bold text-foreground mt-1">You won {result.label}!</p>
            <p className="text-[11px] text-muted-foreground">Points added to your account</p>
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
