import { motion, useAnimation } from "framer-motion";
import { useEffect } from "react";
import iconStays from "@/assets/icon-stays.png";
import iconExperiences from "@/assets/icon-experiences.png";
import iconServices from "@/assets/icon-services.png";
import iconBonfire from "@/assets/icon-bonfire.png";
import iconPool from "@/assets/icon-pool.png";
import iconParty from "@/assets/icon-party.png";
import iconMovie from "@/assets/icon-movie.png";
import iconDining from "@/assets/icon-dining.png";
import iconStargazing from "@/assets/icon-stargazing.png";

interface Category {
  id: string;
  label: string;
  icon: string;
  badge?: string;
  animation: "bounce" | "wiggle" | "pulse" | "spin" | "float";
}

const categories: Category[] = [
  { id: "stays", label: "Stays", icon: iconStays, animation: "bounce" },
  { id: "experiences", label: "Experiences", icon: iconExperiences, badge: "NEW", animation: "wiggle" },
  { id: "services", label: "Services", icon: iconServices, badge: "NEW", animation: "pulse" },
  { id: "bonfire", label: "Bonfire", icon: iconBonfire, animation: "pulse" },
  { id: "pool", label: "Pool", icon: iconPool, animation: "float" },
  { id: "party", label: "Celebrate", icon: iconParty, animation: "spin" },
  { id: "movie", label: "Movie", icon: iconMovie, animation: "bounce" },
  { id: "dining", label: "Dining", icon: iconDining, animation: "wiggle" },
  { id: "stargazing", label: "Stargazing", icon: iconStargazing, animation: "pulse" },
];

const activeAnimations = {
  bounce: {
    y: [0, -6, 0, -3, 0],
    scale: [1, 1.1, 1, 1.05, 1],
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
  wiggle: {
    rotate: [0, -8, 8, -5, 5, 0],
    scale: [1, 1.1, 1.1, 1.05, 1.05, 1],
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
  pulse: {
    scale: [1, 1.15, 0.95, 1.08, 1],
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
  spin: {
    rotate: [0, 15, -10, 5, 0],
    scale: [1, 1.1, 1.05, 1.08, 1],
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
  float: {
    y: [0, -5, 0],
    scale: [1, 1.1, 1],
    transition: { duration: 0.8, ease: "easeInOut" as const },
  },
};

// Idle looping animation for the active icon
const idleAnimations = {
  bounce: {
    y: [0, -2, 0],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" as const },
  },
  wiggle: {
    rotate: [0, -2, 2, 0],
    transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" as const },
  },
  pulse: {
    scale: [1, 1.04, 1],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" as const },
  },
  spin: {
    rotate: [0, 3, -3, 0],
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" as const },
  },
  float: {
    y: [0, -3, 0],
    transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" as const },
  },
};

function AnimatedIcon({ cat, isActive }: { cat: Category; isActive: boolean }) {
  const controls = useAnimation();

  useEffect(() => {
    if (isActive) {
      // Play entrance animation first, then idle loop
      controls.start(activeAnimations[cat.animation]).then(() => {
        controls.start(idleAnimations[cat.animation]);
      });
    } else {
      controls.start({ scale: 1, y: 0, rotate: 0, transition: { duration: 0.2 } });
    }
  }, [isActive, cat.animation, controls]);

  return (
    <motion.img
      src={cat.icon}
      alt={cat.label}
      className="w-12 h-12 object-contain"
      style={{
        opacity: isActive ? 1 : 0.5,
        filter: isActive ? "none" : "grayscale(40%)",
      }}
      animate={controls}
      whileTap={{
        scale: 1.2,
        rotate: [0, -8, 8, 0],
        transition: { type: "spring", stiffness: 400, damping: 12 },
      }}
      whileHover={{ scale: 1.08, opacity: 0.8 }}
    />
  );
}

interface CategoryBarProps {
  active: string;
  onChange: (id: string) => void;
}

export default function CategoryBar({ active, onChange }: CategoryBarProps) {
  return (
    <div className="border-b border-border bg-background">
      <div className="flex overflow-x-auto hide-scrollbar px-1">
        {categories.map((cat) => {
          const isActive = active === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onChange(cat.id)}
              className="relative flex flex-col items-center gap-1.5 px-3 pt-3 pb-3 shrink-0 group min-w-[76px]"
            >
              <div className="relative h-12 flex items-center justify-center">
                <AnimatedIcon cat={cat} isActive={isActive} />
                {cat.badge && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-4 text-[7px] font-bold bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full leading-none tracking-wide"
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
                  className="absolute bottom-0 left-2 right-2 h-[2px] bg-foreground rounded-full"
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
