import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import hushhMascot from "@/assets/hushh-fire-mascot.png";

interface HushhBotProps {
  size?: number;
  state?: "idle" | "thinking" | "speaking" | "listening" | "success" | "error";
}

const glowByState: Record<string, string> = {
  idle: "0 0 40px 12px rgba(255,167,38,0.5), 0 0 80px 24px rgba(255,111,0,0.2), 0 0 120px 40px rgba(255,87,34,0.08)",
  thinking: "0 0 40px 12px rgba(66,165,245,0.5), 0 0 80px 24px rgba(21,101,192,0.2), 0 0 120px 40px rgba(13,71,161,0.08)",
  speaking: "0 0 40px 12px rgba(255,167,38,0.6), 0 0 80px 24px rgba(230,81,0,0.25), 0 0 120px 40px rgba(255,111,0,0.1)",
  listening: "0 0 40px 12px rgba(236,64,122,0.5), 0 0 80px 24px rgba(173,20,87,0.2), 0 0 120px 40px rgba(136,14,79,0.08)",
  success: "0 0 40px 12px rgba(102,187,106,0.5), 0 0 80px 24px rgba(27,94,32,0.2), 0 0 120px 40px rgba(27,94,32,0.08)",
  error: "0 0 40px 12px rgba(239,83,80,0.5), 0 0 80px 24px rgba(183,28,28,0.2), 0 0 120px 40px rgba(183,28,28,0.08)",
};

const filterByState: Record<string, string> = {
  idle: "drop-shadow(0 0 10px rgba(255,167,38,0.7)) drop-shadow(0 4px 8px rgba(0,0,0,0.3))",
  thinking: "drop-shadow(0 0 12px rgba(66,165,245,0.7)) hue-rotate(-30deg) drop-shadow(0 4px 8px rgba(0,0,0,0.3))",
  speaking: "drop-shadow(0 0 12px rgba(255,140,0,0.8)) brightness(1.15) drop-shadow(0 4px 8px rgba(0,0,0,0.3))",
  listening: "drop-shadow(0 0 12px rgba(236,64,122,0.7)) hue-rotate(20deg) drop-shadow(0 4px 8px rgba(0,0,0,0.3))",
  success: "drop-shadow(0 0 12px rgba(102,187,106,0.7)) hue-rotate(-60deg) drop-shadow(0 4px 8px rgba(0,0,0,0.3))",
  error: "drop-shadow(0 0 12px rgba(239,83,80,0.7)) hue-rotate(10deg) saturate(1.3) drop-shadow(0 4px 8px rgba(0,0,0,0.3))",
};

type Expression = "curious" | "happy" | "sleepy" | "excited" | "worried" | "angry" | "thinking";

const expressionConfigs: Record<Expression, {
  scaleX: number; scaleY: number; rotate: number; y: number; brightness: number; hueShift: number;
}> = {
  curious:   { scaleX: 1,    scaleY: 1,    rotate: -6,  y: 0,   brightness: 1,    hueShift: 0   },
  happy:     { scaleX: 1.04, scaleY: 0.96, rotate: 3,   y: -3,  brightness: 1.12, hueShift: 0   },
  sleepy:    { scaleX: 0.98, scaleY: 0.94, rotate: 4,   y: 3,   brightness: 0.88, hueShift: -8  },
  excited:   { scaleX: 1.06, scaleY: 1.08, rotate: -4,  y: -6,  brightness: 1.18, hueShift: 5   },
  worried:   { scaleX: 0.96, scaleY: 1.02, rotate: 5,   y: 2,   brightness: 0.92, hueShift: -5  },
  angry:     { scaleX: 1.08, scaleY: 0.94, rotate: -3,  y: -2,  brightness: 1.1,  hueShift: 15  },
  thinking:  { scaleX: 1,    scaleY: 1.02, rotate: -8,  y: -1,  brightness: 0.95, hueShift: -15 },
};

const expressionOrder: Expression[] = ["curious", "happy", "excited", "thinking", "worried", "sleepy", "angry"];

export default function HushhBot({ size = 80, state = "idle" }: HushhBotProps) {
  const [hovered, setHovered] = useState(false);
  const [expression, setExpression] = useState<Expression>("curious");
  const [cycleIdx, setCycleIdx] = useState(0);

  const onEnter = useCallback(() => setHovered(true), []);
  const onLeave = useCallback(() => setHovered(false), []);

  // Cycle expressions
  useEffect(() => {
    const iv = setInterval(() => {
      setCycleIdx(prev => {
        const next = (prev + 1) % expressionOrder.length;
        setExpression(expressionOrder[next]);
        return next;
      });
    }, 2800);
    return () => clearInterval(iv);
  }, []);

  // On hover, force excited then return
  useEffect(() => {
    if (hovered) {
      setExpression("excited");
    } else {
      setExpression(expressionOrder[cycleIdx]);
    }
  }, [hovered, cycleIdx]);

  const expr = expressionConfigs[expression];
  const embers = Array.from({ length: 8 }, (_, i) => i);
  const sparks = Array.from({ length: 4 }, (_, i) => i);

  return (
    <div
      style={{ width: size, height: size, cursor: "pointer" }}
      className="relative flex items-center justify-center select-none"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onTouchStart={onEnter}
      onTouchEnd={onLeave}
      onContextMenu={e => e.preventDefault()}
    >
      {/* Outer glow pulse */}
      <motion.div
        className="absolute rounded-full"
        style={{ width: size * 1.1, height: size * 1.1 }}
        animate={{
          boxShadow: glowByState[state] || glowByState.idle,
          scale: [1, 1.12, 1],
        }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Inner radial glow */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: size * 0.7,
          height: size * 0.7,
          background: "radial-gradient(circle, rgba(255,167,38,0.15) 0%, transparent 70%)",
        }}
        animate={{ scale: [0.9, 1.15, 0.9], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Ember particles */}
      {embers.map((i) => (
        <motion.div
          key={`ember-${i}`}
          className="absolute rounded-full"
          style={{
            width: 2 + (i % 4),
            height: 2 + (i % 4),
            background: `rgba(255, ${130 + i * 15}, ${i * 10}, ${0.6 + (i % 3) * 0.15})`,
          }}
          animate={{
            y: [0, -(size * 0.4 + i * 10), -(size * 0.9)],
            x: [0, (i % 2 ? 1 : -1) * (10 + i * 4), (i % 2 ? -1 : 1) * 6],
            opacity: [0, 0.9, 0],
            scale: [0.4, 1.2, 0.2],
          }}
          transition={{
            duration: 1.5 + i * 0.25,
            repeat: Infinity,
            delay: i * 0.3,
            ease: "easeOut",
          }}
        />
      ))}

      {/* Sparkle bursts */}
      {sparks.map((i) => (
        <motion.div
          key={`spark-${i}`}
          className="absolute"
          style={{
            width: 2,
            height: 2,
            borderRadius: "50%",
            background: "#fff",
            boxShadow: "0 0 4px 1px rgba(255,200,50,0.8)",
          }}
          animate={{
            y: [0, -(size * 0.3), -(size * 0.6)],
            x: [(i % 2 ? -1 : 1) * 5, (i % 2 ? 1 : -1) * (15 + i * 5), (i % 2 ? -1 : 1) * 8],
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: 0.8 + i * 0.6,
            ease: "easeOut",
          }}
        />
      ))}

      {/* 3D shadow disc */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: size * 0.5,
          height: size * 0.12,
          bottom: -size * 0.02,
          background: "radial-gradient(ellipse, rgba(0,0,0,0.25) 0%, transparent 70%)",
          filter: "blur(3px)",
        }}
        animate={{
          scaleX: hovered ? [1.1, 0.85, 1.1] : [1, 1.08, 1],
          opacity: hovered ? 0.15 : [0.2, 0.35, 0.2],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Main mascot image with 3D transforms */}
      <motion.img
        src={hushhMascot}
        alt="Hushh AI Fire Mascot"
        draggable={false}
        onDragStart={e => e.preventDefault()}
        style={{
          width: size * 0.95,
          height: size * 0.95,
          objectFit: "contain",
          filter: `${filterByState[state] || filterByState.idle} brightness(${expr.brightness}) hue-rotate(${expr.hueShift}deg)`,
          WebkitUserSelect: "none",
          userSelect: "none",
          pointerEvents: "none",
        }}
        animate={
          hovered
            ? {
                scale: 1.2,
                rotate: [0, -10, 10, -5, 0],
                y: -8,
                scaleX: 1.08,
                scaleY: 1.12,
                rotateY: [0, 15, -15, 0],
              }
            : {
                scale: [1, 1.04, 1],
                rotate: expr.rotate,
                y: [expr.y, expr.y - 3, expr.y],
                scaleX: expr.scaleX,
                scaleY: expr.scaleY,
              }
        }
        transition={
          hovered
            ? { duration: 0.6, type: "spring", stiffness: 250, damping: 12 }
            : { duration: 2.8, repeat: Infinity, ease: "easeInOut" }
        }
        className="relative z-10"
      />

      {/* Expression label */}
      <AnimatePresence mode="wait">
        <motion.span
          key={expression}
          initial={{ opacity: 0, y: 6, scale: 0.7 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.7 }}
          transition={{ duration: 0.25 }}
          className="absolute -bottom-1 text-[7px] font-bold tracking-wider uppercase z-20"
          style={{
            color: "rgba(255,167,38,0.6)",
            textShadow: "0 0 8px rgba(255,140,0,0.4)",
          }}
        >
          {expression}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
