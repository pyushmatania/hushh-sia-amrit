import { motion } from "framer-motion";
import { categories } from "@/data/properties";

interface CategoryPillsProps {
  active: string;
  onChange: (id: string) => void;
}

export default function CategoryPills({ active, onChange }: CategoryPillsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto hide-scrollbar py-2 px-4">
      {categories.map((cat) => {
        const isActive = active === cat.id;
        return (
          <motion.button
            key={cat.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => onChange(cat.id)}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl shrink-0 transition-colors ${
              isActive
                ? "bg-primary/15 border border-primary/30"
                : "bg-card border border-transparent hover:border-border"
            }`}
          >
            <span className="text-lg">{cat.emoji}</span>
            <span className={`text-xs font-medium whitespace-nowrap ${isActive ? "text-primary" : "text-muted-foreground"}`}>
              {cat.label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
