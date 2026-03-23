import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useMemo } from "react";
import { useAppConfig } from "@/hooks/use-app-config";

// Preload 3D category icons so they're cached before home screen renders
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

type TimeOfDay = "morning" | "afternoon" | "evening" | "night";

interface TimeTheme {
  period: TimeOfDay;
  greeting: string;
  skyGradient: string;
  groundColor: string;
  sunMoonColor: string;
  sunMoonGlow: string;
  cloudColor: string;
  accentColor: string;
  textColor: string;
  hasSunRays: boolean;
  hasStars: boolean;
  hasFireflies: boolean;
  birdColor: string;
}

function getTimeTheme(): TimeTheme {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return {
    period: "morning",
    greeting: "Good Morning",
    skyGradient: "linear-gradient(180deg, hsl(210, 70%, 55%) 0%, hsl(200, 60%, 70%) 40%, hsl(40, 90%, 85%) 75%, hsl(35, 95%, 75%) 100%)",
    groundColor: "hsl(120, 25%, 35%)",
    sunMoonColor: "hsl(45, 100%, 65%)",
    sunMoonGlow: "hsl(45, 100%, 70%)",
    cloudColor: "hsla(0, 0%, 100%, 0.9)",
    accentColor: "hsl(35, 90%, 60%)",
    textColor: "hsl(210, 30%, 15%)",
    hasSunRays: true,
    hasStars: false,
    hasFireflies: false,
    birdColor: "hsl(210, 20%, 25%)",
  };
  if (hour >= 12 && hour < 17) return {
    period: "afternoon",
    greeting: "Good Afternoon",
    skyGradient: "linear-gradient(180deg, hsl(200, 80%, 50%) 0%, hsl(195, 70%, 60%) 50%, hsl(45, 80%, 80%) 100%)",
    groundColor: "hsl(80, 30%, 40%)",
    sunMoonColor: "hsl(50, 100%, 60%)",
    sunMoonGlow: "hsl(50, 100%, 70%)",
    cloudColor: "hsla(0, 0%, 100%, 0.85)",
    accentColor: "hsl(45, 85%, 55%)",
    textColor: "hsl(200, 25%, 15%)",
    hasSunRays: true,
    hasStars: false,
    hasFireflies: false,
    birdColor: "hsl(200, 15%, 20%)",
  };
  if (hour >= 17 && hour < 21) return {
    period: "evening",
    greeting: "Good Evening",
    skyGradient: "linear-gradient(180deg, hsl(250, 40%, 25%) 0%, hsl(280, 50%, 35%) 30%, hsl(15, 80%, 50%) 65%, hsl(35, 90%, 60%) 100%)",
    groundColor: "hsl(200, 20%, 18%)",
    sunMoonColor: "hsl(20, 100%, 55%)",
    sunMoonGlow: "hsl(20, 100%, 60%)",
    cloudColor: "hsla(280, 30%, 60%, 0.5)",
    accentColor: "hsl(20, 90%, 55%)",
    textColor: "hsl(0, 0%, 95%)",
    hasSunRays: true,
    hasStars: true,
    hasFireflies: true,
    birdColor: "hsl(250, 10%, 15%)",
  };
  return {
    period: "night",
    greeting: "Good Night",
    skyGradient: "linear-gradient(180deg, hsl(230, 50%, 8%) 0%, hsl(240, 40%, 15%) 40%, hsl(250, 35%, 22%) 100%)",
    groundColor: "hsl(220, 20%, 10%)",
    sunMoonColor: "hsl(50, 30%, 85%)",
    sunMoonGlow: "hsl(50, 40%, 90%)",
    cloudColor: "hsla(240, 20%, 40%, 0.3)",
    accentColor: "hsl(50, 50%, 80%)",
    textColor: "hsl(0, 0%, 95%)",
    hasSunRays: false,
    hasStars: true,
    hasFireflies: true,
    birdColor: "hsl(240, 10%, 20%)",
  };
}

/* ── Animated SVG Bird ── */
function Bird({ delay, x, y, scale, color }: { delay: number; x: number; y: number; scale: number; color: string }) {
  return (
    <motion.svg
      width={24 * scale} height={12 * scale}
      viewBox="0 0 24 12"
      className="absolute"
      style={{ left: x, top: y }}
      initial={{ x: -60, opacity: 0 }}
      animate={{ x: [0, 80, 180], y: [0, -8, 2], opacity: [0, 1, 1, 0] }}
      transition={{ delay, duration: 3.5, ease: "easeInOut" }}
    >
      <motion.path
        d="M0 6 Q6 0 12 6 Q18 0 24 6"
        stroke={color}
        strokeWidth={1.5}
        fill="none"
        strokeLinecap="round"
        animate={{ d: ["M0 6 Q6 0 12 6 Q18 0 24 6", "M0 6 Q6 4 12 6 Q18 4 24 6", "M0 6 Q6 0 12 6 Q18 0 24 6"] }}
        transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.svg>
  );
}

/* ── Floating Cloud ── */
function Cloud({ delay, y, size, color, direction }: { delay: number; y: number; size: number; color: string; direction: 1 | -1 }) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size * 0.4,
        background: color,
        filter: `blur(${size * 0.06}px)`,
        top: y,
      }}
      initial={{ x: direction === 1 ? -size * 1.5 : 500 }}
      animate={{ x: direction === 1 ? 500 : -size * 1.5 }}
      transition={{ delay, duration: 8 + size * 0.02, ease: "linear", repeat: Infinity }}
    />
  );
}

/* ── Sun Rays ── */
function SunRays({ color }: { color: string }) {
  return (
    <motion.div
      className="absolute"
      style={{ width: 300, height: 300, top: "10%", right: "-5%" }}
      initial={{ opacity: 0, scale: 0.5, rotate: 0 }}
      animate={{ opacity: [0, 0.4, 0.25], scale: 1, rotate: 45 }}
      transition={{ delay: 0.8, duration: 2.5, ease: "easeOut" }}
    >
      {[0, 30, 60, 90, 120, 150].map((angle) => (
        <motion.div
          key={angle}
          className="absolute left-1/2 top-1/2"
          style={{
            width: 3,
            height: 140,
            background: `linear-gradient(180deg, ${color}, transparent)`,
            transformOrigin: "top center",
            transform: `rotate(${angle}deg)`,
            borderRadius: 2,
          }}
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, delay: angle * 0.01 }}
        />
      ))}
    </motion.div>
  );
}

/* ── Stars (for evening/night) ── */
function Stars() {
  const stars = useMemo(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: `${5 + (i * 31 + 7) % 90}%`,
      y: `${3 + (i * 17 + 11) % 40}%`,
      size: 1 + (i % 3),
      delay: (i * 0.13) % 2,
    })),
  []);
  return (
    <>
      {stars.map((s) => (
        <motion.div
          key={s.id}
          className="absolute rounded-full"
          style={{
            width: s.size,
            height: s.size,
            left: s.x,
            top: s.y,
            background: "hsl(0, 0%, 95%)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0.4, 1] }}
          transition={{ delay: 0.3 + s.delay, duration: 2.5, repeat: Infinity }}
        />
      ))}
    </>
  );
}

/* ── Fireflies ── */
function Fireflies() {
  const flies = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: `${15 + (i * 23) % 70}%`,
      y: `${50 + (i * 13) % 35}%`,
      size: 2 + (i % 3),
    })),
  []);
  return (
    <>
      {flies.map((f) => (
        <motion.div
          key={f.id}
          className="absolute rounded-full"
          style={{
            width: f.size,
            height: f.size,
            left: f.x,
            top: f.y,
            background: "hsl(55, 90%, 70%)",
            boxShadow: "0 0 6px 2px hsla(55, 90%, 70%, 0.6)",
          }}
          animate={{
            y: [0, -15, 5, -10, 0],
            x: [0, 8, -5, 10, 0],
            opacity: [0, 0.9, 0.3, 1, 0],
          }}
          transition={{ duration: 3 + f.id * 0.3, repeat: Infinity, delay: f.id * 0.25 }}
        />
      ))}
    </>
  );
}

/* ── Rolling Hills / Ground ── */
function Ground({ color }: { color: string }) {
  return (
    <motion.div
      className="absolute bottom-0 left-0 right-0"
      style={{ height: "22%" }}
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3, duration: 1, ease: "easeOut" }}
    >
      <svg viewBox="0 0 400 100" preserveAspectRatio="none" className="w-full h-full">
        <path
          d="M0 40 Q50 10 100 35 Q150 55 200 30 Q260 5 320 25 Q370 40 400 20 L400 100 L0 100Z"
          fill={color}
        />
        <path
          d="M0 55 Q80 30 160 50 Q240 65 320 42 Q380 30 400 45 L400 100 L0 100Z"
          fill={color}
          opacity={0.7}
        />
      </svg>
      {/* Tiny trees */}
      <div className="absolute bottom-[25%] left-[15%]">
        <motion.div
          style={{ width: 3, height: 20, background: "hsl(120, 20%, 20%)", borderRadius: 1 }}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
        />
        <motion.div
          className="absolute rounded-full"
          style={{ width: 14, height: 14, background: "hsl(140, 35%, 30%)", top: -10, left: -5.5 }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1.4, type: "spring", stiffness: 300 }}
        />
      </div>
      <div className="absolute bottom-[30%] left-[65%]">
        <motion.div
          style={{ width: 3, height: 16, background: "hsl(120, 20%, 20%)", borderRadius: 1 }}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
        />
        <motion.div
          className="absolute rounded-full"
          style={{ width: 12, height: 12, background: "hsl(130, 30%, 35%)", top: -8, left: -4.5 }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1.7, type: "spring", stiffness: 300 }}
        />
      </div>
    </motion.div>
  );
}

/* ── Sun / Moon Celestial Body ── */
function CelestialBody({ theme }: { theme: TimeTheme }) {
  const isMoon = theme.period === "night";
  const size = isMoon ? 50 : 70;
  const topPos = theme.period === "morning" ? "18%" : theme.period === "afternoon" ? "12%" : theme.period === "evening" ? "25%" : "15%";
  return (
    <motion.div
      className="absolute"
      style={{ right: "18%", top: topPos }}
      initial={{ y: 80, opacity: 0, scale: 0.3 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ delay: 0.5, duration: 1.5, type: "spring", stiffness: 80 }}
    >
      {/* Glow */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: size * 2.5,
          height: size * 2.5,
          top: -(size * 0.75),
          left: -(size * 0.75),
          background: `radial-gradient(circle, ${theme.sunMoonGlow}33 0%, transparent 70%)`,
        }}
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Body */}
      <div
        className="rounded-full relative"
        style={{
          width: size,
          height: size,
          background: theme.sunMoonColor,
          boxShadow: `0 0 40px 10px ${theme.sunMoonGlow}66`,
        }}
      >
        {isMoon && (
          <>
            <div className="absolute rounded-full" style={{ width: 8, height: 8, background: "hsla(0,0%,70%,0.3)", top: "20%", left: "30%" }} />
            <div className="absolute rounded-full" style={{ width: 5, height: 5, background: "hsla(0,0%,70%,0.2)", top: "55%", left: "55%" }} />
            <div className="absolute rounded-full" style={{ width: 12, height: 12, background: "hsla(0,0%,70%,0.15)", top: "35%", left: "60%" }} />
          </>
        )}
      </div>
    </motion.div>
  );
}

/* ── Typographic Logo Animation ── */
function AnimatedLogo({ brandName, tagline, textColor, accentColor, logoUrl }: {
  brandName: string; tagline: string; textColor: string; accentColor: string; logoUrl?: string;
}) {
  const letters = brandName.split("");
  return (
    <motion.div
      className="flex flex-col items-center gap-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.8 }}
    >
      {logoUrl ? (
        <motion.img
          src={logoUrl}
          alt={brandName}
          className="h-12 object-contain"
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 1.8, type: "spring", stiffness: 200, damping: 12 }}
        />
      ) : (
        <div className="flex items-center gap-0.5">
          {letters.map((letter, i) => (
            <motion.span
              key={`l-${i}`}
              className="text-4xl font-black tracking-tight"
              style={{
                color: textColor,
                textShadow: `0 2px 15px ${accentColor}44`,
                display: "inline-block",
              }}
              initial={{ y: 30, opacity: 0, rotateX: -90 }}
              animate={{ y: 0, opacity: 1, rotateX: 0 }}
              transition={{
                delay: 1.8 + i * 0.08,
                type: "spring",
                stiffness: 300,
                damping: 15,
              }}
            >
              {letter}
            </motion.span>
          ))}
        </div>
      )}

      {/* Shush emoji with bounce */}
      <motion.span
        className="text-3xl"
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: [0, 1.3, 1], rotate: [-30, 10, 0] }}
        transition={{ delay: 2.4, duration: 0.6, ease: "easeOut" }}
      >
        🤫
      </motion.span>

      {/* Tagline reveal */}
      <motion.div className="overflow-hidden">
        <motion.p
          className="text-xs tracking-[0.25em] uppercase font-medium"
          style={{ color: `${textColor}99` }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 2.6, duration: 0.6 }}
        >
          {tagline}
        </motion.p>
      </motion.div>

      {/* Underline swipe */}
      <motion.div
        style={{ height: 2, background: accentColor, borderRadius: 1 }}
        initial={{ width: 0 }}
        animate={{ width: 80 }}
        transition={{ delay: 2.8, duration: 0.5, ease: "easeOut" }}
      />
    </motion.div>
  );
}

/* ═══════════════ MAIN SPLASH ═══════════════ */
export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [show, setShow] = useState(true);
  const [phase, setPhase] = useState(0); // 0=sky, 1=scene, 2=brand, 3=exit
  const theme = useMemo(getTimeTheme, []);
  const appConfig = useAppConfig();
  const brandName = appConfig.app_name || "hushh";
  const tagline = appConfig.app_tagline || "Private experiences await";

  // Preload icons
  useEffect(() => {
    preloadIcons.forEach((src) => { const img = new Image(); img.src = src; });
  }, []);

  // Phase progression
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 400);   // scene builds
    const t2 = setTimeout(() => setPhase(2), 1200);   // brand appears
    const t3 = setTimeout(() => setPhase(3), 3200);   // start exit
    const t4 = setTimeout(() => { setShow(false); setTimeout(onComplete, 500); }, 3800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [onComplete]);

  const userName = ""; // Could be fetched from profile
  const greetingText = userName ? `${theme.greeting}, ${userName}` : theme.greeting;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 overflow-hidden"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* ─── PHASE 0: Sky gradient fills in ─── */}
          <motion.div
            className="absolute inset-0"
            style={{ background: theme.skyGradient }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          />

          {/* Stars (evening/night) */}
          {theme.hasStars && <Stars />}

          {/* Sun Rays */}
          {theme.hasSunRays && <SunRays color={theme.sunMoonGlow} />}

          {/* Celestial body */}
          <CelestialBody theme={theme} />

          {/* Clouds — different layers */}
          <Cloud delay={0.5} y={80} size={120} color={theme.cloudColor} direction={1} />
          <Cloud delay={1.2} y={140} size={90} color={theme.cloudColor} direction={-1} />
          <Cloud delay={2} y={60} size={70} color={theme.cloudColor} direction={1} />

          {/* Birds flock */}
          {phase >= 1 && (
            <>
              <Bird delay={0.8} x={30} y={120} scale={1} color={theme.birdColor} />
              <Bird delay={1.0} x={50} y={135} scale={0.8} color={theme.birdColor} />
              <Bird delay={1.2} x={20} y={145} scale={0.6} color={theme.birdColor} />
              <Bird delay={1.5} x={70} y={110} scale={0.7} color={theme.birdColor} />
              <Bird delay={1.8} x={40} y={160} scale={0.5} color={theme.birdColor} />
            </>
          )}

          {/* Ground / Hills */}
          <Ground color={theme.groundColor} />

          {/* Fireflies (evening/night) */}
          {theme.hasFireflies && phase >= 1 && <Fireflies />}

          {/* ─── PHASE 1: Greeting text ─── */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-8">
            {/* Greeting */}
            <motion.div
              className="mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={phase >= 1 ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, type: "spring", stiffness: 120 }}
            >
              <motion.p
                className="text-sm font-medium tracking-widest uppercase text-center"
                style={{ color: `${theme.textColor}88` }}
                initial={{ opacity: 0 }}
                animate={phase >= 1 ? { opacity: 1 } : {}}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </motion.p>
              <motion.h1
                className="text-3xl font-bold text-center mt-2"
                style={{ color: theme.textColor }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={phase >= 1 ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.3, type: "spring", stiffness: 150 }}
              >
                {greetingText} ✨
              </motion.h1>
            </motion.div>

            {/* ─── PHASE 2: Brand Logo ─── */}
            {phase >= 2 && (
              <motion.div className="mt-6">
                <AnimatedLogo
                  brandName={brandName}
                  tagline={tagline}
                  textColor={theme.textColor}
                  accentColor={theme.accentColor}
                  logoUrl={appConfig.logo_url || undefined}
                />
              </motion.div>
            )}
          </div>

          {/* ─── PHASE 3: Exit swoosh ─── */}
          {phase >= 3 && (
            <motion.div
              className="absolute inset-0 z-20"
              style={{ background: theme.skyGradient }}
              initial={{ clipPath: "circle(0% at 50% 50%)" }}
              animate={{ clipPath: "circle(150% at 50% 50%)" }}
              transition={{ duration: 0.6, ease: "easeIn" }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
