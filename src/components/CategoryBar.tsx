import { motion, useAnimation, type Variants } from "framer-motion";
import { useEffect, useState } from "react";
import iconHome from "@/assets/icon-home.png";
import iconStays from "@/assets/icon-stays-new.png";
import iconExperiences from "@/assets/icon-experiences-new.png";
import iconServices from "@/assets/icon-services-new.png";

interface Category {
  id: string;
  label: string;
  icon: string;
  badge?: string;
  animationType: string;
}

const categories: Category[] = [
  { id: "stays", label: "Home", icon: iconHome, animationType: "doorSwing" },
  { id: "stays-book", label: "Stays", icon: iconStays, badge: "NEW", animationType: "waterSplash" },
  { id: "experiences", label: "Experiences", icon: iconExperiences, animationType: "danceSpin" },
  { id: "services", label: "Services", icon: iconServices, badge: "NEW", animationType: "bellRing" },
];

// ─── ENTRANCE (tap) animations ───
const entranceAnimations: Record<string, any> = {
  // Stays: door swinging open then settling
  doorSwing: {
    rotateY: [0, -30, 15, -8, 0],
    scale: [1, 1.15, 1.05, 1.1, 1],
    transition: { duration: 0.7, ease: "easeOut" },
  },
  // Experiences: full excited dance spin
  danceSpin: {
    rotate: [0, -20, 20, -15, 15, -8, 8, 0],
    y: [0, -10, 0, -6, 0, -3, 0, 0],
    scale: [1, 1.2, 1.1, 1.15, 1.08, 1.1, 1.05, 1],
    transition: { duration: 0.9, ease: "easeOut" },
  },
  // Services: bell tring-tring — fast alternating swing from top pivot
  bellRing: {
    rotate: [0, 20, -20, 18, -18, 14, -14, 10, -10, 6, -6, 0],
    transformOrigin: "top center",
    scale: [1, 1.05, 1.05, 1.04, 1.04, 1.03, 1.03, 1.02, 1.02, 1.01, 1.01, 1],
    transition: { duration: 1, ease: "easeOut" },
  },
  // Bonfire: flames dancing — rapid vertical flicker + sway
  fireFlicker: {
    y: [0, -6, -2, -8, -1, -7, -3, -5, 0],
    scaleY: [1, 1.15, 0.95, 1.2, 0.9, 1.18, 0.95, 1.1, 1],
    scaleX: [1, 0.95, 1.05, 0.92, 1.08, 0.96, 1.04, 0.98, 1],
    rotate: [0, -3, 3, -4, 4, -2, 2, -1, 0],
    transition: { duration: 0.8, ease: "easeOut" },
  },
  // Pool: splash — drops up then ripple side to side
  waterSplash: {
    y: [0, -15, -5, -10, 0, 2, 0],
    scaleX: [1, 0.85, 1.2, 0.9, 1.15, 1.05, 1],
    scaleY: [1, 1.2, 0.85, 1.1, 0.95, 1.02, 1],
    rotate: [0, 0, 5, -5, 3, -2, 0],
    transition: { duration: 0.9, ease: "easeOut" },
  },
  // Celebrate: explosion burst outward
  confettiBurst: {
    scale: [1, 0.8, 1.4, 0.95, 1.15, 1],
    rotate: [0, -10, 25, -15, 8, 0],
    y: [0, 3, -12, 0, -4, 0],
    transition: { duration: 0.8, ease: "easeOut" },
  },
  // Movie: film reel rolling — continuous rotation with scale
  filmRoll: {
    rotate: [0, 360],
    scale: [1, 1.1, 1.05, 1.1, 1],
    transition: { duration: 0.8, ease: "easeOut" },
  },
  // Dining: plate being served — slide in from side + settle
  plateServe: {
    x: [30, -5, 3, -2, 0],
    rotate: [10, -5, 3, -1, 0],
    scale: [0.8, 1.1, 1.05, 1.08, 1],
    transition: { duration: 0.7, ease: "easeOut" },
  },
  // Stargazing: star twinkle — scale pulses with opacity shimmer
  starTwinkle: {
    scale: [1, 1.3, 0.85, 1.25, 0.9, 1.15, 1],
    opacity: [1, 0.5, 1, 0.6, 1, 0.8, 1],
    rotate: [0, 15, -10, 12, -8, 5, 0],
    transition: { duration: 1, ease: "easeOut" },
  },
};

// ─── IDLE (looping) animations — subtle but characteristic ───
const idleAnimations: Record<string, any> = {
  doorSwing: {
    rotateY: [0, -3, 3, 0],
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
  },
  danceSpin: {
    rotate: [0, -4, 4, -3, 3, 0],
    y: [0, -2, 0],
    transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
  },
  bellRing: {
    rotate: [0, 6, -6, 5, -5, 3, -3, 0],
    transformOrigin: "top center",
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
  },
  fireFlicker: {
    y: [0, -2, 0, -3, -1, -2, 0],
    scaleY: [1, 1.06, 0.97, 1.05, 0.98, 1.03, 1],
    scaleX: [1, 0.97, 1.03, 0.98, 1.02, 0.99, 1],
    transition: { duration: 1.2, repeat: Infinity, ease: "easeInOut" },
  },
  waterSplash: {
    y: [0, -2, 1, -1, 0],
    scaleX: [1, 1.03, 0.97, 1.02, 1],
    rotate: [0, 1, -1, 0.5, 0],
    transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
  },
  confettiBurst: {
    scale: [1, 1.06, 0.98, 1.04, 1],
    rotate: [0, 3, -3, 2, 0],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
  },
  filmRoll: {
    rotate: [0, 5, -3, 2, 0],
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
  },
  plateServe: {
    x: [0, 2, -2, 1, 0],
    rotate: [0, 1, -1, 0],
    transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
  },
  starTwinkle: {
    scale: [1, 1.08, 0.95, 1.06, 1],
    opacity: [1, 0.8, 1, 0.85, 1],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
  },
};

// Per-icon tap animations
const tapAnimations: Record<string, any> = {
  doorSwing: { rotateY: -20, scale: 1.15, transition: { type: "spring", stiffness: 500, damping: 10 } },
  danceSpin: { rotate: 30, scale: 1.2, transition: { type: "spring", stiffness: 400, damping: 10 } },
  bellRing: { rotate: [0, 15, -15, 10, -10, 0], scale: 1.15, transition: { duration: 0.4 } },
  fireFlicker: { scaleY: 1.3, scaleX: 0.9, y: -5, transition: { type: "spring", stiffness: 500, damping: 10 } },
  waterSplash: { y: -10, scaleX: 1.2, scaleY: 0.85, transition: { type: "spring", stiffness: 400, damping: 10 } },
  confettiBurst: { scale: 1.35, rotate: 15, transition: { type: "spring", stiffness: 500, damping: 8 } },
  filmRoll: { rotate: 180, scale: 1.1, transition: { type: "spring", stiffness: 300, damping: 12 } },
  plateServe: { x: -10, rotate: -8, scale: 1.1, transition: { type: "spring", stiffness: 400, damping: 12 } },
  starTwinkle: { scale: 1.3, opacity: 0.6, rotate: 20, transition: { type: "spring", stiffness: 400, damping: 10 } },
};

// Visual effect styles per icon (glow, shadow, etc.)
const activeEffects: Record<string, React.CSSProperties> = {
  fireFlicker: { filter: "drop-shadow(0 0 8px rgba(255,120,20,0.7)) drop-shadow(0 0 16px rgba(255,80,0,0.4))" },
  waterSplash: { filter: "drop-shadow(0 0 8px rgba(60,160,255,0.6)) drop-shadow(0 0 14px rgba(30,120,255,0.3))" },
  starTwinkle: { filter: "drop-shadow(0 0 10px rgba(255,230,80,0.7)) drop-shadow(0 0 20px rgba(255,200,0,0.4))" },
  confettiBurst: { filter: "drop-shadow(0 0 8px rgba(255,100,200,0.5)) drop-shadow(0 0 14px rgba(200,50,255,0.3))" },
  bellRing: { filter: "drop-shadow(0 0 6px rgba(255,200,50,0.5))" },
  filmRoll: { filter: "drop-shadow(0 0 6px rgba(150,150,255,0.5))" },
  danceSpin: { filter: "drop-shadow(0 0 6px rgba(100,255,150,0.5))" },
  doorSwing: { filter: "drop-shadow(0 0 6px rgba(200,150,100,0.5))" },
  plateServe: { filter: "drop-shadow(0 0 6px rgba(255,180,100,0.5))" },
};

function AnimatedIcon({ cat, isActive }: { cat: Category; isActive: boolean }) {
  const controls = useAnimation();

  useEffect(() => {
    if (isActive) {
      controls.start(entranceAnimations[cat.animationType]).then(() => {
        controls.start(idleAnimations[cat.animationType]);
      });
    } else {
      controls.start({
        scale: 1, scaleX: 1, scaleY: 1,
        y: 0, x: 0, rotate: 0, rotateY: 0,
        opacity: 1,
        transition: { duration: 0.3 },
      });
    }
  }, [isActive, cat.animationType, controls]);

  return (
    <motion.img
      src={cat.icon}
      alt={cat.label}
      className="w-16 h-16 object-contain"
      style={{
        opacity: isActive ? 1 : 0.85,
        ...(isActive ? activeEffects[cat.animationType] || {} : {}),
        transition: "filter 0.3s ease",
      }}
      animate={controls}
      whileTap={tapAnimations[cat.animationType]}
      whileHover={{ scale: 1.08 }}
    />
  );
}

interface CategoryBarProps {
  active: string;
  onChange: (id: string) => void;
}

export default function CategoryBar({ active, onChange }: CategoryBarProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl mx-4"
      style={{
        background: "linear-gradient(135deg, rgba(120,80,220,0.15) 0%, rgba(60,40,140,0.08) 50%, rgba(180,100,255,0.12) 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 4px 24px -4px rgba(120,80,220,0.2)",
      }}>
      <div className="flex justify-around px-1">
        {categories.map((cat) => {
          const isActive = active === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onChange(cat.id)}
              className="relative flex flex-col items-center gap-1.5 px-3 pt-3 pb-3 shrink-0 group min-w-[76px]"
            >
              <div className="relative h-16 flex items-center justify-center">
                <AnimatedIcon cat={cat} isActive={isActive} />
                {cat.badge && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-4 text-[7px] font-bold bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full leading-none tracking-wide glow-sm"
                  >
                    {cat.badge}
                  </motion.span>
                )}
              </div>
              <span className={`text-[11px] font-medium whitespace-nowrap transition-colors duration-200 ${
                isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground/70"
              }`}>
                {cat.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="catUnderline"
                  className="absolute bottom-0 left-2 right-2 h-[2px] bg-primary rounded-full glow-sm"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
