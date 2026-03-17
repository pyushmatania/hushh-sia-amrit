import { motion } from "framer-motion";
import { Search, Heart, MapPin, MessageCircle, User } from "lucide-react";

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
}

export default function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border">
      <div className="flex items-center justify-around pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {tabs.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className="flex flex-col items-center gap-0.5 min-w-[60px] py-0.5"
            >
              <tab.icon
                size={22}
                className={`transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`}
                strokeWidth={isActive ? 2.5 : 1.5}
                fill={isActive && tab.id === "wishlists" ? "currentColor" : "none"}
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
