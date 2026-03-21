import { motion } from "framer-motion";

/* ─── Cute Hushh AI Bot Mascot ─── */
interface HushhBotProps {
  size?: number;
  state?: "idle" | "thinking" | "speaking" | "listening" | "success" | "error";
}

export default function HushhBot({ size = 80, state = "idle" }: HushhBotProps) {
  const s = size;
  const eyeSize = s * 0.09;
  const eyeGap = s * 0.15;

  const stateColors: Record<string, { body: string; glow: string }> = {
    idle: { body: "hsl(260 70% 65%)", glow: "hsl(260 80% 70% / 0.3)" },
    thinking: { body: "hsl(200 80% 60%)", glow: "hsl(200 80% 65% / 0.4)" },
    speaking: { body: "hsl(280 75% 65%)", glow: "hsl(280 80% 70% / 0.4)" },
    listening: { body: "hsl(340 75% 65%)", glow: "hsl(340 80% 70% / 0.4)" },
    success: { body: "hsl(150 70% 50%)", glow: "hsl(150 80% 55% / 0.4)" },
    error: { body: "hsl(0 70% 60%)", glow: "hsl(0 80% 65% / 0.3)" },
  };

  const { body, glow } = stateColors[state];

  return (
    <motion.div className="relative" style={{ width: s, height: s }}>
      {/* Outer glow */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: s * 1.3, height: s * 1.3,
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          background: `radial-gradient(circle, ${glow}, transparent 70%)`,
        }}
        animate={{
          scale: state === "thinking" ? [1, 1.15, 1] : state === "listening" ? [1, 1.2, 1] : [1, 1.05, 1],
          opacity: state === "thinking" ? [0.5, 0.9, 0.5] : [0.4, 0.6, 0.4],
        }}
        transition={{
          duration: state === "thinking" ? 1 : state === "listening" ? 0.8 : 2.5,
          repeat: Infinity,
        }}
      />

      {/* Body */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: s, height: s,
          top: 0, left: 0,
          background: `radial-gradient(circle at 40% 35%, hsl(270 85% 80%), ${body}, hsl(260 60% 45%))`,
          boxShadow: `0 ${s * 0.1}px ${s * 0.25}px ${glow}, inset 0 -${s * 0.06}px ${s * 0.12}px hsl(260 60% 35% / 0.3), inset 0 ${s * 0.06}px ${s * 0.12}px hsl(270 90% 85% / 0.4)`,
        }}
        animate={
          state === "thinking" ? { y: [0, -4, 0], rotate: [0, 3, -3, 0] } :
          state === "listening" ? { scale: [1, 1.04, 1] } :
          state === "speaking" ? { y: [0, -2, 0] } :
          { y: [0, -3, 0] }
        }
        transition={{
          duration: state === "thinking" ? 1.2 : state === "listening" ? 0.6 : 2.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Shine highlight */}
        <div
          className="absolute rounded-full"
          style={{
            width: s * 0.3, height: s * 0.18,
            top: s * 0.12, left: s * 0.2,
            background: "linear-gradient(180deg, rgba(255,255,255,0.5), transparent)",
            borderRadius: "50%",
          }}
        />

        {/* Eyes */}
        <div className="absolute flex items-center justify-center gap-1" style={{ top: s * 0.35, left: 0, right: 0 }}>
          <motion.div
            className="rounded-full bg-white"
            style={{ width: eyeSize, height: eyeSize * (state === "success" ? 0.4 : 1.6), marginRight: eyeGap }}
            animate={
              state === "thinking" ? { scaleY: [1, 0.2, 1] } :
              state === "listening" ? { scaleY: [1, 1.2, 1] } :
              {}
            }
            transition={{ duration: state === "thinking" ? 2 : 1.5, repeat: Infinity, delay: 0 }}
          />
          <motion.div
            className="rounded-full bg-white"
            style={{ width: eyeSize, height: eyeSize * (state === "success" ? 0.4 : 1.6) }}
            animate={
              state === "thinking" ? { scaleY: [1, 0.2, 1] } :
              state === "listening" ? { scaleY: [1, 1.2, 1] } :
              {}
            }
            transition={{ duration: state === "thinking" ? 2 : 1.5, repeat: Infinity, delay: 0.2 }}
          />
        </div>

        {/* Mouth / expression */}
        {state === "speaking" && (
          <motion.div
            className="absolute rounded-full bg-white/70"
            style={{ width: s * 0.12, height: s * 0.06, bottom: s * 0.28, left: "50%", transform: "translateX(-50%)" }}
            animate={{ scaleY: [0.5, 1.2, 0.5], scaleX: [1, 0.8, 1] }}
            transition={{ duration: 0.3, repeat: Infinity }}
          />
        )}
        {state === "error" && (
          <div
            className="absolute bg-white/60"
            style={{ width: s * 0.14, height: 2, bottom: s * 0.3, left: "50%", transform: "translateX(-50%)", borderRadius: 2 }}
          />
        )}
      </motion.div>

      {/* Sparkle particles */}
      {(state === "success" || state === "speaking") && (
        <>
          {[0, 1, 2, 3].map(i => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                width: 4, height: 4, borderRadius: "50%",
                background: state === "success" ? "hsl(150 80% 60%)" : "hsl(280 80% 75%)",
              }}
              initial={{ x: s / 2, y: s / 2, opacity: 0, scale: 0 }}
              animate={{
                x: s / 2 + Math.cos(i * Math.PI / 2) * s * 0.6,
                y: s / 2 + Math.sin(i * Math.PI / 2) * s * 0.6 - 10,
                opacity: [0, 1, 0],
                scale: [0, 1.2, 0],
              }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </>
      )}
    </motion.div>
  );
}
