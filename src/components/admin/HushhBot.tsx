import { motion } from "framer-motion";
import { useState, useCallback } from "react";

interface HushhBotProps {
  size?: number;
  state?: "idle" | "thinking" | "speaking" | "listening" | "success" | "error";
}

export default function HushhBot({ size = 80, state = "idle" }: HushhBotProps) {
  const s = size;
  const [hovered, setHovered] = useState(false);

  const onEnter = useCallback(() => setHovered(true), []);
  const onLeave = useCallback(() => setHovered(false), []);
  const palette: Record<string, { core: string; bright: string; mid: string; outer: string; deep: string; glow: string }> = {
    idle:      { core: "#FFF8E7", bright: "#FFE082", mid: "#FFB74D", outer: "#FF8F00", deep: "#E65100", glow: "rgba(255,160,0,0.5)" },
    thinking:  { core: "#E3F2FD", bright: "#90CAF9", mid: "#42A5F5", outer: "#1E88E5", deep: "#0D47A1", glow: "rgba(30,136,229,0.5)" },
    speaking:  { core: "#FFF8E7", bright: "#FFD54F", mid: "#FFA726", outer: "#F57C00", deep: "#BF360C", glow: "rgba(255,140,0,0.5)" },
    listening: { core: "#FCE4EC", bright: "#F48FB1", mid: "#EC407A", outer: "#C2185B", deep: "#880E4F", glow: "rgba(194,24,91,0.5)" },
    success:   { core: "#E8F5E9", bright: "#A5D6A7", mid: "#66BB6A", outer: "#2E7D32", deep: "#1B5E20", glow: "rgba(46,125,50,0.5)" },
    error:     { core: "#FFEBEE", bright: "#EF9A9A", mid: "#EF5350", outer: "#C62828", deep: "#7F0000", glow: "rgba(198,40,40,0.5)" },
  };

  const c = palette[state];

  // Expression changes every few seconds
  const expressions: Record<string, { eyeStyle: string; mouthType: string }> = {
    idle:      { eyeStyle: "curious", mouthType: "pout" },
    thinking:  { eyeStyle: "look-up", mouthType: "hmm" },
    speaking:  { eyeStyle: "wide", mouthType: "talk" },
    listening: { eyeStyle: "soft", mouthType: "smile" },
    success:   { eyeStyle: "happy", mouthType: "grin" },
    error:     { eyeStyle: "sad", mouthType: "frown" },
  };

  const expr = hovered
    ? { eyeStyle: "scared", mouthType: "gasp" }
    : expressions[state];

  const activeState = hovered ? "hover" : state;

  return (
    <motion.div
      className="relative cursor-pointer"
      style={{ width: s, height: s * 1.3 }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onTouchStart={onEnter}
      onTouchEnd={onLeave}
    >
      {/* ── LARGE AMBIENT GLOW ── */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: s * 1.6, height: s * 1.6,
          top: "40%", left: "50%",
          transform: "translate(-50%, -50%)",
          background: `radial-gradient(circle, ${c.glow}, transparent 65%)`,
        }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* ── GROUND REFLECTION ── */}
      <motion.div
        className="absolute"
        style={{
          width: s * 0.5, height: s * 0.08,
          bottom: s * 0.05, left: "50%", transform: "translateX(-50%)",
          borderRadius: "50%",
          background: `radial-gradient(ellipse, ${c.bright}, transparent 80%)`,
          filter: "blur(3px)",
        }}
        animate={{ opacity: [0.4, 0.8, 0.4], scaleX: [0.8, 1.2, 0.8] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />

      {/* ── CHARACTER GROUP ── */}
      <motion.div
        className="absolute"
        style={{ inset: 0 }}
        animate={
          hovered ? { y: -12, scale: 0.88, rotate: [0, -6, 6, -3, 0] } :
          state === "thinking" ? { y: [0, -5, 0], rotate: [0, 2, -2, 0] } :
          state === "speaking" ? { y: [0, -3, 0] } :
          state === "success" ? { y: [0, -8, 0] } :
          state === "error" ? { x: [0, -3, 3, -2, 0] } :
          state === "listening" ? { scale: [1, 1.03, 1] } :
          { y: [0, -4, 0] }
        }
        transition={{
          duration: hovered ? 0.35 : state === "error" ? 0.4 : state === "success" ? 0.6 : state === "thinking" ? 1.2 : 2.5,
          repeat: hovered ? 0 : Infinity, ease: "easeInOut",
        }}
      >
        {/* ── OUTER FLAME LAYER 1 (biggest, deepest color) ── */}
        <motion.div
          className="absolute"
          style={{
            width: s * 0.85, height: s * 0.75,
            bottom: s * 0.25, left: "50%", transform: "translateX(-50%)",
            borderRadius: "48% 52% 42% 58% / 65% 60% 40% 35%",
            background: `radial-gradient(ellipse at 50% 65%, ${c.outer}, ${c.deep} 90%)`,
            filter: "blur(1px)",
          }}
          animate={{
            borderRadius: [
              "48% 52% 42% 58% / 65% 60% 40% 35%",
              "52% 48% 55% 45% / 60% 65% 35% 40%",
              "45% 55% 48% 52% / 68% 58% 42% 32%",
              "48% 52% 42% 58% / 65% 60% 40% 35%",
            ],
            scaleX: [1, 1.05, 0.95, 1],
            scaleY: [1, 0.96, 1.04, 1],
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* ── OUTER FLAME LAYER 2 (mid) ── */}
        <motion.div
          className="absolute"
          style={{
            width: s * 0.72, height: s * 0.65,
            bottom: s * 0.28, left: "50%", transform: "translateX(-50%)",
            borderRadius: "50% 50% 44% 56% / 62% 58% 42% 38%",
            background: `radial-gradient(ellipse at 50% 60%, ${c.mid}, ${c.outer} 85%)`,
          }}
          animate={{
            borderRadius: [
              "50% 50% 44% 56% / 62% 58% 42% 38%",
              "46% 54% 50% 50% / 58% 62% 38% 42%",
              "54% 46% 48% 52% / 64% 56% 44% 36%",
              "50% 50% 44% 56% / 62% 58% 42% 38%",
            ],
            scaleX: [1, 0.97, 1.03, 1],
          }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
        />

        {/* ── TOP FLAME WISPS (the tall dancing flames) ── */}
        {[
          { left: "35%", w: s * 0.2, h: s * 0.45, delay: 0, skew: -8, rx: "45% 55% 50% 50% / 80% 75% 25% 20%" },
          { left: "50%", w: s * 0.18, h: s * 0.55, delay: 0.12, skew: 2, rx: "50% 50% 45% 55% / 82% 78% 22% 18%" },
          { left: "62%", w: s * 0.16, h: s * 0.4, delay: 0.25, skew: 10, rx: "55% 45% 48% 52% / 78% 72% 28% 22%" },
          { left: "42%", w: s * 0.12, h: s * 0.35, delay: 0.35, skew: -5, rx: "48% 52% 46% 54% / 76% 80% 20% 24%" },
          { left: "56%", w: s * 0.1, h: s * 0.32, delay: 0.18, skew: 12, rx: "52% 48% 50% 50% / 74% 70% 30% 26%" },
        ].map((w, i) => (
          <motion.div
            key={`wisp-${i}`}
            className="absolute"
            style={{
              width: w.w, height: w.h,
              bottom: s * 0.62, left: w.left,
              transform: `translateX(-50%) skewX(${w.skew}deg)`,
              borderRadius: w.rx,
              background: `linear-gradient(to top, ${c.outer}, ${c.mid} 40%, ${c.bright} 75%, transparent)`,
              opacity: 0.85,
            }}
            animate={{
              scaleY: [1, 1.2, 0.85, 1],
              scaleX: [1, 0.85, 1.15, 1],
              y: [0, -6, 3, 0],
              skewX: [w.skew, w.skew + (i % 2 ? 6 : -6), w.skew - 3, w.skew],
            }}
            transition={{ duration: 0.7 + i * 0.15, repeat: Infinity, delay: w.delay, ease: "easeInOut" }}
          />
        ))}

        {/* ── SIDE FLAME TENDRILS ── */}
        {[
          { side: "left", left: "18%", bottom: s * 0.4, w: s * 0.14, h: s * 0.25, rotate: -25 },
          { side: "right", left: "82%", bottom: s * 0.4, w: s * 0.14, h: s * 0.25, rotate: 25 },
          { side: "left", left: "22%", bottom: s * 0.55, w: s * 0.1, h: s * 0.2, rotate: -35 },
          { side: "right", left: "78%", bottom: s * 0.55, w: s * 0.1, h: s * 0.2, rotate: 35 },
        ].map((t, i) => (
          <motion.div
            key={`tendril-${i}`}
            className="absolute"
            style={{
              width: t.w, height: t.h,
              bottom: t.bottom, left: t.left,
              transform: `translateX(-50%) rotate(${t.rotate}deg)`,
              borderRadius: "50% 50% 40% 40% / 70% 70% 30% 30%",
              background: `linear-gradient(to top, ${c.deep}, ${c.outer} 50%, transparent)`,
              opacity: 0.7,
            }}
            animate={{
              scaleY: [1, 1.3, 0.8, 1],
              rotate: [t.rotate, t.rotate + (t.side === "left" ? -8 : 8), t.rotate, t.rotate + (t.side === "left" ? 4 : -4), t.rotate],
              opacity: [0.7, 0.9, 0.5, 0.7],
            }}
            transition={{ duration: 1 + i * 0.2, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}

        {/* ── INNER BRIGHT CORE (the face area) ── */}
        <motion.div
          className="absolute"
          style={{
            width: s * 0.55, height: s * 0.48,
            bottom: s * 0.26, left: "50%", transform: "translateX(-50%)",
            borderRadius: "50% 50% 46% 54% / 56% 54% 46% 44%",
            background: `radial-gradient(ellipse at 50% 50%, ${c.core}, ${c.bright} 60%, ${c.mid} 100%)`,
            boxShadow: `0 0 ${s * 0.15}px ${c.bright}, inset 0 ${s * 0.02}px ${s * 0.06}px rgba(255,255,255,0.6)`,
          }}
          animate={{ scaleX: [1, 1.02, 0.98, 1] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        >
          {/* Highlight sheen */}
          <div
            className="absolute"
            style={{
              width: s * 0.2, height: s * 0.08,
              top: s * 0.04, left: s * 0.06,
              borderRadius: "50%",
              background: "linear-gradient(180deg, rgba(255,255,255,0.7), transparent)",
            }}
          />

          {/* ── FACE ── */}
          <div className="absolute flex flex-col items-center" style={{ top: s * 0.1, left: 0, right: 0 }}>
            {/* Eyebrows for expressions */}
            {(expr.eyeStyle === "curious" || expr.eyeStyle === "sad" || expr.eyeStyle === "scared") && (
              <div className="flex justify-center" style={{ gap: s * 0.1, marginBottom: s * 0.01 }}>
                <motion.div
                  style={{
                    width: s * 0.06, height: 2,
                    background: "rgba(80,40,10,0.5)", borderRadius: 2,
                  }}
                  animate={
                    expr.eyeStyle === "scared" ? { rotate: [20, 25, 20], y: [-2, -4, -2] } :
                    expr.eyeStyle === "curious" ? { rotate: [-8, -12, -8] } :
                    {}
                  }
                  initial={{ rotate: expr.eyeStyle === "sad" ? 15 : expr.eyeStyle === "scared" ? 20 : -8 }}
                  transition={{ duration: expr.eyeStyle === "scared" ? 0.4 : 2, repeat: Infinity }}
                />
                <motion.div
                  style={{
                    width: s * 0.06, height: 2,
                    background: "rgba(80,40,10,0.5)", borderRadius: 2,
                  }}
                  animate={
                    expr.eyeStyle === "scared" ? { rotate: [-20, -25, -20], y: [-2, -4, -2] } :
                    expr.eyeStyle === "curious" ? { rotate: [8, 12, 8] } :
                    {}
                  }
                  initial={{ rotate: expr.eyeStyle === "sad" ? -15 : expr.eyeStyle === "scared" ? -20 : 8 }}
                  transition={{ duration: expr.eyeStyle === "scared" ? 0.4 : 2, repeat: Infinity }}
                />
              </div>
            )}

            {/* Eyes */}
            <div className="flex items-center justify-center" style={{ gap: s * 0.1 }}>
              <FlameEye size={s * 0.065} state={state} side="left" hovered={hovered} />
              <FlameEye size={s * 0.065} state={state} side="right" hovered={hovered} />
            </div>

            {/* Cheek blush */}
            <div className="flex justify-center" style={{ gap: s * 0.18, marginTop: s * 0.015 }}>
              <motion.div
                className="rounded-full"
                style={{ width: s * 0.06, height: s * 0.03, background: "rgba(255,100,60,0.4)", filter: "blur(1px)" }}
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div
                className="rounded-full"
                style={{ width: s * 0.06, height: s * 0.03, background: "rgba(255,100,60,0.4)", filter: "blur(1px)" }}
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              />
            </div>

            {/* Mouth */}
            <FlameMouth size={s} type={expr.mouthType} state={state} />
          </div>
        </motion.div>

        {/* ── LEGS (flame-like, wispy) ── */}
        {[
          { x: -s * 0.1, delay: 0, dir: -1 },
          { x: s * 0.06, delay: 0.2, dir: 1 },
        ].map((leg, i) => (
          <motion.div
            key={`leg-${i}`}
            className="absolute"
            style={{
              width: s * 0.045, height: s * 0.14,
              bottom: s * 0.12, left: `calc(50% + ${leg.x}px)`,
              borderRadius: "40% 40% 50% 50% / 30% 30% 70% 70%",
              background: `linear-gradient(to bottom, ${c.mid}, ${c.outer}, transparent)`,
              transformOrigin: "top center",
            }}
            animate={
              state === "success"
                ? { rotate: [0, leg.dir * -20, leg.dir * 15, 0] }
                : { rotate: [0, leg.dir * -6, leg.dir * 6, 0], scaleY: [1, 1.1, 0.9, 1] }
            }
            transition={{ duration: state === "success" ? 0.4 : 1.5, repeat: Infinity, delay: leg.delay }}
          />
        ))}

        {/* ── ARMS (flame wisps on sides) ── */}
        {[
          { side: -1, x: -s * 0.3 },
          { side: 1, x: s * 0.3 },
        ].map((arm, i) => (
          <motion.div
            key={`arm-${i}`}
            className="absolute"
            style={{
              width: s * 0.04, height: s * 0.12,
              bottom: s * 0.38, left: `calc(50% + ${arm.x}px)`,
              borderRadius: "50%",
              background: `linear-gradient(to bottom, ${c.mid}, ${c.outer}, transparent)`,
              transformOrigin: "top center",
            }}
            animate={
              state === "speaking" ? { rotate: [0, arm.side * -25, arm.side * 15, 0] } :
              state === "success" ? { rotate: [0, arm.side * -50, 0] } :
              { rotate: [0, arm.side * -10, arm.side * 10, 0] }
            }
            transition={{ duration: state === "speaking" ? 0.5 : 2, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </motion.div>

      {/* ── EMBER PARTICLES ── */}
      {Array.from({ length: 10 }).map((_, i) => (
        <motion.div
          key={`ember-${i}`}
          className="absolute rounded-full"
          style={{
            width: 1.5 + (i % 3) * 1.5, height: 1.5 + (i % 3) * 1.5,
            background: i % 3 === 0 ? c.core : i % 3 === 1 ? c.bright : c.mid,
            left: `${25 + (i * 7) % 50}%`,
            bottom: `${45 + (i * 4) % 25}%`,
          }}
          animate={{
            y: [0, -s * 0.6 - i * 6],
            x: [(i % 2 ? 6 : -6), (i % 2 ? -10 : 10)],
            opacity: [0.9, 0],
            scale: [1, 0.2],
          }}
          transition={{ duration: 1.2 + i * 0.25, repeat: Infinity, delay: i * 0.2, ease: "easeOut" }}
        />
      ))}

      {/* ── SPARKLES for success/speaking ── */}
      {(state === "success" || state === "speaking") &&
        Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={`spark-${i}`}
            className="absolute rounded-full"
            style={{ width: 3, height: 3, background: c.bright }}
            initial={{ x: s / 2, y: s * 0.5, opacity: 0 }}
            animate={{
              x: s / 2 + Math.cos(i * Math.PI / 4) * s * 0.65,
              y: s * 0.5 + Math.sin(i * Math.PI / 4) * s * 0.65 - 10,
              opacity: [0, 1, 0], scale: [0, 1.5, 0],
            }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
          />
        ))
      }

      {/* ── Listening wave bars ── */}
      {state === "listening" && (
        <div className="absolute flex items-end justify-center gap-[2px]" style={{ bottom: 0, left: 0, right: 0, height: s * 0.12 }}>
          {[0, 1, 2, 3, 4].map(i => (
            <motion.div
              key={i}
              className="rounded-full"
              style={{ width: 3, background: c.mid }}
              animate={{ height: [3, 10 + i * 3, 3] }}
              transition={{ duration: 0.35 + i * 0.05, repeat: Infinity, delay: i * 0.05 }}
            />
          ))}
        </div>
      )}

      {/* ── Thinking orbit dots ── */}
      {state === "thinking" &&
        [0, 1, 2].map(i => (
          <motion.div
            key={`orb-${i}`}
            className="absolute rounded-full"
            style={{ width: 5, height: 5, background: c.bright, top: "45%", left: "50%" }}
            animate={{
              x: [Math.cos((i * 2 * Math.PI) / 3) * s * 0.5, Math.cos((i * 2 * Math.PI) / 3 + Math.PI) * s * 0.5],
              y: [Math.sin((i * 2 * Math.PI) / 3) * s * 0.4, Math.sin((i * 2 * Math.PI) / 3 + Math.PI) * s * 0.4],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
          />
        ))
      }
    </motion.div>
  );
}

/* ─── Eye Component ─── */
function FlameEye({ size, state, side, hovered = false }: { size: number; state: string; side: "left" | "right"; hovered?: boolean }) {
  const isHappy = state === "success";
  const pupilR = size * 0.45;

  if (isHappy) {
    return (
      <motion.div
        style={{
          width: size * 1.2, height: size * 0.5,
          borderRadius: "0 0 50% 50%",
          background: "#1a0e05",
        }}
        animate={{ scaleX: [1, 1.1, 1] }}
        transition={{ duration: 0.8, repeat: Infinity }}
      />
    );
  }

  if (hovered) {
    // Scared wide eyes
    return (
      <motion.div
        className="relative rounded-full"
        style={{ width: size * 1.4, height: size * 2, background: "#1a0e05" }}
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 0.3, repeat: Infinity }}
      >
        <motion.div
          className="absolute bg-white rounded-full"
          style={{ width: pupilR * 0.8, height: pupilR * 0.8, top: "12%", right: "15%" }}
        />
        <div
          className="absolute bg-white/50 rounded-full"
          style={{ width: pupilR * 0.4, height: pupilR * 0.4, bottom: "20%", left: "18%" }}
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      className="relative rounded-full"
      style={{
        width: size * 1.1, height: size * 1.5,
        background: "#1a0e05",
      }}
      animate={
        state === "thinking" ? { scaleY: [1, 0.1, 1] } :
        state === "listening" ? { scaleY: [1, 1.15, 1] } :
        { scaleY: [1, 1, 1, 0.1, 1, 1, 1] }
      }
      transition={{
        duration: state === "thinking" ? 2.5 : state === "listening" ? 1.5 : 4,
        repeat: Infinity,
        delay: side === "right" ? 0.1 : 0,
      }}
    >
      <motion.div
        className="absolute bg-white rounded-full"
        style={{ width: pupilR, height: pupilR, top: "18%", right: "18%" }}
        animate={
          state === "thinking" ? { x: [0, -2, 2, 0], y: [0, -1, 0] } :
          state === "listening" ? { scale: [1, 1.2, 1] } :
          {}
        }
        transition={{ duration: 2, repeat: Infinity }}
      />
      <div
        className="absolute bg-white/60 rounded-full"
        style={{ width: pupilR * 0.5, height: pupilR * 0.5, bottom: "25%", left: "22%" }}
      />
    </motion.div>
  );
}

/* ─── Mouth Component ─── */
function FlameMouth({ size, type, state }: { size: number; type: string; state: string }) {
  const s = size;

  if (type === "talk" || state === "speaking") {
    return (
      <motion.div
        className="rounded-full"
        style={{
          width: s * 0.09, height: s * 0.06,
          marginTop: s * 0.02,
          background: "#1a0e05",
          opacity: 0.6,
        }}
        animate={{ scaleY: [0.4, 1.4, 0.6, 1.2, 0.4], scaleX: [1, 0.8, 1.1, 0.9, 1] }}
        transition={{ duration: 0.35, repeat: Infinity }}
      />
    );
  }

  if (type === "frown" || state === "error") {
    return (
      <div style={{ marginTop: s * 0.025 }}>
        <svg width={s * 0.1} height={s * 0.05} viewBox="0 0 20 10">
          <path d="M3 8 Q10 3 17 8" stroke="#1a0e05" strokeWidth="2" fill="none" opacity="0.5" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  if (type === "grin" || state === "success") {
    return (
      <motion.div
        style={{
          width: s * 0.1, height: s * 0.05,
          marginTop: s * 0.015,
          borderRadius: "0 0 50% 50%",
          background: "#1a0e05",
          opacity: 0.5,
        }}
        animate={{ scaleX: [1, 1.3, 1] }}
        transition={{ duration: 0.6, repeat: Infinity }}
      />
    );
  }

  if (type === "pout") {
    // Cute worried/pouty mouth like in the reference
    return (
      <div style={{ marginTop: s * 0.02 }}>
        <svg width={s * 0.1} height={s * 0.06} viewBox="0 0 20 12">
          <motion.path
            d="M6 5 Q10 8 14 5"
            stroke="#1a0e05"
            strokeWidth="2"
            fill="none"
            opacity="0.5"
            strokeLinecap="round"
            animate={{ d: ["M6 5 Q10 8 14 5", "M6 6 Q10 9 14 6", "M6 5 Q10 8 14 5"] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        </svg>
      </div>
    );
  }

  // hmm / smile / default
  return (
    <motion.div
      style={{
        width: s * 0.06, height: 2,
        marginTop: s * 0.025,
        background: "#1a0e05",
        opacity: 0.45,
        borderRadius: 2,
      }}
      animate={{ scaleX: [1, 1.2, 1] }}
      transition={{ duration: 3, repeat: Infinity }}
    />
  );
}
