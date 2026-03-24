import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useAppConfig } from "@/hooks/use-app-config";

// Time-of-day splash backgrounds — Variant 1 (Classic)
import splashMorning from "@/assets/splash-morning.webp";
import splashAfternoon from "@/assets/splash-afternoon.webp";
import splashEvening from "@/assets/splash-evening.webp";
import splashNight from "@/assets/splash-night.webp";

// Desktop landscape splash backgrounds (16:9)
import splashMorningDesktop from "@/assets/splash-morning-desktop.webp";
import splashAfternoonDesktop from "@/assets/splash-afternoon-desktop.webp";
import splashEveningDesktop from "@/assets/splash-evening-desktop.webp";
import splashNightDesktop from "@/assets/splash-night-desktop.webp";

// Time-of-day splash backgrounds — Variant 2 (Cinematic Glass H)
import splash2Dawn from "@/assets/splash2-dawn-v4.jpg";
import splash2Day from "@/assets/splash2-day-v4.jpg";
import splash2Dusk from "@/assets/splash2-dusk-v4.jpg";
import splash2Night from "@/assets/splash2-night-v4.jpg";

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

const isDesktop = typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches;

function getTimeConfig(variant: string = "1") {
  const hour = new Date().getHours();
  const isDarkTime = hour >= 17 || hour < 5;
  const isV2 = variant === "2";
  if (hour >= 5 && hour < 12) return {
    greeting: "Good Morning",
    emoji: "☀️",
    bg: isV2 ? splash2Dawn : (isDesktop ? splashMorningDesktop : splashMorning),
    overlay: "linear-gradient(180deg, hsla(0,0%,0%,0.35) 0%, hsla(0,0%,0%,0.1) 40%, hsla(0,0%,0%,0.5) 100%)",
    hasFireflies: false,
    hasShootingStars: false,
    hasBirds: true,
    hasClouds: true,
    hasLanterns: false,
    hasTwinkle: false,
    particleColor: "hsla(45, 90%, 70%, 0.5)",
    glowColor: "hsla(40, 100%, 65%, 0.3)",
    isDark: false,
    textColor: "hsla(0,0%,100%,1)",
    textShadow: "0 2px 24px hsla(0,0%,0%,0.7), 0 0 60px hsla(0,0%,0%,0.3)",
    brandGradient: "linear-gradient(180deg, hsla(0,0%,100%,1) 0%, hsla(45,90%,85%,1) 50%, hsla(35,100%,70%,0.95) 100%)",
    brandGlow: "drop-shadow(0 0 25px hsla(35,100%,50%,0.6)) drop-shadow(0 4px 35px hsla(0,0%,0%,0.7))",
    taglineColor: "hsla(0,0%,100%,0.85)",
    taglineGlow: "0 0 16px hsla(35,100%,60%,0.5), 0 2px 8px hsla(0,0%,0%,0.6)",
  };
  if (hour >= 12 && hour < 17) return {
    greeting: "Good Afternoon",
    emoji: "🌤️",
    bg: isV2 ? splash2Day : (isDesktop ? splashAfternoonDesktop : splashAfternoon),
    overlay: "linear-gradient(180deg, hsla(0,0%,0%,0.3) 0%, hsla(0,0%,0%,0.05) 40%, hsla(0,0%,0%,0.45) 100%)",
    hasFireflies: false,
    hasShootingStars: false,
    hasBirds: true,
    hasClouds: true,
    hasLanterns: false,
    hasTwinkle: false,
    particleColor: "hsla(45, 80%, 75%, 0.4)",
    glowColor: "hsla(45, 90%, 60%, 0.25)",
    isDark: false,
    textColor: "hsla(0,0%,100%,1)",
    textShadow: "0 2px 24px hsla(0,0%,0%,0.7), 0 0 60px hsla(0,0%,0%,0.3)",
    brandGradient: "linear-gradient(180deg, hsla(0,0%,100%,1) 0%, hsla(40,95%,80%,1) 50%, hsla(25,100%,65%,0.95) 100%)",
    brandGlow: "drop-shadow(0 0 25px hsla(30,100%,55%,0.5)) drop-shadow(0 4px 35px hsla(0,0%,0%,0.7))",
    taglineColor: "hsla(0,0%,100%,0.85)",
    taglineGlow: "0 0 16px hsla(40,90%,60%,0.5), 0 2px 8px hsla(0,0%,0%,0.6)",
  };
  if (hour >= 17 && hour < 21) return {
    greeting: "Good Evening",
    emoji: "🌅",
    bg: isDesktop ? splashEveningDesktop : splashEvening,
    overlay: "linear-gradient(180deg, hsla(0,0%,0%,0.3) 0%, hsla(0,0%,0%,0.1) 35%, hsla(0,0%,0%,0.5) 100%)",
    hasFireflies: true,
    hasShootingStars: true,
    hasBirds: false,
    hasClouds: false,
    hasLanterns: true,
    hasTwinkle: true,
    particleColor: "hsla(35, 100%, 65%, 0.7)",
    glowColor: "hsla(20, 100%, 55%, 0.3)",
    isDark: true,
    textColor: "hsla(0,0%,100%,1)",
    textShadow: "0 2px 20px hsla(0,0%,0%,0.5), 0 0 40px hsla(270,80%,50%,0.3)",
    brandGradient: "linear-gradient(180deg, hsla(0,0%,100%,1) 0%, hsla(0,0%,100%,0.9) 40%, hsla(270,80%,85%,1) 100%)",
    brandGlow: "drop-shadow(0 0 30px hsla(270,80%,65%,0.7)) drop-shadow(0 4px 40px hsla(0,0%,0%,0.6))",
    taglineColor: "hsla(0,0%,100%,0.8)",
    taglineGlow: "0 0 18px hsla(270,80%,65%,0.5), 0 2px 8px hsla(0,0%,0%,0.5)",
  };
  return {
    greeting: "Good Night",
    emoji: "🌙",
    bg: isDesktop ? splashNightDesktop : splashNight,
    overlay: "linear-gradient(180deg, hsla(0,0%,0%,0.2) 0%, hsla(0,0%,0%,0.05) 40%, hsla(0,0%,0%,0.55) 100%)",
    hasFireflies: true,
    hasShootingStars: true,
    hasBirds: false,
    hasClouds: false,
    hasLanterns: true,
    hasTwinkle: true,
    particleColor: "hsla(55, 90%, 70%, 0.8)",
    glowColor: "hsla(45, 80%, 70%, 0.25)",
    isDark: true,
    textColor: "hsla(0,0%,100%,1)",
    textShadow: "0 2px 20px hsla(0,0%,0%,0.6), 0 0 50px hsla(220,80%,60%,0.3)",
    brandGradient: "linear-gradient(180deg, hsla(0,0%,100%,1) 0%, hsla(220,70%,90%,1) 50%, hsla(270,80%,80%,1) 100%)",
    brandGlow: "drop-shadow(0 0 30px hsla(270,80%,65%,0.7)) drop-shadow(0 4px 40px hsla(0,0%,0%,0.7))",
    taglineColor: "hsla(0,0%,100%,0.85)",
    taglineGlow: "0 0 20px hsla(270,80%,65%,0.6), 0 2px 10px hsla(0,0%,0%,0.5)",
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

/* ── Flying Birds (morning/afternoon) ── */
function FlyingBirds() {
  const birds = useMemo(() => [
    { id: 0, startX: -10, startY: 18, delay: 0.5, dur: 4, scale: 0.7 },
    { id: 1, startX: -15, startY: 22, delay: 0.8, dur: 4.5, scale: 0.5 },
    { id: 2, startX: -8, startY: 15, delay: 1.5, dur: 3.8, scale: 0.6 },
    { id: 3, startX: -20, startY: 25, delay: 2.2, dur: 5, scale: 0.4 },
    { id: 4, startX: -12, startY: 12, delay: 2.8, dur: 4.2, scale: 0.55 },
  ], []);

  return (
    <>
      {birds.map((b) => (
        <motion.div
          key={b.id}
          className="absolute pointer-events-none"
          style={{ left: `${b.startX}%`, top: `${b.startY}%`, transform: `scale(${b.scale})` }}
          initial={{ x: 0, y: 0, opacity: 0 }}
          animate={{ x: [0, 500], y: [0, -30 - b.id * 8, -15, -40 - b.id * 5], opacity: [0, 1, 1, 0.8, 0] }}
          transition={{ delay: b.delay, duration: b.dur, ease: "easeInOut" }}
        >
          <svg width="28" height="12" viewBox="0 0 28 12" fill="none">
            <motion.path
              d="M14 6 C10 2, 5 0, 0 3"
              stroke="hsla(0,0%,15%,0.5)"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
              animate={{ d: ["M14 6 C10 2, 5 0, 0 3", "M14 6 C10 5, 5 6, 0 5", "M14 6 C10 2, 5 0, 0 3"] }}
              transition={{ duration: 0.4, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.path
              d="M14 6 C18 2, 23 0, 28 3"
              stroke="hsla(0,0%,15%,0.5)"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
              animate={{ d: ["M14 6 C18 2, 23 0, 28 3", "M14 6 C18 5, 23 6, 28 5", "M14 6 C18 2, 23 0, 28 3"] }}
              transition={{ duration: 0.4, repeat: Infinity, ease: "easeInOut" }}
            />
          </svg>
        </motion.div>
      ))}
    </>
  );
}

/* ── Drifting Clouds (morning/afternoon) ── */
function DriftingClouds() {
  const clouds = useMemo(() => [
    { id: 0, y: 8, w: 120, h: 35, delay: 0, dur: 12, opacity: 0.15 },
    { id: 1, y: 16, w: 90, h: 28, delay: 2, dur: 15, opacity: 0.1 },
    { id: 2, y: 5, w: 140, h: 40, delay: 4, dur: 18, opacity: 0.08 },
  ], []);

  return (
    <>
      {clouds.map((c) => (
        <motion.div
          key={c.id}
          className="absolute pointer-events-none"
          style={{
            top: `${c.y}%`,
            width: c.w,
            height: c.h,
            borderRadius: "50%",
            background: `hsla(0,0%,100%,${c.opacity})`,
            filter: "blur(18px)",
          }}
          initial={{ x: -c.w, opacity: 0 }}
          animate={{ x: [-c.w, 500], opacity: [0, c.opacity, c.opacity, 0] }}
          transition={{ delay: c.delay, duration: c.dur, ease: "linear", repeat: Infinity }}
        />
      ))}
    </>
  );
}

/* ── Floating Lanterns (evening/night) ── */
function FloatingLanterns() {
  const lanterns = useMemo(() => [
    { id: 0, x: 25, startY: 78, delay: 0.5, dur: 4, size: 5 },
    { id: 1, x: 50, startY: 75, delay: 1.2, dur: 4.5, size: 4 },
    { id: 2, x: 70, startY: 80, delay: 2, dur: 3.5, size: 6 },
    { id: 3, x: 40, startY: 76, delay: 2.8, dur: 4, size: 4 },
    { id: 4, x: 82, startY: 82, delay: 3.5, dur: 5, size: 5 },
  ], []);

  return (
    <>
      {lanterns.map((l) => (
        <motion.div
          key={l.id}
          className="absolute pointer-events-none"
          style={{ left: `${l.x}%`, top: `${l.startY}%` }}
          initial={{ y: 0, opacity: 0, scale: 0.5 }}
          animate={{
            y: [0, -30, -60, -90],
            x: [0, (l.id % 2 === 0 ? 8 : -8), (l.id % 2 === 0 ? 4 : -4), 0],
            opacity: [0, 0.7, 0.5, 0],
            scale: [0.5, 1, 0.8, 0.4],
          }}
          transition={{ delay: l.delay, duration: l.dur, ease: "easeOut" }}
        >
          <div style={{
            width: l.size * 0.6,
            height: l.size * 0.8,
            borderRadius: "50%",
            background: "radial-gradient(circle, hsla(45, 100%, 85%, 0.7) 0%, hsla(35, 100%, 60%, 0.3) 50%, transparent 100%)",
            boxShadow: `0 0 ${l.size}px ${l.size * 0.4}px hsla(35, 100%, 60%, 0.15)`,
          }} />
        </motion.div>
      ))}
    </>
  );
}

/* ── Twinkling Stars (evening/night) ── */
function TwinklingStars() {
  const stars = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: `${5 + (i * 17 + 7) % 90}%`,
      y: `${3 + (i * 13 + 3) % 35}%`,
      size: 1 + (i % 3) * 0.5,
      dur: 1.5 + (i % 5) * 0.6,
      del: (i * 0.3) % 3,
    })),
  []);

  return (
    <>
      {stars.map((s) => (
        <motion.div
          key={s.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: s.size,
            height: s.size,
            left: s.x,
            top: s.y,
            background: "white",
            boxShadow: `0 0 ${s.size * 2}px ${s.size}px hsla(0,0%,100%,0.5)`,
          }}
          animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.3, 0.8] }}
          transition={{ duration: s.dur, repeat: Infinity, delay: s.del, ease: "easeInOut" }}
        />
      ))}
    </>
  );
}

/* ── Sun Rays (morning) — subtle, no flash ── */
function SunRays() {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        top: "8%",
        right: "-10%",
        width: 200,
        height: 200,
        background: "radial-gradient(ellipse, hsla(45, 80%, 75%, 0.06) 0%, transparent 70%)",
        borderRadius: "50%",
        filter: "blur(12px)",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.6 }}
      transition={{ duration: 2, ease: "easeOut" }}
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

  // Preload category icons + homepage videos during splash
  useEffect(() => {
    preloadIcons.forEach((src) => { const img = new Image(); img.src = src; });
    // Preload homepage videos during splash idle time
    import("@/lib/video-preloader").then(({ preloadVideos }) => preloadVideos());
  }, []);

  // Ambient sound removed

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
              <ShootingStar delay={3.6} />
            </>
          )}

          {/* ─── Layer 4b: Sun rays (morning) ─── */}
          {config.hasBirds && phase >= 1 && <SunRays />}

          {/* ─── Layer 4c: Flying birds (morning/afternoon) ─── */}
          {config.hasBirds && phase >= 1 && <FlyingBirds />}

          {/* ─── Layer 4d: Drifting clouds (morning/afternoon) ─── */}
          {config.hasClouds && phase >= 1 && <DriftingClouds />}

          {/* ─── Layer 4e: Floating lanterns (evening/night) ─── */}
          {config.hasLanterns && phase >= 1 && <FloatingLanterns />}

          {/* ─── Layer 4f: Twinkling stars (evening/night) ─── */}
          {config.hasTwinkle && phase >= 1 && <TwinklingStars />}
          <div className="absolute inset-0 flex flex-col z-10">

            {/* Top — Greeting area */}
            <div className="flex-1 flex flex-col justify-center items-center px-8 pt-16 md:pt-24 lg:pt-32">
              {/* Date */}
              <motion.p
                className="text-[11px] md:text-sm lg:text-base font-semibold tracking-[0.2em] uppercase"
                style={{ color: config.textColor, opacity: 0.6, textShadow: config.textShadow }}
                initial={{ opacity: 0, y: -15 }}
                animate={phase >= 2 ? { opacity: 0.6, y: 0 } : { opacity: 0, y: -15 }}
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
                className="text-[32px] md:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-center mt-2 md:mt-4 leading-tight"
                style={{
                  color: config.textColor,
                  textShadow: config.textShadow,
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
                <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] md:text-xs lg:text-sm font-medium tracking-wide" style={{ color: config.taglineColor }}> Jeypore, Odisha</span>
              </motion.div>
            </div>

            {/* Bottom — Brand area */}
            <div className="pb-14 md:pb-24 lg:pb-32 flex flex-col items-center px-8 relative">

              {/* Background glow behind brand */}
              {phase >= 3 && (
                <motion.div
                  className="absolute pointer-events-none"
                  style={{
                    width: 280,
                    height: 120,
                    bottom: 20,
                    borderRadius: "50%",
                    background: "radial-gradient(ellipse, hsla(270,80%,65%,0.25) 0%, hsla(320,70%,55%,0.12) 40%, transparent 70%)",
                    filter: "blur(30px)",
                  }}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: [0, 1, 0.7, 1], scale: 1 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              )}

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
                <div className="relative flex flex-col items-center">
                  {/* Main brand name — 3D glossy style */}
                  <div className="flex items-center relative" style={{ perspective: "1200px" }}>
                    {letters.map((letter, i) => (
                      <motion.span
                        key={i}
                        className="inline-block relative text-[58px] md:text-[84px] lg:text-[104px] xl:text-[124px]"
                        style={{
                          lineHeight: 1,
                          fontFamily: "'Space Grotesk', sans-serif",
                          fontWeight: 900,
                          fontStyle: "normal",
                          textTransform: "uppercase",
                          color: "hsla(220,60%,92%,1)",
                          backgroundImage: "linear-gradient(180deg, hsla(200,100%,95%,1) 0%, hsla(220,80%,85%,1) 25%, hsla(240,70%,75%,1) 50%, hsla(220,80%,65%,1) 75%, hsla(200,90%,80%,1) 100%)",
                          WebkitBackgroundClip: "text",
                          backgroundClip: "text",
                          WebkitTextStroke: "2.5px hsla(230,60%,18%,0.95)",
                          paintOrder: "stroke fill",
                          filter: "drop-shadow(0 2px 0 hsla(230,60%,15%,0.9)) drop-shadow(0 4px 0 hsla(230,50%,12%,0.8)) drop-shadow(0 6px 0 hsla(230,40%,10%,0.6)) drop-shadow(0 8px 16px hsla(230,60%,10%,0.5)) drop-shadow(0 0 30px hsla(220,80%,60%,0.4))",
                          letterSpacing: "-0.02em",
                        }}
                        initial={{ y: 80, opacity: 0, rotateX: 90, scale: 0.2 }}
                        animate={phase >= 3 ? { y: 0, opacity: 1, rotateX: 0, scale: 1 } : { y: 80, opacity: 0, rotateX: 90, scale: 0.2 }}
                        transition={{
                          delay: i * 0.08,
                          type: "spring",
                          stiffness: 280,
                          damping: 16,
                        }}
                      >
                        {letter}
                        {/* Glossy highlight overlay */}
                        <span
                          className="absolute inset-0 pointer-events-none"
                          style={{
                            backgroundImage: "linear-gradient(180deg, hsla(0,0%,100%,0.5) 0%, hsla(0,0%,100%,0.15) 35%, transparent 55%, hsla(220,80%,90%,0.1) 100%)",
                            WebkitBackgroundClip: "text",
                            backgroundClip: "text",
                            color: "transparent",
                            fontFamily: "inherit",
                            fontWeight: "inherit",
                            fontSize: "inherit",
                            lineHeight: "inherit",
                            textTransform: "inherit",
                            WebkitTextStroke: "0px transparent",
                          }}
                          aria-hidden="true"
                        >
                          {letter}
                        </span>
                      </motion.span>
                    ))}

                    {/* Shush emoji with bounce */}
                    <motion.span
                      className="text-[38px] md:text-[54px] lg:text-[68px] xl:text-[80px] ml-1 md:ml-3 inline-block"
                      style={{
                        filter: "drop-shadow(0 4px 8px hsla(230,60%,10%,0.5)) drop-shadow(0 0 20px hsla(220,80%,60%,0.3))",
                      }}
                      initial={{ scale: 0, rotate: -60, y: 20 }}
                      animate={phase >= 3 ? { scale: [0, 1.6, 0.9, 1.15, 1], rotate: [-60, 15, -5, 0], y: [20, -8, 2, 0] } : { scale: 0 }}
                      transition={{ delay: letters.length * 0.08 + 0.12, duration: 0.7, ease: "easeOut" }}
                    >
                      🤫
                    </motion.span>

                    {/* Sparkle accents — brighter, more dramatic */}
                    {phase >= 3 && [
                      { x: -16, y: -12, delay: 0.5, size: 8 },
                      { x: "calc(100% + 10px)", y: 0, delay: 0.7, size: 7 },
                      { x: "25%", y: -18, delay: 0.9, size: 5 },
                      { x: "65%", y: -10, delay: 1.1, size: 6 },
                    ].map((spark, si) => (
                      <motion.div
                        key={si}
                        className="absolute pointer-events-none"
                        style={{ left: spark.x, top: spark.y }}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: [0, 1.8, 0], opacity: [0, 1, 0], rotate: [0, 180] }}
                        transition={{ delay: spark.delay, duration: 0.9, ease: "easeOut" }}
                      >
                        <svg width={spark.size * 2} height={spark.size * 2} viewBox="0 0 12 12" fill="none">
                          <path d="M6 0 L7 4.5 L12 6 L7 7.5 L6 12 L5 7.5 L0 6 L5 4.5 Z" fill="hsla(210,100%,95%,0.95)" />
                        </svg>
                      </motion.div>
                    ))}
                  </div>



                </div>
              )}

              {/* Decorative divider */}
              <motion.div
                className="flex items-center gap-3 md:gap-5 mt-4 md:mt-6"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={phase >= 3 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
                transition={{ delay: 0.5, duration: 0.4, ease: "easeOut" }}
              >
                <motion.div
                  style={{ height: 1, background: "linear-gradient(90deg, transparent, hsla(0,0%,100%,0.4))" }}
                  initial={{ width: 0 }}
                  animate={phase >= 3 ? { width: 40 } : { width: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                />
                <motion.span
                  className="text-[8px]"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={phase >= 3 ? { opacity: 0.5, scale: 1 } : { opacity: 0, scale: 0 }}
                  transition={{ delay: 0.7, type: "spring", stiffness: 300 }}
                >
                  ✦
                </motion.span>
                <motion.div
                  style={{ height: 1, background: "linear-gradient(90deg, hsla(0,0%,100%,0.4), transparent)" }}
                  initial={{ width: 0 }}
                  animate={phase >= 3 ? { width: 40 } : { width: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                />
              </motion.div>

              {/* Tagline — character-by-character reveal with stagger */}
              <div className="mt-2 md:mt-4 flex items-center justify-center gap-[1.5px] md:gap-[2.5px] overflow-hidden">
                {tagline.split("").map((char, i) => (
                  <motion.span
                    key={i}
                    className="inline-block text-[11px] md:text-sm lg:text-base"
                    style={{
                      letterSpacing: "0.22em",
                      textTransform: "uppercase",
                      fontWeight: 600,
                      color: config.taglineColor,
                      fontFamily: "'Space Grotesk', sans-serif",
                      textShadow: config.taglineGlow,
                    }}
                    initial={{ y: 20, opacity: 0, filter: "blur(4px)" }}
                    animate={phase >= 3 ? { y: 0, opacity: 1, filter: "blur(0px)" } : { y: 20, opacity: 0 }}
                    transition={{
                      delay: 0.6 + i * 0.025,
                      type: "spring",
                      stiffness: 200,
                      damping: 18,
                    }}
                  >
                    {char === " " ? "\u00A0" : char}
                  </motion.span>
                ))}
              </div>




              {/* Pulse rings — more dramatic */}
              {phase >= 3 && (
                <>
                  <motion.div
                    className="absolute w-32 h-32 rounded-full pointer-events-none"
                    style={{
                      bottom: 30,
                      border: "1px solid hsla(270,80%,65%,0.15)",
                      boxShadow: "0 0 20px 2px hsla(270,80%,65%,0.08)",
                    }}
                    initial={{ scale: 0.2, opacity: 0 }}
                    animate={{ scale: [0.2, 3], opacity: [0.6, 0] }}
                    transition={{ delay: 0.8, duration: 2, ease: "easeOut" }}
                  />
                  <motion.div
                    className="absolute w-32 h-32 rounded-full pointer-events-none"
                    style={{
                      bottom: 30,
                      border: "1px solid hsla(320,70%,60%,0.1)",
                    }}
                    initial={{ scale: 0.2, opacity: 0 }}
                    animate={{ scale: [0.2, 3.5], opacity: [0.4, 0] }}
                    transition={{ delay: 1.2, duration: 2, ease: "easeOut" }}
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
