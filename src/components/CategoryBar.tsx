import { motion } from "framer-motion";
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
}

const categories: Category[] = [
  { id: "stays", label: "Stays", icon: iconStays },
  { id: "experiences", label: "Experiences", icon: iconExperiences, badge: "NEW" },
  { id: "services", label: "Services", icon: iconServices, badge: "NEW" },
  { id: "bonfire", label: "Bonfire", icon: iconBonfire },
  { id: "pool", label: "Pool", icon: iconPool },
  { id: "party", label: "Celebrate", icon: iconParty },
  { id: "movie", label: "Movie", icon: iconMovie },
  { id: "dining", label: "Dining", icon: iconDining },
  { id: "stargazing", label: "Stargazing", icon: iconStargazing },
];

interface CategoryBarProps {
  active: string;
  onChange: (id: string) => void;
}

export default function CategoryBar({ active, onChange }: CategoryBarProps) {
  return (
    <div className="border-b border-border bg-background">
      <div className="flex overflow-x-auto hide-scrollbar px-2">
        {categories.map((cat) => {
          const isActive = active === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onChange(cat.id)}
              className="relative flex flex-col items-center gap-1 px-4 pt-3 pb-3 shrink-0 group min-w-[72px]"
            >
              <div className="relative">
                <motion.img
                  src={cat.icon}
                  alt={cat.label}
                  className="w-10 h-10 object-contain"
                  style={{
                    opacity: isActive ? 1 : 0.55,
                    filter: isActive ? "none" : "grayscale(30%)",
                  }}
                  whileTap={{ scale: 1.15, rotate: [0, -5, 5, 0] }}
                  animate={isActive ? {
                    scale: [1, 1.08, 1],
                    transition: { duration: 0.3 }
                  } : {}}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                />
                {cat.badge && (
                  <span className="absolute -top-1 -right-5 text-[7px] font-bold bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full leading-none tracking-wide">
                    {cat.badge}
                  </span>
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
                  className="absolute bottom-0 left-3 right-3 h-[2px] bg-foreground rounded-full"
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
