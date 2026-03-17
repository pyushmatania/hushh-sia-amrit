import { motion } from "framer-motion";
import iconStays from "@/assets/icon-stays.png";
import iconExperiences from "@/assets/icon-experiences.png";
import iconServices from "@/assets/icon-services.png";
import iconBonfire from "@/assets/icon-bonfire.png";
import iconPool from "@/assets/icon-pool.png";
import iconParty from "@/assets/icon-party.png";
import iconMovie from "@/assets/icon-movie.png";
import iconDining from "@/assets/icon-dining.png";

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
  { id: "party", label: "Party", icon: iconParty },
  { id: "movie", label: "Movie", icon: iconMovie },
  { id: "dining", label: "Dining", icon: iconDining },
];

interface CategoryBarProps {
  active: string;
  onChange: (id: string) => void;
}

export default function CategoryBar({ active, onChange }: CategoryBarProps) {
  return (
    <div className="border-b border-border">
      <div className="flex overflow-x-auto hide-scrollbar">
        {categories.map((cat) => {
          const isActive = active === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onChange(cat.id)}
              className="relative flex flex-col items-center gap-1 px-5 pt-2 pb-3 shrink-0 group"
            >
              <div className="relative">
                <img
                  src={cat.icon}
                  alt={cat.label}
                  className={`w-7 h-7 object-contain transition-opacity ${
                    isActive ? "opacity-100" : "opacity-60 group-hover:opacity-80"
                  }`}
                />
                {cat.badge && (
                  <span className="absolute -top-1.5 -right-4 text-[8px] font-bold bg-muted-foreground text-background px-1.5 py-0.5 rounded-full leading-none">
                    {cat.badge}
                  </span>
                )}
              </div>
              <span className={`text-[11px] font-medium whitespace-nowrap transition-colors ${
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
