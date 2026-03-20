import { motion } from "framer-motion";
import { hapticSelection } from "@/lib/haptics";

export type Mood = "romantic" | "party" | "chill" | "work" | null;

interface MoodSelectorProps {
  activeMood: Mood;
  onMoodChange: (mood: Mood) => void;
}

const moods = [
  { id: "romantic" as const, emoji: "💑", label: "Romantic", gradient: "from-pink-500/20 to-rose-600/10", activeGradient: "from-pink-500/40 to-rose-600/25", glow: "rgba(236,72,153,0.4)" },
  { id: "party" as const, emoji: "🎉", label: "Party", gradient: "from-amber-500/20 to-orange-600/10", activeGradient: "from-amber-500/40 to-orange-600/25", glow: "rgba(245,158,11,0.4)" },
  { id: "chill" as const, emoji: "🌿", label: "Chill", gradient: "from-emerald-500/20 to-teal-600/10", activeGradient: "from-emerald-500/40 to-teal-600/25", glow: "rgba(16,185,129,0.4)" },
  { id: "work" as const, emoji: "💻", label: "Work", gradient: "from-blue-500/20 to-cyan-600/10", activeGradient: "from-blue-500/40 to-cyan-600/25", glow: "rgba(59,130,246,0.4)" },
];

export default function MoodSelector({ activeMood, onMoodChange }: MoodSelectorProps) {
  return (
    <div className="px-4 pt-4 pb-2">
      <div className="flex items-center gap-2 mb-3 px-1">
        <span className="text-sm font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          What's your vibe?
        </span>
        {activeMood && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => { hapticSelection(); onMoodChange(null); }}
            className="text-[10px] px-2 py-0.5 rounded-full bg-foreground/10 text-muted-foreground font-medium"
          >
            Clear
          </motion.button>
        )}
      </div>
      <div className="grid grid-cols-4 gap-2.5">
        {moods.map((mood, i) => {
          const isActive = activeMood === mood.id;
          return (
            <motion.button
              key={mood.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                hapticSelection();
                onMoodChange(isActive ? null : mood.id);
              }}
              className={`relative rounded-2xl py-3.5 flex flex-col items-center gap-1.5 transition-all duration-300 overflow-hidden ${
                isActive ? "ring-1 ring-primary/40" : ""
              }`}
              style={{
                background: isActive
                  ? `linear-gradient(145deg, ${mood.activeGradient.split(" ")[0].replace("from-", "")} 0%, ${mood.activeGradient.split(" ")[1]?.replace("to-", "") || "transparent"} 100%)`
                  : "hsl(var(--foreground) / 0.04)",
                border: `1px solid ${isActive ? "hsl(var(--primary) / 0.3)" : "hsl(var(--foreground) / 0.06)"}`,
                boxShadow: isActive ? `0 4px 20px -4px ${mood.glow}` : "none",
              }}
            >
              {isActive && (
                <div
                  className="absolute -top-6 -right-6 w-16 h-16 rounded-full opacity-30 pointer-events-none"
                  style={{ background: `radial-gradient(circle, ${mood.glow}, transparent 70%)` }}
                />
              )}
              <motion.span
                className="text-2xl"
                animate={isActive ? { scale: [1, 1.2, 1], rotate: [0, -5, 5, 0] } : {}}
                transition={{ duration: 0.5 }}
              >
                {mood.emoji}
              </motion.span>
              <span className={`text-[10px] font-semibold ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                {mood.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
