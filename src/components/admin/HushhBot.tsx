import { useState, useCallback, useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import joyMascot from "@/assets/hushh-fire-mascot-joy.png";
import curiousMascot from "@/assets/hushh-fire-mascot-curious.png";
import excitedMascot from "@/assets/hushh-fire-mascot-excited.png";
import sleepyMascot from "@/assets/hushh-fire-mascot-sleepy.png";
import worriedMascot from "@/assets/hushh-fire-mascot-worried.png";
import thinkingMascot from "@/assets/hushh-fire-mascot-thinking.png";

interface HushhBotProps {
  size?: number;
  state?: "idle" | "thinking" | "speaking" | "listening" | "success" | "error";
}

type Expression = "joy" | "curious" | "excited" | "thinking" | "worried" | "sleepy";

const expressionFrames: Record<Expression, string> = {
  joy: joyMascot,
  curious: curiousMascot,
  excited: excitedMascot,
  thinking: thinkingMascot,
  worried: worriedMascot,
  sleepy: sleepyMascot,
};

const expressionCycle: Expression[] = ["joy", "curious", "excited", "thinking", "worried", "sleepy"];

export default function HushhBot({ size = 88, state = "idle" }: HushhBotProps) {
  const [hovered, setHovered] = useState(false);
  const [cycleIndex, setCycleIndex] = useState(0);

  const onEnter = useCallback(() => setHovered(true), []);
  const onLeave = useCallback(() => setHovered(false), []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCycleIndex((prev) => (prev + 1) % expressionCycle.length);
    }, 2600);

    return () => clearInterval(interval);
  }, []);

  const expression = useMemo<Expression>(() => {
    if (hovered) return "excited";
    if (state === "thinking") return "thinking";
    if (state === "error") return "worried";
    if (state === "success") return "joy";

    return expressionCycle[cycleIndex];
  }, [hovered, state, cycleIndex]);

  const embers = useMemo(() => Array.from({ length: 12 }, (_, i) => i), []);

  return (
    <div
      style={{
        width: size * 1.55,
        height: size * 1.55,
        cursor: "pointer",
        WebkitTouchCallout: "none",
        userSelect: "none",
      }}
      className="relative flex items-center justify-center"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onTouchStart={onEnter}
      onTouchEnd={onLeave}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Ambient flame aura */}
      <motion.div
        className="absolute"
        style={{
          width: size * 1.45,
          height: size * 1.45,
          background:
            "radial-gradient(circle, rgba(255,153,41,0.2) 0%, rgba(255,122,24,0.08) 40%, rgba(255,97,0,0.03) 60%, transparent 78%)",
        }}
        animate={{ scale: [0.98, 1.12, 0.98], opacity: [0.45, 0.9, 0.45] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Floating embers */}
      {embers.map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 2 + (i % 3),
            height: 2 + (i % 3),
            background: `rgba(255, ${145 + i * 7}, 40, ${0.5 + (i % 4) * 0.1})`,
          }}
          animate={{
            y: [size * 0.22, -(size * 0.32 + i * 8), -(size * 0.82 + i * 5)],
            x: [0, (i % 2 ? 1 : -1) * (6 + i * 2), (i % 2 ? -1 : 1) * (4 + i)],
            opacity: [0, 0.9, 0],
            scale: [0.4, 1.1, 0.15],
          }}
          transition={{
            duration: 1.5 + i * 0.14,
            delay: i * 0.16,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      ))}

      {/* Ground shadow for 3D pop */}
      <motion.div
        className="absolute"
        style={{
          width: size * 0.58,
          height: size * 0.14,
          bottom: size * 0.08,
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(0,0,0,0.24) 0%, rgba(0,0,0,0.04) 65%, transparent 80%)",
          filter: "blur(5px)",
        }}
        animate={{
          scaleX: hovered ? [1.04, 0.78, 1.04] : [1, 1.12, 1],
          opacity: hovered ? 0.14 : [0.16, 0.3, 0.16],
        }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="relative z-10"
        animate={
          hovered
            ? {
                scale: 1.32,
                y: -16,
                rotate: [0, -10, 10, -5, 0],
              }
            : {
                scale: [1.16, 1.25, 1.16],
                y: [0, -8, 0],
                rotate: [-2, 2, -2],
              }
        }
        transition={
          hovered
            ? { duration: 0.52, type: "spring", stiffness: 260, damping: 14 }
            : { duration: 2.8, repeat: Infinity, ease: "easeInOut" }
        }
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={expression}
            src={expressionFrames[expression]}
            alt="Hushh AI Fire Mascot"
            draggable={false}
            onDragStart={(e) => e.preventDefault()}
            initial={{ opacity: 0, scale: 0.9, rotate: -4, filter: "blur(2px)" }}
            animate={{ opacity: 1, scale: 1, rotate: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.08, rotate: 4, filter: "blur(1px)" }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            style={{
              width: size * 1.38,
              height: size * 1.38,
              objectFit: "contain",
              pointerEvents: "none",
              userSelect: "none",
              WebkitTouchCallout: "none",
              filter:
                state === "listening"
                  ? "drop-shadow(0 0 18px rgba(255,112,67,0.75)) drop-shadow(0 10px 16px rgba(0,0,0,0.35))"
                  : state === "thinking"
                    ? "drop-shadow(0 0 16px rgba(255,140,0,0.65)) drop-shadow(0 10px 16px rgba(0,0,0,0.35))"
                    : "drop-shadow(0 0 20px rgba(255,140,0,0.7)) drop-shadow(0 12px 18px rgba(0,0,0,0.4))",
            }}
          />
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
