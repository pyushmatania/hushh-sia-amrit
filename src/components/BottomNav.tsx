import { motion, AnimatePresence } from "framer-motion";
import { Search, Heart, MapPin, MessageCircle, User } from "lucide-react";
import { hapticSelection } from "@/lib/haptics";

const tabs = [
  { id: "home", icon: Search, label: "Explore" },
  { id: "wishlists", icon: Heart, label: "Wishlists" },
  { id: "bookings", icon: MapPin, label: "Trips" },
  { id: "messages", icon: MessageCircle, label: "Messages" },
  { id: "profile", icon: User, label: "Profile" },
];

interface BottomNavProps {
  active: string;
  onChange: (tab: string) => void;
  messageBadge?: number;
}

export default function BottomNav({ active, onChange, messageBadge = 0 }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 glass">
      <div className="flex items-center justify-around pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {tabs.map((tab) => {
          const isActive = active === tab.id;
          return (
            <motion.button
              key={tab.id}
              onClick={() => { hapticSelection(); onChange(tab.id); }}
              className="flex flex-col items-center gap-0.5 min-w-[60px] py-0.5 relative"
              whileTap={{ scale: 0.8 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
            >
              {/* Active glow indicator */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    layoutId="bottomNavGlow"
                    className="absolute -top-1 left-1/2 -translate-x-1/2 w-10 h-[2.5px] rounded-full"
                    style={{ background: "linear-gradient(90deg, transparent, hsl(var(--primary)), transparent)" }}
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    exit={{ opacity: 0, scaleX: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </AnimatePresence>

              {/* Icon with bounce + glow */}
              <motion.div
                animate={isActive
                  ? { y: [0, -4, -1, 0], scale: [1, 1.15, 1.05, 1] }
                  : { y: 0, scale: 1 }
                }
                transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
                className="relative"
              >
                {/* Background glow for active */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      className="absolute inset-0 -m-2 rounded-full bg-primary/10 blur-md"
                    />
                  )}
                </AnimatePresence>

                <tab.icon
                  size={22}
                  className={`relative transition-colors duration-200 ${isActive ? "text-primary drop-shadow-[0_0_6px_hsl(var(--primary)/0.4)]" : "text-muted-foreground"}`}
                  strokeWidth={isActive ? 2.5 : 1.5}
                  fill={isActive && tab.id === "wishlists" ? "currentColor" : "none"}
                />

                {/* Message badge */}
                {tab.id === "messages" && messageBadge > 0 && !isActive && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center px-1"
                  >
                    {messageBadge > 99 ? "99+" : messageBadge}
                  </motion.span>
                )}
              </motion.div>

              {/* Label with smooth color transition */}
              <motion.span
                animate={{ color: isActive ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))" }}
                transition={{ duration: 0.2 }}
                className={`text-[10px] font-semibold ${isActive ? "text-primary" : "text-muted-foreground"}`}
              >
                {tab.label}
              </motion.span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
