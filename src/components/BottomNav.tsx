import { motion } from "framer-motion";
import { Home, Search, CalendarDays, Coins, User } from "lucide-react";

const tabs = [
  { id: "home", icon: Home, label: "Explore" },
  { id: "explore", icon: Search, label: "Search" },
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
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border">
      <div className="flex items-center justify-around py-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {tabs.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className="flex flex-col items-center gap-0.5 min-w-[56px] py-1"
            >
              <tab.icon
                size={24}
                className={`transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`}
                strokeWidth={isActive ? 2 : 1.5}
              />
              <span className={`text-[10px] font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
