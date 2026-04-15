import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Sparkles, UtensilsCrossed, Wrench, Gift, Package, RefreshCw, History } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { DEMO_LISTINGS, DEMO_CURATIONS, DEMO_INVENTORY } from "./admin-demo-data";
import DemoDataBanner from "./DemoDataBanner";
import { useDataMode } from "@/hooks/use-data-mode";
import AdminProperties from "./AdminProperties";
import AdminCurations from "./AdminCurations";
import AdminInventory from "./AdminInventory";
import AdminExperiencePackages from "./AdminExperiencePackages";
import RevisionHistoryPanel from "./RevisionHistoryPanel";

const tabs = [
  { id: "properties", label: "Properties", icon: Building2, color: "text-indigo-500" },
  { id: "packages", label: "Packages", icon: Gift, color: "text-pink-500" },
  { id: "curations", label: "Curated", icon: Sparkles, color: "text-amber-500" },
  { id: "food", label: "Food", icon: UtensilsCrossed, color: "text-emerald-500" },
  { id: "addons", label: "Add-ons", icon: Wrench, color: "text-sky-500" },
  { id: "history", label: "History", icon: History, color: "text-violet-500" },
] as const;

type TabId = typeof tabs[number]["id"];

interface CatalogStats {
  properties: number;
  liveProperties: number;
  packages: number;
  curations: number;
  inventoryItems: number;
  lowStockItems: number;
}

export default function AdminCatalog() {
  const [activeTab, setActiveTab] = useState<TabId>("properties");
  const [stats, setStats] = useState<CatalogStats>({
    properties: 0, liveProperties: 0, packages: 0, curations: 0,
    inventoryItems: 0, lowStockItems: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const { isDemoMode } = useDataMode();

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

    /* ── Demo-data fallback when Supabase returns nothing ── */
    if (props.length === 0 && (pkgRes.data ?? []).length === 0 && (curRes.data ?? []).length === 0 && inv.length === 0) {
      if (isDemoMode) {
        const demoInv = DEMO_INVENTORY;
        setStats({
          properties: DEMO_LISTINGS.length,
          liveProperties: DEMO_LISTINGS.filter(l => l.status === "published").length,
          packages: 0,
          curations: DEMO_CURATIONS.length,
          inventoryItems: demoInv.length,
          lowStockItems: demoInv.filter(i => i.stock <= i.low_stock_threshold && i.available).length,
        });
        setIsDemo(true);
      } else {
        setStats({ properties: 0, liveProperties: 0, packages: 0, curations: 0, inventoryItems: 0, lowStockItems: 0 });
        setIsDemo(false);
      }
      setLoadingStats(false);
      return;
    }

    setStats({
      properties: props.length,
      liveProperties: props.filter(p => p.status === "published").length,
      packages: (pkgRes.data ?? []).length,
      curations: (curRes.data ?? []).length,
      inventoryItems: inv.length,
      lowStockItems: inv.filter(i => (i as any).stock <= (i as any).low_stock_threshold && (i as any).available).length,
    });
    setIsDemo(false);
    setLoadingStats(false);
  };

  useEffect(() => {
    fetchStats();
    const handler = () => fetchStats();
    const openCurationsHandler = () => setActiveTab("curations");
    window.addEventListener("hushh:listings-updated", handler);
    window.addEventListener("hushh:open-curations", openCurationsHandler);
    return () => {
      window.removeEventListener("hushh:listings-updated", handler);
      window.removeEventListener("hushh:open-curations", openCurationsHandler);
    };
  }, [isDemoMode]);

  const statPills = [
    { label: "Properties", value: stats.properties, sub: `${stats.liveProperties} live`, tab: "properties" as TabId },
    { label: "Packages", value: stats.packages, tab: "packages" as TabId },
    { label: "Curations", value: stats.curations, tab: "curations" as TabId },
    { label: "Inventory", value: stats.inventoryItems, sub: stats.lowStockItems > 0 ? `${stats.lowStockItems} low` : undefined, alert: stats.lowStockItems > 0, tab: "food" as TabId },
  ];

  return (
    <div className="space-y-5">
      {isDemo && <DemoDataBanner entityName="catalog" />}
      {/* Compact Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <Package size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Catalog</h1>
            <p className="text-[11px] text-muted-foreground">
              {stats.properties + stats.packages + stats.curations + stats.inventoryItems} total items
            </p>
          </div>
        </div>
        <motion.button
          whileHover={{ rotate: 180 }}
          whileTap={{ scale: 0.9 }}
          onClick={fetchStats}
          className="p-2 rounded-xl bg-card border border-border hover:border-primary/30 transition"
        >
          <RefreshCw size={14} className={`text-muted-foreground ${loadingStats ? "animate-spin" : ""}`} />
        </motion.button>
      </div>

      {/* Quick Stats Row */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar">
        {statPills.map((s) => (
          <button
            key={s.label}
            onClick={() => setActiveTab(s.tab)}
            className={`shrink-0 flex items-center gap-2.5 px-4 py-2.5 rounded-xl border transition-all ${
              activeTab === s.tab
                ? "bg-primary/10 border-primary/30 shadow-sm"
                : "bg-card border-border hover:border-primary/20"
            }`}
          >
            <span className={`text-base font-bold tabular-nums ${activeTab === s.tab ? "text-primary" : "text-foreground"}`}>
              {loadingStats ? "–" : s.value}
            </span>
            <div className="text-left">
              <p className={`text-[11px] font-semibold ${activeTab === s.tab ? "text-primary" : "text-muted-foreground"}`}>
                {s.label}
              </p>
              {s.sub && (
                <p className={`text-[9px] ${s.alert ? "text-amber-500 font-semibold" : "text-muted-foreground/60"}`}>
                  {s.sub}
                </p>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Tab Bar */}
      <div className="flex gap-0.5 p-1 bg-secondary/50 rounded-xl border border-border">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all min-w-[56px] ${
                isActive
                  ? "text-foreground bg-card shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon size={13} className={isActive ? tab.color : ""} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15 }}
        >
          {activeTab === "properties" && <AdminProperties />}
          {activeTab === "packages" && <AdminExperiencePackages />}
          {activeTab === "curations" && <AdminCurations />}
          {activeTab === "food" && <AdminInventory filterCategory="food-drinks" />}
          {activeTab === "addons" && <AdminInventory filterCategory="addons" />}
          {activeTab === "history" && <RevisionHistoryPanel />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
