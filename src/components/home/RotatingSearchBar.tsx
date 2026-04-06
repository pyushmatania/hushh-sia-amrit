import { motion } from "framer-motion";
import { Search, Map } from "lucide-react";
import TypeWriter from "@/components/shared/TypeWriter";
import { hapticLight } from "@/lib/haptics";

const placeholders = [
  "Bonfire Night",
  "Romantic Date",
  "Pickleball",
  "Birthday Party",
  "Movie Night",
  "Tribal Thali",
];

interface RotatingSearchBarProps {
  onSearchTap?: () => void;
  onMapTap?: () => void;
}

export default function RotatingSearchBar({ onSearchTap, onMapTap }: RotatingSearchBarProps) {
  return (
    <div className="flex gap-2.5 px-4 pb-1 md:justify-center">
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="flex-1 flex items-center gap-3 rounded-2xl px-4 py-3 cursor-pointer md:max-w-[680px] lg:max-w-[780px] md:h-[52px] md:rounded-full md:shadow-lg md:hover:shadow-xl md:hover:shadow-primary/5 md:transition-shadow active:scale-[0.98] transition-transform"
        style={{
          background: "hsl(var(--card) / 0.92)",
          border: "1px solid hsl(var(--border) / 0.4)",
        }}
        onClick={() => { hapticLight(); onSearchTap?.(); }}
      >
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: "hsl(var(--primary) / 0.12)" }}>
          <Search size={15} className="text-primary" />
        </div>
        <div className="relative h-5 flex-1 overflow-hidden">
          <TypeWriter
            strings={placeholders}
            className="text-sm text-muted-foreground whitespace-nowrap md:text-base"
            typingSpeed={80}
            deletingSpeed={45}
            pauseDuration={3000}
          />
        </div>
        <div className="hidden md:flex w-9 h-9 rounded-full bg-primary items-center justify-center hover:bg-primary/90 transition-colors cursor-pointer">
          <Search size={14} className="text-primary-foreground" />
        </div>
      </motion.div>
      <motion.button
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        whileTap={{ scale: 0.85 }}
        onClick={() => { hapticLight(); onMapTap?.(); }}
        className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 md:hidden transition-transform"
        style={{
          background: "hsl(var(--card) / 0.92)",
          border: "1px solid hsl(var(--border) / 0.4)",
        }}
      >
        <Map size={18} className="text-primary" />
      </motion.button>
    </div>
  );
}
