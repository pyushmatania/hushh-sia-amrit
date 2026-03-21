import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Sparkles, UtensilsCrossed, Wrench, Package, Gift, TrendingUp, AlertTriangle, RefreshCw, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import AdminProperties from "./AdminProperties";
import AdminCurations from "./AdminCurations";
import AdminInventory from "./AdminInventory";
import AdminExperiencePackages from "./AdminExperiencePackages";

const tabs = [
  { id: "properties", label: "Properties", icon: Building2, color: "from-indigo-500 to-violet-500", badge: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400" },
  { id: "packages", label: "Packages", icon: Gift, color: "from-pink-500 to-rose-500", badge: "bg-pink-500/15 text-pink-600 dark:text-pink-400" },
  { id: "curations", label: "Curated", icon: Sparkles, color: "from-amber-500 to-orange-500", badge: "bg-amber-500/15 text-amber-600 dark:text-amber-400" },
  { id: "food", label: "Food", icon: UtensilsCrossed, color: "from-emerald-500 to-teal-500", badge: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" },
  { id: "addons", label: "Add-ons", icon: Wrench, color: "from-sky-500 to-blue-500", badge: "bg-sky-500/15 text-sky-600 dark:text-sky-400" },
] as const;

type TabId = typeof tabs[number]["id"];

interface CatalogStats {
  properties: number;
  liveProperties: number;
  packages: number;
  curations: number;
  inventoryItems: number;
  lowStockItems: number;
  lastUpdated: Date | null;
}

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const steps = 20;
    const inc = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += inc;
      if (current >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(Math.floor(current));
    }, 30);
    return () => clearInterval(timer);
  }, [value]);
  return <span className="tabular-nums">{display}</span>;
}

export default function AdminCatalog() {
  const [activeTab, setActiveTab] = useState<TabId>("properties");
  const [stats, setStats] = useState<CatalogStats>({
    properties: 0, liveProperties: 0, packages: 0, curations: 0,
    inventoryItems: 0, lowStockItems: 0, lastUpdated: null,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  const fetchStats = async () => {
    setLoadingStats(true);
    const [propRes, pkgRes, curRes, invRes] = await Promise.all([
      supabase.from("host_listings").select("id, status"),
      supabase.from("experience_packages").select("id"),
      supabase.from("curations").select("id"),
      supabase.from("inventory").select("id, stock, low_stock_threshold, available"),
    ]);
    const props = propRes.data ?? [];
    const inv = invRes.data ?? [];
    setStats({
      properties: props.length,
      liveProperties: props.filter(p => p.status === "published").length,
      packages: (pkgRes.data ?? []).length,
      curations: (curRes.data ?? []).length,
      inventoryItems: inv.length,
      lowStockItems: inv.filter(i => (i as any).stock <= (i as any).low_stock_threshold && (i as any).available).length,
      lastUpdated: new Date(),
    });
    setLoadingStats(false);
  };

  useEffect(() => {
    fetchStats();
    const handler = () => fetchStats();
    window.addEventListener("hushh:listings-updated", handler);
    return () => window.removeEventListener("hushh:listings-updated", handler);
  }, []);

  const quickStats = [
    { label: "Properties", value: stats.properties, sub: `${stats.liveProperties} live`, icon: Building2, gradient: "from-indigo-500/10 to-violet-500/5 dark:from-indigo-500/15 dark:to-violet-500/10", iconBg: "bg-indigo-100 dark:bg-indigo-500/20", iconColor: "text-indigo-600 dark:text-indigo-400" },
    { label: "Packages", value: stats.packages, sub: "experience packs", icon: Gift, gradient: "from-pink-500/10 to-rose-500/5 dark:from-pink-500/15 dark:to-rose-500/10", iconBg: "bg-pink-100 dark:bg-pink-500/20", iconColor: "text-pink-600 dark:text-pink-400" },
    { label: "Curations", value: stats.curations, sub: "curated combos", icon: Sparkles, gradient: "from-amber-500/10 to-orange-500/5 dark:from-amber-500/15 dark:to-orange-500/10", iconBg: "bg-amber-100 dark:bg-amber-500/20", iconColor: "text-amber-600 dark:text-amber-400" },
    { label: "Inventory", value: stats.inventoryItems, sub: stats.lowStockItems > 0 ? `${stats.lowStockItems} low stock` : "all stocked", icon: Package, gradient: "from-emerald-500/10 to-teal-500/5 dark:from-emerald-500/15 dark:to-teal-500/10", iconBg: "bg-emerald-100 dark:bg-emerald-500/20", iconColor: "text-emerald-600 dark:text-emerald-400", alert: stats.lowStockItems > 0 },
  ];

  const activeTabData = tabs.find(t => t.id === activeTab)!;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ rotate: [0, -5, 5, 0], scale: 1.05 }}
            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200/50 dark:shadow-indigo-900/30"
          >
            <Package size={22} className="text-white" />
          </motion.div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Catalog Manager</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              Manage all your listings in one place
              {stats.lastUpdated && (
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground/60">
                  <Clock size={9} />
                  {stats.lastUpdated.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                </span>
              )}
            </p>
          </div>
        </div>
        <motion.button
          whileHover={{ rotate: 180, scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={fetchStats}
          className="p-2.5 rounded-xl bg-card border border-border hover:border-primary/30 transition"
          title="Refresh stats"
        >
          <RefreshCw size={16} className={`text-muted-foreground ${loadingStats ? "animate-spin" : ""}`} />
        </motion.button>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {quickStats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`rounded-2xl bg-gradient-to-br ${stat.gradient} border border-border/50 p-4 relative overflow-hidden group hover:shadow-md transition-shadow`}
          >
            <div className="flex items-center gap-2.5 mb-3">
              <div className={`w-8 h-8 rounded-xl ${stat.iconBg} flex items-center justify-center transition-transform group-hover:scale-110`}>
                <stat.icon size={15} className={stat.iconColor} />
              </div>
              {stat.alert && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center ml-auto"
                >
                  <AlertTriangle size={10} className="text-amber-600" />
                </motion.div>
              )}
            </div>
            <p className="text-2xl font-bold text-foreground">
              {loadingStats ? <span className="inline-block w-8 h-6 bg-secondary rounded animate-pulse" /> : <AnimatedNumber value={stat.value} />}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{stat.sub}</p>
            {/* Decorative */}
            <div className="absolute -bottom-4 -right-4 w-16 h-16 rounded-full bg-gradient-to-br from-primary/5 to-transparent" />
          </motion.div>
        ))}
      </div>

      {/* Low Stock Alert Banner */}
      <AnimatePresence>
        {stats.lowStockItems > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-2xl border border-amber-200/60 dark:border-amber-500/20 bg-gradient-to-r from-amber-50 to-yellow-50/50 dark:from-amber-500/5 dark:to-yellow-500/5 p-3.5 flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center shrink-0">
              <AlertTriangle size={14} className="text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-foreground">{stats.lowStockItems} items running low</p>
              <p className="text-[10px] text-muted-foreground">Check inventory to restock</p>
            </div>
            <button
              onClick={() => setActiveTab("food")}
              className="px-3 py-1.5 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 text-[11px] font-semibold hover:bg-amber-500/25 transition"
            >
              View →
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab Navigation */}
      <div className="flex gap-1.5 overflow-x-auto hide-scrollbar p-1 bg-card border border-border rounded-2xl">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              whileTap={{ scale: 0.95 }}
              className={`relative flex-1 flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl text-[12px] font-semibold whitespace-nowrap transition-all min-w-[72px] ${
                isActive
                  ? "text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="catalog-tab-bg"
                  className={`absolute inset-0 rounded-xl bg-gradient-to-r ${tab.color} opacity-[0.08] dark:opacity-[0.15]`}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              {isActive && (
                <motion.div
                  layoutId="catalog-tab-border"
                  className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[2px] rounded-full bg-gradient-to-r ${tab.color}`}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <tab.icon size={14} className="relative z-10" />
              <span className="relative z-10 hidden sm:inline">{tab.label}</span>
              <span className="relative z-10 sm:hidden">{tab.label.split(" ")[0]}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "properties" && <AdminProperties />}
          {activeTab === "packages" && <AdminExperiencePackages />}
          {activeTab === "curations" && <AdminCurations />}
          {activeTab === "food" && <AdminInventory filterCategory="food-drinks" />}
          {activeTab === "addons" && <AdminInventory filterCategory="addons" />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
