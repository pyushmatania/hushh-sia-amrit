import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Building2, CalendarCheck, Users, BarChart3,
  Sparkles, Tag, Megaphone, Ticket, ShoppingCart, LogOut,
  ChevronLeft, ChevronRight, Shield, Menu, X, FileSpreadsheet,
  Bot, Bell, ScrollText, Wallet, Zap, Trophy, Search
} from "lucide-react";
import CommandPalette from "./CommandPalette";
import { useAuth } from "@/hooks/use-auth";
import { useAdmin } from "@/hooks/use-admin";

export type AdminPage =
  | "dashboard" | "properties" | "bookings" | "users"
  | "analytics" | "curations" | "tags" | "campaigns"
  | "coupons" | "orders" | "exports" | "ai" | "alerts" | "audit"
  | "earnings" | "pricing" | "achievements" | "loyalty";

interface AdminLayoutProps {
  activePage: AdminPage;
  onNavigate: (page: AdminPage) => void;
  children: React.ReactNode;
}

const navItems: { id: AdminPage; label: string; icon: typeof LayoutDashboard; adminOnly?: boolean }[] = [
  { id: "dashboard", label: "Command Center", icon: LayoutDashboard },
  { id: "ai", label: "AI Assistant", icon: Bot },
  { id: "alerts", label: "Smart Alerts", icon: Bell },
  { id: "pricing", label: "Dynamic Pricing", icon: Zap },
  { id: "properties", label: "Properties", icon: Building2 },
  { id: "bookings", label: "Bookings", icon: CalendarCheck },
  { id: "users", label: "Users (CRM)", icon: Users, adminOnly: true },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "earnings", label: "Earnings", icon: Wallet },
  { id: "curations", label: "Curations", icon: Sparkles },
  { id: "campaigns", label: "Campaigns", icon: Megaphone },
  { id: "coupons", label: "Coupons", icon: Ticket },
  { id: "tags", label: "Tags", icon: Tag },
  { id: "orders", label: "Live Orders", icon: ShoppingCart },
  { id: "exports", label: "Exports", icon: FileSpreadsheet },
  { id: "achievements", label: "Achievements", icon: Trophy },
  { id: "audit", label: "Audit Trail", icon: ScrollText, adminOnly: true },
];

export default function AdminLayout({ activePage, onNavigate, children }: AdminLayoutProps) {
  const { signOut, user } = useAuth();
  const { isAdmin } = useAdmin();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const filteredNav = navItems.filter(n => !n.adminOnly || isAdmin);

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`flex flex-col h-full bg-card/95 backdrop-blur-xl border-r border-border ${
      mobile ? "w-72" : collapsed ? "w-[72px]" : "w-64"
    } transition-all duration-300`}>
      <div className="px-4 py-5 flex items-center gap-3 border-b border-border">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
          <Shield size={18} className="text-primary-foreground" />
        </div>
        {(!collapsed || mobile) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="font-bold text-sm text-foreground">Hushh Admin</p>
            <p className="text-[10px] text-muted-foreground">Command Center</p>
          </motion.div>
        )}
      </div>

      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
        {filteredNav.map(item => {
          const active = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => { onNavigate(item.id); if (mobile) setMobileOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <item.icon size={18} className={active ? "text-primary" : ""} />
              {(!collapsed || mobile) && <span>{item.label}</span>}
              {active && (!collapsed || mobile) && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border space-y-2">
        {(!collapsed || mobile) && (
          <div className="px-3 py-2">
            <p className="text-xs font-medium text-foreground truncate">{user?.email}</p>
            <p className="text-[10px] text-muted-foreground">{isAdmin ? "Super Admin" : "Manager"}</p>
          </div>
        )}
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-destructive hover:bg-destructive/10 transition"
        >
          <LogOut size={18} />
          {(!collapsed || mobile) && <span>Sign out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      <CommandPalette onNavigate={onNavigate} />
      <div className="hidden md:flex relative">
        <Sidebar />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-8 z-10 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center hover:bg-secondary transition"
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: -288 }} animate={{ x: 0 }} exit={{ x: -288 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 z-50 md:hidden"
            >
              <Sidebar mobile />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-card/80 backdrop-blur-lg">
          <button onClick={() => setMobileOpen(true)} className="p-1.5 rounded-lg hover:bg-secondary">
            <Menu size={20} className="text-foreground" />
          </button>
          <div className="flex-1 flex items-center gap-2">
            <Shield size={16} className="text-primary" />
            <span className="font-bold text-sm text-foreground">Hushh Admin</span>
          </div>
          <kbd className="hidden md:inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-secondary text-[10px] text-muted-foreground font-mono border border-border">
            <Search size={10} /> ⌘K
          </kbd>
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
