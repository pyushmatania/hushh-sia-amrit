import { motion } from "framer-motion";
import { Home, Search, CalendarDays, Coins, User } from "lucide-react";

const tabs = [
  { id: "home", icon: Home, label: "Home" },
  { id: "explore", icon: Search, label: "Explore" },
  { id: "bookings", icon: CalendarDays, label: "Bookings" },
  { id: "wallet", icon: Coins, label: "Wallet" },
  { id: "profile", icon: User, label: "Profile" },
];

interface BottomNavProps {
  active: string;
  onChange: (tab: string) => void;
}

export default function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 glass-surface border-t border-border/50">
      <div className="flex items-center justify-around py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {tabs.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className="flex flex-col items-center gap-0.5 min-w-[56px] py-1 relative"
            >
              <motion.div
                animate={isActive ? { scale: [1, 1.2, 1] } : {}}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                <tab.icon
                  size={22}
                  className={isActive ? "text-primary" : "text-muted-foreground"}
                  strokeWidth={isActive ? 2.5 : 1.5}
                />
              </motion.div>
              {isActive && (
                <motion.span
                  className="text-[10px] font-semibold text-primary"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {tab.label}
                </motion.span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
