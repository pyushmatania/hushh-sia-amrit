import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const letters = ["H", "U", "S", "H", "H"];

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onComplete, 500);
    }, 2800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-mesh overflow-hidden"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Animated gradient orbs */}
          <motion.div
            className="absolute w-64 h-64 rounded-full"
            style={{ background: "radial-gradient(circle, hsla(270,80%,65%,0.3), transparent 70%)" }}
            animate={{
              x: [0, 30, -20, 0],
              y: [0, -40, 20, 0],
              scale: [1, 1.2, 0.9, 1],
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute w-48 h-48 rounded-full"
            style={{ background: "radial-gradient(circle, hsla(320,70%,55%,0.2), transparent 70%)" }}
            animate={{
              x: [0, -30, 20, 0],
              y: [0, 30, -30, 0],
              scale: [1, 0.8, 1.3, 1],
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />

          {/* Floating particles */}
          {Array.from({ length: 25 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-[2px] h-[2px] rounded-full bg-primary/40"
              initial={{
                x: Math.random() * 400 - 200,
                y: Math.random() * 400 - 200,
                opacity: 0,
              }}
              animate={{
                y: [null, Math.random() * -150 - 50],
                opacity: [0, 0.8, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}

          {/* Logo */}
          <div className="flex items-center gap-1.5 relative z-10">
            {letters.map((letter, i) => (
              <motion.span
                key={i}
                className="text-5xl font-display font-bold tracking-tight"
                initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{
                  delay: i * 0.12 + 0.3,
                  type: "spring",
                  stiffness: 200,
                  damping: 20,
                }}
              >
                {i === 4 ? (
                  <span className="text-4xl">🤫</span>
                ) : (
                  <span className="text-gradient">{letter}</span>
                )}
              </motion.span>
            ))}
          </div>

          {/* Tagline */}
          <motion.p
            className="mt-5 text-sm text-muted-foreground tracking-widest uppercase"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
          >
            Keep it hushh 🤫
          </motion.p>

          {/* Glowing ring */}
          <motion.div
            className="absolute w-56 h-56 rounded-full border border-primary/20"
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: [0.3, 1.8], opacity: [0.4, 0] }}
            transition={{ delay: 1.2, duration: 2 }}
          />
          <motion.div
            className="absolute w-40 h-40 rounded-full glow-lg"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: [0.5, 1.5], opacity: [0.3, 0] }}
            transition={{ delay: 1.5, duration: 1.8 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
