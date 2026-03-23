import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useAppConfig } from "@/hooks/use-app-config";

// Time-of-day splash backgrounds
import splashMorning from "@/assets/splash-morning.webp";
import splashAfternoon from "@/assets/splash-afternoon.webp";
import splashEvening from "@/assets/splash-evening.webp";
import splashNight from "@/assets/splash-night.webp";

// Preload 3D category icons during splash
import iconHome from "@/assets/icon-home.webp";
import iconStays from "@/assets/icon-stays-new.webp";
import iconExperiences from "@/assets/icon-experiences-new.webp";
import iconServices from "@/assets/icon-services-new.webp";
import iconCurations from "@/assets/icon-curations.webp";
import icon3dPickleball from "@/assets/icon-3d-pickleball.webp";
import icon3dBadminton from "@/assets/icon-3d-badminton.webp";
import icon3dArchery from "@/assets/icon-3d-archery.webp";
import icon3dSwimming from "@/assets/icon-3d-swimming.webp";

const preloadIcons = [
  iconHome, iconStays, iconExperiences, iconServices, iconCurations,
  icon3dPickleball, icon3dBadminton, icon3dArchery, icon3dSwimming,
];

function getTimeConfig() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return {
    greeting: "Good Morning",
    emoji: "☀️",
    bg: splashMorning,
    overlay: "linear-gradient(180deg, hsla(0,0%,0%,0.25) 0%, hsla(0,0%,0%,0.05) 40%, hsla(0,0%,0%,0.4) 100%)",
    hasFireflies: false,
    hasShootingStars: false,
    particleColor: "hsla(45, 90%, 70%, 0.5)",
    glowColor: "hsla(40, 100%, 65%, 0.3)",
    ambientSound: "/audio/birds-morning.wav",
  };
  if (hour >= 12 && hour < 17) return {
    greeting: "Good Afternoon",
    emoji: "🌤️",
    bg: splashAfternoon,
    overlay: "linear-gradient(180deg, hsla(0,0%,0%,0.2) 0%, hsla(0,0%,0%,0.0) 40%, hsla(0,0%,0%,0.35) 100%)",
    hasFireflies: false,
    hasShootingStars: false,
    particleColor: "hsla(45, 80%, 75%, 0.4)",
    glowColor: "hsla(45, 90%, 60%, 0.25)",
    ambientSound: "/audio/birds-morning.wav",
  };
  if (hour >= 17 && hour < 21) return {
    greeting: "Good Evening",
    emoji: "🌅",
    bg: splashEvening,
    overlay: "linear-gradient(180deg, hsla(0,0%,0%,0.3) 0%, hsla(0,0%,0%,0.1) 35%, hsla(0,0%,0%,0.5) 100%)",
    hasFireflies: true,
    hasShootingStars: true,
    particleColor: "hsla(35, 100%, 65%, 0.7)",
    glowColor: "hsla(20, 100%, 55%, 0.3)",
    ambientSound: "/audio/crickets-night.wav",
  };
  return {
    greeting: "Good Night",
    emoji: "🌙",
    bg: splashNight,
    overlay: "linear-gradient(180deg, hsla(0,0%,0%,0.15) 0%, hsla(0,0%,0%,0.05) 40%, hsla(0,0%,0%,0.55) 100%)",
    hasFireflies: true,
    hasShootingStars: true,
    particleColor: "hsla(55, 90%, 70%, 0.8)",
    glowColor: "hsla(45, 80%, 70%, 0.25)",
    ambientSound: "/audio/crickets-night.wav",
  };
}

/* ── Floating Particles (fireflies / dust motes) ── */
function FloatingParticles({ color, count }: { color: string; count: number }) {
  const particles = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: `${8 + (i * 29 + 13) % 84}%`,
      y: `${25 + (i * 19 + 7) % 55}%`,
      size: 2 + (i % 3),
      dur: 2.5 + (i % 4) * 0.8,
      del: (i * 0.2) % 2.5,
    })),
  [count]);

  return (
    <>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: p.size,
            height: p.size,
            left: p.x,
            top: p.y,
            background: color,
            boxShadow: `0 0 ${p.size * 3}px ${p.size}px ${color}`,
          }}
          animate={{
            y: [0, -(12 + p.id % 15), 4, -(8 + p.id % 10), 0],
            x: [0, (p.id % 2 === 0 ? 6 : -6), 0],
            opacity: [0, 0.9, 0.4, 0.8, 0],
          }}
          transition={{ duration: p.dur, repeat: Infinity, delay: p.del, ease: "easeInOut" }}
        />
      ))}
    </>
  );
}

/* ── Shooting Star ── */
function ShootingStar({ delay }: { delay: number }) {
  const startX = useMemo(() => 20 + Math.random() * 50, []);
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        width: 2,
        height: 2,
        top: `${5 + Math.random() * 25}%`,
        left: `${startX}%`,
        background: "white",
        borderRadius: 1,
        boxShadow: "0 0 4px 1px white, -20px 0 15px 1px hsla(0,0%,100%,0.3)",
      }}
      initial={{ x: 0, y: 0, opacity: 0 }}
      animate={{ x: [0, 120], y: [0, 60], opacity: [0, 1, 1, 0] }}
      transition={{ delay, duration: 0.8, ease: "easeIn" }}
    />
  );
}

/* ═══════════════ MAIN SPLASH ═══════════════ */
export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [show, setShow] = useState(true);
  const [phase, setPhase] = useState(0);
  const [imgReady, setImgReady] = useState(false);
  const config = useMemo(getTimeConfig, []);
  const appConfig = useAppConfig();
  const brandName = appConfig.app_name || "hushh";
  const tagline = appConfig.app_tagline || "Private experiences await";
  const letters = useMemo(() => brandName.split(""), [brandName]);

  // Preload splash bg image ASAP with high priority
  useEffect(() => {
    const img = new Image();
    img.fetchPriority = "high" as any;
    img.onload = () => setImgReady(true);
    img.onerror = () => setImgReady(true); // proceed even on error
    img.src = config.bg;
  }, [config.bg]);

  // Preload category icons during splash
  useEffect(() => {
    preloadIcons.forEach((src) => { const img = new Image(); img.src = src; });
  }, []);

  // Ambient sound — triggered on first user interaction to bypass autoplay policy
  useEffect(() => {
    let audio: HTMLAudioElement | null = null;
    let fadeInId: ReturnType<typeof setInterval>;
    let started = false;

    const startAudio = () => {
      if (started) return;
      started = true;
      audio = new Audio(config.ambientSound);
      audio.loop = true;
      audio.volume = 0;
      audio.play().catch(() => {});
      let vol = 0;
      fadeInId = setInterval(() => {
        vol = Math.min(vol + 0.02, 0.25);
        if (audio) audio.volume = vol;
        if (vol >= 0.25) clearInterval(fadeInId);
      }, 60);
    };

    // Try autoplay first
    const autoTimer = setTimeout(() => {
      startAudio();
    }, 400);

    // Also listen for user interaction as fallback
    const interactionHandler = () => startAudio();
    document.addEventListener("touchstart", interactionHandler, { once: true, passive: true });
    document.addEventListener("click", interactionHandler, { once: true });

    return () => {
      clearTimeout(autoTimer);
      clearInterval(fadeInId);
      document.removeEventListener("touchstart", interactionHandler);
      document.removeEventListener("click", interactionHandler);
      if (audio) {
        let vol = audio.volume;
        const id = setInterval(() => {
          vol = Math.max(vol - 0.05, 0);
          if (audio) audio.volume = vol;
          if (vol <= 0) { clearInterval(id); audio?.pause(); }
        }, 40);
      }
    };
  }, [config.ambientSound]);

  // Start phase timeline only when image is ready
  useEffect(() => {
    if (!imgReady) return;
    const timers = [
      setTimeout(() => setPhase(1), 150),     // image revealed
      setTimeout(() => setPhase(2), 700),     // greeting appears
      setTimeout(() => setPhase(3), 1800),    // brand name types in
      setTimeout(() => setPhase(4), 4200),    // begin exit
      setTimeout(() => { setShow(false); setTimeout(onComplete, 500); }, 4800),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete, imgReady]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 overflow-hidden"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* ─── Layer 0: Background image — instant display ─── */}
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1.12, opacity: imgReady ? 1 : 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 3.5, ease: "easeOut" }}
          >
            <img
              src={config.bg}
              alt=""
              className="w-full h-full object-cover"
              fetchPriority="high"
              decoding="sync"
              style={{ willChange: "transform" }}
            />
          </motion.div>

          {/* ─── Layer 1: Gradient overlay ─── */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: config.overlay }} />

          {/* ─── Layer 2: Ambient warm glow pulse ─── */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at 50% 80%, ${config.glowColor} 0%, transparent 60%)`,
            }}
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* ─── Layer 3: Floating particles ─── */}
          {phase >= 1 && (
            <FloatingParticles color={config.particleColor} count={config.hasFireflies ? 16 : 8} />
          )}

          {/* ─── Layer 4: Shooting stars (evening/night) ─── */}
          {config.hasShootingStars && phase >= 1 && (
            <>
              <ShootingStar delay={1.2} />
              <ShootingStar delay={2.4} />
            </>
          )}

          {/* ─── Layer 5: Content ─── */}
          <div className="absolute inset-0 flex flex-col z-10">

            {/* Top — Greeting area */}
            <div className="flex-1 flex flex-col justify-center items-center px-8 pt-16">
              {/* Date */}
              <motion.p
                className="text-[11px] font-semibold tracking-[0.2em] uppercase text-white/50"
                initial={{ opacity: 0, y: -15 }}
                animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
              >
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </motion.p>

              {/* Greeting */}
              <motion.h1
                className="text-[32px] font-extrabold text-white text-center mt-2 leading-tight"
                style={{
                  textShadow: "0 2px 20px hsla(0,0%,0%,0.5)",
                  fontFamily: "'Playfair Display', serif",
                }}
                initial={{ opacity: 0, y: 25, scale: 0.9 }}
                animate={phase >= 2 ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 25, scale: 0.9 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 120, damping: 14 }}
              >
                {config.greeting} {config.emoji}
              </motion.h1>

              {/* Subtle location pill */}
              <motion.div
                className="mt-3 flex items-center gap-1.5 px-3 py-1 rounded-full"
                style={{
                  background: "hsla(0,0%,100%,0.12)",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                  border: "1px solid hsla(0,0%,100%,0.1)",
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={phase >= 2 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-medium text-white/70 tracking-wide">Jeypore, Odisha</span>
              </motion.div>
            </div>

            {/* Bottom — Brand area */}
            <div className="pb-14 flex flex-col items-center px-8">

              {/* Logo image OR typographic animation */}
              {appConfig.logo_url ? (
                <motion.img
                  src={appConfig.logo_url}
                  alt={brandName}
                  className="h-11 object-contain"
                  initial={{ scale: 0, rotate: -15 }}
                  animate={phase >= 3 ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -15 }}
                  transition={{ type: "spring", stiffness: 200, damping: 12 }}
                />
              ) : (
                <div className="flex items-center" style={{ perspective: "800px" }}>
                  {letters.map((letter, i) => (
                    <motion.span
                      key={i}
                      className="text-[46px] text-white inline-block"
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        fontWeight: 900,
                        fontStyle: "italic",
                        textShadow: "0 0 30px hsla(270, 80%, 65%, 0.6), 0 0 60px hsla(270, 80%, 65%, 0.3), 0 4px 40px hsla(0,0%,0%,0.5)",
                        WebkitTextStroke: "0.5px hsla(0,0%,100%,0.15)",
                      }}
                      initial={{ y: 50, opacity: 0, rotateY: -120, scale: 0.3 }}
                      animate={phase >= 3 ? { y: 0, opacity: 1, rotateY: 0, scale: 1 } : { y: 50, opacity: 0, rotateY: -120, scale: 0.3 }}
                      transition={{
                        delay: i * 0.08,
                        type: "spring",
                        stiffness: 300,
                        damping: 16,
                      }}
                    >
                      {letter}
                    </motion.span>
                  ))}

                  {/* Shush emoji */}
                  <motion.span
                    className="text-[34px] ml-1.5 inline-block"
                    initial={{ scale: 0, rotate: -40 }}
                    animate={phase >= 3 ? { scale: [0, 1.5, 1], rotate: [-40, 10, 0] } : { scale: 0 }}
                    transition={{ delay: letters.length * 0.08 + 0.1, duration: 0.5, ease: "easeOut" }}
                  >
                    🤫
                  </motion.span>
                </div>
              )}

              {/* Tagline — typed reveal */}
              <motion.div
                className="overflow-hidden mt-2.5"
                initial={{ width: 0 }}
                animate={phase >= 3 ? { width: "auto" } : { width: 0 }}
                transition={{ delay: 0.5, duration: 0.7, ease: "easeOut" }}
              >
                <p
                  className="text-[10px] tracking-[0.25em] uppercase font-semibold text-white/45 whitespace-nowrap"
                  style={{
                    textShadow: "0 1px 8px hsla(0,0%,0%,0.4)",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {tagline}
                </p>
              </motion.div>

              {/* Accent underline swipe */}
              <motion.div
                className="mt-2.5 rounded-full"
                style={{
                  height: 2,
                  background: "linear-gradient(90deg, transparent, hsla(270,80%,65%,0.8), hsl(var(--primary)), hsla(270,80%,65%,0.8), transparent)",
                }}
                initial={{ width: 0, opacity: 0 }}
                animate={phase >= 3 ? { width: 100, opacity: 1 } : { width: 0, opacity: 0 }}
                transition={{ delay: 0.8, duration: 0.5, ease: "easeOut" }}
              />

              {/* Pulse rings */}
              {phase >= 3 && (
                <>
                  <motion.div
                    className="absolute w-24 h-24 rounded-full border pointer-events-none"
                    style={{ borderColor: "hsla(0,0%,100%,0.08)", bottom: 40 }}
                    initial={{ scale: 0.3, opacity: 0 }}
                    animate={{ scale: [0.3, 2.5], opacity: [0.4, 0] }}
                    transition={{ delay: 1, duration: 1.8, ease: "easeOut" }}
                  />
                  <motion.div
                    className="absolute w-24 h-24 rounded-full border pointer-events-none"
                    style={{ borderColor: "hsla(270,80%,65%,0.06)", bottom: 40 }}
                    initial={{ scale: 0.3, opacity: 0 }}
                    animate={{ scale: [0.3, 3], opacity: [0.3, 0] }}
                    transition={{ delay: 1.4, duration: 1.8, ease: "easeOut" }}
                  />
                </>
              )}
            </div>
          </div>

          {/* ─── Exit transition ─── */}
          {phase >= 4 && (
            <motion.div
              className="absolute inset-0 z-30 pointer-events-none"
              style={{ background: "hsl(var(--background))" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
