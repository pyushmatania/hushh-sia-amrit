import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Building2, CalendarCheck, Users, BarChart3,
  Sparkles, Tag, Megaphone, Ticket, ShoppingCart, LogOut,
  ChevronLeft, ChevronRight, Shield, Menu, X, FileSpreadsheet,
  Bot, Bell, ScrollText, Wallet, Zap, Trophy, Search, UserCheck, Package,
  Home
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

const navSections: { title: string; items: { id: AdminPage; label: string; icon: typeof LayoutDashboard; color: string; adminOnly?: boolean }[] }[] = [
  {
    title: "Overview",
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, color: "bg-indigo-100 text-indigo-600" },
      { id: "ai", label: "AI Assistant", icon: Bot, color: "bg-violet-100 text-violet-600" },
      { id: "alerts", label: "Smart Alerts", icon: Bell, color: "bg-rose-100 text-rose-600" },
    ]
  },
  {
    title: "Operations",
    items: [
      { id: "calendar", label: "Calendar", icon: CalendarCheck, color: "bg-emerald-100 text-emerald-600" },
      { id: "requests", label: "Requests", icon: CalendarCheck, color: "bg-teal-100 text-teal-600" },
      { id: "bookings", label: "Bookings", icon: CalendarCheck, color: "bg-sky-100 text-sky-600" },
      { id: "orders", label: "Live Orders", icon: ShoppingCart, color: "bg-orange-100 text-orange-600" },
      { id: "inventory", label: "Inventory", icon: Package, color: "bg-amber-100 text-amber-600" },
    ]
  },
  {
    title: "People",
    items: [
      { id: "clients", label: "Clients", icon: UserCheck, color: "bg-pink-100 text-pink-600" },
      { id: "users", label: "Users CRM", icon: Users, color: "bg-fuchsia-100 text-fuchsia-600", adminOnly: true },
    ]
  },
  {
    title: "Business",
    items: [
      { id: "catalog", label: "Catalog", icon: Package, color: "bg-lime-100 text-lime-600" },
      { id: "analytics", label: "Analytics", icon: BarChart3, color: "bg-blue-100 text-blue-600" },
      { id: "earnings", label: "Earnings", icon: Wallet, color: "bg-green-100 text-green-600" },
      { id: "pricing", label: "Pricing", icon: Zap, color: "bg-yellow-100 text-yellow-600" },
      { id: "history", label: "History", icon: ScrollText, color: "bg-slate-100 text-slate-600" },
    ]
  },
  {
    title: "Marketing",
    items: [
      { id: "campaigns", label: "Campaigns", icon: Megaphone, color: "bg-red-100 text-red-600" },
      { id: "coupons", label: "Coupons", icon: Ticket, color: "bg-purple-100 text-purple-600" },
      { id: "curations", label: "Curations", icon: Sparkles, color: "bg-cyan-100 text-cyan-600" },
      { id: "tags", label: "Tags", icon: Tag, color: "bg-stone-100 text-stone-600" },
    ]
  },
  {
    title: "More",
    items: [
      { id: "achievements", label: "Achievements", icon: Trophy, color: "bg-amber-100 text-amber-600" },
      { id: "loyalty", label: "Loyalty", icon: Sparkles, color: "bg-pink-100 text-pink-600" },
      { id: "exports", label: "Exports", icon: FileSpreadsheet, color: "bg-gray-100 text-gray-600" },
      { id: "audit", label: "Audit Trail", icon: ScrollText, color: "bg-neutral-100 text-neutral-600", adminOnly: true },
    ]
  },
];

export default function AdminLayout({ activePage, onNavigate, children }: AdminLayoutProps) {
  const { signOut, user } = useAuth();
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`flex flex-col h-full bg-white dark:bg-zinc-900 ${
      mobile ? "w-72" : collapsed ? "w-[68px]" : "w-60"
    } transition-all duration-300 border-r border-zinc-100 dark:border-zinc-800`}>
      {/* Logo */}
      <div className="px-4 py-5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center shrink-0 shadow-md shadow-indigo-200 dark:shadow-indigo-900/30">
          <span className="text-white font-bold text-sm">H</span>
        </div>
        {(!collapsed || mobile) && (
          <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}>
            <p className="font-bold text-[15px] text-zinc-800 dark:text-zinc-100">Hushh</p>
            <p className="text-[10px] text-zinc-400 -mt-0.5">Admin Panel</p>
          </motion.div>
        )}
      </div>

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
                    <button
                      key={item.id}
                      onClick={() => { onNavigate(item.id); if (mobile) setMobileOpen(false); }}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[13px] font-medium transition-all ${
                        active
                          ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-sm"
                          : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${active ? item.color : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"}`}>
                        <item.icon size={14} />
                      </div>
                      {(!collapsed || mobile) && <span className="truncate">{item.label}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-zinc-100 dark:border-zinc-800 space-y-1">
        {(!collapsed || mobile) && (
          <div className="px-2.5 py-2 rounded-xl bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-500/5 dark:to-violet-500/5 mb-2">
            <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-200 truncate">{user?.email?.split("@")[0]}</p>
            <p className="text-[10px] text-zinc-400">{isAdmin ? "Super Admin" : "Manager"}</p>
          </div>
        )}
        <button
          onClick={() => navigate("/")}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[13px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
        >
          <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center"><Home size={14} /></div>
          {(!collapsed || mobile) && <span>Back to App</span>}
        </button>
        <button
          onClick={signOut}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[13px] text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition"
        >
          <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center"><LogOut size={14} /></div>
          {(!collapsed || mobile) && <span>Sign out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
      <CommandPalette onNavigate={onNavigate} />
      <div className="hidden md:flex relative">
        <Sidebar />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-8 z-10 w-6 h-6 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center hover:bg-zinc-50 transition shadow-sm"
        >
          {collapsed ? <ChevronRight size={12} className="text-zinc-400" /> : <ChevronLeft size={12} className="text-zinc-400" />}
        </button>
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
        {/* Top bar - mobile */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3.5 bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800">
          <button onClick={() => setMobileOpen(true)} className="p-1.5 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800">
            <Menu size={20} className="text-zinc-600 dark:text-zinc-300" />
          </button>
          <div className="flex-1 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center">
              <span className="text-white text-xs font-bold">H</span>
            </div>
            <span className="font-bold text-sm text-zinc-800 dark:text-zinc-100">Hushh Admin</span>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
      <FloatingChecklist />
    </div>
  );
}
