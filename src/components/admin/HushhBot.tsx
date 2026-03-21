import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import hushhMascot from "@/assets/hushh-fire-mascot.png";

interface HushhBotProps {
  size?: number;
  state?: "idle" | "thinking" | "speaking" | "listening" | "success" | "error";
}

type Expression = "curious" | "happy" | "sleepy" | "excited" | "worried" | "angry" | "thinking";

const expressionConfigs: Record<Expression, {
  scaleX: number; scaleY: number; rotate: number; y: number;
  brightness: number; hueShift: number; saturate: number;
  eyeScaleY: number; mouthWidth: number; mouthHeight: number; mouthY: number;
  browAngle: number; browY: number; blush: number;
}> = {
  curious:   { scaleX: 1.02, scaleY: 1.04, rotate: -8,  y: 0,   brightness: 1.05, hueShift: 0,   saturate: 1.1,  eyeScaleY: 1.1,  mouthWidth: 6,  mouthHeight: 3, mouthY: 0,  browAngle: -8,  browY: -2, blush: 0   },
  happy:     { scaleX: 1.06, scaleY: 0.94, rotate: 3,   y: -5,  brightness: 1.2,  hueShift: 5,   saturate: 1.2,  eyeScaleY: 0.5,  mouthWidth: 10, mouthHeight: 6, mouthY: 1,  browAngle: 0,   browY: -3, blush: 0.6 },
  sleepy:    { scaleX: 0.98, scaleY: 0.92, rotate: 6,   y: 4,   brightness: 0.82, hueShift: -10, saturate: 0.85, eyeScaleY: 0.2,  mouthWidth: 5,  mouthHeight: 2, mouthY: 2,  browAngle: 5,   browY: 2,  blush: 0   },
  excited:   { scaleX: 1.1,  scaleY: 1.12, rotate: -5,  y: -10, brightness: 1.3,  hueShift: 8,   saturate: 1.3,  eyeScaleY: 1.3,  mouthWidth: 12, mouthHeight: 8, mouthY: 0,  browAngle: -12, browY: -4, blush: 0.4 },
  worried:   { scaleX: 0.95, scaleY: 1.04, rotate: 5,   y: 3,   brightness: 0.9,  hueShift: -8,  saturate: 0.9,  eyeScaleY: 1.15, mouthWidth: 7,  mouthHeight: 2, mouthY: 3,  browAngle: 12,  browY: 0,  blush: 0   },
  angry:     { scaleX: 1.12, scaleY: 0.9,  rotate: -2,  y: -3,  brightness: 1.15, hueShift: 20,  saturate: 1.4,  eyeScaleY: 0.7,  mouthWidth: 8,  mouthHeight: 3, mouthY: 2,  browAngle: -15, browY: 3,  blush: 0   },
  thinking:  { scaleX: 1,    scaleY: 1.02, rotate: -10, y: -2,  brightness: 0.95, hueShift: -20, saturate: 1,    eyeScaleY: 0.9,  mouthWidth: 4,  mouthHeight: 4, mouthY: 1,  browAngle: -5,  browY: -1, blush: 0   },
};

const expressionOrder: Expression[] = ["curious", "happy", "excited", "thinking", "worried", "sleepy", "angry"];

export default function HushhBot({ size = 80, state = "idle" }: HushhBotProps) {
  const [hovered, setHovered] = useState(false);
  const [expression, setExpression] = useState<Expression>("curious");
  const [cycleIdx, setCycleIdx] = useState(0);

  const onEnter = useCallback(() => setHovered(true), []);
  const onLeave = useCallback(() => setHovered(false), []);

  useEffect(() => {
    const iv = setInterval(() => {
      setCycleIdx(prev => {
        const next = (prev + 1) % expressionOrder.length;
        setExpression(expressionOrder[next]);
        return next;
      });
    }, 7000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (hovered) setExpression("excited");
    else setExpression(expressionOrder[cycleIdx]);
  }, [hovered, cycleIdx]);

  const expr = expressionConfigs[expression];
  const embers = Array.from({ length: 10 }, (_, i) => i);

  // Face positions relative to size
  const faceScale = size / 80;
  const eyeSize = 4.5 * faceScale;
  const pupilSize = 2.5 * faceScale;

  return (
    <div
      style={{ width: size * 1.8, height: size * 1.8, cursor: "pointer" }}
      className="relative flex items-center justify-center select-none"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onTouchStart={onEnter}
      onTouchEnd={onLeave}
      onContextMenu={e => e.preventDefault()}
    >
      {/* Ember particles */}
      {embers.map((i) => (
        <motion.div
          key={`ember-${i}`}
          className="absolute rounded-full"
          style={{
            width: 2 + (i % 4),
            height: 2 + (i % 4),
            background: `rgba(255, ${130 + i * 12}, ${i * 8}, ${0.7 + (i % 3) * 0.1})`,
          }}
          animate={{
            y: [size * 0.1, -(size * 0.3 + i * 8), -(size * 0.7)],
            x: [(i % 2 ? 1 : -1) * 3, (i % 2 ? 1 : -1) * (12 + i * 3), (i % 2 ? -1 : 1) * 5],
            opacity: [0, 0.85, 0],
            scale: [0.3, 1.1, 0.1],
          }}
          transition={{
            duration: 1.4 + i * 0.2,
            repeat: Infinity,
            delay: i * 0.25,
            ease: "easeOut",
          }}
        />
      ))}

      {/* Warm ambient glow (no circle border) */}
      <motion.div
        className="absolute"
        style={{
          width: size * 1.2,
          height: size * 1.2,
          background: "radial-gradient(circle, rgba(255,140,0,0.12) 0%, rgba(255,87,34,0.04) 50%, transparent 75%)",
        }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* 3D shadow disc */}
      <motion.div
        className="absolute"
        style={{
          width: size * 0.45,
          height: size * 0.1,
          bottom: size * 0.05,
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(0,0,0,0.2) 0%, transparent 70%)",
          filter: "blur(4px)",
        }}
        animate={{
          scaleX: hovered ? [1.1, 0.8, 1.1] : [1, 1.1, 1],
          opacity: hovered ? 0.1 : [0.15, 0.3, 0.15],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Main mascot - bigger, more pop */}
      <motion.img
        src={hushhMascot}
        alt="Hushh AI"
        draggable={false}
        onDragStart={e => e.preventDefault()}
        style={{
          width: size * 1.25,
          height: size * 1.25,
          objectFit: "contain",
          filter: `drop-shadow(0 0 14px rgba(255,140,0,0.6)) drop-shadow(0 6px 12px rgba(0,0,0,0.35)) brightness(${expr.brightness}) hue-rotate(${expr.hueShift}deg) saturate(${expr.saturate})`,
          WebkitUserSelect: "none",
          userSelect: "none",
          pointerEvents: "none",
        }}
        animate={
          hovered
            ? {
                scale: 1.25,
                rotate: [0, -12, 12, -6, 0],
                y: -12,
                scaleX: expr.scaleX,
                scaleY: expr.scaleY,
              }
            : {
                scale: [1, 1.06, 1],
                rotate: expr.rotate,
                y: [expr.y, expr.y - 4, expr.y],
                scaleX: expr.scaleX,
                scaleY: expr.scaleY,
              }
        }
        transition={
          hovered
            ? { duration: 0.5, type: "spring", stiffness: 280, damping: 14 }
            : { duration: 2.8, repeat: Infinity, ease: "easeInOut" }
        }
        className="relative z-10"
      />

      {/* Overlay face — eyes */}
      <div className="absolute z-20 flex flex-col items-center" style={{ pointerEvents: "none", top: "38%", gap: 2 * faceScale }}>
        <motion.div className="flex items-center" style={{ gap: 8 * faceScale }}
          animate={{ y: hovered ? -2 : [0, -1, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {/* Left eye */}
          <motion.div style={{ width: eyeSize * 2, height: eyeSize * 2, position: "relative" }}>
            <motion.div
              style={{
                width: eyeSize * 2,
                background: "white",
                borderRadius: "50%",
                position: "absolute",
                boxShadow: "inset 0 1px 3px rgba(0,0,0,0.15), 0 0 6px rgba(255,255,255,0.3)",
              }}
              animate={{ height: eyeSize * 2 * expr.eyeScaleY }}
              transition={{ duration: 0.3 }}
            />
            <motion.div
              style={{
                width: pupilSize,
                height: pupilSize,
                background: "#1a1a2e",
                borderRadius: "50%",
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                boxShadow: "0 0 2px rgba(0,0,0,0.5)",
              }}
              animate={{
                scale: hovered ? 1.4 : [1, 1.1, 1],
                x: expression === "thinking" ? -1.5 : 0,
              }}
              transition={{ duration: 0.3 }}
            >
              {/* Glint */}
              <div style={{
                width: pupilSize * 0.35,
                height: pupilSize * 0.35,
                background: "white",
                borderRadius: "50%",
                position: "absolute",
                top: "20%",
                right: "15%",
              }} />
            </motion.div>
            {/* Left brow */}
            <motion.div
              style={{
                width: eyeSize * 1.6,
                height: 1.5 * faceScale,
                background: "rgba(80,30,0,0.6)",
                borderRadius: 99,
                position: "absolute",
                left: "50%",
                transformOrigin: "center",
              }}
              animate={{
                rotate: expr.browAngle,
                top: -3 * faceScale + expr.browY * faceScale,
                x: "-50%",
              }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>

          {/* Right eye */}
          <motion.div style={{ width: eyeSize * 2, height: eyeSize * 2, position: "relative" }}>
            <motion.div
              style={{
                width: eyeSize * 2,
                background: "white",
                borderRadius: "50%",
                position: "absolute",
                boxShadow: "inset 0 1px 3px rgba(0,0,0,0.15), 0 0 6px rgba(255,255,255,0.3)",
              }}
              animate={{ height: eyeSize * 2 * expr.eyeScaleY }}
              transition={{ duration: 0.3 }}
            />
            <motion.div
              style={{
                width: pupilSize,
                height: pupilSize,
                background: "#1a1a2e",
                borderRadius: "50%",
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                boxShadow: "0 0 2px rgba(0,0,0,0.5)",
              }}
              animate={{
                scale: hovered ? 1.4 : [1, 1.1, 1],
                x: expression === "thinking" ? 1.5 : 0,
              }}
              transition={{ duration: 0.3 }}
            >
              <div style={{
                width: pupilSize * 0.35,
                height: pupilSize * 0.35,
                background: "white",
                borderRadius: "50%",
                position: "absolute",
                top: "20%",
                right: "15%",
              }} />
            </motion.div>
            {/* Right brow */}
            <motion.div
              style={{
                width: eyeSize * 1.6,
                height: 1.5 * faceScale,
                background: "rgba(80,30,0,0.6)",
                borderRadius: 99,
                position: "absolute",
                left: "50%",
                transformOrigin: "center",
              }}
              animate={{
                rotate: -expr.browAngle,
                top: -3 * faceScale + expr.browY * faceScale,
                x: "-50%",
              }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>
        </motion.div>

        {/* Blush cheeks */}
        <AnimatePresence>
          {expr.blush > 0 && (
            <motion.div
              className="absolute flex"
              style={{ gap: 16 * faceScale, top: 6 * faceScale }}
              initial={{ opacity: 0 }}
              animate={{ opacity: expr.blush * 0.5 }}
              exit={{ opacity: 0 }}
            >
              <div style={{ width: 5 * faceScale, height: 3 * faceScale, borderRadius: "50%", background: "rgba(255,100,80,0.4)" }} />
              <div style={{ width: 5 * faceScale, height: 3 * faceScale, borderRadius: "50%", background: "rgba(255,100,80,0.4)" }} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mouth */}
        <motion.div
          style={{
            borderRadius: "0 0 50% 50%",
            background: expression === "angry" ? "rgba(200,50,30,0.7)" : "rgba(60,20,0,0.6)",
            marginTop: 1 * faceScale,
          }}
          animate={{
            width: expr.mouthWidth * faceScale,
            height: expr.mouthHeight * faceScale,
            y: expr.mouthY * faceScale,
            borderRadius: expression === "happy" || expression === "excited"
              ? "0 0 50% 50%"
              : expression === "worried"
                ? "50% 50% 0 0"
                : "50%",
          }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
}
