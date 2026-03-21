import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IndianRupee, CalendarCheck, Eye, Users, TrendingUp,
  ArrowUpRight, ArrowDownRight, Flame, Clock, Sparkles, Activity,
  ShoppingCart, ChevronRight, Zap, BarChart3, Target,
  Package, Star, Shield, Utensils,
  Calendar, Gift, AlertTriangle, CheckCircle2,
  MessageSquare, CreditCard, Ticket,
  Sun, Moon, Sunrise, Sunset, PieChart,
  Wallet, UserCog, ClipboardList, FileText
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

const smartCards = [
  { icon: Flame, text: "7–11 PM slots 85% full tonight", tag: "Urgent", tagColor: "bg-rose-500" },
  { icon: TrendingUp, text: "Couple experiences trending +40%", tag: "Growth", tagColor: "bg-emerald-500" },
  { icon: Clock, text: "Low bookings tomorrow 12–4 PM", tag: "Action", tagColor: "bg-amber-500" },
];

// These will be replaced with real data in the useEffect
const emptyChartData: { day: string; revenue: number }[] = [];
const emptyWeeklyData: { day: string; value: number }[] = [];

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

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

function getSlotIcon(slot: string) {
  const s = slot.toLowerCase();
  if (s.includes("morning") || s.includes("sunrise")) return Sunrise;
  if (s.includes("afternoon") || s.includes("lunch")) return Sun;
  if (s.includes("evening") || s.includes("sunset")) return Sunset;
  return Moon;
}

const PIE_COLORS = ["hsl(250, 80%, 60%)", "hsl(280, 65%, 62%)", "hsl(200, 75%, 55%)", "hsl(340, 70%, 60%)", "hsl(160, 60%, 50%)"];

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
    { label: "Revenue", value: stats.revenue, prefix: "₹", icon: IndianRupee, accent: "from-emerald-500 to-emerald-600", accentLight: "bg-emerald-500/8", change: "+12.5%", up: true },
    { label: "Bookings", value: stats.bookings, prefix: "", icon: CalendarCheck, accent: "from-blue-500 to-blue-600", accentLight: "bg-blue-500/8", change: "+8.2%", up: true },
    { label: "Listings", value: stats.activeListings, prefix: "", icon: Eye, accent: "from-violet-500 to-violet-600", accentLight: "bg-violet-500/8", change: "+3", up: true },
    { label: "Users", value: stats.totalUsers, prefix: "", icon: Users, accent: "from-rose-500 to-rose-600", accentLight: "bg-rose-500/8", change: "+24", up: true },
  ];

  const quickActions = [
    { label: "Bookings", icon: CalendarCheck, page: "bookings" as AdminPage },
    { label: "Orders", icon: ShoppingCart, page: "orders" as AdminPage },
    { label: "Analytics", icon: BarChart3, page: "analytics" as AdminPage },
    { label: "Staff", icon: UserCog, page: "staff-mgmt" as AdminPage },
    { label: "Budget", icon: Wallet, page: "budget" as AdminPage },
    { label: "Calendar", icon: Calendar, page: "calendar" as AdminPage },
    { label: "Campaigns", icon: Target, page: "campaigns" as AdminPage },
    { label: "Catalog", icon: Package, page: "catalog" as AdminPage },
    { label: "Coupons", icon: Ticket, page: "coupons" as AdminPage },
    { label: "Clients", icon: Users, page: "clients" as AdminPage },
    { label: "Loyalty", icon: Gift, page: "loyalty" as AdminPage },
    { label: "Earnings", icon: CreditCard, page: "earnings" as AdminPage },
    { label: "Inventory", icon: Utensils, page: "inventory" as AdminPage },
    { label: "Requests", icon: ClipboardList, page: "requests" as AdminPage },
    { label: "Exports", icon: FileText, page: "exports" as AdminPage },
    { label: "Audit", icon: Shield, page: "audit" as AdminPage },
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
      label: "AI Insights",
      render: () => (
        <div className="space-y-2">
          {smartCards.map((card, i) => (
            <motion.div key={i} whileHover={{ x: 3 }} whileTap={{ scale: 0.98 }}
              className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border/60 cursor-pointer group hover:border-primary/20 transition-colors"
            >
              <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0">
                <card.icon size={16} className="text-foreground/70" />
              </div>
              <p className="text-[12px] text-foreground/80 font-medium flex-1 leading-snug">{card.text}</p>
              <span className={`text-[9px] font-bold text-white px-2 py-0.5 rounded-full ${card.tagColor}`}>{card.tag}</span>
            </motion.div>
          ))}
        </div>
      ),
    },
    {
      id: "quick-shortcuts",
      label: "Quick Actions",
      render: () => (
        <div className="rounded-2xl bg-card border border-border/60 p-4">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={14} className="text-primary" />
            <span className="text-xs font-semibold text-foreground">Quick Actions</span>
          </div>
          <div className="grid grid-cols-4 md:grid-cols-6 gap-1.5">
            {quickActions.map(action => (
              <motion.button key={action.label} whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate?.(action.page)}
                className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl hover:bg-muted/80 transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-muted group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                  <action.icon size={15} className="text-foreground/60 group-hover:text-primary transition-colors" />
                </div>
                <span className="text-[9px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">{action.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: "today-schedule",
      label: "Schedule",
      render: () => (
        <div className="rounded-2xl bg-card border border-border/60 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-primary" />
              <span className="text-xs font-semibold text-foreground">Today's Schedule</span>
              {todaySchedule.length > 0 && <span className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">{todaySchedule.length}</span>}
            </div>
            <button onClick={() => onNavigate?.("calendar")} className="text-[10px] text-primary font-medium hover:underline flex items-center gap-0.5">View all <ChevronRight size={10} /></button>
          </div>
          {todaySchedule.length === 0 ? (
            <div className="text-center py-6"><p className="text-[11px] text-muted-foreground">No bookings today</p></div>
          ) : (
            <div className="space-y-1.5">
              {todaySchedule.map((slot, i) => {
                const SlotIcon = getSlotIcon(slot.slot);
                return (
                  <motion.div key={slot.id + i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center"><SlotIcon size={14} className="text-foreground/60" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-foreground truncate">{slot.propertyName}</p>
                      <p className="text-[10px] text-muted-foreground">{slot.slot} · {slot.guests} guests</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] font-bold text-foreground tabular-nums">₹{slot.total.toLocaleString()}</p>
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${slot.status === "confirmed" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}`}>
                        {slot.status === "confirmed" ? "Confirmed" : "Pending"}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
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
      label: "Revenue",
      render: () => (
        <div className="rounded-2xl bg-card border border-border/60 p-4">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <IndianRupee size={14} className="text-primary" />
              <span className="text-xs font-semibold text-foreground">Revenue Trend</span>
              <span className="text-[9px] text-muted-foreground">14 days</span>
            </div>
            <div className="flex items-center gap-1 text-emerald-600">
              <ArrowUpRight size={11} />
              <span className="text-[10px] font-bold">+12.5%</span>
            </div>
          </div>
          <p className="text-xl font-bold text-foreground tabular-nums mb-3">₹{mockChartData.reduce((s, d) => s + d.revenue, 0).toLocaleString("en-IN")}</p>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockChartData}>
                <defs>
                  <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(250, 80%, 60%)" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="hsl(250, 80%, 60%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} strokeOpacity={0.5} />
                <XAxis dataKey="day" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={35} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 11, boxShadow: "0 8px 30px -8px rgba(0,0,0,0.12)", padding: "8px 12px" }} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(250, 80%, 60%)" strokeWidth={2} fill="url(#areaFill)" dot={false} activeDot={{ r: 4, fill: "hsl(250, 80%, 60%)", stroke: "hsl(var(--card))", strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      ),
    },
    {
      id: "financial-summary",
      label: "Finance",
      render: () => {
        const monthlyExpenses = [
          { month: "Jan", expenses: 45000, revenue: 62000 },
          { month: "Feb", expenses: 52000, revenue: 71000 },
          { month: "Mar", expenses: 48000, revenue: 85000 },
          { month: "Apr", expenses: 55000, revenue: 78000 },
          { month: "May", expenses: 41000, revenue: 69000 },
          { month: "Jun", expenses: 58000, revenue: 92000 },
        ];
        const totalRev = monthlyExpenses.reduce((s, m) => s + m.revenue, 0);
        const totalExp = monthlyExpenses.reduce((s, m) => s + m.expenses, 0);
        const netProfit = totalRev - totalExp;
        const margin = totalRev > 0 ? ((netProfit / totalRev) * 100).toFixed(1) : "0";
        return (
          <div className="rounded-2xl bg-card border border-border/60 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Wallet size={14} className="text-primary" />
                <span className="text-xs font-semibold text-foreground">Financial Summary</span>
                <span className="text-[9px] text-muted-foreground">6 months</span>
              </div>
              <button onClick={() => onNavigate?.("budget")} className="text-[10px] text-primary font-medium hover:underline flex items-center gap-0.5">
                Details <ChevronRight size={10} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="rounded-xl bg-emerald-500/10 p-2.5 text-center">
                <p className="text-[9px] text-muted-foreground font-medium">Revenue</p>
                <p className="text-sm font-bold text-emerald-600">₹{(totalRev / 1000).toFixed(0)}K</p>
              </div>
              <div className="rounded-xl bg-rose-500/10 p-2.5 text-center">
                <p className="text-[9px] text-muted-foreground font-medium">Expenses</p>
                <p className="text-sm font-bold text-rose-500">₹{(totalExp / 1000).toFixed(0)}K</p>
              </div>
              <div className={`rounded-xl p-2.5 text-center ${netProfit >= 0 ? "bg-emerald-500/10" : "bg-rose-500/10"}`}>
                <p className="text-[9px] text-muted-foreground font-medium">Net Profit</p>
                <p className={`text-sm font-bold ${netProfit >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
                  {netProfit >= 0 ? "+" : ""}₹{(netProfit / 1000).toFixed(0)}K
                </p>
                <p className="text-[8px] text-muted-foreground">{margin}% margin</p>
              </div>
            </div>
            <div className="h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyExpenses} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} strokeOpacity={0.5} />
                  <XAxis dataKey="month" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={35} tickFormatter={(v: number) => `${(v/1000).toFixed(0)}K`} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 11, boxShadow: "0 8px 30px -8px rgba(0,0,0,0.12)", padding: "8px 12px" }} formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, ""]} />
                  <Bar dataKey="revenue" fill="hsl(152, 69%, 40%)" radius={[4, 4, 0, 0]} name="Revenue" />
                  <Bar dataKey="expenses" fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} name="Expenses" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      },
    },
    {
      id: "top-properties",
      label: "Top Properties",
      render: () => (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="rounded-2xl bg-card border border-border/60 p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp size={14} className="text-primary" />
                <span className="text-xs font-semibold text-foreground">Top Properties</span>
              </div>
              <button onClick={() => onNavigate?.("analytics")} className="text-[10px] text-primary font-medium hover:underline">Details</button>
            </div>
            {topProperties.length === 0 ? <p className="text-[11px] text-muted-foreground text-center py-6">No data yet</p> : (
              <div className="space-y-3">
                {topProperties.map((prop, i) => {
                  const maxRev = topProperties[0]?.revenue || 1;
                  return (
                    <div key={prop.name} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center text-[9px] font-bold text-primary">{i + 1}</span>
                          <p className="text-[11px] font-medium text-foreground truncate max-w-[130px]">{prop.name}</p>
                        </div>
                        <span className="text-[11px] font-bold text-foreground tabular-nums">₹{prop.revenue.toLocaleString()}</span>
                      </div>
                      <div className="h-1 bg-muted rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${(prop.revenue / maxRev) * 100}%` }} transition={{ duration: 0.8, delay: i * 0.1 }}
                          className="h-full rounded-full bg-primary" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div className="rounded-2xl bg-card border border-border/60 p-4">
            <div className="flex items-center gap-2 mb-4">
              <PieChart size={14} className="text-primary" />
              <span className="text-xs font-semibold text-foreground">Categories</span>
            </div>
            {categoryData.length === 0 ? <p className="text-[11px] text-muted-foreground text-center py-6">No data</p> : (
              <div className="flex items-center gap-4">
                <div className="w-[100px] h-[100px] shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <RPieChart><Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={28} outerRadius={46} paddingAngle={3} strokeWidth={0}>
                      {categoryData.map((_, idx) => <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />)}
                    </Pie></RPieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-2">
                  {categoryData.map((cat, idx) => (
                    <div key={cat.name} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: PIE_COLORS[idx % PIE_COLORS.length] }} />
                      <span className="text-[10px] text-muted-foreground flex-1 truncate">{cat.name}</span>
                      <span className="text-[10px] font-bold text-foreground tabular-nums">{cat.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      id: "weekly-performance",
      label: "Weekly",
      render: () => (
        <div className="rounded-2xl bg-card border border-border/60 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity size={14} className="text-primary" />
              <span className="text-xs font-semibold text-foreground">Weekly Performance</span>
            </div>
            <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5"><TrendingUp size={10} /> +18%</span>
          </div>
          <div className="h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} barCategoryGap="25%">
                <defs>
                  <linearGradient id="barFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(250, 80%, 60%)" />
                    <stop offset="100%" stopColor="hsl(250, 80%, 45%)" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} strokeOpacity={0.5} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 11, padding: "8px 12px" }} cursor={{ fill: "hsla(250, 80%, 60%, 0.04)", radius: 6 } as any} />
                <Bar dataKey="value" radius={[6, 6, 2, 2]} fill="url(#barFill)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ),
    },
    {
      id: "recent-reviews",
      label: "Reviews",
      render: () => (
        <div className="rounded-2xl bg-card border border-border/60 p-4">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare size={14} className="text-primary" />
            <span className="text-xs font-semibold text-foreground">Recent Reviews</span>
          </div>
          {recentReviews.length === 0 ? <p className="text-[11px] text-muted-foreground text-center py-6">No reviews yet</p> : (
            <div className="space-y-2">
              {recentReviews.map((review, i) => (
                <motion.div key={review.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                  className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-muted/50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                    <Star size={13} className="text-amber-500 fill-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-[11px] font-semibold text-foreground truncate">{review.propertyName}</p>
                      <span className="text-[9px] text-muted-foreground shrink-0 ml-2">{timeAgo(review.time)}</span>
                    </div>
                    <div className="flex items-center gap-0.5 mb-1">
                      {Array.from({ length: 5 }).map((_, j) => <Star key={j} size={8} className={j < review.rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground/20"} />)}
                    </div>
                    <p className="text-[10px] text-muted-foreground line-clamp-2">{review.content || "No comment"}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      id: "system-health",
      label: "System",
      render: () => (
        <div className="rounded-2xl bg-card border border-border/60 p-4">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={14} className="text-primary" />
            <span className="text-xs font-semibold text-foreground">System Health</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { label: "Database", ok: true, detail: "<200ms", icon: "💾" },
              { label: "Storage", ok: true, detail: "4 buckets", icon: "📦" },
              { label: "Auth", ok: true, detail: "Active", icon: "🔐" },
              { label: "Functions", ok: stats.lowStock === 0, detail: stats.lowStock > 0 ? `${stats.lowStock} alerts` : "5 deployed", icon: "⚡" },
            ].map(item => (
              <div key={item.label} className="rounded-xl bg-muted/50 p-3 text-center">
                <span className="text-sm">{item.icon}</span>
                <div className="flex items-center justify-center gap-1 mt-1.5 mb-0.5">
                  {item.ok ? <CheckCircle2 size={10} className="text-emerald-500" /> : <AlertTriangle size={10} className="text-amber-500" />}
                  <p className="text-[10px] font-bold text-foreground">{item.label}</p>
                </div>
                <p className="text-[8px] text-muted-foreground">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: "heatmap-activity",
      label: "Heatmap & Activity",
      render: () => (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
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
      label: "Funnel",
      render: () => (
        <div className="rounded-2xl bg-card border border-border/60 p-4">
          <div className="flex items-center gap-2 mb-4">
            <Target size={14} className="text-primary" />
            <span className="text-xs font-semibold text-foreground">Conversion Funnel</span>
          </div>
          <div className="space-y-2">
            {[
              { stage: "Page Views", value: stats.totalUsers * 12, pct: 100 },
              { stage: "Wishlists", value: Math.round(stats.totalUsers * 4.5), pct: 75 },
              { stage: "Checkout", value: Math.round(stats.bookings * 1.8), pct: 50 },
              { stage: "Bookings", value: stats.bookings, pct: 30 },
              { stage: "Reviews", value: Math.round(stats.bookings * 0.4), pct: 12 },
            ].map((step, i) => (
              <div key={step.stage} className="flex items-center gap-2.5">
                <p className="text-[10px] text-muted-foreground w-[70px] shrink-0 font-medium">{step.stage}</p>
                <div className="flex-1 h-6 bg-muted/60 rounded-lg overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${step.pct}%` }} transition={{ duration: 0.7, delay: i * 0.08 }}
                    className="h-full rounded-lg bg-primary/80 flex items-center justify-end pr-2"
                  >
                    <span className="text-[9px] font-bold text-primary-foreground">{step.value.toLocaleString()}</span>
                  </motion.div>
                </div>
                <span className="text-[9px] text-muted-foreground w-7 text-right tabular-nums font-medium">{step.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      ),
    },
  ], [stats, topProperties, recentReviews, todaySchedule, categoryData, onNavigate]);

  const { orderedWidgets, editMode, setEditMode, dragIdx, overIdx, handlePointerDown, handlePointerMove, handlePointerUp, resetOrder, containerRef } = useDraggableWidgets(widgets);

  return (
    <div className="space-y-4 pb-8">
      {/* Header */}
      <motion.div {...fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">{greeting} 👋</h1>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {currentTime.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" })} · {currentTime.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DashboardEditToggle editMode={editMode} onToggle={() => setEditMode(!editMode)} onReset={resetOrder} />
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Live</span>
          </div>
        </div>
      </motion.div>

      {/* Edit mode banner */}
      <AnimatePresence>
        {editMode && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="rounded-xl bg-primary/5 border border-primary/15 p-3 flex items-center gap-2.5"
          >
            <Sparkles size={14} className="text-primary shrink-0" />
            <p className="text-[11px] text-foreground/80"><span className="font-semibold">Customization Mode</span> — Drag handles to rearrange widgets</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stat Cards — clean minimal */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {statCards.map((card, i) => (
          <motion.div key={card.label}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06, duration: 0.4 }}
            className="rounded-2xl bg-card border border-border/60 p-3.5 hover:border-primary/20 transition-colors group"
          >
            <div className="flex items-center justify-between mb-2.5">
              <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${card.accent} flex items-center justify-center`}>
                <card.icon size={14} className="text-white" />
              </div>
              <span className={`flex items-center gap-0.5 text-[9px] font-bold ${card.up ? "text-emerald-600" : "text-rose-500"}`}>
                {card.up ? <ArrowUpRight size={9} /> : <ArrowDownRight size={9} />} {card.change}
              </span>
            </div>
            <p className="text-xl font-bold text-foreground tabular-nums leading-none"><AnimatedCounter value={card.value} prefix={card.prefix} /></p>
            <p className="text-[10px] text-muted-foreground mt-1 font-medium">{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Mini stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {[
          { label: "Today", value: stats.todayBookings, icon: Calendar, alert: false },
          { label: "Pending", value: stats.pendingOrders, icon: ShoppingCart, alert: stats.pendingOrders > 0 },
          { label: "Rating", value: stats.avgRating, icon: Star, alert: false },
          { label: "Low Stock", value: stats.lowStock, icon: AlertTriangle, alert: stats.lowStock > 0 },
        ].map((card) => (
          <div key={card.label} className="flex items-center gap-2.5 rounded-xl bg-card border border-border/60 p-2.5">
            <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <card.icon size={13} className="text-foreground/60" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground tabular-nums leading-none flex items-center gap-1">
                {card.value}
                {card.alert && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />}
              </p>
              <p className="text-[9px] text-muted-foreground mt-0.5">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Draggable widgets */}
      <div ref={containerRef} className="space-y-3">
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
    </div>
  );
}
