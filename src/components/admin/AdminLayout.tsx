import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Building2, CalendarCheck, Users, BarChart3,
  Sparkles, Tag, Megaphone, Ticket, ShoppingCart, LogOut,
  ChevronLeft, ChevronRight, Shield, Menu, X, FileSpreadsheet,
  Bot, Bell, ScrollText, Wallet, Zap, Trophy, Search, UserCheck, Package,
  Home, Sun, Moon, Send
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import CommandPalette from "./CommandPalette";
import FloatingChecklist from "./FloatingChecklist";
import { useAuth } from "@/hooks/use-auth";
import { useAdmin } from "@/hooks/use-admin";
import { useTheme } from "@/hooks/use-theme";

export type AdminPage =
  | "dashboard" | "catalog" | "properties" | "bookings" | "users" | "clients"
  | "analytics" | "curations" | "tags" | "campaigns"
  | "coupons" | "orders" | "exports" | "ai" | "alerts" | "audit"
  | "earnings" | "pricing" | "achievements" | "loyalty"
  | "calendar" | "requests" | "history" | "inventory" | "staff-mgmt" | "budget"
  | "checkin" | "reports" | "notifications" | "settings" | "homepage" | "telegram";

interface AdminLayoutProps {
  activePage: AdminPage;
  onNavigate: (page: AdminPage) => void;
  children: React.ReactNode;
  breadcrumb?: { page: AdminPage; label: string }[];
}

const navSections: { title: string; items: { id: AdminPage; label: string; icon: typeof LayoutDashboard; color: string; activeGlow: string; adminOnly?: boolean }[] }[] = [
  {
    title: "Overview",
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400", activeGlow: "shadow-indigo-200/60 dark:shadow-indigo-500/20" },
      { id: "ai", label: "AI Assistant", icon: Bot, color: "bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400", activeGlow: "shadow-violet-200/60 dark:shadow-violet-500/20" },
      { id: "alerts", label: "Intelligence", icon: Bell, color: "bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400", activeGlow: "shadow-rose-200/60 dark:shadow-rose-500/20" },
    ]
  },
  {
    title: "Operations",
    items: [
      { id: "calendar", label: "Calendar", icon: CalendarCheck, color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400", activeGlow: "shadow-emerald-200/60" },
      { id: "bookings", label: "Booking Hub", icon: CalendarCheck, color: "bg-sky-100 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400", activeGlow: "shadow-sky-200/60" },
      { id: "checkin", label: "Check-in", icon: UserCheck, color: "bg-teal-100 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400", activeGlow: "shadow-teal-200/60" },
      { id: "orders", label: "Live Orders", icon: ShoppingCart, color: "bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400", activeGlow: "shadow-orange-200/60" },
      { id: "inventory", label: "Inventory", icon: Package, color: "bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400", activeGlow: "shadow-amber-200/60" },
    ]
  },
  {
    title: "People",
    items: [
      { id: "clients", label: "Clients", icon: UserCheck, color: "bg-pink-100 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400", activeGlow: "shadow-pink-200/60" },
      { id: "users", label: "Users CRM", icon: Users, color: "bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-500/20 dark:text-fuchsia-400", activeGlow: "shadow-fuchsia-200/60", adminOnly: true },
      { id: "staff-mgmt", label: "Staff Mgmt", icon: UserCheck, color: "bg-cyan-100 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400", activeGlow: "shadow-cyan-200/60" },
    ]
  },
  {
    title: "Business",
    items: [
      { id: "catalog", label: "Catalog", icon: Package, color: "bg-lime-100 text-lime-600 dark:bg-lime-500/20 dark:text-lime-400", activeGlow: "shadow-lime-200/60" },
      { id: "analytics", label: "Analytics", icon: BarChart3, color: "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400", activeGlow: "shadow-blue-200/60" },
      { id: "earnings", label: "Finance Hub", icon: Wallet, color: "bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400", activeGlow: "shadow-green-200/60" },
      { id: "history", label: "History", icon: ScrollText, color: "bg-slate-100 text-slate-600 dark:bg-slate-500/20 dark:text-slate-400", activeGlow: "shadow-slate-200/60" },
    ]
  },
  {
    title: "Marketing",
    items: [
      { id: "homepage", label: "Homepage", icon: Home, color: "bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400", activeGlow: "shadow-violet-200/60 dark:shadow-violet-500/20" },
      { id: "campaigns", label: "Campaigns", icon: Megaphone, color: "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400", activeGlow: "shadow-red-200/60" },
      { id: "coupons", label: "Coupons", icon: Ticket, color: "bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400", activeGlow: "shadow-purple-200/60" },
      { id: "curations", label: "Curations", icon: Sparkles, color: "bg-cyan-100 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400", activeGlow: "shadow-cyan-200/60" },
    ]
  },
  {
    title: "More",
    items: [
      { id: "notifications", label: "Notifications", icon: Bell, color: "bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400", activeGlow: "shadow-rose-200/60" },
      { id: "reports", label: "Reports", icon: FileSpreadsheet, color: "bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400", activeGlow: "shadow-violet-200/60" },
      { id: "achievements", label: "Achievements", icon: Trophy, color: "bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400", activeGlow: "shadow-amber-200/60" },
      { id: "loyalty", label: "Loyalty", icon: Sparkles, color: "bg-pink-100 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400", activeGlow: "shadow-pink-200/60" },
      { id: "exports", label: "Exports", icon: FileSpreadsheet, color: "bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400", activeGlow: "shadow-gray-200/60" },
      { id: "settings", label: "Settings", icon: Search, color: "bg-zinc-100 text-zinc-600 dark:bg-zinc-500/20 dark:text-zinc-400", activeGlow: "shadow-zinc-200/60" },
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

export default function AdminLayout({ activePage, onNavigate, children, breadcrumb }: AdminLayoutProps) {
  const { signOut, user } = useAuth();
  const { isAdmin } = useAdmin();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeLabel = navSections.flatMap(s => s.items).find(i => i.id === activePage)?.label || "Dashboard";

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => {
    const show = !collapsed || mobile;
    return (
      <div className={`flex flex-col h-full bg-white/80 dark:bg-zinc-900/90 backdrop-blur-xl ${
        mobile ? "w-72" : collapsed ? "w-[68px]" : "w-64"
      } transition-all duration-300 border-r border-zinc-100/80 dark:border-zinc-800/80`}>

        {/* Profile Header — logo + user + quick actions */}
        <div className="p-3 space-y-3">
          {/* Brand + User Row */}
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: [0, -8, 8, 0], scale: 1.05 }}
              transition={{ duration: 0.5 }}
              className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-400 via-violet-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-200/50 dark:shadow-indigo-900/40"
            >
              <span className="text-white font-bold text-sm">H</span>
            </motion.div>
            {show && (
              <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="flex-1 min-w-0">
                <p className="font-bold text-[15px] text-foreground leading-tight">Hushh</p>
                <p className="text-[10px] text-muted-foreground -mt-0.5 flex items-center gap-1">
                  Admin Panel
                  <span className="inline-flex w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </p>
              </motion.div>
            )}
          </div>

          {/* User card with role + quick nav */}
          {show && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-gradient-to-br from-indigo-50/80 via-violet-50/40 to-purple-50/30 dark:from-indigo-500/10 dark:via-violet-500/5 dark:to-purple-500/5 border border-indigo-100/60 dark:border-indigo-500/15 p-3"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-xs font-bold text-white shadow-md shadow-indigo-200/40 dark:shadow-indigo-900/30">
                  {(user?.email?.[0] || "A").toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-foreground truncate">{user?.email?.split("@")[0] || "Manager"}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${
                      isAdmin
                        ? "bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400"
                        : "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400"
                    }`}>
                      <Shield size={8} />
                      {isAdmin ? "Super Admin" : "Manager"}
                    </span>
                    <span className="inline-flex w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  </div>
                </div>
              </div>
              {/* Quick actions row */}
              <div className="flex items-center gap-1.5 mt-2.5 pt-2.5 border-t border-indigo-100/40 dark:border-indigo-500/10">
                <button
                  onClick={() => navigate("/")}
                  className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg bg-white/70 dark:bg-zinc-800/60 border border-zinc-200/50 dark:border-zinc-700/50 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-white dark:hover:bg-zinc-800 transition-all group"
                >
                  <Home size={12} className="group-hover:text-indigo-500 transition-colors" />
                  App
                </button>
                <motion.button
                  whileTap={{ scale: 0.9, rotate: resolvedTheme === "dark" ? -30 : 30 }}
                  onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                  className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/70 dark:bg-zinc-800/60 border border-zinc-200/50 dark:border-zinc-700/50 hover:bg-white dark:hover:bg-zinc-800 transition-all"
                >
                  {resolvedTheme === "dark" ? <Sun size={13} className="text-amber-400" /> : <Moon size={13} className="text-indigo-500" />}
                </motion.button>
                <button
                  onClick={signOut}
                  className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/70 dark:bg-zinc-800/60 border border-zinc-200/50 dark:border-zinc-700/50 text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all"
                >
                  <LogOut size={13} />
                </button>
              </div>
            </motion.div>
          )}

          {/* Collapsed user icon */}
          {!show && (
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-[10px] font-bold text-white">
                {(user?.email?.[0] || "A").toUpperCase()}
              </div>
              <button onClick={() => navigate("/")} className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-muted-foreground hover:text-foreground transition">
                <Home size={13} />
              </button>
            </div>
          )}

          {/* Quick Search */}
          {show && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-50/80 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-700/50 text-muted-foreground text-[11px] cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">
              <Search size={12} />
              <span>Search...</span>
              <kbd className="ml-auto text-[9px] px-1.5 py-0.5 rounded bg-zinc-200/70 dark:bg-zinc-700 text-zinc-500 font-mono">⌘K</kbd>
            </div>
          )}
        </div>

        {/* Nav Sections */}
        <nav className="flex-1 py-1 px-2.5 overflow-y-auto space-y-3 scrollbar-thin">
          {navSections.map(section => {
            const visibleItems = section.items.filter(n => !n.adminOnly || isAdmin);
            if (visibleItems.length === 0) return null;
            return (
              <div key={section.title}>
                {show && (
                  <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider px-2 mb-1">{section.title}</p>
                )}
                {!show && <div className="w-6 mx-auto my-1 border-t border-zinc-200 dark:border-zinc-800" />}
                <div className="space-y-0.5">
                  {visibleItems.map(item => {
                    const active = activePage === item.id;
                    return (
                      <motion.button
                        key={item.id}
                        whileHover={{ x: show ? 2 : 0 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => { onNavigate(item.id); if (mobile) setMobileOpen(false); }}
                        className={`relative w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[13px] font-medium transition-all ${
                          active
                            ? `bg-gradient-to-r from-indigo-50/80 to-violet-50/50 dark:from-indigo-500/10 dark:to-violet-500/5 text-indigo-600 dark:text-indigo-400 shadow-sm ${item.activeGlow}`
                            : "text-muted-foreground hover:text-foreground hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
                        }`}
                      >
                        {active && (
                          <motion.div
                            layoutId={mobile ? "sidebar-active-m" : "sidebar-active"}
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-gradient-to-b from-indigo-500 to-violet-500"
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          />
                        )}
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all ${active ? item.color : "bg-zinc-100 dark:bg-zinc-800 text-muted-foreground"}`}>
                          <item.icon size={14} />
                        </div>
                        {show && <span className="truncate">{item.label}</span>}
                        {item.id === "orders" && show && (
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

        {/* Bottom — Live clock */}
        <div className="px-3 py-2.5 border-t border-zinc-100/80 dark:border-zinc-800/80 flex items-center justify-center">
          <LiveClock />
        </div>
      </div>
    );
  };

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

          {/* Breadcrumb - shows on both mobile and desktop */}
          <div className="flex items-center gap-1.5 flex-1 min-w-0 overflow-x-auto hide-scrollbar">
            <button onClick={() => onNavigate("dashboard")} className="text-xs text-muted-foreground hover:text-foreground transition shrink-0">
              Admin
            </button>
            {breadcrumb && breadcrumb.length > 0 ? (
              breadcrumb.map((crumb, i) => (
                <span key={crumb.page} className="flex items-center gap-1.5 shrink-0">
                  <ChevronRight size={10} className="text-muted-foreground/50" />
                  {i < breadcrumb.length - 1 ? (
                    <button onClick={() => onNavigate(crumb.page)} className="text-xs text-muted-foreground hover:text-foreground transition">
                      {crumb.label}
                    </button>
                  ) : (
                    <motion.span
                      key={crumb.label}
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs font-semibold text-foreground"
                    >
                      {crumb.label}
                    </motion.span>
                  )}
                </span>
              ))
            ) : (
              <>
                <ChevronRight size={10} className="text-muted-foreground/50 shrink-0" />
                <motion.span
                  key={activeLabel}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs font-semibold text-foreground shrink-0"
                >
                  {activeLabel}
                </motion.span>
              </>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <LiveClock />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9, rotate: resolvedTheme === "dark" ? -30 : 30 }}
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="relative w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={resolvedTheme}
                  initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.2 }}
                >
                  {resolvedTheme === "dark" ? (
                    <Sun size={15} className="text-amber-400" />
                  ) : (
                    <Moon size={15} className="text-indigo-500" />
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.button>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold">Live</span>
            </div>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 24, scale: 0.98, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -16, scale: 0.99, filter: "blur(2px)" }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border-t border-zinc-200/80 dark:border-zinc-800/80 px-2 py-1.5 safe-area-bottom">
        <div className="flex items-center justify-around">
          {[
            { id: "dashboard" as AdminPage, icon: LayoutDashboard, label: "Home" },
            { id: "orders" as AdminPage, icon: ShoppingCart, label: "Orders" },
            { id: "checkin" as AdminPage, icon: UserCheck, label: "Check-in" },
            { id: "notifications" as AdminPage, icon: Bell, label: "Alerts" },
            { id: "settings" as AdminPage, icon: Menu, label: "More" },
          ].map(tab => {
            const active = activePage === tab.id;
            return (
              <motion.button
                key={tab.id}
                whileTap={{ scale: 0.9 }}
                onClick={() => onNavigate(tab.id)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <tab.icon size={20} strokeWidth={active ? 2.5 : 1.5} />
                <span className={`text-[9px] font-medium ${active ? "font-bold" : ""}`}>{tab.label}</span>
                {active && <motion.div layoutId="mobile-tab-dot" className="w-1 h-1 rounded-full bg-primary" />}
              </motion.button>
            );
          })}
        </div>
      </div>

      <FloatingChecklist />
    </div>
  );
}
