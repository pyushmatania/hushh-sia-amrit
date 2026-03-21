import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import hushhMascot from "@/assets/hushh-fire-mascot.png";

interface HushhBotProps {
  size?: number;
  state?: "idle" | "thinking" | "speaking" | "listening" | "success" | "error";
}

type Expression = "curious" | "happy" | "sleepy" | "excited" | "worried" | "thinking";

// Each expression = unique combo of transforms to make the single image feel alive
const expressions: Record<Expression, {
  scaleX: number; scaleY: number; rotate: number; y: number;
  brightness: number; hue: number; saturate: number;
}> = {
  curious:  { scaleX: 1,    scaleY: 1,    rotate: -6,  y: 0,   brightness: 1.05, hue: 0,   saturate: 1.1 },
  happy:    { scaleX: 1.05, scaleY: 0.95, rotate: 3,   y: -6,  brightness: 1.2,  hue: 5,   saturate: 1.25 },
  sleepy:   { scaleX: 0.97, scaleY: 0.93, rotate: 5,   y: 4,   brightness: 0.8,  hue: -10, saturate: 0.8 },
  excited:  { scaleX: 1.08, scaleY: 1.1,  rotate: -4,  y: -10, brightness: 1.3,  hue: 8,   saturate: 1.35 },
  worried:  { scaleX: 0.96, scaleY: 1.03, rotate: 6,   y: 2,   brightness: 0.88, hue: -6,  saturate: 0.9 },
  thinking: { scaleX: 1,    scaleY: 1.02, rotate: -10, y: -2,  brightness: 0.92, hue: -18, saturate: 1 },
};

const cycle: Expression[] = ["curious", "happy", "excited", "thinking", "worried", "sleepy"];

export default function HushhBot({ size = 80, state = "idle" }: HushhBotProps) {
  const [hovered, setHovered] = useState(false);
  const [idx, setIdx] = useState(0);

  const onEnter = useCallback(() => setHovered(true), []);
  const onLeave = useCallback(() => setHovered(false), []);

  useEffect(() => {
    const iv = setInterval(() => setIdx(p => (p + 1) % cycle.length), 2800);
    return () => clearInterval(iv);
  }, []);

  const expr = hovered ? expressions.excited : expressions[cycle[idx]];
  const embers = Array.from({ length: 10 }, (_, i) => i);

  return (
    <div
      style={{ width: size * 1.3, height: size * 1.3, cursor: "pointer" }}
      className="relative flex items-center justify-center select-none"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onTouchStart={onEnter}
      onTouchEnd={onLeave}
      onContextMenu={e => e.preventDefault()}
    >
      {/* Warm ambient glow */}
      <motion.div
        className="absolute"
        style={{
          width: size * 1.3,
          height: size * 1.3,
          background: "radial-gradient(circle, rgba(255,140,0,0.14) 0%, rgba(255,87,34,0.05) 45%, transparent 70%)",
        }}
        animate={{ scale: [1, 1.18, 1], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Embers */}
      {embers.map(i => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 2 + (i % 4),
            height: 2 + (i % 4),
            background: `rgba(255,${130 + i * 12},${i * 8},0.75)`,
          }}
          animate={{
            y: [size * 0.1, -(size * 0.3 + i * 8), -(size * 0.75)],
            x: [(i % 2 ? 1 : -1) * 3, (i % 2 ? 1 : -1) * (10 + i * 3), (i % 2 ? -1 : 1) * 5],
            opacity: [0, 0.85, 0],
            scale: [0.3, 1.1, 0.1],
          }}
          transition={{ duration: 1.4 + i * 0.2, repeat: Infinity, delay: i * 0.25, ease: "easeOut" }}
        />
      ))}

      {/* Shadow disc */}
      <motion.div
        className="absolute"
        style={{
          width: size * 0.45, height: size * 0.1, bottom: size * 0.05,
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(0,0,0,0.2) 0%, transparent 70%)",
          filter: "blur(4px)",
        }}
        animate={{ scaleX: hovered ? [1.1, 0.8, 1.1] : [1, 1.1, 1], opacity: hovered ? 0.1 : [0.15, 0.3, 0.15] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Main mascot */}
      <motion.img
        src={hushhMascot}
        alt="Hushh AI"
        draggable={false}
        onDragStart={e => e.preventDefault()}
        style={{
          width: size * 1.25,
          height: size * 1.25,
          objectFit: "contain",
          filter: `drop-shadow(0 0 16px rgba(255,140,0,0.6)) drop-shadow(0 8px 16px rgba(0,0,0,0.4)) brightness(${expr.brightness}) hue-rotate(${expr.hue}deg) saturate(${expr.saturate})`,
          WebkitUserSelect: "none",
          userSelect: "none",
          pointerEvents: "none",
        }}
        animate={
          hovered
            ? { scale: 1.25, rotate: [0, -12, 12, -6, 0], y: -14, scaleX: expr.scaleX, scaleY: expr.scaleY }
            : { scale: [1, 1.05, 1], rotate: expr.rotate, y: [expr.y, expr.y - 4, expr.y], scaleX: expr.scaleX, scaleY: expr.scaleY }
        }
        transition={
          hovered
            ? { duration: 0.5, type: "spring", stiffness: 280, damping: 14 }
            : { duration: 2.8, repeat: Infinity, ease: "easeInOut" }
        }
        className="relative z-10"
      />
    </div>
  );
}
