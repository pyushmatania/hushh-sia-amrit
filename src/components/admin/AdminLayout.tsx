import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Building2, CalendarCheck, Users, BarChart3,
  Sparkles, Tag, Megaphone, Ticket, ShoppingCart, LogOut,
  ChevronLeft, ChevronRight, Shield, Menu, X, FileSpreadsheet,
  Bot, Bell, ScrollText, Wallet, Zap, Trophy, Search, UserCheck, Package,
  Home, Sun, Moon
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import CommandPalette from "./CommandPalette";
import FloatingChecklist from "./FloatingChecklist";
import { useAuth } from "@/hooks/use-auth";
import { useAdmin } from "@/hooks/use-admin";

export type AdminPage =
  | "dashboard" | "catalog" | "properties" | "bookings" | "users" | "clients"
  | "analytics" | "curations" | "tags" | "campaigns"
  | "coupons" | "orders" | "exports" | "ai" | "alerts" | "audit"
  | "earnings" | "pricing" | "achievements" | "loyalty"
  | "calendar" | "requests" | "history" | "inventory";

interface AdminLayoutProps {
  activePage: AdminPage;
  onNavigate: (page: AdminPage) => void;
  children: React.ReactNode;
}

const navSections: { title: string; items: { id: AdminPage; label: string; icon: typeof LayoutDashboard; color: string; activeGlow: string; adminOnly?: boolean }[] }[] = [
  {
    title: "Overview",
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400", activeGlow: "shadow-indigo-200/60 dark:shadow-indigo-500/20" },
      { id: "ai", label: "AI Assistant", icon: Bot, color: "bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400", activeGlow: "shadow-violet-200/60 dark:shadow-violet-500/20" },
      { id: "alerts", label: "Smart Alerts", icon: Bell, color: "bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400", activeGlow: "shadow-rose-200/60 dark:shadow-rose-500/20" },
    ]
  },
  {
    title: "Operations",
    items: [
      { id: "calendar", label: "Calendar", icon: CalendarCheck, color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400", activeGlow: "shadow-emerald-200/60" },
      { id: "requests", label: "Requests", icon: CalendarCheck, color: "bg-teal-100 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400", activeGlow: "shadow-teal-200/60" },
      { id: "bookings", label: "Bookings", icon: CalendarCheck, color: "bg-sky-100 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400", activeGlow: "shadow-sky-200/60" },
      { id: "orders", label: "Live Orders", icon: ShoppingCart, color: "bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400", activeGlow: "shadow-orange-200/60" },
      { id: "inventory", label: "Inventory", icon: Package, color: "bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400", activeGlow: "shadow-amber-200/60" },
    ]
  },
  {
    title: "People",
    items: [
      { id: "clients", label: "Clients", icon: UserCheck, color: "bg-pink-100 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400", activeGlow: "shadow-pink-200/60" },
      { id: "users", label: "Users CRM", icon: Users, color: "bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-500/20 dark:text-fuchsia-400", activeGlow: "shadow-fuchsia-200/60", adminOnly: true },
    ]
  },
  {
    title: "Business",
    items: [
      { id: "catalog", label: "Catalog", icon: Package, color: "bg-lime-100 text-lime-600 dark:bg-lime-500/20 dark:text-lime-400", activeGlow: "shadow-lime-200/60" },
      { id: "analytics", label: "Analytics", icon: BarChart3, color: "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400", activeGlow: "shadow-blue-200/60" },
      { id: "earnings", label: "Earnings", icon: Wallet, color: "bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400", activeGlow: "shadow-green-200/60" },
      { id: "pricing", label: "Pricing", icon: Zap, color: "bg-yellow-100 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400", activeGlow: "shadow-yellow-200/60" },
      { id: "history", label: "History", icon: ScrollText, color: "bg-slate-100 text-slate-600 dark:bg-slate-500/20 dark:text-slate-400", activeGlow: "shadow-slate-200/60" },
    ]
  },
  {
    title: "Marketing",
    items: [
      { id: "campaigns", label: "Campaigns", icon: Megaphone, color: "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400", activeGlow: "shadow-red-200/60" },
      { id: "coupons", label: "Coupons", icon: Ticket, color: "bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400", activeGlow: "shadow-purple-200/60" },
      { id: "curations", label: "Curations", icon: Sparkles, color: "bg-cyan-100 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400", activeGlow: "shadow-cyan-200/60" },
      { id: "tags", label: "Tags", icon: Tag, color: "bg-stone-100 text-stone-600 dark:bg-stone-500/20 dark:text-stone-400", activeGlow: "shadow-stone-200/60" },
    ]
  },
  {
    title: "More",
    items: [
      { id: "achievements", label: "Achievements", icon: Trophy, color: "bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400", activeGlow: "shadow-amber-200/60" },
      { id: "loyalty", label: "Loyalty", icon: Sparkles, color: "bg-pink-100 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400", activeGlow: "shadow-pink-200/60" },
      { id: "exports", label: "Exports", icon: FileSpreadsheet, color: "bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400", activeGlow: "shadow-gray-200/60" },
      { id: "audit", label: "Audit Trail", icon: ScrollText, color: "bg-neutral-100 text-neutral-600 dark:bg-neutral-500/20 dark:text-neutral-400", activeGlow: "shadow-neutral-200/60", adminOnly: true },
    ]
  },
];

function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);
  return (
    <span className="text-[11px] font-mono text-zinc-400 tabular-nums">
      {time.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
    </span>
  );
}

export default function AdminLayout({ activePage, onNavigate, children }: AdminLayoutProps) {
  const { signOut, user } = useAuth();
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeLabel = navSections.flatMap(s => s.items).find(i => i.id === activePage)?.label || "Dashboard";

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`flex flex-col h-full bg-white/80 dark:bg-zinc-900/90 backdrop-blur-xl ${
      mobile ? "w-72" : collapsed ? "w-[68px]" : "w-60"
    } transition-all duration-300 border-r border-zinc-100/80 dark:border-zinc-800/80`}>
      {/* Logo */}
      <div className="px-4 py-5 flex items-center gap-3">
        <motion.div
          whileHover={{ rotate: [0, -8, 8, 0], scale: 1.05 }}
          transition={{ duration: 0.5 }}
          className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-400 via-violet-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-200/50 dark:shadow-indigo-900/40"
        >
          <span className="text-white font-bold text-sm">H</span>
        </motion.div>
        {(!collapsed || mobile) && (
          <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}>
            <p className="font-bold text-[15px] text-zinc-800 dark:text-zinc-100">Hushh</p>
            <p className="text-[10px] text-zinc-400 -mt-0.5 flex items-center gap-1">
              Admin Panel
              <span className="inline-flex w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </p>
          </motion.div>
        )}
      </div>

      {/* Quick Search Hint */}
      {(!collapsed || mobile) && (
        <div className="px-3 mb-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-700/50 text-zinc-400 text-[11px] cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">
            <Search size={12} />
            <span>Search...</span>
            <kbd className="ml-auto text-[9px] px-1.5 py-0.5 rounded bg-zinc-200/70 dark:bg-zinc-700 text-zinc-500 font-mono">⌘K</kbd>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 py-2 px-2.5 overflow-y-auto space-y-4 scrollbar-thin">
        {navSections.map(section => {
          const visibleItems = section.items.filter(n => !n.adminOnly || isAdmin);
          if (visibleItems.length === 0) return null;
          return (
            <div key={section.title}>
              {(!collapsed || mobile) && (
                <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider px-2 mb-1.5">{section.title}</p>
              )}
              <div className="space-y-0.5">
                {visibleItems.map(item => {
                  const active = activePage === item.id;
                  return (
                    <motion.button
                      key={item.id}
                      whileHover={{ x: 2 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => { onNavigate(item.id); if (mobile) setMobileOpen(false); }}
                      className={`relative w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[13px] font-medium transition-all ${
                        active
                          ? `bg-gradient-to-r from-indigo-50/80 to-violet-50/50 dark:from-indigo-500/10 dark:to-violet-500/5 text-indigo-600 dark:text-indigo-400 shadow-sm ${item.activeGlow}`
                          : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
                      }`}
                    >
                      {active && (
                        <motion.div
                          layoutId="sidebar-active"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-gradient-to-b from-indigo-500 to-violet-500"
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      )}
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all ${active ? item.color : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"}`}>
                        <item.icon size={14} />
                      </div>
                      {(!collapsed || mobile) && <span className="truncate">{item.label}</span>}
                      {item.id === "orders" && (!collapsed || mobile) && (
                        <span className="ml-auto w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-zinc-100/80 dark:border-zinc-800/80 space-y-1">
        {(!collapsed || mobile) && (
          <div className="px-2.5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-50/80 to-violet-50/60 dark:from-indigo-500/5 dark:to-violet-500/5 border border-indigo-100/50 dark:border-indigo-500/10 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-[10px] font-bold text-white">
                {(user?.email?.[0] || "A").toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-200 truncate">{user?.email?.split("@")[0]}</p>
                <p className="text-[10px] text-zinc-400 flex items-center gap-1">
                  {isAdmin ? "Super Admin" : "Manager"}
                  <span className="inline-flex w-1 h-1 rounded-full bg-emerald-400" />
                </p>
              </div>
            </div>
          </div>
        )}
        <button
          onClick={() => navigate("/")}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[13px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition group"
        >
          <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10 transition"><Home size={14} /></div>
          {(!collapsed || mobile) && <span>Back to App</span>}
        </button>
        <button
          onClick={signOut}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[13px] text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition group"
        >
          <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center group-hover:shadow-sm group-hover:shadow-rose-200/50 transition"><LogOut size={14} /></div>
          {(!collapsed || mobile) && <span>Sign out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex bg-gradient-to-br from-zinc-50 via-white to-zinc-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 overflow-hidden">
      <CommandPalette onNavigate={onNavigate} />
      <div className="hidden md:flex relative">
        <Sidebar />
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-8 z-10 w-6 h-6 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center hover:bg-zinc-50 transition shadow-sm"
        >
          {collapsed ? <ChevronRight size={12} className="text-zinc-400" /> : <ChevronLeft size={12} className="text-zinc-400" />}
        </motion.button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: -288 }} animate={{ x: 0 }} exit={{ x: -288 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 z-50 md:hidden shadow-2xl"
            >
              <Sidebar mobile />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center gap-3 px-4 py-3 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border-b border-zinc-100/80 dark:border-zinc-800/80">
          <button onClick={() => setMobileOpen(true)} className="md:hidden p-1.5 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800">
            <Menu size={20} className="text-zinc-600 dark:text-zinc-300" />
          </button>
          <div className="md:hidden flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center">
              <span className="text-white text-xs font-bold">H</span>
            </div>
          </div>

          {/* Breadcrumb - desktop */}
          <div className="hidden md:flex items-center gap-2 flex-1">
            <span className="text-sm text-zinc-400">Admin</span>
            <ChevronRight size={12} className="text-zinc-300" />
            <motion.span
              key={activeLabel}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm font-semibold text-zinc-700 dark:text-zinc-200"
            >
              {activeLabel}
            </motion.span>
          </div>

          <div className="flex-1 md:hidden" />

          {/* Right side */}
          <div className="flex items-center gap-3">
            <LiveClock />
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold">Live</span>
            </div>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <FloatingChecklist />
    </div>
  );
}
