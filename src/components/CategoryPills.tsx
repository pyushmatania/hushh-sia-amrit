import { motion } from "framer-motion";
import {
  Heart, Flame, Users, PartyPopper, TreePine, Dumbbell,
  Film, Star, UtensilsCrossed, Mic, Sparkles
} from "lucide-react";
import type { ReactNode } from "react";

interface Category {
  id: string;
  label: string;
  icon: ReactNode;
}

const iconSize = 24;
const iconStroke = 1.5;

const categories: Category[] = [
  { id: "all", label: "All", icon: <Sparkles size={iconSize} strokeWidth={iconStroke} /> },
  { id: "couples", label: "Couples", icon: <Heart size={iconSize} strokeWidth={iconStroke} /> },
  { id: "party", label: "Party", icon: <PartyPopper size={iconSize} strokeWidth={iconStroke} /> },
  { id: "family", label: "Family", icon: <Users size={iconSize} strokeWidth={iconStroke} /> },
  { id: "bonfire", label: "Bonfire", icon: <Flame size={iconSize} strokeWidth={iconStroke} /> },
  { id: "sports", label: "Sports", icon: <Dumbbell size={iconSize} strokeWidth={iconStroke} /> },
  { id: "movie", label: "Movie", icon: <Film size={iconSize} strokeWidth={iconStroke} /> },
  { id: "stargazing", label: "Stargazing", icon: <Star size={iconSize} strokeWidth={iconStroke} /> },
  { id: "dining", label: "Dining", icon: <UtensilsCrossed size={iconSize} strokeWidth={iconStroke} /> },
  { id: "karaoke", label: "Karaoke", icon: <Mic size={iconSize} strokeWidth={iconStroke} /> },
];

interface CategoryPillsProps {
  active: string;
  onChange: (id: string) => void;
}

export default function CategoryPills({ active, onChange }: CategoryPillsProps) {
  return (
    <div className="border-b border-border/50">
      <div className="flex gap-0 overflow-x-auto hide-scrollbar px-4">
        {categories.map((cat) => {
          const isActive = active === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onChange(cat.id)}
              className="relative flex flex-col items-center gap-1.5 px-4 py-3 shrink-0 group"
            >
              <span className={`transition-colors duration-200 ${
                isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground/70"
              }`}>
                {cat.icon}
              </span>
              <span className={`text-[10px] font-medium whitespace-nowrap transition-colors duration-200 ${
                isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground/70"
              }`}>
                {cat.label}
              </span>
              {/* Active underline */}
              {isActive && (
                <motion.div
                  layoutId="categoryUnderline"
                  className="absolute bottom-0 left-2 right-2 h-[2px] bg-foreground rounded-full"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
