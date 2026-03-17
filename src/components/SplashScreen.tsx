import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onComplete, 500);
    }, 3200);
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
            className="absolute w-80 h-80 rounded-full"
            style={{ background: "radial-gradient(circle, hsla(270,80%,65%,0.25), transparent 70%)" }}
            animate={{
              x: [0, 40, -30, 0],
              y: [0, -50, 30, 0],
              scale: [1, 1.3, 0.8, 1],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute w-60 h-60 rounded-full"
            style={{ background: "radial-gradient(circle, hsla(320,70%,55%,0.15), transparent 70%)" }}
            animate={{
              x: [0, -40, 30, 0],
              y: [0, 40, -40, 0],
              scale: [1, 0.7, 1.4, 1],
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
          <motion.div
            className="absolute w-40 h-40 rounded-full"
            style={{ background: "radial-gradient(circle, hsla(43,96%,56%,0.1), transparent 70%)" }}
            animate={{
              x: [30, -20, 40, 30],
              y: [-30, 20, -10, -30],
            }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          />

          {/* Floating particles */}
          {Array.from({ length: 30 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: Math.random() * 3 + 1,
                height: Math.random() * 3 + 1,
                background: i % 3 === 0
                  ? "hsl(var(--primary))"
                  : i % 3 === 1
                  ? "hsl(var(--gold))"
                  : "hsl(var(--foreground) / 0.3)",
              }}
              initial={{
                x: Math.random() * 400 - 200,
                y: Math.random() * 400 - 200,
                opacity: 0,
              }}
              animate={{
                y: [null, Math.random() * -200 - 50],
                opacity: [0, 0.9, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}

          {/* Large expressive typography */}
          <div className="relative z-10 text-center px-8">
            <motion.h1
              className="text-6xl font-bold tracking-tight"
              initial={{ opacity: 0, y: 40, filter: "blur(20px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.3, duration: 0.8, type: "spring", stiffness: 100 }}
            >
              <span className="text-gradient">hushh</span>
            </motion.h1>
            <motion.div
              className="flex items-center justify-center gap-2 mt-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <span className="text-3xl">🤫</span>
            </motion.div>
            <motion.p
              className="mt-4 text-sm text-muted-foreground tracking-[0.25em] uppercase font-medium"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
            >
              Private experiences await
            </motion.p>
          </div>

          {/* Expanding rings */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute rounded-full border border-primary/15"
              initial={{ width: 60, height: 60, opacity: 0 }}
              animate={{
                width: [60, 400],
                height: [60, 400],
                opacity: [0.4, 0],
              }}
              transition={{
                delay: 1.5 + i * 0.4,
                duration: 2,
                ease: "easeOut",
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
