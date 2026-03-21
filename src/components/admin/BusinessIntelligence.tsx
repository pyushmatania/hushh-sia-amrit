import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle, TrendingUp, TrendingDown, Flame, Clock, Zap, IndianRupee,
  Bell, Lightbulb, ExternalLink, Loader2, ShoppingCart, Package,
  ArrowUp, ArrowDown, Minus, BarChart3, Activity, Shield, Target,
  Gauge, Eye, CheckCircle, ChevronRight, Sparkles, RefreshCw,
  MapPin, Calendar, Users, PieChart
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, Cell } from "recharts";

/* ─── Types ─── */
interface SmartAlert {
  id: string;
  type: "warning" | "opportunity" | "insight" | "action";
  severity: string;
  title: string;
  description: string;
  action?: string;
  actionTarget?: string;
}

interface Predictions {
  peakDay: string; peakDayBookings: number; slowDay: string;
  peakSlot: string; avgBookingValue: number; weeklyTrend: number;
}

interface SlotDemand {
  slot: string; bookings: number; revenue: number; avgPrice: number;
  trend: "up" | "down" | "flat"; suggestion: string; suggestedChange: number;
  recentCount: number; olderCount: number;
}

interface PropertyDemand {
  id: string; name: string; bookings: number; revenue: number;
  trend: "up" | "down" | "flat"; avgPrice: number;
}

interface WeeklyDay {
  day: string; thisWeek: number; lastWeek: number; thisRevenue: number; lastRevenue: number;
}

interface AutoAction {
  id: string; icon: typeof Zap; title: string; description: string;
  color: string; bg: string; running: boolean;
}

/* ─── Tabs ─── */
const TABS = [
  { id: "overview", label: "Overview", icon: Gauge },
  { id: "alerts", label: "Alerts", icon: Bell },
  { id: "pricing", label: "Pricing", icon: Zap },
  { id: "actions", label: "Actions", icon: Activity },
] as const;
type TabId = typeof TABS[number]["id"];

const typeIcons: Record<string, typeof Flame> = { warning: AlertTriangle, opportunity: Flame, insight: IndianRupee, action: Zap };
const typeColors: Record<string, { text: string; bg: string; border: string; glow: string }> = {
  warning: { text: "text-amber-500", bg: "bg-amber-500/10", border: "border-l-amber-400", glow: "shadow-amber-100/30 dark:shadow-amber-900/20" },
  opportunity: { text: "text-orange-500", bg: "bg-orange-500/10", border: "border-l-orange-400", glow: "shadow-orange-100/30 dark:shadow-orange-900/20" },
  insight: { text: "text-primary", bg: "bg-primary/10", border: "border-l-primary", glow: "shadow-primary/10" },
  action: { text: "text-blue-500", bg: "bg-blue-500/10", border: "border-l-blue-400", glow: "shadow-blue-100/30 dark:shadow-blue-900/20" },
};
const severityBadge: Record<string, string> = {
  high: "bg-destructive/15 text-destructive", medium: "bg-amber-500/15 text-amber-500",
  low: "bg-muted text-muted-foreground", info: "bg-primary/10 text-primary",
};
const DEMAND_COLORS = ["hsl(142,71%,45%)", "hsl(221,83%,53%)", "hsl(38,92%,50%)", "hsl(0,84%,60%)", "hsl(262,83%,58%)"];

const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 } };

/* ─── Stat Card ─── */
function StatCard({ icon: Icon, label, value, sub, accent, trend, trendUp }: {
  icon: any; label: string; value: string; sub?: string; accent?: string;
  trend?: string; trendUp?: boolean;
}) {
  return (
    <motion.div {...fadeUp} className="rounded-2xl border border-border/60 bg-gradient-to-br from-card to-secondary/20 p-3.5 flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${accent || "bg-primary/10"}`}>
          <Icon size={14} className={accent ? "text-foreground" : "text-primary"} />
        </div>
        {trend && (
          <span className={`flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${trendUp ? "text-emerald-500 bg-emerald-500/10" : "text-destructive bg-destructive/10"}`}>
            {trendUp ? <ArrowUp size={9} /> : <ArrowDown size={9} />} {trend}
          </span>
        )}
      </div>
      <span className="text-xl font-black text-foreground tracking-tight leading-none">{value}</span>
      <span className="text-[10px] text-muted-foreground font-medium">{label}</span>
      {sub && <span className="text-[9px] text-muted-foreground/70">{sub}</span>}
    </motion.div>
  );
}

/* ─── Main Component ─── */
export default function BusinessIntelligence({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const { toast } = useToast();
  const [tab, setTab] = useState<TabId>("overview");
  const [alerts, setAlerts] = useState<SmartAlert[]>([]);
  const [predictions, setPredictions] = useState<Predictions | null>(null);
  const [slots, setSlots] = useState<SlotDemand[]>([]);
  const [propertyDemand, setPropertyDemand] = useState<PropertyDemand[]>([]);
  const [loadingAlerts, setLoadingAlerts] = useState(true);
  const [loadingPricing, setLoadingPricing] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionResults, setActionResults] = useState<string[]>([]);
  const [actions, setActions] = useState<AutoAction[]>([
    { id: "low-stock", icon: Package, title: "Check Low Stock", description: "Scan inventory & auto-disable out-of-stock items", color: "text-amber-500", bg: "bg-amber-500/10", running: false },
    { id: "notify-admins", icon: Bell, title: "Run Notification Scan", description: "Detect spikes, low stock, cancellations", color: "text-primary", bg: "bg-primary/10", running: false },
    { id: "slow-slots", icon: TrendingDown, title: "Flag Slow Slots", description: "Identify underbooked slots for discounts", color: "text-blue-500", bg: "bg-blue-500/10", running: false },
    { id: "restock-alert", icon: ShoppingCart, title: "Restock Reminder", description: "Flag items below threshold for reorder", color: "text-emerald-500", bg: "bg-emerald-500/10", running: false },
  ]);

  /* ─── Fetch Alerts ─── */
  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("smart-alerts");
      if (error) throw error;
      setAlerts(data.alerts || []);
      setPredictions(data.predictions || null);
    } catch {
      setAlerts([{
        id: "fallback", type: "insight", severity: "info",
        title: "Analytics engine loading", description: "Showing cached insights while connecting.",
      }]);
    }
    setLoadingAlerts(false);
  };

  /* ─── Fetch Pricing Data ─── */
  const fetchPricing = async () => {
    const [bookingsRes, listingsRes] = await Promise.all([
      supabase.from("bookings").select("slot, total, date, created_at, status, property_id").neq("status", "cancelled"),
      supabase.from("host_listings").select("id, name"),
    ]);
    const bookings = bookingsRes.data ?? [];
    if (!bookings.length) { setLoadingPricing(false); return; }

    const now = Date.now();
    const weekMs = 7 * 86400000;
    const listingMap = new Map<string, string>();
    (listingsRes.data ?? []).forEach(l => listingMap.set(l.id, l.name));

    // Slot demand
    const slotMap = new Map<string, { total: number; count: number; recent: number; older: number }>();
    bookings.forEach(b => {
      const slot = b.slot || "Unknown";
      const existing = slotMap.get(slot) || { total: 0, count: 0, recent: 0, older: 0 };
      existing.total += Number(b.total); existing.count++;
      const age = now - new Date(b.created_at).getTime();
      if (age <= weekMs) existing.recent++; else if (age <= 2 * weekMs) existing.older++;
      slotMap.set(slot, existing);
    });

    const totalBookings = bookings.length;
    const slotResults: SlotDemand[] = [];
    slotMap.forEach((data, slot) => {
      const share = (data.count / totalBookings) * 100;
      const avgPrice = data.count > 0 ? Math.round(data.total / data.count) : 0;
      const growth = data.older > 0 ? ((data.recent - data.older) / data.older) * 100 : 0;
      let trend: "up" | "down" | "flat" = "flat";
      let suggestion = ""; let suggestedChange = 0;
      if (share > 40 && growth > 10) {
        trend = "up"; suggestedChange = Math.min(20, Math.round(growth * 0.5));
        suggestion = `High demand. Increase price by ${suggestedChange}% to optimize.`;
      } else if (share > 30 && growth > 0) {
        trend = "up"; suggestedChange = Math.min(10, Math.round(growth * 0.3));
        suggestion = `Growing demand. Consider ${suggestedChange}% price increase.`;
      } else if (share < 15 || growth < -20) {
        trend = "down"; suggestedChange = -Math.min(15, Math.abs(Math.round(growth * 0.4)));
        suggestion = `Low demand. Offer ${Math.abs(suggestedChange)}% discount to boost.`;
      } else { suggestion = "Demand steady. Current pricing optimal."; }
      slotResults.push({ slot, bookings: data.count, revenue: data.total, avgPrice, trend, suggestion, suggestedChange, recentCount: data.recent, olderCount: data.older });
    });
    slotResults.sort((a, b) => b.bookings - a.bookings);
    setSlots(slotResults);

    // Property demand
    const propMap = new Map<string, { total: number; count: number; recent: number; older: number }>();
    bookings.forEach(b => {
      const existing = propMap.get(b.property_id) || { total: 0, count: 0, recent: 0, older: 0 };
      existing.total += Number(b.total); existing.count++;
      const age = now - new Date(b.created_at).getTime();
      if (age <= weekMs) existing.recent++; else if (age <= 2 * weekMs) existing.older++;
      propMap.set(b.property_id, existing);
    });
    const propResults: PropertyDemand[] = [];
    propMap.forEach((data, id) => {
      const growth = data.older > 0 ? ((data.recent - data.older) / data.older) * 100 : 0;
      const trend = growth > 10 ? "up" : growth < -10 ? "down" : "flat";
      propResults.push({ id, name: listingMap.get(id) || "Unknown", bookings: data.count, revenue: data.total, trend, avgPrice: data.count > 0 ? Math.round(data.total / data.count) : 0 });
    });
    propResults.sort((a, b) => b.revenue - a.revenue);
    setPropertyDemand(propResults.slice(0, 8));
    setLoadingPricing(false);
  };

  useEffect(() => { fetchAlerts(); fetchPricing(); }, []);

  const refresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchAlerts(), fetchPricing()]);
    setRefreshing(false);
    toast({ title: "Refreshed", description: "All intelligence data updated." });
  };

  /* ─── Auto Actions ─── */
  const runAction = async (actionId: string) => {
    setActions(prev => prev.map(a => a.id === actionId ? { ...a, running: true } : a));
    try {
      if (actionId === "low-stock") {
        const { data: items } = await supabase.from("inventory").select("id, name, stock, low_stock_threshold, available");
        const outOfStock = (items ?? []).filter(i => i.stock <= 0 && i.available);
        for (const item of outOfStock) await supabase.from("inventory").update({ available: false }).eq("id", item.id);
        const msg = outOfStock.length > 0 ? `Disabled ${outOfStock.length} out-of-stock items: ${outOfStock.map(i => i.name).join(", ")}` : "All inventory in stock ✓";
        setActionResults(prev => [msg, ...prev]);
        toast({ title: "Low Stock Check", description: msg });
      }
      if (actionId === "notify-admins") {
        const { data, error } = await supabase.functions.invoke("auto-notifications");
        if (error) throw error;
        const msgs = data?.results ?? [];
        const msg = msgs.length > 0 ? `Sent ${msgs.length} alert(s)` : "No alerts triggered — all clear ✓";
        setActionResults(prev => [msg, ...prev]);
        toast({ title: "Notification Scan", description: msg });
      }
      if (actionId === "slow-slots") {
        const { data: bookings } = await supabase.from("bookings").select("slot, date").gte("date", new Date().toISOString().split("T")[0]);
        const slotCounts: Record<string, number> = {};
        for (const b of bookings ?? []) slotCounts[b.slot] = (slotCounts[b.slot] || 0) + 1;
        const allSlots = ["12 PM – 4 PM", "4 PM – 7 PM", "7 PM – 11 PM", "11 PM – 7 AM"];
        const slowSlots = allSlots.filter(s => (slotCounts[s] || 0) <= 1);
        const msg = slowSlots.length > 0 ? `Slow: ${slowSlots.join(", ")} — consider discounts` : "All slots performing well ✓";
        setActionResults(prev => [msg, ...prev]);
        toast({ title: "Slow Slot Scan", description: msg });
      }
      if (actionId === "restock-alert") {
        const { data: items } = await supabase.from("inventory").select("id, name, stock, low_stock_threshold");
        const lowStock = (items ?? []).filter(i => i.stock <= i.low_stock_threshold && i.stock > 0);
        const msg = lowStock.length > 0 ? `${lowStock.length} items need restock: ${lowStock.map(i => `${i.name} (${i.stock} left)`).join(", ")}` : "All inventory above threshold ✓";
        setActionResults(prev => [msg, ...prev]);
        toast({ title: "Restock Check", description: msg });
      }
    } catch (e) {
      const msg = `Error: ${e instanceof Error ? e.message : "Unknown"}`;
      setActionResults(prev => [msg, ...prev]);
      toast({ title: "Error", description: msg, variant: "destructive" });
    }
    setActions(prev => prev.map(a => a.id === actionId ? { ...a, running: false } : a));
  };

  /* ─── Computed Stats ─── */
  const highAlerts = alerts.filter(a => a.severity === "high").length;
  const totalSlotRevenue = slots.reduce((s, sl) => s + sl.revenue, 0);
  const highDemandSlots = slots.filter(s => s.trend === "up").length;
  const lowDemandSlots = slots.filter(s => s.trend === "down").length;
  const slotChartData = slots.map(s => ({ name: s.slot.length > 15 ? s.slot.slice(0, 14) + "…" : s.slot, bookings: s.bookings, revenue: Math.round(s.revenue / 1000) }));
  const propChartData = propertyDemand.map(p => ({ name: p.name.length > 12 ? p.name.slice(0, 11) + "…" : p.name, revenue: Math.round(p.revenue / 1000), bookings: p.bookings }));

  const loading = loadingAlerts && loadingPricing;

  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div {...fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-500/15 dark:to-indigo-500/15 flex items-center justify-center shadow-sm">
              <Sparkles size={20} className="text-violet-600 dark:text-violet-400" />
            </div>
            Business Intelligence
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Alerts, pricing insights & automated actions</p>
        </div>
        <motion.button whileTap={{ scale: 0.9, rotate: 180 }} onClick={refresh} disabled={refreshing}
          className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center hover:bg-muted transition">
          <RefreshCw size={16} className={`text-muted-foreground ${refreshing ? "animate-spin" : ""}`} />
        </motion.button>
      </motion.div>

      {/* Tabs */}
      <motion.div {...fadeUp} className="flex gap-1.5 bg-secondary/50 rounded-2xl p-1">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              tab === t.id
                ? "bg-card text-foreground shadow-sm border border-border/60"
                : "text-muted-foreground hover:text-foreground"
            }`}>
            <t.icon size={13} /> {t.label}
          </button>
        ))}
      </motion.div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 rounded-2xl bg-secondary animate-pulse" />)}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {/* ─── OVERVIEW TAB ─── */}
          {tab === "overview" && (
            <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
              {/* KPI Row */}
              <div className="grid grid-cols-2 gap-3">
                <StatCard icon={Bell} label="Active Alerts" value={String(alerts.length)}
                  sub={highAlerts > 0 ? `${highAlerts} high priority` : "All clear"}
                  accent="bg-rose-100 dark:bg-rose-500/15" />
                <StatCard icon={IndianRupee} label="Slot Revenue" value={`₹${(totalSlotRevenue / 1000).toFixed(0)}K`}
                  accent="bg-emerald-100 dark:bg-emerald-500/15" />
                <StatCard icon={TrendingUp} label="High Demand" value={`${highDemandSlots} slots`}
                  accent="bg-blue-100 dark:bg-blue-500/15"
                  trend={predictions ? `${predictions.weeklyTrend} this week` : undefined} trendUp />
                <StatCard icon={TrendingDown} label="Needs Boost" value={`${lowDemandSlots} slots`}
                  accent="bg-amber-100 dark:bg-amber-500/15" />
              </div>

              {/* Demand by Slot Chart */}
              {slotChartData.length > 0 && (
                <div className="rounded-2xl border border-border/60 bg-card p-4">
                  <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                    <BarChart3 size={14} className="text-primary" /> Demand by Time Slot
                  </h3>
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={slotChartData} barSize={20}>
                      <XAxis dataKey="name" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={30} />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 11 }} />
                      <Bar dataKey="bookings" radius={[6, 6, 0, 0]}>
                        {slotChartData.map((_, i) => <Cell key={i} fill={DEMAND_COLORS[i % DEMAND_COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Property Revenue Chart */}
              {propChartData.length > 0 && (
                <div className="rounded-2xl border border-border/60 bg-card p-4">
                  <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                    <MapPin size={14} className="text-primary" /> Revenue by Property (₹K)
                  </h3>
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={propChartData} layout="vertical" barSize={14}>
                      <XAxis type="number" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={80} />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 11 }} />
                      <Bar dataKey="revenue" radius={[0, 6, 6, 0]} fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Predictions */}
              {predictions && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Lightbulb size={14} className="text-primary" /> AI Predictions
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: TrendingUp, title: "Peak Day", value: predictions.peakDay, sub: `${predictions.peakDayBookings} bookings`, color: "text-emerald-500" },
                      { icon: Clock, title: "Slow Day", value: predictions.slowDay, sub: "Run discounts", color: "text-amber-500" },
                      { icon: Flame, title: "Hot Slot", value: predictions.peakSlot, sub: "Most popular", color: "text-orange-500" },
                      { icon: IndianRupee, title: "Avg Booking", value: `₹${predictions.avgBookingValue.toLocaleString()}`, sub: "Upsell opportunity", color: "text-primary" },
                    ].map((p, i) => (
                      <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05 }}
                        className="rounded-2xl border border-border/60 bg-card p-3.5">
                        <p.icon size={16} className={p.color} />
                        <p className="text-[10px] text-muted-foreground mt-2">{p.title}</p>
                        <p className="text-base font-bold text-foreground mt-0.5">{p.value}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{p.sub}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => setTab("alerts")}
                  className="rounded-2xl border border-border/60 bg-card p-4 text-left hover:bg-muted/30 transition group">
                  <Bell size={18} className="text-rose-500 mb-2" />
                  <p className="text-sm font-semibold text-foreground">View Alerts</p>
                  <p className="text-[10px] text-muted-foreground">{alerts.length} active alerts</p>
                </motion.button>
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => setTab("pricing")}
                  className="rounded-2xl border border-border/60 bg-card p-4 text-left hover:bg-muted/30 transition group">
                  <Zap size={18} className="text-yellow-500 mb-2" />
                  <p className="text-sm font-semibold text-foreground">Pricing Engine</p>
                  <p className="text-[10px] text-muted-foreground">{slots.length} slots analyzed</p>
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ─── ALERTS TAB ─── */}
          {tab === "alerts" && (
            <motion.div key="alerts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              {/* Severity Summary */}
              <div className="flex gap-2 flex-wrap">
                {(["high", "medium", "low", "info"] as const).map(sev => {
                  const count = alerts.filter(a => a.severity === sev).length;
                  if (count === 0) return null;
                  return (
                    <span key={sev} className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize ${severityBadge[sev]}`}>
                      {count} {sev}
                    </span>
                  );
                })}
              </div>

              {/* Alert Cards */}
              <div className="space-y-3">
                {alerts.map((alert, i) => {
                  const colors = typeColors[alert.type] || typeColors.insight;
                  const Icon = typeIcons[alert.type] || Lightbulb;
                  return (
                    <motion.div key={alert.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                      className={`rounded-2xl border border-border/60 bg-card p-4 border-l-4 ${colors.border} hover:shadow-lg ${colors.glow} transition-all`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center shrink-0`}>
                          <Icon size={18} className={colors.text} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-bold text-foreground">{alert.title}</h4>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${severityBadge[alert.severity] || severityBadge.info}`}>
                              {alert.severity}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">{alert.description}</p>
                          {alert.action && (
                            <button onClick={() => onNavigate?.(alert.actionTarget || "dashboard")}
                              className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline bg-primary/5 px-3 py-1.5 rounded-lg">
                              {alert.action} <ChevronRight size={11} />
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Predictions inline */}
              {predictions && (
                <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-primary/5 to-transparent p-4 space-y-3">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Lightbulb size={14} className="text-primary" /> AI Predictions
                  </h3>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="text-center p-2.5 rounded-xl bg-card border border-border/40">
                      <p className="text-lg font-black text-foreground">{predictions.peakDay}</p>
                      <p className="text-[9px] text-muted-foreground">Peak day ({predictions.peakDayBookings} bookings)</p>
                    </div>
                    <div className="text-center p-2.5 rounded-xl bg-card border border-border/40">
                      <p className="text-lg font-black text-foreground">{predictions.peakSlot}</p>
                      <p className="text-[9px] text-muted-foreground">Hottest slot</p>
                    </div>
                    <div className="text-center p-2.5 rounded-xl bg-card border border-border/40">
                      <p className="text-lg font-black text-foreground">₹{predictions.avgBookingValue.toLocaleString()}</p>
                      <p className="text-[9px] text-muted-foreground">Avg booking value</p>
                    </div>
                    <div className="text-center p-2.5 rounded-xl bg-card border border-border/40">
                      <p className="text-lg font-black text-foreground">{predictions.weeklyTrend}</p>
                      <p className="text-[9px] text-muted-foreground">Bookings this week</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ─── PRICING TAB ─── */}
          {tab === "pricing" && (
            <motion.div key="pricing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              {/* Demand Summary */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-center">
                  <TrendingUp size={16} className="text-emerald-500 mx-auto mb-1" />
                  <p className="text-lg font-black text-foreground">{highDemandSlots}</p>
                  <p className="text-[9px] text-muted-foreground">High Demand</p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-card p-3 text-center">
                  <Minus size={16} className="text-muted-foreground mx-auto mb-1" />
                  <p className="text-lg font-black text-foreground">{slots.filter(s => s.trend === "flat").length}</p>
                  <p className="text-[9px] text-muted-foreground">Steady</p>
                </div>
                <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-3 text-center">
                  <TrendingDown size={16} className="text-destructive mx-auto mb-1" />
                  <p className="text-lg font-black text-foreground">{lowDemandSlots}</p>
                  <p className="text-[9px] text-muted-foreground">Low Demand</p>
                </div>
              </div>

              {slots.length === 0 ? (
                <div className="text-center py-12">
                  <Flame size={36} className="mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">Not enough data for pricing analysis</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {slots.map((slot, i) => (
                    <motion.div key={slot.slot} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      className={`rounded-2xl border bg-card p-4 transition-all hover:shadow-md ${
                        slot.trend === "up" ? "border-emerald-500/30" : slot.trend === "down" ? "border-destructive/30" : "border-border/60"
                      }`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                            slot.trend === "up" ? "bg-emerald-500/10" : slot.trend === "down" ? "bg-destructive/10" : "bg-muted"
                          }`}>
                            <Clock size={16} className={slot.trend === "up" ? "text-emerald-500" : slot.trend === "down" ? "text-destructive" : "text-muted-foreground"} />
                          </div>
                          <div>
                            <h3 className="font-bold text-sm text-foreground">{slot.slot}</h3>
                            <p className="text-[10px] text-muted-foreground">
                              {slot.recentCount} recent · {slot.olderCount} prior week
                            </p>
                          </div>
                        </div>
                        {slot.suggestedChange !== 0 && (
                          <span className={`text-xs font-black px-3 py-1.5 rounded-full ${
                            slot.suggestedChange > 0 ? "bg-emerald-500/15 text-emerald-500" : "bg-amber-500/15 text-amber-500"
                          }`}>
                            {slot.suggestedChange > 0 ? "↑" : "↓"} {Math.abs(slot.suggestedChange)}%
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-3 mb-3">
                        <div className="rounded-xl bg-secondary/50 p-2.5 text-center">
                          <p className="text-[9px] text-muted-foreground">Bookings</p>
                          <p className="text-sm font-bold text-foreground tabular-nums">{slot.bookings}</p>
                        </div>
                        <div className="rounded-xl bg-secondary/50 p-2.5 text-center">
                          <p className="text-[9px] text-muted-foreground">Revenue</p>
                          <p className="text-sm font-bold text-foreground tabular-nums">₹{(slot.revenue / 1000).toFixed(1)}K</p>
                        </div>
                        <div className="rounded-xl bg-secondary/50 p-2.5 text-center">
                          <p className="text-[9px] text-muted-foreground">Avg Price</p>
                          <p className="text-sm font-bold text-foreground tabular-nums">₹{slot.avgPrice.toLocaleString()}</p>
                        </div>
                      </div>

                      <div className={`rounded-xl p-3 text-xs font-medium flex items-start gap-2 ${
                        slot.trend === "up" ? "bg-emerald-500/8 text-emerald-600 dark:text-emerald-400" :
                        slot.trend === "down" ? "bg-amber-500/8 text-amber-600 dark:text-amber-400" :
                        "bg-secondary text-muted-foreground"
                      }`}>
                        <Lightbulb size={14} className="shrink-0 mt-0.5" />
                        <span>{slot.suggestion}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Property Demand Table */}
              {propertyDemand.length > 0 && (
                <div className="rounded-2xl border border-border/60 bg-card p-4 space-y-3">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <MapPin size={14} className="text-primary" /> Property Demand Ranking
                  </h3>
                  <div className="space-y-2">
                    {propertyDemand.map((p, i) => (
                      <div key={p.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                        <div className="flex items-center gap-2.5">
                          <span className="text-[10px] font-bold text-muted-foreground w-5 text-center">#{i + 1}</span>
                          <div>
                            <p className="text-xs font-semibold text-foreground">{p.name}</p>
                            <p className="text-[10px] text-muted-foreground">{p.bookings} bookings · Avg ₹{p.avgPrice.toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-foreground tabular-nums">₹{(p.revenue / 1000).toFixed(1)}K</span>
                          {p.trend === "up" ? <ArrowUp size={12} className="text-emerald-500" /> :
                           p.trend === "down" ? <ArrowDown size={12} className="text-destructive" /> :
                           <Minus size={12} className="text-muted-foreground" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ─── ACTIONS TAB ─── */}
          {tab === "actions" && (
            <motion.div key="actions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                {actions.map((action, i) => (
                  <motion.button key={action.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    whileTap={{ scale: 0.97 }} onClick={() => runAction(action.id)} disabled={action.running}
                    className="rounded-2xl border border-border/60 bg-card p-4 text-left hover:bg-muted/30 transition-all disabled:opacity-60 group">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-xl ${action.bg} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                        {action.running ? <Loader2 size={18} className="animate-spin text-primary" /> : <action.icon size={18} className={action.color} />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-foreground">{action.title}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{action.description}</p>
                      </div>
                      <ChevronRight size={16} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Action Log */}
              {actionResults.length > 0 && (
                <div className="rounded-2xl border border-border/60 bg-card p-4 space-y-2.5">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Activity size={12} /> Action Log
                  </h4>
                  {actionResults.slice(0, 10).map((r, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                      className="flex items-start gap-2.5 text-xs text-foreground py-1.5 border-b border-border/30 last:border-0">
                      <CheckCircle size={13} className="text-emerald-500 mt-0.5 shrink-0" />
                      <span className="leading-relaxed">{r}</span>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
