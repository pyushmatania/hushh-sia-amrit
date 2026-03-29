import { motion, AnimatePresence } from "framer-motion";
import { Search, Heart, MapPin, MessageCircle, User } from "lucide-react";
import { hapticLight, hapticMedium } from "@/lib/haptics";
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
      hapticLight();
    } else {
      hapticMedium();
    }
    onChange(tabId);
  }, [active, onChange]);

  return (
    <div
      className="fixed left-0 right-0 z-40 md:hidden"
      style={{ bottom: 0 }}
    >
      {/* Frosted glass top edge */}
      <div
        className="h-6 pointer-events-none"
        style={{
          background: "linear-gradient(to top, hsl(var(--card) / 0.95), hsl(var(--card) / 0))",
        }}
      />
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 350, damping: 32, delay: 0.06 }}
        className="nav-glass-bar"
        style={{
          background: "hsl(var(--card) / 0.82)",
          backdropFilter: "blur(24px) saturate(1.6)",
          WebkitBackdropFilter: "blur(24px) saturate(1.6)",
          borderTop: "1px solid hsl(var(--border) / 0.5)",
          boxShadow: "0 -4px 24px -4px hsl(var(--foreground) / 0.08), 0 -1px 3px hsl(var(--foreground) / 0.04)",
        }}
      >
        <div className="flex items-center justify-around pt-2 pb-[max(0.65rem,env(safe-area-inset-bottom))] px-2">
          {tabs.map((tab) => {
            const isActive = active === tab.id;
            return (
              <motion.button
                key={tab.id}
                onClick={() => handleTabPress(tab.id)}
                className="flex flex-col items-center gap-[3px] min-w-[52px] py-1 relative"
                whileTap={{ scale: 0.88 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
              >
                {/* Active pill */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="navActivePill"
                      className="absolute -inset-x-1.5 -inset-y-0.5 rounded-2xl"
                      style={{ background: "hsl(var(--primary) / 0.08)" }}
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.85 }}
                      transition={{ type: "spring", stiffness: 450, damping: 28 }}
                    />
                  )}
                </AnimatePresence>

                {/* Active line indicator */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="bottomNavLine"
                      className="absolute -top-[5px] left-1/2 -translate-x-1/2 w-8 h-[2.5px] rounded-full"
                      style={{
                        background: "linear-gradient(90deg, hsl(var(--primary) / 0.3), hsl(var(--primary)), hsl(var(--primary) / 0.3))",
                        boxShadow: "0 0 12px 2px hsl(var(--primary) / 0.35)",
                      }}
                      initial={{ opacity: 0, scaleX: 0 }}
                      animate={{ opacity: 1, scaleX: 1 }}
                      exit={{ opacity: 0, scaleX: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </AnimatePresence>

                <motion.div
                  animate={isActive
                    ? { y: [0, -3, 0], scale: [1, 1.12, 1] }
                    : { y: 0, scale: 1 }
                  }
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className="relative"
                >
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        className="absolute inset-0 -m-2.5 rounded-full"
                        style={{ background: "hsl(var(--primary) / 0.1)", filter: "blur(6px)" }}
                      />
                    )}
                  </AnimatePresence>

                  <tab.icon
                    size={22}
                    className={`relative transition-colors duration-200 ${isActive ? "text-primary" : "text-muted-foreground"}`}
                    style={isActive ? { filter: "drop-shadow(0 0 5px hsl(var(--primary) / 0.45))" } : undefined}
                    strokeWidth={isActive ? 2.5 : 1.6}
                    fill={isActive && tab.id === "wishlists" ? "currentColor" : "none"}
                  />

                  {tab.id === "messages" && messageBadge > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 15 }}
                      className="absolute -top-1.5 -right-2.5 min-w-[15px] h-[15px] rounded-full bg-destructive text-destructive-foreground text-[8px] font-bold flex items-center justify-center px-1"
                      style={{ boxShadow: "0 0 6px hsl(var(--destructive) / 0.4)" }}
                    >
                      {messageBadge > 99 ? "99+" : messageBadge}
                    </motion.span>
                  )}
                </motion.div>

                <motion.span
                  animate={{
                    color: isActive ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
                    fontWeight: isActive ? 700 : 400,
                  }}
                  transition={{ duration: 0.2 }}
                  className="text-[9px] relative z-10 tracking-wide"
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
