import { motion } from "framer-motion";

/* ─── Cute Hushh Fire Spirit Mascot (Pixar 3D style) ─── */
interface HushhBotProps {
  size?: number;
  state?: "idle" | "thinking" | "speaking" | "listening" | "success" | "error";
}

export default function HushhBot({ size = 80, state = "idle" }: HushhBotProps) {
  const s = size;

  /* ── Flame colors per state ── */
  const palette: Record<string, { core: string; mid: string; outer: string; glow: string }> = {
    idle:      { core: "hsl(45 100% 65%)",  mid: "hsl(30 95% 55%)",  outer: "hsl(15 90% 50%)",  glow: "hsl(25 100% 50% / 0.35)" },
    thinking:  { core: "hsl(200 90% 70%)",  mid: "hsl(220 85% 60%)", outer: "hsl(240 80% 55%)", glow: "hsl(220 90% 60% / 0.4)" },
    speaking:  { core: "hsl(45 100% 70%)",  mid: "hsl(25 95% 55%)",  outer: "hsl(10 90% 48%)",  glow: "hsl(20 100% 50% / 0.4)" },
    listening: { core: "hsl(340 85% 70%)",  mid: "hsl(320 80% 58%)", outer: "hsl(300 75% 50%)", glow: "hsl(330 90% 60% / 0.4)" },
    success:   { core: "hsl(120 80% 65%)",  mid: "hsl(140 75% 50%)", outer: "hsl(160 70% 42%)", glow: "hsl(140 85% 50% / 0.4)" },
    error:     { core: "hsl(0 80% 65%)",    mid: "hsl(350 85% 50%)", outer: "hsl(340 80% 40%)", glow: "hsl(0 90% 50% / 0.35)" },
  };

  const { core, mid, outer, glow } = palette[state];

  const bodyW = s * 0.55;
  const bodyH = s * 0.45;
  const eyeSize = s * 0.06;
  const legW = s * 0.04;
  const legH = s * 0.12;

  return (
    <motion.div className="relative" style={{ width: s, height: s }}>
      {/* Ambient glow */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: s * 1.2, height: s * 1.2,
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          background: `radial-gradient(circle, ${glow}, transparent 70%)`,
        }}
        animate={{
          scale: state === "thinking" ? [1, 1.2, 1] : state === "listening" ? [1, 1.3, 1] : [1, 1.08, 1],
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{ duration: state === "thinking" ? 1 : 2.5, repeat: Infinity }}
      />

      {/* Ground light reflection */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: s * 0.4, height: s * 0.06,
          bottom: s * 0.08, left: "50%", transform: "translateX(-50%)",
          background: `radial-gradient(ellipse, ${glow}, transparent 80%)`,
        }}
        animate={{ opacity: [0.3, 0.6, 0.3], scaleX: [0.9, 1.1, 0.9] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />

      {/* Main character group – bobs gently */}
      <motion.div
        className="absolute"
        style={{ inset: 0 }}
        animate={
          state === "thinking" ? { y: [0, -4, 0], rotate: [0, 3, -3, 0] } :
          state === "listening" ? { scale: [1, 1.04, 1] } :
          state === "speaking" ? { y: [0, -3, 0] } :
          state === "success" ? { y: [0, -6, 0], rotate: [0, 8, -8, 0] } :
          state === "error" ? { x: [0, -3, 3, -2, 0] } :
          { y: [0, -4, 0] }
        }
        transition={{
          duration: state === "thinking" ? 1.2 : state === "success" ? 0.6 : state === "error" ? 0.4 : 2.5,
          repeat: Infinity, ease: "easeInOut",
        }}
      >
        {/* ── OUTER FLAME (big blobby shape) ── */}
        <motion.div
          className="absolute"
          style={{
            width: s * 0.65, height: s * 0.55,
            bottom: s * 0.25, left: "50%", transform: "translateX(-50%)",
            borderRadius: "45% 45% 40% 40% / 60% 60% 35% 35%",
            background: `radial-gradient(ellipse at 50% 70%, ${mid}, ${outer})`,
          }}
          animate={{ scaleX: [1, 1.04, 0.96, 1], scaleY: [1, 0.97, 1.03, 1] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* ── TOP FLAME WISPS ── */}
        {[
          { left: "40%", w: s * 0.22, h: s * 0.3, delay: 0, skewX: -5 },
          { left: "50%", w: s * 0.18, h: s * 0.38, delay: 0.15, skewX: 3 },
          { left: "58%", w: s * 0.16, h: s * 0.26, delay: 0.3, skewX: 8 },
        ].map((wisp, i) => (
          <motion.div
            key={`wisp-${i}`}
            className="absolute"
            style={{
              width: wisp.w, height: wisp.h,
              bottom: s * 0.55, left: wisp.left,
              transform: `translateX(-50%) skewX(${wisp.skewX}deg)`,
              borderRadius: "50% 50% 40% 40% / 70% 70% 30% 30%",
              background: `linear-gradient(to top, ${outer}, ${mid} 60%, transparent)`,
            }}
            animate={{
              scaleY: [1, 1.15, 0.9, 1],
              scaleX: [1, 0.9, 1.1, 1],
              y: [0, -4, 2, 0],
              rotate: [0, (i % 2 ? 5 : -5), 0],
            }}
            transition={{ duration: 0.8 + i * 0.2, repeat: Infinity, delay: wisp.delay, ease: "easeInOut" }}
          />
        ))}

        {/* ── INNER CORE GLOW (bright yellow) ── */}
        <motion.div
          className="absolute"
          style={{
            width: bodyW, height: bodyH,
            bottom: s * 0.22, left: "50%", transform: "translateX(-50%)",
            borderRadius: "50% 50% 45% 45% / 55% 55% 40% 40%",
            background: `radial-gradient(ellipse at 50% 55%, ${core}, ${mid} 80%)`,
            boxShadow: `inset 0 ${s * 0.03}px ${s * 0.08}px rgba(255,255,255,0.5), inset 0 -${s * 0.03}px ${s * 0.06}px rgba(0,0,0,0.1)`,
          }}
          animate={{ scaleX: [1, 1.02, 0.98, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {/* Highlight sheen */}
          <div
            className="absolute"
            style={{
              width: s * 0.18, height: s * 0.08,
              top: s * 0.04, left: s * 0.08,
              borderRadius: "50%",
              background: "linear-gradient(180deg, rgba(255,255,255,0.6), transparent)",
            }}
          />

          {/* ── FACE ── */}
          <div className="absolute flex flex-col items-center" style={{ top: s * 0.1, left: 0, right: 0 }}>
            {/* Eyes */}
            <div className="flex items-center justify-center" style={{ gap: s * 0.11 }}>
              <Eye size={eyeSize} state={state} delay={0} />
              <Eye size={eyeSize} state={state} delay={0.15} />
            </div>

            {/* Cheek blush */}
            <div className="flex justify-center" style={{ gap: s * 0.2, marginTop: s * 0.02 }}>
              <motion.div
                className="rounded-full"
                style={{ width: s * 0.06, height: s * 0.03, background: "rgba(255,100,80,0.35)" }}
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div
                className="rounded-full"
                style={{ width: s * 0.06, height: s * 0.03, background: "rgba(255,100,80,0.35)" }}
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              />
            </div>

            {/* Mouth */}
            <Mouth size={s} state={state} />
          </div>
        </motion.div>

        {/* ── TINY LEGS ── */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: legW, height: legH,
            bottom: s * 0.12, left: `calc(50% - ${s * 0.1}px)`,
            background: `linear-gradient(to bottom, ${mid}, ${outer})`,
          }}
          animate={state === "success" ? { rotate: [0, -15, 0] } : { rotate: [0, -5, 5, 0] }}
          transition={{ duration: state === "success" ? 0.3 : 1.5, repeat: Infinity }}
        />
        <motion.div
          className="absolute rounded-full"
          style={{
            width: legW, height: legH,
            bottom: s * 0.12, left: `calc(50% + ${s * 0.06}px)`,
            background: `linear-gradient(to bottom, ${mid}, ${outer})`,
          }}
          animate={state === "success" ? { rotate: [0, 15, 0] } : { rotate: [0, 5, -5, 0] }}
          transition={{ duration: state === "success" ? 0.3 : 1.5, repeat: Infinity, delay: 0.2 }}
        />

        {/* ── TINY ARMS ── */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: s * 0.035, height: s * 0.1,
            bottom: s * 0.32, left: `calc(50% - ${s * 0.32}px)`,
            background: `linear-gradient(to bottom, ${mid}, ${outer})`,
            transformOrigin: "top center",
          }}
          animate={
            state === "speaking" ? { rotate: [0, -20, 10, -15, 0] } :
            state === "success" ? { rotate: [0, -45, 0] } :
            { rotate: [0, -8, 8, 0] }
          }
          transition={{ duration: state === "speaking" ? 0.6 : 2, repeat: Infinity }}
        />
        <motion.div
          className="absolute rounded-full"
          style={{
            width: s * 0.035, height: s * 0.1,
            bottom: s * 0.32, right: `calc(50% - ${s * 0.32}px)`,
            background: `linear-gradient(to bottom, ${mid}, ${outer})`,
            transformOrigin: "top center",
          }}
          animate={
            state === "speaking" ? { rotate: [0, 20, -10, 15, 0] } :
            state === "success" ? { rotate: [0, 45, 0] } :
            { rotate: [0, 8, -8, 0] }
          }
          transition={{ duration: state === "speaking" ? 0.6 : 2, repeat: Infinity, delay: 0.15 }}
        />
      </motion.div>

      {/* ── EMBER PARTICLES ── */}
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div
          key={`ember-${i}`}
          className="absolute rounded-full"
          style={{
            width: 2 + (i % 2) * 2, height: 2 + (i % 2) * 2,
            background: i % 2 === 0 ? core : mid,
            left: `${30 + (i * 10) % 40}%`,
            bottom: `${50 + (i * 5) % 20}%`,
          }}
          animate={{
            y: [0, -s * 0.5 - i * 8],
            x: [(i % 2 ? 5 : -5), (i % 2 ? -8 : 8)],
            opacity: [0.8, 0],
            scale: [1, 0.3],
          }}
          transition={{ duration: 1.5 + i * 0.3, repeat: Infinity, delay: i * 0.25, ease: "easeOut" }}
        />
      ))}

      {/* ── Extra sparkles for success/speaking ── */}
      {(state === "success" || state === "speaking") && (
        <>
          {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
            <motion.div
              key={`spark-${i}`}
              className="absolute"
              style={{
                width: 3, height: 3, borderRadius: "50%",
                background: state === "success" ? "hsl(50 100% 70%)" : core,
              }}
              initial={{ x: s / 2, y: s / 2, opacity: 0 }}
              animate={{
                x: s / 2 + Math.cos(i * Math.PI / 4) * s * 0.6,
                y: s / 2 + Math.sin(i * Math.PI / 4) * s * 0.6 - 15,
                opacity: [0, 1, 0], scale: [0, 1.3, 0],
              }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
            />
          ))}
        </>
      )}

      {/* ── Listening wave bars ── */}
      {state === "listening" && (
        <div className="absolute flex items-end justify-center gap-[2px]" style={{ bottom: 0, left: 0, right: 0, height: s * 0.15 }}>
          {[0, 1, 2, 3, 4].map(i => (
            <motion.div
              key={i}
              className="rounded-full"
              style={{ width: 3, background: mid }}
              animate={{ height: [4, 10 + i * 3, 4] }}
              transition={{ duration: 0.4 + i * 0.05, repeat: Infinity, delay: i * 0.06 }}
            />
          ))}
        </div>
      )}

      {/* ── Thinking orbit dots ── */}
      {state === "thinking" && (
        <>
          {[0, 1, 2].map(i => (
            <motion.div
              key={`orbit-${i}`}
              className="absolute rounded-full"
              style={{
                width: 4, height: 4,
                background: core,
                top: "50%", left: "50%",
              }}
              animate={{
                x: [Math.cos((i * 2 * Math.PI) / 3) * s * 0.5, Math.cos((i * 2 * Math.PI) / 3 + Math.PI) * s * 0.5, Math.cos((i * 2 * Math.PI) / 3) * s * 0.5],
                y: [Math.sin((i * 2 * Math.PI) / 3) * s * 0.5, Math.sin((i * 2 * Math.PI) / 3 + Math.PI) * s * 0.5, Math.sin((i * 2 * Math.PI) / 3) * s * 0.5],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
            />
          ))}
        </>
      )}
    </motion.div>
  );
}

/* ─── Sub-components ─── */

function Eye({ size, state, delay }: { size: number; state: string; delay: number }) {
  const isHappy = state === "success";
  const pupilSize = size * 0.6;

  return (
    <motion.div
      className="relative rounded-full bg-[#1a1008]"
      style={{ width: size, height: isHappy ? size * 0.4 : size * 1.4, borderRadius: isHappy ? "0 0 50% 50%" : "50%" }}
      animate={
        state === "thinking" ? { scaleY: [1, 0.15, 1] } :
        state === "listening" ? { scaleY: [1, 1.15, 1] } :
        {}
      }
      transition={{ duration: state === "thinking" ? 2.5 : 1.5, repeat: Infinity, delay }}
    >
      {/* Pupil highlight */}
      {!isHappy && (
        <motion.div
          className="absolute bg-white rounded-full"
          style={{ width: pupilSize, height: pupilSize, top: "15%", right: "15%" }}
          animate={{ opacity: [0.9, 1, 0.9] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
}

function Mouth({ size, state }: { size: number; state: string }) {
  const s = size;

  if (state === "speaking") {
    return (
      <motion.div
        className="rounded-full bg-[#1a1008]/60"
        style={{ width: s * 0.08, height: s * 0.05, marginTop: s * 0.02 }}
        animate={{ scaleY: [0.5, 1.3, 0.5], scaleX: [1, 0.8, 1] }}
        transition={{ duration: 0.3, repeat: Infinity }}
      />
    );
  }
  if (state === "error") {
    return (
      <div
        className="bg-[#1a1008]/50"
        style={{ width: s * 0.1, height: 1.5, marginTop: s * 0.03, borderRadius: 2 }}
      />
    );
  }
  if (state === "success") {
    return (
      <motion.div
        style={{
          width: s * 0.1, height: s * 0.05, marginTop: s * 0.01,
          borderRadius: "0 0 50% 50%",
          background: "#1a1008",
          opacity: 0.5,
        }}
        animate={{ scaleX: [1, 1.2, 1] }}
        transition={{ duration: 0.8, repeat: Infinity }}
      />
    );
  }
  // idle / thinking / listening – small cute line
  return (
    <motion.div
      className="bg-[#1a1008]/40"
      style={{ width: s * 0.06, height: 1.5, marginTop: s * 0.025, borderRadius: 2 }}
      animate={{ scaleX: [1, 1.15, 1] }}
      transition={{ duration: 3, repeat: Infinity }}
    />
  );
}
