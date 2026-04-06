import { motion } from "framer-motion";
import { Compass, Heart, Map, MessageCircle, User } from "lucide-react";
import { hapticLight, hapticMedium } from "@/lib/haptics";
import { useCallback, memo } from "react";

const tabs = [
  { id: "home", icon: Compass, label: "Explore" },
  { id: "wishlists", icon: Heart, label: "Wishlists" },
  { id: "bookings", icon: Map, label: "Trips" },
  { id: "messages", icon: MessageCircle, label: "Messages" },
  { id: "profile", icon: User, label: "Profile" },
];

interface BottomNavProps {
  active: string;
  onChange: (tab: string) => void;
  messageBadge?: number;
}

export default memo(function BottomNav({ active, onChange, messageBadge = 0 }: BottomNavProps) {
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
      {/* Fade edge — no blur, just gradient */}
      <div
        className="h-6 pointer-events-none"
        style={{
          background: "linear-gradient(to top, hsl(var(--card) / 0.95), hsl(var(--card) / 0))",
        }}
      />
      <div
        className="nav-glass-bar"
        style={{
          background: "hsl(var(--card) / 0.92)",
          borderTop: "1px solid hsl(var(--border) / 0.5)",
          boxShadow: "0 -4px 24px -4px hsl(var(--foreground) / 0.08)",
        }}
      >
        <div className="flex items-center justify-around pt-2 pb-[max(0.65rem,env(safe-area-inset-bottom))] px-2">
          {tabs.map((tab) => {
            const isActive = active === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabPress(tab.id)}
                className="flex flex-col items-center gap-[3px] min-w-[52px] py-1 relative active:scale-[0.88] transition-transform"
              >
                {/* Active pill — simple CSS, no AnimatePresence */}
                {isActive && (
                  <div
                    className="absolute -inset-x-1.5 -inset-y-0.5 rounded-2xl transition-opacity duration-200"
                    style={{ background: "hsl(var(--primary) / 0.08)" }}
                  />
                )}

                {/* Active line indicator — CSS only */}
                {isActive && (
                  <div
                    className="absolute -top-[5px] left-1/2 -translate-x-1/2 w-8 h-[2.5px] rounded-full"
                    style={{
                      background: "hsl(var(--primary))",
                    }}
                  />
                )}

                <div className="relative">
                  <tab.icon
                    size={22}
                    className={`relative transition-colors duration-200 ${isActive ? "text-primary" : "text-muted-foreground"}`}
                    strokeWidth={isActive ? 2.5 : 1.6}
                    fill={isActive && tab.id === "wishlists" ? "currentColor" : "none"}
                  />

                  {tab.id === "messages" && messageBadge > 0 && (
                    <span
                      className="absolute -top-1.5 -right-2.5 min-w-[15px] h-[15px] rounded-full bg-destructive text-destructive-foreground text-[8px] font-bold flex items-center justify-center px-1"
                      style={{ boxShadow: "0 0 6px hsl(var(--destructive) / 0.4)" }}
                    >
                      {messageBadge > 99 ? "99+" : messageBadge}
                    </span>
                  )}
                </div>

                <span
                  className={`text-[9px] relative z-10 tracking-wide transition-all duration-200 ${isActive ? "text-primary font-bold" : "text-muted-foreground font-normal"}`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
});
