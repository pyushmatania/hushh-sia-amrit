import { motion } from "framer-motion";
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
              onClick={() => onChange(tab.id)}
              className="flex flex-col items-center gap-0.5 min-w-[60px] py-0.5 relative"
              whileTap={{ scale: 0.85 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              {isActive && (
                <motion.div
                  layoutId="bottomNavGlow"
                  className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-primary rounded-full glow-sm"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <motion.div
                animate={isActive ? { y: [0, -3, 0] } : { y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="relative"
              >
                <tab.icon
                  size={22}
                  className={`transition-colors duration-200 ${isActive ? "text-primary" : "text-muted-foreground"}`}
                  strokeWidth={isActive ? 2.5 : 1.5}
                  fill={isActive && tab.id === "wishlists" ? "currentColor" : "none"}
                />
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
              <span className={`text-[10px] font-medium transition-colors duration-200 ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                {tab.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
