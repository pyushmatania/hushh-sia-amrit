import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChefHat, ClipboardList, Package, LogOut, Menu, X,
  ShoppingCart, CalendarCheck, CheckSquare, Clock, CalendarOff, Wallet
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export type StaffPage = "orders" | "checkin" | "tasks" | "inventory" | "attendance" | "leaves" | "salary";

interface StaffLayoutProps {
  activePage: StaffPage;
  onNavigate: (page: StaffPage) => void;
  children: React.ReactNode;
}

const tabs: { id: StaffPage; label: string; icon: typeof ChefHat }[] = [
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "checkin", label: "Check-In", icon: CalendarCheck },
  { id: "tasks", label: "Tasks", icon: CheckSquare },
  { id: "attendance", label: "Clock", icon: Clock },
  { id: "leaves", label: "Leave", icon: CalendarOff },
  { id: "salary", label: "Pay", icon: Wallet },
  { id: "inventory", label: "Stock", icon: Package },
];

export default function StaffLayout({ activePage, onNavigate, children }: StaffLayoutProps) {
  const { signOut, user } = useAuth();

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/80 backdrop-blur-lg">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
            <ChefHat size={16} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-sm text-foreground">Hushh Staff</p>
            <p className="text-[10px] text-muted-foreground">{user?.email?.split("@")[0]}</p>
          </div>
        </div>
        <button onClick={signOut} className="p-2 rounded-lg hover:bg-secondary transition">
          <LogOut size={16} className="text-muted-foreground" />
        </button>
      </div>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-4">
        {children}
      </main>

      {/* Bottom tabs — scrollable for 7 tabs */}
      <div className="border-t border-border bg-card/80 backdrop-blur-lg px-1 py-1.5 flex overflow-x-auto no-scrollbar">
        {tabs.map(tab => {
          const active = activePage === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`flex-shrink-0 flex flex-col items-center gap-0.5 py-1.5 px-2.5 rounded-xl transition ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <tab.icon size={16} />
              <span className="text-[9px] font-medium">{tab.label}</span>
              {active && <motion.div layoutId="staff-tab" className="w-3 h-0.5 rounded-full bg-primary" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
