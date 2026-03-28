import { motion } from "framer-motion";
import { Search, Map } from "lucide-react";
import TypeWriter from "@/components/shared/TypeWriter";

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
    <div className="flex gap-2 px-4 md:justify-center">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 flex items-center gap-3 rounded-full px-5 py-3 cursor-pointer md:max-w-[680px] lg:max-w-[780px] md:h-[52px] md:shadow-lg md:hover:shadow-xl md:hover:shadow-primary/5 md:transition-shadow"
        style={{
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
        onClick={onSearchTap}
      >
        <Search size={18} className="text-muted-foreground shrink-0 md:w-5 md:h-5" />
        <div className="relative h-5 flex-1 overflow-hidden">
          <TypeWriter
            strings={placeholders}
            className="text-sm text-muted-foreground whitespace-nowrap md:text-base"
            typingSpeed={80}
            deletingSpeed={45}
            pauseDuration={3000}
          />
        </div>
        {/* Desktop search button */}
        <div className="hidden md:flex w-9 h-9 rounded-full bg-primary/20 items-center justify-center hover:bg-primary/30 transition-colors cursor-pointer">
          <Search size={16} className="text-primary" />
        </div>
      </motion.div>
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onMapTap}
        className="w-[48px] h-[48px] rounded-2xl flex items-center justify-center shrink-0 md:hidden"
        style={{
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <Map size={20} className="text-primary" />
      </motion.button>
    </div>
  );
}
