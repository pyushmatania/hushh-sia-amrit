import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import hushhMascot from "@/assets/hushh-fire-mascot.png";

interface HushhBotProps {
  size?: number;
  state?: "idle" | "thinking" | "speaking" | "listening" | "success" | "error";
}

const glowByState: Record<string, string> = {
  idle: "0 0 30px 8px rgba(255,167,38,0.4), 0 0 60px 16px rgba(255,111,0,0.15)",
  thinking: "0 0 30px 8px rgba(66,165,245,0.4), 0 0 60px 16px rgba(21,101,192,0.15)",
  speaking: "0 0 30px 8px rgba(255,167,38,0.5), 0 0 60px 16px rgba(230,81,0,0.2)",
  listening: "0 0 30px 8px rgba(236,64,122,0.4), 0 0 60px 16px rgba(173,20,87,0.15)",
  success: "0 0 30px 8px rgba(102,187,106,0.4), 0 0 60px 16px rgba(27,94,32,0.15)",
  error: "0 0 30px 8px rgba(239,83,80,0.4), 0 0 60px 16px rgba(183,28,28,0.15)",
};

const filterByState: Record<string, string> = {
  idle: "drop-shadow(0 0 6px rgba(255,167,38,0.6))",
  thinking: "drop-shadow(0 0 8px rgba(66,165,245,0.6)) hue-rotate(-30deg)",
  speaking: "drop-shadow(0 0 8px rgba(255,140,0,0.7)) brightness(1.1)",
  listening: "drop-shadow(0 0 8px rgba(236,64,122,0.6)) hue-rotate(20deg)",
  success: "drop-shadow(0 0 8px rgba(102,187,106,0.6)) hue-rotate(-60deg)",
  error: "drop-shadow(0 0 8px rgba(239,83,80,0.6)) hue-rotate(10deg) saturate(1.3)",
};

export default function HushhBot({ size = 80, state = "idle" }: HushhBotProps) {
  const [hovered, setHovered] = useState(false);
  const onEnter = useCallback(() => setHovered(true), []);
  const onLeave = useCallback(() => setHovered(false), []);

  // Ember particles
  const embers = Array.from({ length: 5 }, (_, i) => i);

  return (
    <div
      style={{ width: size, height: size, cursor: "pointer" }}
      className="relative flex items-center justify-center"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onTouchStart={onEnter}
      onTouchEnd={onLeave}
    >
      {/* Glow ring */}
      <motion.div
        className="absolute rounded-full"
        style={{ width: size * 0.85, height: size * 0.85 }}
        animate={{
          boxShadow: glowByState[state] || glowByState.idle,
          scale: [1, 1.08, 1],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Ember particles */}
      {embers.map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 3 + (i % 3),
            height: 3 + (i % 3),
            background: `rgba(255, ${150 + i * 20}, 0, 0.7)`,
          }}
          animate={{
            y: [0, -(size * 0.5 + i * 8), -(size * 0.8)],
            x: [0, (i % 2 ? 1 : -1) * (8 + i * 3), (i % 2 ? -1 : 1) * 5],
            opacity: [0, 0.8, 0],
            scale: [0.5, 1, 0.3],
          }}
          transition={{
            duration: 1.8 + i * 0.3,
            repeat: Infinity,
            delay: i * 0.35,
            ease: "easeOut",
          }}
        />
      ))}

      {/* Main mascot image */}
      <motion.img
        src={hushhMascot}
        alt="Hushh AI Fire Mascot"
        style={{
          width: size * 0.9,
          height: size * 0.9,
          objectFit: "contain",
          filter: filterByState[state] || filterByState.idle,
        }}
        animate={
          hovered
            ? { scale: 1.15, rotate: [0, -8, 8, -4, 0], y: -4 }
            : { scale: [1, 1.03, 1], rotate: 0, y: [0, -2, 0] }
        }
        transition={
          hovered
            ? { duration: 0.5, type: "spring", stiffness: 300 }
            : { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
        }
        className="relative z-10"
        draggable={false}
      />
    </div>
  );
}
