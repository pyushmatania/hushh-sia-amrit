import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import splashEvening from "@/assets/splash-jeypore-evening.jpg";
import splashDay from "@/assets/splash-jeypore-day.jpg";

function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return { greeting: "Good Morning", emoji: "☀️", bg: splashDay };
  if (hour >= 12 && hour < 17) return { greeting: "Good Afternoon", emoji: "🌤️", bg: splashDay };
  if (hour >= 17 && hour < 21) return { greeting: "Good Evening", emoji: "🌅", bg: splashEvening };
  return { greeting: "Good Night", emoji: "🌙", bg: splashEvening };
}

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [show, setShow] = useState(true);
  const { greeting, emoji, bg } = getTimeGreeting();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onComplete, 600);
    }, 3400);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col overflow-hidden"
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.6 }}
        >
          {/* Full-bleed scenic background */}
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 4, ease: "easeOut" }}
          >
            <img
              src={bg}
              alt="Jeypore"
              className="w-full h-full object-cover"
            />
            {/* Top gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/60" />
          </motion.div>

          {/* Floating firefly particles */}
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: Math.random() * 4 + 2,
                height: Math.random() * 4 + 2,
                background: i % 2 === 0
                  ? "hsla(55, 90%, 70%, 0.8)"
                  : "hsla(270, 80%, 75%, 0.6)",
                left: `${10 + Math.random() * 80}%`,
                top: `${20 + Math.random() * 60}%`,
              }}
              animate={{
                y: [0, -(20 + Math.random() * 40), 0],
                x: [0, (Math.random() - 0.5) * 30, 0],
                opacity: [0, 0.9, 0.4, 0.8, 0],
                scale: [0.5, 1, 0.7, 1.1, 0.5],
              }}
              transition={{
                duration: 3 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 3,
                ease: "easeInOut",
              }}
            />
          ))}

          {/* Top content - Greeting */}
          <div className="relative z-10 flex-1 flex flex-col">
            <div className="px-6 pt-14">
              <motion.p
                className="text-sm font-medium text-white/60 tracking-wider uppercase"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </motion.p>
              <motion.h1
                className="text-4xl font-bold text-white mt-2 tracking-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
              >
                {greeting} {emoji}
              </motion.h1>

              {/* Activity card — glass overlay */}
              <motion.div
                className="mt-5 rounded-2xl overflow-hidden"
                style={{
                  background: "hsla(0, 0%, 100%, 0.12)",
                  backdropFilter: "blur(16px) saturate(1.4)",
                  WebkitBackdropFilter: "blur(16px) saturate(1.4)",
                  border: "1px solid hsla(0, 0%, 100%, 0.15)",
                }}
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.9, type: "spring", stiffness: 120 }}
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      <span className="text-xs font-semibold text-primary">
                        Available today
                      </span>
                    </div>
                    <span className="text-xs text-white/50">Jeypore, Odisha</span>
                  </div>
                  <p className="text-sm font-medium text-white/90">
                    Pool villas, bonfires & stargazing experiences
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Bottom branding area */}
            <div className="mt-auto px-6 pb-12">
              <motion.div
                className="flex flex-col items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4 }}
              >
                {/* Logo */}
                <div className="flex items-center gap-1">
                  <motion.span
                    className="text-3xl font-bold text-white tracking-tight"
                    style={{
                      textShadow: "0 2px 20px hsla(270, 80%, 65%, 0.5)",
                    }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.6, type: "spring", stiffness: 150 }}
                  >
                    hushh
                  </motion.span>
                  <motion.span
                    className="text-2xl"
                    initial={{ opacity: 0, rotate: -20 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    transition={{ delay: 1.8 }}
                  >
                    🤫
                  </motion.span>
                </div>
                <motion.p
                  className="text-xs text-white/40 tracking-[0.2em] uppercase mt-1.5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2.0 }}
                >
                  Private experiences await
                </motion.p>

                {/* Pulse ring around logo */}
                <motion.div
                  className="absolute bottom-16 w-32 h-32 rounded-full border border-white/10"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: [0.5, 2], opacity: [0.3, 0] }}
                  transition={{ delay: 2.2, duration: 2, ease: "easeOut" }}
                />
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
