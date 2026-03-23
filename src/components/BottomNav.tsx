import { motion, AnimatePresence } from "framer-motion";
import { Search, Heart, MapPin, MessageCircle, User } from "lucide-react";
import { hapticSelection, hapticLight, hapticMedium } from "@/lib/haptics";
import { useCallback } from "react";

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
  const handleTabPress = useCallback((tabId: string) => {
    if (tabId === active) {
      hapticImpact("light");
    } else {
      hapticImpact("medium");
    }
    onChange(tabId);
  }, [active, onChange]);

  return (
    <div
      className="fixed left-2 right-2 z-40"
      style={{
        bottom: "max(10px, calc(env(safe-area-inset-bottom, 0px) + 4px))",
      }}
    >
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 28, delay: 0.1 }}
        className="relative overflow-hidden"
        style={{
          borderRadius: "22px",
          background: "hsl(var(--card) / 0.85)",
          backdropFilter: "blur(24px) saturate(1.6)",
          WebkitBackdropFilter: "blur(24px) saturate(1.6)",
          border: "1px solid hsl(var(--border) / 0.25)",
          boxShadow: "0 8px 32px hsl(var(--foreground) / 0.12), 0 2px 8px hsl(var(--foreground) / 0.06), inset 0 1px 0 hsl(0 0% 100% / 0.04)",
        }}
      >
        {/* Subtle top highlight */}
        <div
          className="absolute top-0 inset-x-0 h-px pointer-events-none"
          style={{ background: "linear-gradient(90deg, transparent 10%, hsl(0 0% 100% / 0.08) 50%, transparent 90%)" }}
        />

        <div className="flex items-center justify-around py-2 px-1">
          {tabs.map((tab) => {
            const isActive = active === tab.id;
            return (
              <motion.button
                key={tab.id}
                onClick={() => handleTabPress(tab.id)}
                className="flex flex-col items-center gap-0.5 min-w-[56px] py-1 relative"
                whileTap={{ scale: 0.75 }}
                transition={{ type: "spring", stiffness: 600, damping: 20 }}
              >
                {/* Active pill background */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="navActivePill"
                      className="absolute inset-0 -mx-1 rounded-2xl"
                      style={{
                        background: "hsl(var(--primary) / 0.1)",
                      }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ type: "spring", stiffness: 400, damping: 28 }}
                    />
                  )}
                </AnimatePresence>

                {/* Active glow dot */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="bottomNavGlow"
                      className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-5 h-[2px] rounded-full"
                      style={{ background: "hsl(var(--primary))", boxShadow: "0 0 8px hsl(var(--primary) / 0.6)" }}
                      initial={{ opacity: 0, scaleX: 0 }}
                      animate={{ opacity: 1, scaleX: 1 }}
                      exit={{ opacity: 0, scaleX: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </AnimatePresence>

                {/* Icon with bounce */}
                <motion.div
                  animate={isActive
                    ? { y: [0, -5, -2, 0], scale: [1, 1.2, 1.08, 1] }
                    : { y: 0, scale: 1 }
                  }
                  transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                  className="relative"
                >
                  {/* Background glow for active icon */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        className="absolute inset-0 -m-3 rounded-full"
                        style={{ background: "hsl(var(--primary) / 0.12)", filter: "blur(8px)" }}
                      />
                    )}
                  </AnimatePresence>

                  <tab.icon
                    size={23}
                    className={`relative transition-colors duration-200 ${isActive ? "text-primary" : "text-muted-foreground"}`}
                    style={isActive ? { filter: "drop-shadow(0 0 6px hsl(var(--primary) / 0.5))" } : undefined}
                    strokeWidth={isActive ? 2.5 : 1.5}
                    fill={isActive && tab.id === "wishlists" ? "currentColor" : "none"}
                  />

                  {/* Message badge */}
                  {tab.id === "messages" && messageBadge > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 15 }}
                      className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center px-1"
                      style={{ boxShadow: "0 0 6px hsl(var(--destructive) / 0.4)" }}
                    >
                      {messageBadge > 99 ? "99+" : messageBadge}
                    </motion.span>
                  )}
                </motion.div>

                {/* Label */}
                <motion.span
                  animate={{
                    color: isActive ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
                    fontWeight: isActive ? 700 : 500,
                  }}
                  transition={{ duration: 0.2 }}
                  className="text-[10px] relative z-10"
                >
                  {tab.label}
                </motion.span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
