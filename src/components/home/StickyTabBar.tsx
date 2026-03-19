import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Home } from "lucide-react";

const tabs = [
  { id: "home", label: "Home", isIcon: true },
  { id: "dining", label: "Dining" },
  { id: "experiences", label: "Experiences" },
  { id: "sports", label: "Sports" },
  { id: "events", label: "Events" },
  { id: "packages", label: "Packages" },
];

interface StickyTabBarProps {
  active: string;
  onChange: (id: string) => void;
}

export default function StickyTabBar({ active, onChange }: StickyTabBarProps) {
  return (
    <div
      className="sticky top-0 z-30 backdrop-blur-xl"
      style={{
        background: "rgba(12,11,29,0.85)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="flex overflow-x-auto hide-scrollbar px-2">
        {tabs.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className="relative flex items-center justify-center px-4 py-3 shrink-0"
            >
              {tab.isIcon ? (
                <Home
                  size={20}
                  className={isActive ? "text-foreground" : "text-foreground/45"}
                />
              ) : (
                <span
                  className={`text-sm font-medium whitespace-nowrap transition-colors ${
                    isActive ? "text-foreground" : "text-foreground/45"
                  }`}
                >
                  {tab.label}
                </span>
              )}
              {isActive && (
                <motion.div
                  layoutId="districtTabUnderline"
                  className="absolute bottom-0 left-3 right-3 h-[3px] bg-primary rounded-full"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
