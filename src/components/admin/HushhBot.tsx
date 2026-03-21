import { motion } from "framer-motion";
import { useState, useCallback, useEffect, useRef } from "react";
import mascotImg from "@/assets/hushh-fire-mascot.jpeg";

interface HushhBotProps {
  size?: number;
  state?: "idle" | "thinking" | "speaking" | "listening" | "success" | "error";
}

const expressions = ["curious", "happy", "sleepy", "excited"] as const;

export default function HushhBot({ size = 80, state = "idle" }: HushhBotProps) {
  const [hovered, setHovered] = useState(false);
  const [cycleIndex, setCycleIndex] = useState(0);

  const onEnter = useCallback(() => setHovered(true), []);
  const onLeave = useCallback(() => setHovered(false), []);

  useEffect(() => {
    if (state === "idle" && !hovered) {
      const iv = setInterval(() => setCycleIndex(p => (p + 1) % expressions.length), 3000);
      return () => clearInterval(iv);
    }
  }, [state, hovered]);

  const glowColor: Record<string, string> = {
    idle: "rgba(255,160,0,0.4)",
    thinking: "rgba(30,136,229,0.5)",
    speaking: "rgba(255,140,0,0.5)",
    listening: "rgba(194,24,91,0.5)",
    success: "rgba(46,125,50,0.5)",
    error: "rgba(198,40,40,0.5)",
  };

  const filterByState: Record<string, string> = {
    idle: "drop-shadow(0 0 8px rgba(255,160,0,0.4))",
    thinking: "drop-shadow(0 0 12px rgba(30,136,229,0.6)) hue-rotate(180deg) saturate(1.2)",
    speaking: "drop-shadow(0 0 10px rgba(255,140,0,0.5)) brightness(1.1)",
    listening: "drop-shadow(0 0 12px rgba(194,24,91,0.5)) hue-rotate(300deg)",
    success: "drop-shadow(0 0 12px rgba(46,125,50,0.5)) hue-rotate(80deg) saturate(1.3)",
    error: "drop-shadow(0 0 12px rgba(198,40,40,0.5)) saturate(1.5) brightness(0.9)",
  };

  // Idle cycle animations
  const idleAnimations: Record<string, object> = {
    curious: { rotate: [0, -8, 8, 0], scale: [1, 1.02, 1], y: [0, -3, 0] },
    happy: { scale: [1, 1.08, 1], y: [0, -6, 0], rotate: [0, 3, -3, 0] },
    sleepy: { rotate: [0, -3, 0], scale: [1, 0.96, 1], y: [0, 2, 0] },
    excited: { scale: [1, 1.1, 0.95, 1.05, 1], y: [0, -8, -2, -6, 0], rotate: [0, -5, 5, -3, 0] },
  };

  const currentExpression = expressions[cycleIndex];
  const isActive = state !== "idle";

  return (
    <motion.div
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onTouchStart={onEnter}
      onTouchEnd={onLeave}
      style={{ width: size, height: size, position: "relative", cursor: "pointer" }}
      // Scared jump on hover
      animate={
        hovered
          ? { scale: [1, 0.85, 1.1, 1], y: [0, 4, -10, 0], rotate: [0, -8, 6, 0] }
          : isActive
            ? state === "thinking"
              ? { rotate: [0, -5, 5, 0], scale: [1, 1.03, 1] }
              : state === "speaking"
                ? { scale: [1, 1.06, 1], y: [0, -4, 0] }
                : state === "listening"
                  ? { scale: [1, 1.04, 0.98, 1], y: [0, -2, 0] }
                  : { scale: 1 }
            : (idleAnimations[currentExpression] as any) || { scale: 1 }
      }
      transition={
        hovered
          ? { duration: 0.5, ease: "easeOut" as const }
          : { duration: 2, repeat: Infinity, ease: "easeInOut" as const }
      }
    >
      {/* Glow ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, ${glowColor[state]} 0%, transparent 70%)`,
          transform: "scale(1.5)",
        }}
        animate={{ opacity: [0.3, 0.7, 0.3], scale: [1.4, 1.6, 1.4] }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Ember particles */}
      {["idle", "speaking", "thinking"].includes(state) &&
        [0, 1, 2, 3].map(i => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 3 + i,
              height: 3 + i,
              background: i % 2 === 0 ? "#FFB74D" : "#FF8F00",
              left: `${20 + i * 18}%`,
              top: "10%",
            }}
            animate={{
              y: [-5, -20 - i * 8, -5],
              x: [0, (i % 2 ? 6 : -6), 0],
              opacity: [0, 0.8, 0],
              scale: [0.5, 1, 0],
            }}
            transition={{ duration: 1.5 + i * 0.3, repeat: Infinity, delay: i * 0.4 }}
          />
        ))}

      {/* The mascot image */}
      <motion.img
        src={mascotImg}
        alt="Hushh AI Fire Mascot"
        draggable={false}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          filter: filterByState[state],
          position: "relative",
          zIndex: 2,
        }}
        animate={
          hovered
            ? { filter: filterByState[state], scale: 1 }
            : state === "thinking"
              ? { filter: [filterByState.thinking, filterByState.thinking.replace("0.6", "0.9"), filterByState.thinking] }
              : {}
        }
        transition={{ duration: 1.5, repeat: Infinity }}
      />

      {/* Floating shadow */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: "60%",
          height: 4,
          left: "20%",
          bottom: -2,
          background: "rgba(0,0,0,0.15)",
          borderRadius: "50%",
          zIndex: 1,
        }}
        animate={{
          scaleX: hovered ? [1, 0.6, 1] : [0.8, 1, 0.8],
          opacity: hovered ? [0.2, 0.1, 0.2] : [0.15, 0.25, 0.15],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </motion.div>
  );
}
