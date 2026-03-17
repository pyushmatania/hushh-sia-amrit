import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const letters = ["H", "U", "S", "H", "H"];

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onComplete, 500);
    }, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Floating particles */}
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-primary/30"
              initial={{
                x: Math.random() * 400 - 200,
                y: Math.random() * 400 - 200,
                opacity: 0,
              }}
              animate={{
                y: [null, Math.random() * -100 - 50],
                opacity: [0, 0.6, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}

          {/* Logo */}
          <div className="flex items-center gap-1">
            {letters.map((letter, i) => (
              <motion.span
                key={i}
                className="text-5xl font-display font-extrabold tracking-tighter text-foreground"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: i * 0.1 + 0.3,
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                }}
              >
                {i === 4 ? (
                  <motion.span
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                  >
                    🤫
                  </motion.span>
                ) : (
                  letter
                )}
              </motion.span>
            ))}
          </div>

          {/* Tagline */}
          <motion.p
            className="mt-4 text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            Keep it hushh 🤫
          </motion.p>

          {/* Glow ring */}
          <motion.div
            className="absolute w-48 h-48 rounded-full border border-primary/20"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: [0.5, 1.5], opacity: [0.3, 0] }}
            transition={{ delay: 1, duration: 1.5 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
