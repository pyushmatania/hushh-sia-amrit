import { motion, useAnimation } from "framer-motion";
import { useEffect, useState } from "react";
import iconHome from "@/assets/icon-home.png";
import iconStays from "@/assets/icon-stays-new.png";
import iconExperiences from "@/assets/icon-experiences-new.png";
import iconServices from "@/assets/icon-services-new.png";
import iconCurations from "@/assets/icon-curations.png";

interface Category {
  id: string;
  label: string;
  icon: string;
  badge?: string;
  animationType: string;
}

const categories: Category[] = [
  { id: "home", label: "Home", icon: iconHome, animationType: "doorSwing" },
  { id: "stay", label: "Stays", icon: iconStays, animationType: "waterSplash" },
  { id: "experience", label: "Experiences", icon: iconExperiences, animationType: "danceSpin" },
  { id: "service", label: "Services", icon: iconServices, animationType: "bellRing" },
  { id: "curation", label: "Curations", icon: iconCurations, badge: "🔥", animationType: "confettiBurst" },
];

// ─── ENTRANCE (tap) animations ───
const entranceAnimations: Record<string, any> = {
  doorSwing: {
    rotateY: [0, -30, 15, -8, 0],
    scale: [1, 1.15, 1.05, 1.1, 1],
    transition: { duration: 0.7, ease: "easeOut" },
  },
  danceSpin: {
    rotate: [0, -20, 20, -15, 15, -8, 8, 0],
    y: [0, -10, 0, -6, 0, -3, 0, 0],
    scale: [1, 1.2, 1.1, 1.15, 1.08, 1.1, 1.05, 1],
    transition: { duration: 0.9, ease: "easeOut" },
  },
  bellRing: {
    rotate: [0, 20, -20, 18, -18, 14, -14, 10, -10, 6, -6, 0],
    transformOrigin: "top center",
    scale: [1, 1.05, 1.05, 1.04, 1.04, 1.03, 1.03, 1.02, 1.02, 1.01, 1.01, 1],
    transition: { duration: 1, ease: "easeOut" },
  },
  waterSplash: {
    y: [0, -15, -5, -10, 0, 2, 0],
    scaleX: [1, 0.85, 1.2, 0.9, 1.15, 1.05, 1],
    scaleY: [1, 1.2, 0.85, 1.1, 0.95, 1.02, 1],
    rotate: [0, 0, 5, -5, 3, -2, 0],
    transition: { duration: 0.9, ease: "easeOut" },
  },
  confettiBurst: {
    scale: [1, 0.8, 1.4, 0.95, 1.15, 1],
    rotate: [0, -10, 25, -15, 8, 0],
    y: [0, 3, -12, 0, -4, 0],
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

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
};

const tapAnimations: Record<string, any> = {
  doorSwing: { rotateY: -20, scale: 1.15, transition: { type: "spring", stiffness: 500, damping: 10 } },
  danceSpin: { rotate: 30, scale: 1.2, transition: { type: "spring", stiffness: 400, damping: 10 } },
  bellRing: { rotate: [0, 15, -15, 10, -10, 0], scale: 1.15, transition: { duration: 0.4 } },
  waterSplash: { y: -10, scaleX: 1.2, scaleY: 0.85, transition: { type: "spring", stiffness: 400, damping: 10 } },
  confettiBurst: { scale: 1.35, rotate: 15, transition: { type: "spring", stiffness: 500, damping: 8 } },
};

const activeEffects: Record<string, React.CSSProperties> = {
  waterSplash: { filter: "drop-shadow(0 0 8px rgba(60,160,255,0.6)) drop-shadow(0 0 14px rgba(30,120,255,0.3))" },
  confettiBurst: { filter: "drop-shadow(0 0 8px rgba(255,100,200,0.5)) drop-shadow(0 0 14px rgba(200,50,255,0.3))" },
  bellRing: { filter: "drop-shadow(0 0 6px rgba(255,200,50,0.5))" },
  danceSpin: { filter: "drop-shadow(0 0 6px rgba(100,255,150,0.5))" },
  doorSwing: { filter: "drop-shadow(0 0 6px rgba(200,150,100,0.5))" },
};

function AnimatedIcon({ cat, isActive }: { cat: Category; isActive: boolean }) {
  const controls = useAnimation();
  const [loaded, setLoaded] = useState(false);

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
    <div className="relative w-14 h-14">
      {/* Skeleton shimmer */}
      {!loaded && (
        <div className="absolute inset-0 rounded-xl bg-secondary overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(90deg, transparent 0%, hsl(var(--foreground) / 0.06) 50%, transparent 100%)",
              animation: "shimmer 1.5s infinite",
            }}
          />
        </div>
      )}
      <motion.img
        src={cat.icon}
        alt={cat.label}
        className="w-14 h-14 object-contain"
        loading="eager"
        decoding="async"
        fetchPriority="high"
        onLoad={() => setLoaded(true)}
        style={{
          opacity: loaded ? (isActive ? 1 : 0.85) : 0,
          ...(isActive ? activeEffects[cat.animationType] || {} : {}),
          transition: "filter 0.3s ease, opacity 0.2s ease",
          contentVisibility: "auto",
        }}
        animate={controls}
        whileTap={tapAnimations[cat.animationType]}
        whileHover={{ scale: 1.08 }}
      />
    </div>
  );
}

interface CategoryBarProps {
  active: string;
  onChange: (id: string) => void;
}

export default function CategoryBar({ active, onChange }: CategoryBarProps) {
  return (
    <div className="flex justify-around px-0">
      {categories.map((cat) => {
        const isActive = active === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onChange(cat.id)}
            className="relative flex flex-col items-center gap-1 px-1.5 pt-2 pb-2.5 shrink-0 group min-w-0 flex-1"
          >
            <div className="relative h-14 flex items-center justify-center">
              <AnimatedIcon cat={cat} isActive={isActive} />
              {cat.badge && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-1 text-[9px] leading-none"
                >
                  {cat.badge}
                </motion.span>
              )}
            </div>
            <span className={`text-[10px] font-medium whitespace-nowrap transition-colors duration-200 ${
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
  );
}
