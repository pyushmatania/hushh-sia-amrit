import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IndianRupee, CalendarCheck, Eye, Users, TrendingUp,
  ArrowUpRight, ArrowDownRight, Flame, Clock, Sparkles, Activity,
  ShoppingCart, ChevronRight, Zap, BarChart3, Target,
  Package, Star, Shield, Utensils,
  Calendar, Gift, AlertTriangle, CheckCircle2,
  MessageSquare, CreditCard, Ticket,
  Sun, Moon, Sunrise, Sunset, PieChart
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid, PieChart as RPieChart, Pie, Cell } from "recharts";
import LiveActivityFeed from "./LiveActivityFeed";
import LiveOrdersWidget from "./LiveOrdersWidget";
import BookingHeatmap from "./BookingHeatmap";
import WeeklyDigestPreview from "./WeeklyDigestPreview";
import NeuralSearchWidget from "./NeuralSearchWidget";
import { useDraggableWidgets, DraggableWidgetWrapper, DashboardEditToggle } from "./DraggableWidgets";
import type { AdminPage } from "./AdminLayout";

interface Stats {
  revenue: number; bookings: number; activeListings: number; totalUsers: number;
  pendingOrders: number; todayBookings: number; avgRating: number; lowStock: number;
}
interface TopProperty { name: string; bookings: number; revenue: number; }
interface RecentReview { id: string; rating: number; content: string; propertyName: string; time: string; }
interface TodaySlot { id: string; propertyName: string; slot: string; guests: number; total: number; status: string; }

function AnimatedCounter({ value, prefix = "" }: { value: number; prefix?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.max(1, Math.floor(value / 40));
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(start);
    }, 25);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{prefix}{display.toLocaleString("en-IN")}</span>;
}

/* ── Glassmorphic card wrapper ─────────────────────────────── */
function GlassCard({ children, className = "", glow }: { children: React.ReactNode; className?: string; glow?: string }) {
  return (
    <div className={`relative rounded-[20px] bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl border border-white/40 dark:border-zinc-700/40 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.3)] overflow-hidden ${className}`}>
      {glow && <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-20 pointer-events-none ${glow}`} />}
      <div className="relative">{children}</div>
    </div>
  );
}

/* ── Section heading ─────────────────────────────── */
function SectionHead({ icon: Icon, iconBg, iconColor, title, badge, action }: {
  icon: any; iconBg: string; iconColor: string; title: string; badge?: React.ReactNode; action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-5">
      <h3 className="text-[13px] font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2.5">
        <div className={`w-8 h-8 rounded-xl ${iconBg} flex items-center justify-center shadow-sm`}>
          <Icon size={15} className={iconColor} />
        </div>
        {title}
        {badge}
      </h3>
      {action}
    </div>
  );
}

const smartCards = [
  { icon: Flame, text: "7–11 PM slots 85% full tonight", color: "text-orange-500", glow: "bg-orange-400" },
  { icon: TrendingUp, text: "Couple experiences trending +40%", color: "text-emerald-500", glow: "bg-emerald-400" },
  { icon: Clock, text: "Low bookings tomorrow 12–4 PM", color: "text-amber-500", glow: "bg-amber-400" },
];

const mockChartData = Array.from({ length: 14 }, (_, i) => ({
  day: `${i + 1}`,
  revenue: Math.floor(Math.random() * 15000) + 5000,
}));

const weeklyData = [
  { day: "Mon", value: 44 }, { day: "Tue", value: 34 }, { day: "Wed", value: 110 },
  { day: "Thu", value: 47 }, { day: "Fri", value: 32 }, { day: "Sat", value: 79 }, { day: "Sun", value: 24 },
];

const commandCenterExamples = [
  "What was our busiest day this month?",
  "Which property generates the most revenue?",
  "Top 5 most ordered food items",
  "Compare weekday vs weekend bookings",
];

async function handleCommandCenterSearch(query: string): Promise<string> {
  const [bookingsRes, ordersRes, orderItemsRes, profilesRes, listingsRes, reviewsRes, inventoryRes] = await Promise.all([
    supabase.from("bookings").select("*").order("created_at", { ascending: false }).limit(100),
    supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(100),
    supabase.from("order_items").select("*").limit(500),
    supabase.from("profiles").select("display_name, tier, loyalty_points, location, created_at, user_id").limit(100),
    supabase.from("host_listings").select("id, name, category, base_price, capacity, status").limit(50),
    supabase.from("reviews").select("property_id, rating, content, created_at").limit(100),
    supabase.from("inventory").select("name, emoji, stock, category, unit_price, available").limit(100),
  ]);
  const listingMap = new Map<string, string>();
  (listingsRes.data ?? []).forEach(l => listingMap.set(l.id, l.name));
  const oiMap = new Map<string, any[]>();
  (orderItemsRes.data ?? []).forEach(item => { const list = oiMap.get(item.order_id) || []; list.push(item); oiMap.set(item.order_id, list); });
  const context = {
    properties: listingsRes.data ?? [],
    bookings: (bookingsRes.data ?? []).map(b => ({ ...b, propertyName: listingMap.get(b.property_id) })),
    orders: (ordersRes.data ?? []).map(o => ({ ...o, propertyName: listingMap.get(o.property_id), items: (oiMap.get(o.id) || []).map((i: any) => `${i.item_emoji}${i.item_name} x${i.quantity}`).join(", ") })),
    clients: profilesRes.data ?? [],
    reviews: (reviewsRes.data ?? []).map(r => ({ ...r, propertyName: listingMap.get(r.property_id) })),
    inventory: inventoryRes.data ?? [],
    summary: { totalRevenue: (bookingsRes.data ?? []).reduce((s, b) => s + Number(b.total), 0), totalBookings: (bookingsRes.data ?? []).length, totalOrders: (ordersRes.data ?? []).length, totalClients: (profilesRes.data ?? []).length },
  };
  const resp = await supabase.functions.invoke("property-history-ai", { body: { query, context: JSON.stringify(context), mode: "general" } });
  if (resp.error) throw resp.error;
  return resp.data?.answer || "No answer found.";
}

const stagger = { animate: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } } };
const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } } };

function getSlotIcon(slot: string) {
  const s = slot.toLowerCase();
  if (s.includes("morning") || s.includes("sunrise")) return Sunrise;
  if (s.includes("afternoon") || s.includes("lunch")) return Sun;
  if (s.includes("evening") || s.includes("sunset")) return Sunset;
  return Moon;
}

const PIE_COLORS = ["hsl(239, 84%, 67%)", "hsl(263, 70%, 68%)", "hsl(280, 65%, 68%)", "hsl(295, 55%, 72%)", "hsl(310, 60%, 75%)"];
const BAR_GRADIENT_ID = "barGrad";
const AREA_GRADIENT_ID = "areaGrad";

export default function CommandCenter({ onNavigate }: { onNavigate?: (page: AdminPage) => void }) {
  const [stats, setStats] = useState<Stats>({ revenue: 0, bookings: 0, activeListings: 0, totalUsers: 0, pendingOrders: 0, todayBookings: 0, avgRating: 0, lowStock: 0 });
  const [greeting, setGreeting] = useState("Good morning");
  const [topProperties, setTopProperties] = useState<TopProperty[]>([]);
  const [recentReviews, setRecentReviews] = useState<RecentReview[]>([]);
  const [todaySchedule, setTodaySchedule] = useState<TodaySlot[]>([]);
  const [categoryData, setCategoryData] = useState<{ name: string; value: number }[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => { const t = setInterval(() => setCurrentTime(new Date()), 60000); return () => clearInterval(t); }, []);

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening");
    const today = new Date().toISOString().split("T")[0];
    Promise.all([
      supabase.from("bookings").select("total, status, property_id, date, slot, guests"),
      supabase.from("host_listings").select("id, name, status, category"),
      supabase.from("profiles").select("id"),
      supabase.from("orders").select("id, status"),
      supabase.from("reviews").select("id, rating, content, property_id, created_at").order("created_at", { ascending: false }).limit(5),
      supabase.from("inventory").select("id, stock, low_stock_threshold, available"),
    ]).then(([bookingsRes, listingsRes, usersRes, ordersRes, reviewsRes, inventoryRes]) => {
      const bookings = bookingsRes.data ?? []; const listings = listingsRes.data ?? [];
      const users = usersRes.data ?? []; const orders = ordersRes.data ?? [];
      const reviews = reviewsRes.data ?? []; const inventory = inventoryRes.data ?? [];
      const listingMap = new Map<string, string>(); listings.forEach(l => listingMap.set(l.id, l.name));
      const pendingOrders = orders.filter(o => o.status === "pending").length;
      const todayBk = bookings.filter(b => b.date === today);
      const ratings = reviews.map(r => r.rating);
      const avgRating = ratings.length > 0 ? +(ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : 0;
      const lowStock = inventory.filter(i => (i as any).stock <= (i as any).low_stock_threshold && (i as any).available).length;
      setStats({ revenue: bookings.reduce((s, b) => s + Number(b.total), 0), bookings: bookings.length, activeListings: listings.filter(l => l.status === "published").length, totalUsers: users.length, pendingOrders, todayBookings: todayBk.length, avgRating, lowStock });
      const propMap: Record<string, { name: string; bookings: number; revenue: number }> = {};
      bookings.forEach(b => { const key = b.property_id; if (!propMap[key]) propMap[key] = { name: listingMap.get(key) || "Unknown", bookings: 0, revenue: 0 }; propMap[key].bookings += 1; propMap[key].revenue += Number(b.total); });
      setTopProperties(Object.values(propMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5));
      const catMap: Record<string, number> = {};
      bookings.forEach(b => { const listing = listings.find(l => l.id === b.property_id); const cat = listing?.category || "Other"; catMap[cat] = (catMap[cat] || 0) + 1; });
      setCategoryData(Object.entries(catMap).map(([name, value]) => ({ name, value })));
      setRecentReviews(reviews.map(r => ({ id: r.id, rating: r.rating, content: r.content || "", propertyName: listingMap.get(r.property_id) || "Property", time: r.created_at })));
      setTodaySchedule(todayBk.slice(0, 6).map(b => ({ id: b.property_id + b.slot, propertyName: listingMap.get(b.property_id) || "Property", slot: b.slot || "Evening", guests: b.guests, total: Number(b.total), status: b.status })));
    });
  }, []);

  const statCards = [
    { label: "Total Revenue", value: stats.revenue, prefix: "₹", icon: IndianRupee, gradient: "from-emerald-500/10 via-emerald-500/5 to-transparent", iconBg: "bg-gradient-to-br from-emerald-400 to-green-500", iconColor: "text-white", change: "+12.5%", up: true },
    { label: "Total Bookings", value: stats.bookings, prefix: "", icon: CalendarCheck, gradient: "from-blue-500/10 via-blue-500/5 to-transparent", iconBg: "bg-gradient-to-br from-blue-400 to-indigo-500", iconColor: "text-white", change: "+8.2%", up: true },
    { label: "Active Listings", value: stats.activeListings, prefix: "", icon: Eye, gradient: "from-violet-500/10 via-violet-500/5 to-transparent", iconBg: "bg-gradient-to-br from-violet-400 to-purple-500", iconColor: "text-white", change: "+3", up: true },
    { label: "Total Users", value: stats.totalUsers, prefix: "", icon: Users, gradient: "from-rose-500/10 via-rose-500/5 to-transparent", iconBg: "bg-gradient-to-br from-rose-400 to-pink-500", iconColor: "text-white", change: "+24", up: true },
  ];

  const miniStatCards = [
    { label: "Today's Bookings", value: stats.todayBookings, icon: Calendar, color: "text-indigo-500", bg: "bg-gradient-to-br from-indigo-500/8 to-indigo-500/3", border: "border-indigo-200/50 dark:border-indigo-500/15" },
    { label: "Pending Orders", value: stats.pendingOrders, icon: ShoppingCart, color: "text-orange-500", bg: "bg-gradient-to-br from-orange-500/8 to-orange-500/3", border: "border-orange-200/50 dark:border-orange-500/15", alert: stats.pendingOrders > 0 },
    { label: "Avg Rating", value: stats.avgRating, icon: Star, color: "text-amber-500", bg: "bg-gradient-to-br from-amber-500/8 to-amber-500/3", border: "border-amber-200/50 dark:border-amber-500/15" },
    { label: "Low Stock", value: stats.lowStock, icon: AlertTriangle, color: "text-rose-500", bg: "bg-gradient-to-br from-rose-500/8 to-rose-500/3", border: "border-rose-200/50 dark:border-rose-500/15", alert: stats.lowStock > 0 },
  ];

  const quickShortcuts = [
    { label: "Bookings", icon: CalendarCheck, color: "text-blue-500", bg: "from-blue-500/10 to-blue-500/5", page: "bookings" as AdminPage },
    { label: "Orders", icon: ShoppingCart, color: "text-orange-500", bg: "from-orange-500/10 to-orange-500/5", page: "orders" as AdminPage },
    { label: "Analytics", icon: BarChart3, color: "text-violet-500", bg: "from-violet-500/10 to-violet-500/5", page: "analytics" as AdminPage },
    { label: "Campaigns", icon: Target, color: "text-rose-500", bg: "from-rose-500/10 to-rose-500/5", page: "campaigns" as AdminPage },
    { label: "Catalog", icon: Package, color: "text-indigo-500", bg: "from-indigo-500/10 to-indigo-500/5", page: "catalog" as AdminPage },
    { label: "Calendar", icon: Calendar, color: "text-emerald-500", bg: "from-emerald-500/10 to-emerald-500/5", page: "calendar" as AdminPage },
    { label: "Coupons", icon: Ticket, color: "text-pink-500", bg: "from-pink-500/10 to-pink-500/5", page: "coupons" as AdminPage },
    { label: "Clients", icon: Users, color: "text-teal-500", bg: "from-teal-500/10 to-teal-500/5", page: "clients" as AdminPage },
    { label: "Loyalty", icon: Gift, color: "text-amber-500", bg: "from-amber-500/10 to-amber-500/5", page: "loyalty" as AdminPage },
    { label: "Earnings", icon: CreditCard, color: "text-green-500", bg: "from-green-500/10 to-green-500/5", page: "earnings" as AdminPage },
    { label: "Inventory", icon: Utensils, color: "text-cyan-500", bg: "from-cyan-500/10 to-cyan-500/5", page: "catalog" as AdminPage },
    { label: "Audit Log", icon: Shield, color: "text-slate-500", bg: "from-slate-500/10 to-slate-500/5", page: "audit" as AdminPage },
  ];

  const timeAgo = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const widgets = useMemo(() => [
    {
      id: "smart-insights",
      label: "Smart Insights",
      render: () => (
        <div className="space-y-2.5">
          {smartCards.map((card, i) => (
            <motion.div key={i} whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}
              className="relative rounded-2xl bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border border-white/30 dark:border-zinc-700/30 p-4 flex items-center gap-3.5 cursor-pointer group overflow-hidden"
            >
              <div className={`absolute -left-6 top-1/2 -translate-y-1/2 w-20 h-20 rounded-full blur-2xl opacity-15 pointer-events-none ${card.glow}`} />
              <div className="relative w-10 h-10 rounded-2xl bg-white/80 dark:bg-zinc-800/80 flex items-center justify-center shrink-0 shadow-sm border border-white/50 dark:border-zinc-700/50">
                <card.icon size={18} className={card.color} />
              </div>
              <div className="relative flex-1 min-w-0">
                <p className="text-[13px] text-foreground font-medium leading-snug">{card.text}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1"><Sparkles size={9} className="text-primary" /> AI Insight</p>
              </div>
              <ChevronRight size={14} className="text-muted-foreground/40 group-hover:text-primary/60 transition shrink-0" />
            </motion.div>
          ))}
        </div>
      ),
    },
    {
      id: "quick-shortcuts",
      label: "Quick Shortcuts",
      render: () => (
        <GlassCard className="p-5" glow="bg-amber-400">
          <SectionHead icon={Zap} iconBg="bg-gradient-to-br from-amber-400 to-orange-500" iconColor="text-white" title="Quick Shortcuts"
            badge={<span className="text-[10px] text-muted-foreground ml-1">{quickShortcuts.length}</span>} />
          <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
            {quickShortcuts.map(action => (
              <motion.button key={action.label} whileHover={{ y: -4, scale: 1.05 }} whileTap={{ scale: 0.92 }}
                onClick={() => onNavigate?.(action.page)}
                className={`bg-gradient-to-br ${action.bg} rounded-2xl p-3 flex flex-col items-center gap-2 border border-white/30 dark:border-zinc-700/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group`}
              >
                <div className="w-9 h-9 rounded-xl bg-white/70 dark:bg-zinc-800/70 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                  <action.icon size={17} className={action.color} />
                </div>
                <span className="text-[10px] font-semibold text-foreground/70 leading-tight text-center">{action.label}</span>
              </motion.button>
            ))}
          </div>
        </GlassCard>
      ),
    },
    {
      id: "today-schedule",
      label: "Today's Schedule",
      render: () => (
        <GlassCard className="p-5" glow="bg-indigo-400">
          <SectionHead icon={Calendar} iconBg="bg-gradient-to-br from-indigo-400 to-violet-500" iconColor="text-white" title="Today's Schedule"
            badge={todaySchedule.length > 0 ? <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">{todaySchedule.length}</span> : undefined}
            action={<button onClick={() => onNavigate?.("calendar")} className="text-[11px] text-primary font-medium flex items-center gap-0.5 hover:underline">Full calendar <ChevronRight size={12} /></button>}
          />
          {todaySchedule.length === 0 ? (
            <div className="text-center py-8"><Calendar size={28} className="mx-auto text-muted-foreground/30 mb-2" /><p className="text-xs text-muted-foreground">No bookings scheduled for today</p></div>
          ) : (
            <div className="space-y-2">
              {todaySchedule.map((slot, i) => {
                const SlotIcon = getSlotIcon(slot.slot);
                return (
                  <motion.div key={slot.id + i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/40 dark:bg-zinc-800/40 border border-white/30 dark:border-zinc-700/30 group hover:bg-white/60 dark:hover:bg-zinc-800/60 transition-all duration-200"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400/20 to-violet-400/20 flex items-center justify-center"><SlotIcon size={17} className="text-indigo-500" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{slot.propertyName}</p>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1.5"><Clock size={9} /> {slot.slot} · <Users size={9} /> {slot.guests} guests</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-foreground tabular-nums">₹{slot.total.toLocaleString()}</p>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${slot.status === "confirmed" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}`}>
                        {slot.status === "confirmed" ? "✓ Confirmed" : "⏳ Pending"}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </GlassCard>
      ),
    },
    {
      id: "ai-search",
      label: "AI Search",
      render: () => <NeuralSearchWidget title="Ask AI" subtitle="Business intelligence at your fingertips" placeholder="Ask about revenue, guests, trends..." examples={commandCenterExamples} onSearch={handleCommandCenterSearch} />,
    },
    {
      id: "live-orders",
      label: "Live Orders",
      render: () => <LiveOrdersWidget onViewAll={() => onNavigate?.("orders")} />,
    },
    {
      id: "revenue-trend",
      label: "Revenue Trend",
      render: () => (
        <GlassCard className="p-5" glow="bg-emerald-400">
          <div className="flex items-center justify-between mb-5">
            <div>
              <SectionHead icon={IndianRupee} iconBg="bg-gradient-to-br from-emerald-400 to-green-500" iconColor="text-white" title="Revenue Trend"
                badge={<span className="text-[10px] text-muted-foreground ml-1">14 days</span>} />
            </div>
            <div className="text-right -mt-5">
              <p className="text-xl font-bold text-foreground tabular-nums">₹{mockChartData.reduce((s, d) => s + d.revenue, 0).toLocaleString("en-IN")}</p>
              <p className="text-[10px] text-emerald-500 font-semibold flex items-center gap-0.5 justify-end"><ArrowUpRight size={10} /> +12.5% vs prev</p>
            </div>
          </div>
          <div className="h-[200px] md:h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockChartData}>
                <defs>
                  <linearGradient id={AREA_GRADIENT_ID} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(239, 84%, 67%)" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="hsl(239, 84%, 67%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 5%, 92%)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(240, 4%, 65%)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(240, 4%, 65%)" }} axisLine={false} tickLine={false} width={40} />
                <Tooltip contentStyle={{ background: "hsl(0, 0%, 100%)", border: "1px solid hsl(240, 5%, 92%)", borderRadius: 16, fontSize: 12, boxShadow: "0 12px 40px -8px rgba(0,0,0,0.1)", padding: "10px 16px" }} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(239, 84%, 67%)" strokeWidth={2.5} fill={`url(#${AREA_GRADIENT_ID})`} dot={false} activeDot={{ r: 5, fill: "hsl(239, 84%, 67%)", stroke: "#fff", strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      ),
    },
    {
      id: "top-properties",
      label: "Top Properties & Categories",
      render: () => (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <GlassCard className="p-5" glow="bg-emerald-400">
            <SectionHead icon={TrendingUp} iconBg="bg-gradient-to-br from-emerald-400 to-teal-500" iconColor="text-white" title="Top Properties"
              action={<button onClick={() => onNavigate?.("analytics")} className="text-[11px] text-primary font-medium flex items-center gap-0.5 hover:underline">Details <ChevronRight size={12} /></button>}
            />
            {topProperties.length === 0 ? <p className="text-xs text-muted-foreground text-center py-6">No booking data yet</p> : (
              <div className="space-y-3">
                {topProperties.map((prop, i) => {
                  const maxRev = topProperties[0]?.revenue || 1;
                  return (
                    <motion.div key={prop.name} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">{i + 1}</span>
                          <p className="text-xs font-medium text-foreground truncate max-w-[140px]">{prop.name}</p>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <span className="text-[10px] text-muted-foreground bg-secondary/50 px-1.5 py-0.5 rounded-md">{prop.bookings} bkgs</span>
                          <span className="text-xs font-bold text-foreground tabular-nums">₹{prop.revenue.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-secondary/60 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${(prop.revenue / maxRev) * 100}%` }} transition={{ duration: 0.8, delay: i * 0.1 }}
                          className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-violet-500 shadow-sm" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </GlassCard>
          <GlassCard className="p-5" glow="bg-violet-400">
            <SectionHead icon={PieChart} iconBg="bg-gradient-to-br from-violet-400 to-purple-500" iconColor="text-white" title="Category Mix" />
            {categoryData.length === 0 ? <p className="text-xs text-muted-foreground text-center py-6">No data yet</p> : (
              <div className="flex items-center gap-5">
                <div className="w-[120px] h-[120px] shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <RPieChart><Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={32} outerRadius={55} paddingAngle={3} strokeWidth={0}>
                      {categoryData.map((_, idx) => <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />)}
                    </Pie></RPieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-2">
                  {categoryData.map((cat, idx) => (
                    <div key={cat.name} className="flex items-center gap-2.5">
                      <div className="w-3 h-3 rounded-md shrink-0 shadow-sm" style={{ background: PIE_COLORS[idx % PIE_COLORS.length] }} />
                      <span className="text-[11px] text-foreground/70 flex-1 truncate">{cat.name}</span>
                      <span className="text-[11px] font-bold text-foreground tabular-nums">{cat.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </GlassCard>
        </div>
      ),
    },
    {
      id: "weekly-performance",
      label: "Weekly Performance",
      render: () => (
        <GlassCard className="p-5" glow="bg-indigo-400">
          <div className="flex items-center justify-between mb-5">
            <SectionHead icon={Activity} iconBg="bg-gradient-to-br from-indigo-400 to-blue-500" iconColor="text-white" title="Weekly Performance"
              badge={<span className="text-[10px] text-muted-foreground ml-1">by day</span>} />
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 -mt-5">
              <TrendingUp size={12} className="text-emerald-500" /><span className="text-[10px] font-bold text-emerald-600">+18%</span>
            </div>
          </div>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} barCategoryGap="20%">
                <defs>
                  <linearGradient id={BAR_GRADIENT_ID} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(239, 84%, 67%)" />
                    <stop offset="100%" stopColor="hsl(263, 70%, 68%)" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 5%, 92%)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(240, 4%, 65%)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "hsl(0, 0%, 100%)", border: "1px solid hsl(240, 5%, 92%)", borderRadius: 16, fontSize: 12, boxShadow: "0 12px 40px -8px rgba(0,0,0,0.1)", padding: "10px 16px" }} cursor={{ fill: "hsla(239, 84%, 67%, 0.04)", radius: 8 } as any} />
                <Bar dataKey="value" radius={[10, 10, 4, 4]} fill={`url(#${BAR_GRADIENT_ID})`} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      ),
    },
    {
      id: "recent-reviews",
      label: "Recent Reviews",
      render: () => (
        <GlassCard className="p-5" glow="bg-amber-400">
          <SectionHead icon={MessageSquare} iconBg="bg-gradient-to-br from-amber-400 to-orange-500" iconColor="text-white" title="Recent Reviews" />
          {recentReviews.length === 0 ? <p className="text-xs text-muted-foreground text-center py-6">No reviews yet</p> : (
            <div className="space-y-2.5">
              {recentReviews.map((review, i) => (
                <motion.div key={review.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/40 dark:bg-zinc-800/40 border border-white/30 dark:border-zinc-700/30"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-400/20 flex items-center justify-center shadow-sm shrink-0">
                    <Star size={15} className="text-amber-500 fill-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold text-foreground truncate">{review.propertyName}</p>
                      <span className="text-[10px] text-muted-foreground shrink-0 ml-2">{timeAgo(review.time)}</span>
                    </div>
                    <div className="flex items-center gap-0.5 mb-1.5">
                      {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={10} className={i < review.rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground/20"} />)}
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">{review.content || "No comment"}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </GlassCard>
      ),
    },
    {
      id: "system-health",
      label: "System Health",
      render: () => (
        <GlassCard className="p-5" glow="bg-emerald-400">
          <SectionHead icon={Shield} iconBg="bg-gradient-to-br from-emerald-400 to-teal-500" iconColor="text-white" title="System Health" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            {[
              { label: "Database", status: "healthy", detail: "All queries <200ms", icon: "💾" },
              { label: "Storage", status: "healthy", detail: "4 buckets active", icon: "📦" },
              { label: "Auth", status: "healthy", detail: "Sessions active", icon: "🔐" },
              { label: "Functions", status: stats.lowStock > 0 ? "warning" : "healthy", detail: stats.lowStock > 0 ? `${stats.lowStock} alerts` : "5 deployed", icon: "⚡" },
            ].map(item => (
              <div key={item.label} className="rounded-2xl bg-white/40 dark:bg-zinc-800/40 border border-white/30 dark:border-zinc-700/30 p-3.5 text-center">
                <span className="text-lg">{item.icon}</span>
                <div className="flex items-center justify-center gap-1.5 mt-2 mb-1">
                  {item.status === "healthy" ? <CheckCircle2 size={12} className="text-emerald-500" /> : <AlertTriangle size={12} className="text-amber-500" />}
                  <p className="text-[11px] font-bold text-foreground">{item.label}</p>
                </div>
                <p className="text-[9px] text-muted-foreground">{item.detail}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      ),
    },
    {
      id: "heatmap-activity",
      label: "Heatmap & Activity",
      render: () => (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <BookingHeatmap />
          <LiveActivityFeed />
        </div>
      ),
    },
    {
      id: "weekly-digest",
      label: "Weekly Digest",
      render: () => <WeeklyDigestPreview />,
    },
    {
      id: "conversion-funnel",
      label: "Conversion Funnel",
      render: () => (
        <GlassCard className="p-5" glow="bg-violet-400">
          <SectionHead icon={Target} iconBg="bg-gradient-to-br from-violet-400 to-fuchsia-500" iconColor="text-white" title="Conversion Funnel" />
          <div className="space-y-2.5">
            {[
              { stage: "Page Views", value: stats.totalUsers * 12, pct: 100, color: "from-indigo-400 to-indigo-500" },
              { stage: "Wishlists", value: Math.round(stats.totalUsers * 4.5), pct: 75, color: "from-violet-400 to-violet-500" },
              { stage: "Checkout", value: Math.round(stats.bookings * 1.8), pct: 50, color: "from-purple-400 to-purple-500" },
              { stage: "Bookings", value: stats.bookings, pct: 30, color: "from-fuchsia-400 to-fuchsia-500" },
              { stage: "Reviews", value: Math.round(stats.bookings * 0.4), pct: 12, color: "from-pink-400 to-pink-500" },
            ].map((step, i) => (
              <div key={step.stage} className="flex items-center gap-3">
                <p className="text-[11px] text-muted-foreground w-[80px] shrink-0 truncate font-medium">{step.stage}</p>
                <div className="flex-1 h-7 bg-secondary/40 rounded-xl overflow-hidden relative">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${step.pct}%` }} transition={{ duration: 0.8, delay: i * 0.1 }}
                    className={`h-full rounded-xl bg-gradient-to-r ${step.color} flex items-center justify-end pr-2.5 shadow-sm`}
                  >
                    <span className="text-[10px] font-bold text-white drop-shadow-sm">{step.value.toLocaleString()}</span>
                  </motion.div>
                </div>
                <span className="text-[10px] text-muted-foreground w-8 text-right tabular-nums font-medium">{step.pct}%</span>
              </div>
            ))}
          </div>
        </GlassCard>
      ),
    },
  ], [stats, topProperties, recentReviews, todaySchedule, categoryData, onNavigate]);

  const { orderedWidgets, editMode, setEditMode, dragIdx, overIdx, handlePointerDown, handlePointerMove, handlePointerUp, resetOrder, containerRef } = useDraggableWidgets(widgets);

  return (
    <motion.div className="space-y-5 pb-8" variants={stagger} initial="initial" animate="animate">
      {/* ── Premium Header ─────────────────────────────── */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-sm font-medium">{greeting} 👋</p>
          <h1 className="text-2xl font-extrabold text-foreground mt-0.5 tracking-tight">Dashboard</h1>
          <p className="text-[11px] text-muted-foreground mt-1 font-medium">
            {currentTime.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short", year: "numeric" })} · {currentTime.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DashboardEditToggle editMode={editMode} onToggle={() => setEditMode(!editMode)} onReset={resetOrder} />
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/8 border border-emerald-500/15">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">Live</span>
          </div>
        </div>
      </motion.div>

      {/* ── Edit mode banner ─────────────────────────────── */}
      <AnimatePresence>
        {editMode && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="rounded-2xl bg-primary/5 border border-primary/15 p-4 flex items-center gap-3 backdrop-blur-sm"
          >
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>🎨</motion.div>
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-foreground">Customization Mode</p>
              <p className="text-[10px] text-muted-foreground">Drag the handles to rearrange your dashboard</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Stat Cards ─────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((card) => (
          <motion.div key={card.label} variants={fadeUp} whileHover={{ y: -5, transition: { type: "spring", stiffness: 300 } }}
            className={`relative overflow-hidden rounded-[20px] bg-gradient-to-br ${card.gradient} bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl p-4 border border-white/40 dark:border-zinc-700/30 cursor-pointer hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 group`}
          >
            {/* Decorative orb */}
            <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/10 dark:bg-white/5 group-hover:scale-125 transition-transform duration-700" />
            <div className="absolute -right-2 -bottom-2 w-16 h-16 rounded-full bg-white/5 dark:bg-white/3" />
            <div className="relative flex items-center justify-between mb-3">
              <motion.div whileHover={{ rotate: 12, scale: 1.1 }} className={`w-11 h-11 rounded-2xl ${card.iconBg} flex items-center justify-center shadow-lg shadow-primary/10`}>
                <card.icon size={19} className={card.iconColor} />
              </motion.div>
              <span className={`flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm ${card.up ? "text-emerald-600 bg-emerald-500/10" : "text-rose-500 bg-rose-500/10"}`}>
                {card.up ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />} {card.change}
              </span>
            </div>
            <p className="relative text-2xl font-extrabold text-foreground tabular-nums tracking-tight"><AnimatedCounter value={card.value} prefix={card.prefix} /></p>
            <p className="relative text-[11px] text-muted-foreground mt-1 font-semibold">{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Mini Stats ─────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {miniStatCards.map((card) => (
          <motion.div key={card.label} variants={fadeUp}
            className={`${card.bg} rounded-2xl p-3.5 border ${card.border} flex items-center gap-3 backdrop-blur-sm`}
          >
            <div className="w-9 h-9 rounded-xl bg-white/60 dark:bg-zinc-800/60 flex items-center justify-center shadow-sm shrink-0">
              <card.icon size={15} className={card.color} />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-extrabold text-foreground tabular-nums leading-none flex items-center gap-1.5">
                {card.value}
                {card.alert && <motion.span animate={{ scale: [1, 1.4, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-2 h-2 rounded-full bg-rose-500 inline-block shadow-sm shadow-rose-500/30" />}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5 truncate font-medium">{card.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Draggable widgets ─────────────────────────────── */}
      <div ref={containerRef} className="space-y-5">
        {orderedWidgets.map((widget, index) => (
          <DraggableWidgetWrapper
            key={widget.id}
            widget={widget}
            index={index}
            editMode={editMode}
            isDragging={dragIdx === index}
            isDragOver={overIdx === index && dragIdx !== index}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          />
        ))}
      </div>
    </motion.div>
  );
}
