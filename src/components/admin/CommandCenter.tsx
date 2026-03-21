import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  IndianRupee, CalendarCheck, Eye, Users, TrendingUp,
  ArrowUpRight, ArrowDownRight, Flame, Clock, Sparkles, Activity,
  ShoppingCart, ChevronRight, Zap, BarChart3, Target,
  Package, Star, Bell, Shield, MapPin, Utensils,
  Calendar, Gift, AlertTriangle, CheckCircle2, XCircle,
  Percent, Award, MessageSquare, CreditCard, Ticket,
  Sun, Moon, Sunrise, Sunset, Heart, PieChart
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid, PieChart as RPieChart, Pie, Cell } from "recharts";
import LiveActivityFeed from "./LiveActivityFeed";
import LiveOrdersWidget from "./LiveOrdersWidget";
import BookingHeatmap from "./BookingHeatmap";
import WeeklyDigestPreview from "./WeeklyDigestPreview";
import NeuralSearchWidget from "./NeuralSearchWidget";
import type { AdminPage } from "./AdminLayout";

interface Stats {
  revenue: number;
  bookings: number;
  activeListings: number;
  totalUsers: number;
  pendingOrders: number;
  todayBookings: number;
  avgRating: number;
  lowStock: number;
}

interface TopProperty {
  name: string;
  bookings: number;
  revenue: number;
}

interface RecentReview {
  id: string;
  rating: number;
  content: string;
  propertyName: string;
  time: string;
}

interface TodaySlot {
  id: string;
  propertyName: string;
  slot: string;
  guests: number;
  total: number;
  status: string;
}

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
  { icon: Flame, text: "7–11 PM slots 85% full tonight", color: "text-orange-600", bg: "bg-gradient-to-br from-orange-50 to-amber-50/50 dark:from-orange-500/10 dark:to-amber-500/5", border: "border-orange-100/80 dark:border-orange-500/20" },
  { icon: TrendingUp, text: "Couple experiences trending +40%", color: "text-emerald-600", bg: "bg-gradient-to-br from-emerald-50 to-green-50/50 dark:from-emerald-500/10 dark:to-green-500/5", border: "border-emerald-100/80 dark:border-emerald-500/20" },
  { icon: Clock, text: "Low bookings tomorrow 12–4 PM", color: "text-amber-600", bg: "bg-gradient-to-br from-amber-50 to-yellow-50/50 dark:from-amber-500/10 dark:to-yellow-500/5", border: "border-amber-100/80 dark:border-amber-500/20" },
];

const mockChartData = Array.from({ length: 14 }, (_, i) => ({
  day: `Day ${i + 1}`,
  revenue: Math.floor(Math.random() * 15000) + 5000,
}));

const weeklyData = [
  { day: "Mon", value: 44, fill: "#a5b4fc" },
  { day: "Tue", value: 34, fill: "#c4b5fd" },
  { day: "Wed", value: 110, fill: "#818cf8" },
  { day: "Thu", value: 47, fill: "#a5b4fc" },
  { day: "Fri", value: 32, fill: "#c4b5fd" },
  { day: "Sat", value: 79, fill: "#818cf8" },
  { day: "Sun", value: 24, fill: "#a5b4fc" },
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
  (orderItemsRes.data ?? []).forEach(item => {
    const list = oiMap.get(item.order_id) || [];
    list.push(item);
    oiMap.set(item.order_id, list);
  });

  const context = {
    properties: listingsRes.data ?? [],
    bookings: (bookingsRes.data ?? []).map(b => ({ ...b, propertyName: listingMap.get(b.property_id) })),
    orders: (ordersRes.data ?? []).map(o => ({
      ...o, propertyName: listingMap.get(o.property_id),
      items: (oiMap.get(o.id) || []).map((i: any) => `${i.item_emoji}${i.item_name} x${i.quantity}`).join(", "),
    })),
    clients: profilesRes.data ?? [],
    reviews: (reviewsRes.data ?? []).map(r => ({ ...r, propertyName: listingMap.get(r.property_id) })),
    inventory: inventoryRes.data ?? [],
    summary: {
      totalRevenue: (bookingsRes.data ?? []).reduce((s, b) => s + Number(b.total), 0),
      totalBookings: (bookingsRes.data ?? []).length,
      totalOrders: (ordersRes.data ?? []).length,
      totalClients: (profilesRes.data ?? []).length,
    },
  };

  const resp = await supabase.functions.invoke("property-history-ai", {
    body: { query, context: JSON.stringify(context), mode: "general" },
  });
  if (resp.error) throw resp.error;
  return resp.data?.answer || "No answer found.";
}

const stagger = { animate: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

function getSlotIcon(slot: string) {
  const s = slot.toLowerCase();
  if (s.includes("morning") || s.includes("sunrise")) return Sunrise;
  if (s.includes("afternoon") || s.includes("lunch")) return Sun;
  if (s.includes("evening") || s.includes("sunset")) return Sunset;
  return Moon;
}

const PIE_COLORS = ["#818cf8", "#a5b4fc", "#c4b5fd", "#e9d5ff", "#f0abfc"];

export default function CommandCenter({ onNavigate }: { onNavigate?: (page: AdminPage) => void }) {
  const [stats, setStats] = useState<Stats>({ revenue: 0, bookings: 0, activeListings: 0, totalUsers: 0, pendingOrders: 0, todayBookings: 0, avgRating: 0, lowStock: 0 });
  const [greeting, setGreeting] = useState("Good morning");
  const [topProperties, setTopProperties] = useState<TopProperty[]>([]);
  const [recentReviews, setRecentReviews] = useState<RecentReview[]>([]);
  const [todaySchedule, setTodaySchedule] = useState<TodaySlot[]>([]);
  const [categoryData, setCategoryData] = useState<{ name: string; value: number }[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

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
      const bookings = bookingsRes.data ?? [];
      const listings = listingsRes.data ?? [];
      const users = usersRes.data ?? [];
      const orders = ordersRes.data ?? [];
      const reviews = reviewsRes.data ?? [];
      const inventory = inventoryRes.data ?? [];

      const listingMap = new Map<string, string>();
      listings.forEach(l => listingMap.set(l.id, l.name));

      const pendingOrders = orders.filter(o => o.status === "pending").length;
      const todayBk = bookings.filter(b => b.date === today);
      const ratings = reviews.map(r => r.rating);
      const avgRating = ratings.length > 0 ? +(ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : 0;
      const lowStock = inventory.filter(i => (i as any).stock <= (i as any).low_stock_threshold && (i as any).available).length;

      setStats({
        revenue: bookings.reduce((s, b) => s + Number(b.total), 0),
        bookings: bookings.length,
        activeListings: listings.filter(l => l.status === "published").length,
        totalUsers: users.length,
        pendingOrders,
        todayBookings: todayBk.length,
        avgRating,
        lowStock,
      });

      // Top properties by revenue
      const propMap: Record<string, { name: string; bookings: number; revenue: number }> = {};
      bookings.forEach(b => {
        const key = b.property_id;
        if (!propMap[key]) propMap[key] = { name: listingMap.get(key) || "Unknown", bookings: 0, revenue: 0 };
        propMap[key].bookings += 1;
        propMap[key].revenue += Number(b.total);
      });
      setTopProperties(Object.values(propMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5));

      // Category breakdown
      const catMap: Record<string, number> = {};
      bookings.forEach(b => {
        const listing = listings.find(l => l.id === b.property_id);
        const cat = listing?.category || "Other";
        catMap[cat] = (catMap[cat] || 0) + 1;
      });
      setCategoryData(Object.entries(catMap).map(([name, value]) => ({ name, value })));

      // Recent reviews
      setRecentReviews(reviews.map(r => ({
        id: r.id,
        rating: r.rating,
        content: r.content || "",
        propertyName: listingMap.get(r.property_id) || "Property",
        time: r.created_at,
      })));

      // Today's schedule
      setTodaySchedule(todayBk.slice(0, 6).map(b => ({
        id: b.property_id + b.slot,
        propertyName: listingMap.get(b.property_id) || "Property",
        slot: b.slot || "Evening",
        guests: b.guests,
        total: Number(b.total),
        status: b.status,
      })));
    });
  }, []);

  const statCards = [
    { label: "Total Revenue", value: stats.revenue, prefix: "₹", icon: IndianRupee, gradient: "from-green-50 to-emerald-50/50 dark:from-green-500/10 dark:to-emerald-500/5", iconBg: "bg-green-100 dark:bg-green-500/20", iconColor: "text-green-600", change: "+12.5%", up: true },
    { label: "Total Bookings", value: stats.bookings, prefix: "", icon: CalendarCheck, gradient: "from-blue-50 to-indigo-50/50 dark:from-blue-500/10 dark:to-indigo-500/5", iconBg: "bg-blue-100 dark:bg-blue-500/20", iconColor: "text-blue-600", change: "+8.2%", up: true },
    { label: "Active Listings", value: stats.activeListings, prefix: "", icon: Eye, gradient: "from-violet-50 to-purple-50/50 dark:from-violet-500/10 dark:to-purple-500/5", iconBg: "bg-violet-100 dark:bg-violet-500/20", iconColor: "text-violet-600", change: "+3", up: true },
    { label: "Total Users", value: stats.totalUsers, prefix: "", icon: Users, gradient: "from-rose-50 to-pink-50/50 dark:from-rose-500/10 dark:to-pink-500/5", iconBg: "bg-rose-100 dark:bg-rose-500/20", iconColor: "text-rose-600", change: "+24", up: true },
  ];

  const miniStatCards = [
    { label: "Today's Bookings", value: stats.todayBookings, icon: Calendar, color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-500/10", border: "border-indigo-100/80 dark:border-indigo-500/20" },
    { label: "Pending Orders", value: stats.pendingOrders, icon: ShoppingCart, color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-500/10", border: "border-orange-100/80 dark:border-orange-500/20", alert: stats.pendingOrders > 0 },
    { label: "Avg Rating", value: stats.avgRating, icon: Star, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-500/10", border: "border-amber-100/80 dark:border-amber-500/20", suffix: "★" },
    { label: "Low Stock", value: stats.lowStock, icon: AlertTriangle, color: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-500/10", border: "border-rose-100/80 dark:border-rose-500/20", alert: stats.lowStock > 0 },
  ];

  const quickShortcuts = [
    { label: "New Booking", icon: CalendarCheck, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-500/10", page: "bookings" as AdminPage },
    { label: "View Orders", icon: ShoppingCart, color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-500/10", page: "orders" as AdminPage },
    { label: "Analytics", icon: BarChart3, color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-500/10", page: "analytics" as AdminPage },
    { label: "Campaigns", icon: Target, color: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-500/10", page: "campaigns" as AdminPage },
    { label: "Catalog", icon: Package, color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-500/10", page: "catalog" as AdminPage },
    { label: "Calendar", icon: Calendar, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-500/10", page: "calendar" as AdminPage },
    { label: "Coupons", icon: Ticket, color: "text-pink-600", bg: "bg-pink-50 dark:bg-pink-500/10", page: "coupons" as AdminPage },
    { label: "Clients", icon: Users, color: "text-teal-600", bg: "bg-teal-50 dark:bg-teal-500/10", page: "clients" as AdminPage },
    { label: "Loyalty", icon: Gift, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-500/10", page: "loyalty" as AdminPage },
    { label: "Earnings", icon: CreditCard, color: "text-green-600", bg: "bg-green-50 dark:bg-green-500/10", page: "earnings" as AdminPage },
    { label: "Inventory", icon: Utensils, color: "text-cyan-600", bg: "bg-cyan-50 dark:bg-cyan-500/10", page: "catalog" as AdminPage },
    { label: "Audit Log", icon: Shield, color: "text-slate-600", bg: "bg-slate-50 dark:bg-slate-500/10", page: "audit" as AdminPage },
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

  return (
    <motion.div className="space-y-5" variants={stagger} initial="initial" animate="animate">
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <p className="text-zinc-400 text-sm">{greeting}! 👋</p>
          <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mt-0.5">Dashboard</h1>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            {currentTime.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short", year: "numeric" })} · {currentTime.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[11px] text-emerald-600 font-semibold">Live</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Main Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            variants={fadeUp}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.gradient} p-4 border border-zinc-100/80 dark:border-zinc-800/80 cursor-pointer transition-shadow duration-300 hover:shadow-lg group`}
          >
            <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-white/20 dark:bg-white/5 group-hover:scale-110 transition-transform duration-500" />
            <div className="relative flex items-center justify-between mb-3">
              <motion.div whileHover={{ rotate: 12 }} className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center shadow-sm`}>
                <card.icon size={18} className={card.iconColor} />
              </motion.div>
              <span className={`flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-full ${card.up ? "text-emerald-600 bg-emerald-100/60 dark:bg-emerald-500/15" : "text-rose-500 bg-rose-100/60"}`}>
                {card.up ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />} {card.change}
              </span>
            </div>
            <p className="relative text-2xl font-bold text-zinc-800 dark:text-zinc-100 tabular-nums">
              <AnimatedCounter value={card.value} prefix={card.prefix} />
            </p>
            <p className="relative text-[11px] text-zinc-500 mt-0.5 font-medium">{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Mini Stat Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {miniStatCards.map((card, i) => (
          <motion.div
            key={card.label}
            variants={fadeUp}
            className={`${card.bg} rounded-xl p-3 border ${card.border} flex items-center gap-2.5`}
          >
            <div className="w-8 h-8 rounded-lg bg-white/70 dark:bg-white/10 flex items-center justify-center shadow-sm shrink-0">
              <card.icon size={14} className={card.color} />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-bold text-zinc-800 dark:text-zinc-100 tabular-nums leading-none flex items-center gap-1">
                {card.value}
                {card.alert && (
                  <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                )}
              </p>
              <p className="text-[10px] text-zinc-500 mt-0.5 truncate">{card.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Smart Insight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {smartCards.map((card, i) => (
          <motion.div
            key={i}
            variants={fadeUp}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
            className={`${card.bg} rounded-2xl p-4 flex items-center gap-3 border ${card.border} cursor-pointer group`}
          >
            <div className="w-10 h-10 rounded-xl bg-white/70 dark:bg-white/10 flex items-center justify-center shrink-0 shadow-sm group-hover:shadow-md transition-shadow">
              <card.icon size={18} className={card.color} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] text-zinc-700 dark:text-zinc-200 font-medium leading-snug">{card.text}</p>
              <p className="text-[10px] text-zinc-400 mt-0.5 flex items-center gap-1">
                <Sparkles size={9} /> AI Insight
              </p>
            </div>
            <ChevronRight size={14} className="text-zinc-300 group-hover:text-zinc-500 transition shrink-0" />
          </motion.div>
        ))}
      </div>

      {/* Quick Shortcuts Grid */}
      <motion.div variants={fadeUp}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
            <Zap size={14} className="text-amber-500" />
            Quick Shortcuts
          </h3>
          <span className="text-[10px] text-zinc-400">{quickShortcuts.length} actions</span>
        </div>
        <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
          {quickShortcuts.map(action => (
            <motion.button
              key={action.label}
              whileHover={{ y: -3, scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate?.(action.page)}
              className={`${action.bg} rounded-xl p-3 flex flex-col items-center gap-1.5 border border-zinc-100/50 dark:border-zinc-800/50 hover:shadow-md transition group`}
            >
              <action.icon size={18} className={action.color} />
              <span className="text-[10px] font-semibold text-zinc-600 dark:text-zinc-300 leading-tight text-center">{action.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Today's Schedule Widget */}
      <motion.div variants={fadeUp} className="rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-zinc-100/80 dark:border-zinc-800/80 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
              <Calendar size={14} className="text-indigo-600" />
            </div>
            Today's Schedule
            {todaySchedule.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 text-[10px] font-bold">
                {todaySchedule.length}
              </span>
            )}
          </h3>
          <button onClick={() => onNavigate?.("calendar")} className="text-[11px] text-indigo-500 font-medium flex items-center gap-0.5 hover:underline">
            Full calendar <ChevronRight size={12} />
          </button>
        </div>

        {todaySchedule.length === 0 ? (
          <div className="text-center py-6">
            <Calendar size={24} className="mx-auto text-zinc-300 dark:text-zinc-600 mb-2" />
            <p className="text-xs text-zinc-400">No bookings scheduled for today</p>
          </div>
        ) : (
          <div className="space-y-2">
            {todaySchedule.map((slot, i) => {
              const SlotIcon = getSlotIcon(slot.slot);
              return (
                <motion.div
                  key={slot.id + i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50/80 dark:bg-zinc-800/50 border border-zinc-100/50 dark:border-zinc-700/50 group hover:border-indigo-200 dark:hover:border-indigo-500/30 transition"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-500/20 dark:to-violet-500/20 flex items-center justify-center shadow-sm">
                    <SlotIcon size={16} className="text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-200 truncate">{slot.propertyName}</p>
                    <p className="text-[10px] text-zinc-400 flex items-center gap-1.5">
                      <Clock size={8} /> {slot.slot} · <Users size={8} /> {slot.guests} guests
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-zinc-700 dark:text-zinc-200 tabular-nums">₹{slot.total.toLocaleString()}</p>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                      slot.status === "confirmed" ? "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600" : "bg-amber-100 dark:bg-amber-500/15 text-amber-600"
                    }`}>
                      {slot.status === "confirmed" ? "✓ Confirmed" : "⏳ Pending"}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* AI Command Search */}
      <motion.div variants={fadeUp}>
        <NeuralSearchWidget
          title="Ask AI"
          subtitle="Business intelligence at your fingertips"
          placeholder="Ask about revenue, guests, trends..."
          examples={commandCenterExamples}
          onSearch={handleCommandCenterSearch}
        />
      </motion.div>

      {/* Live Orders */}
      <motion.div variants={fadeUp}>
        <LiveOrdersWidget onViewAll={() => onNavigate?.("orders")} />
      </motion.div>

      {/* Top Properties + Category Mix (side by side) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Properties */}
        <motion.div variants={fadeUp} className="rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-zinc-100/80 dark:border-zinc-800/80 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                <TrendingUp size={14} className="text-emerald-600" />
              </div>
              Top Properties
            </h3>
            <button onClick={() => onNavigate?.("analytics")} className="text-[11px] text-indigo-500 font-medium flex items-center gap-0.5 hover:underline">
              Details <ChevronRight size={12} />
            </button>
          </div>
          {topProperties.length === 0 ? (
            <p className="text-xs text-zinc-400 text-center py-6">No booking data yet</p>
          ) : (
            <div className="space-y-2.5">
              {topProperties.map((prop, i) => {
                const maxRev = topProperties[0]?.revenue || 1;
                return (
                  <div key={prop.name} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-lg bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-500/20 dark:to-violet-500/20 flex items-center justify-center text-[10px] font-bold text-indigo-600 dark:text-indigo-400">{i + 1}</span>
                        <p className="text-xs font-medium text-zinc-700 dark:text-zinc-200 truncate max-w-[140px]">{prop.name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-zinc-400">{prop.bookings} bkgs</span>
                        <span className="text-xs font-bold text-zinc-700 dark:text-zinc-200 tabular-nums">₹{prop.revenue.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(prop.revenue / maxRev) * 100}%` }}
                        transition={{ duration: 0.8, delay: i * 0.1 }}
                        className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-violet-400"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Category Mix Pie */}
        <motion.div variants={fadeUp} className="rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-zinc-100/80 dark:border-zinc-800/80 p-5">
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center">
              <PieChart size={14} className="text-violet-600" />
            </div>
            Category Mix
          </h3>
          {categoryData.length === 0 ? (
            <p className="text-xs text-zinc-400 text-center py-6">No data yet</p>
          ) : (
            <div className="flex items-center gap-4">
              <div className="w-[130px] h-[130px] shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <RPieChart>
                    <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={2} strokeWidth={0}>
                      {categoryData.map((_, idx) => (
                        <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e4e4e7", borderRadius: 12, fontSize: 11, padding: "6px 10px" }} />
                  </RPieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-1.5">
                {categoryData.map((cat, idx) => (
                  <div key={cat.name} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: PIE_COLORS[idx % PIE_COLORS.length] }} />
                    <span className="text-[11px] text-zinc-600 dark:text-zinc-300 flex-1 truncate">{cat.name}</span>
                    <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-200 tabular-nums">{cat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent Reviews Widget */}
      <motion.div variants={fadeUp} className="rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-zinc-100/80 dark:border-zinc-800/80 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
              <MessageSquare size={14} className="text-amber-600" />
            </div>
            Recent Reviews
          </h3>
        </div>
        {recentReviews.length === 0 ? (
          <p className="text-xs text-zinc-400 text-center py-4">No reviews yet</p>
        ) : (
          <div className="space-y-2.5">
            {recentReviews.map((review) => (
              <div key={review.id} className="flex items-start gap-3 p-3 rounded-xl bg-zinc-50/80 dark:bg-zinc-800/50 border border-zinc-100/50 dark:border-zinc-700/50">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-100 to-yellow-100 dark:from-amber-500/20 dark:to-yellow-500/20 flex items-center justify-center shadow-sm shrink-0">
                  <Star size={14} className="text-amber-600 fill-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-200 truncate">{review.propertyName}</p>
                    <span className="text-[10px] text-zinc-400 shrink-0 ml-2">{timeAgo(review.time)}</span>
                  </div>
                  <div className="flex items-center gap-0.5 mb-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={10} className={i < review.rating ? "text-amber-400 fill-amber-400" : "text-zinc-200 dark:text-zinc-700"} />
                    ))}
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">{review.content || "No comment"}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Weekly Performance Bar Chart */}
      <motion.div
        variants={fadeUp}
        className="rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-zinc-100/80 dark:border-zinc-800/80 p-5 hover:shadow-lg hover:shadow-zinc-100/50 transition-shadow duration-300"
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
              <Activity size={16} className="text-indigo-500" />
              Weekly Performance
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">Booking volume by day</p>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-500/10">
            <TrendingUp size={12} className="text-indigo-500" />
            <span className="text-[10px] font-semibold text-indigo-600">+18%</span>
          </div>
        </div>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} barCategoryGap="25%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#a1a1aa" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#a1a1aa" }} axisLine={false} tickLine={false} hide />
              <Tooltip
                contentStyle={{ background: "#fff", border: "1px solid #e4e4e7", borderRadius: 16, fontSize: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.08)", padding: "10px 14px" }}
                cursor={{ fill: "rgba(99,102,241,0.04)", radius: 8 } as any}
              />
              <Bar dataKey="value" radius={[10, 10, 4, 4]} fill="#a5b4fc" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* System Health */}
      <motion.div variants={fadeUp} className="rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-zinc-100/80 dark:border-zinc-800/80 p-5">
        <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
            <Shield size={14} className="text-emerald-600" />
          </div>
          System Health
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { label: "Database", status: "healthy", detail: "All queries <200ms" },
            { label: "Storage", status: "healthy", detail: "4 buckets active" },
            { label: "Auth", status: "healthy", detail: "Sessions active" },
            { label: "Edge Functions", status: stats.lowStock > 0 ? "warning" : "healthy", detail: stats.lowStock > 0 ? `${stats.lowStock} alerts` : "5 deployed" },
          ].map(item => (
            <div key={item.label} className="rounded-xl bg-zinc-50/80 dark:bg-zinc-800/50 border border-zinc-100/50 dark:border-zinc-700/50 p-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                {item.status === "healthy" ? (
                  <CheckCircle2 size={12} className="text-emerald-500" />
                ) : (
                  <AlertTriangle size={12} className="text-amber-500" />
                )}
                <p className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-200">{item.label}</p>
              </div>
              <p className="text-[10px] text-zinc-400">{item.detail}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div variants={fadeUp}><BookingHeatmap /></motion.div>
        <motion.div variants={fadeUp}><LiveActivityFeed /></motion.div>
      </div>

      <motion.div variants={fadeUp}><WeeklyDigestPreview /></motion.div>

      {/* Revenue Trend */}
      <motion.div
        variants={fadeUp}
        className="rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-zinc-100/80 dark:border-zinc-800/80 p-5 hover:shadow-lg hover:shadow-zinc-100/50 transition-shadow duration-300"
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
              <IndianRupee size={16} className="text-emerald-500" />
              Revenue Trend
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">Last 14 days performance</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-zinc-800 dark:text-zinc-100 tabular-nums">
              ₹{mockChartData.reduce((s, d) => s + d.revenue, 0).toLocaleString("en-IN")}
            </p>
            <p className="text-[10px] text-emerald-500 font-semibold flex items-center gap-0.5 justify-end">
              <ArrowUpRight size={10} /> +12.5% vs prev
            </p>
          </div>
        </div>
        <div className="h-[220px] md:h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockChartData}>
              <defs>
                <linearGradient id="revGradPastel2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#818cf8" stopOpacity={0.3} />
                  <stop offset="50%" stopColor="#a5b4fc" stopOpacity={0.1} />
                  <stop offset="100%" stopColor="#a5b4fc" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#a1a1aa" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#a1a1aa" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "#fff", border: "1px solid #e4e4e7", borderRadius: 16, fontSize: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.08)", padding: "10px 14px" }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#818cf8" strokeWidth={2.5} fill="url(#revGradPastel2)" dot={{ fill: "#818cf8", r: 3, strokeWidth: 0 }} activeDot={{ r: 6, fill: "#818cf8", stroke: "#fff", strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Conversion Funnel */}
      <motion.div variants={fadeUp} className="rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-zinc-100/80 dark:border-zinc-800/80 p-5">
        <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center">
            <Target size={14} className="text-violet-600" />
          </div>
          Conversion Funnel
        </h3>
        <div className="space-y-2">
          {[
            { stage: "Page Views", value: stats.totalUsers * 12, pct: 100, color: "from-indigo-400 to-indigo-500" },
            { stage: "Wishlists", value: Math.round(stats.totalUsers * 4.5), pct: 75, color: "from-violet-400 to-violet-500" },
            { stage: "Checkout Started", value: Math.round(stats.bookings * 1.8), pct: 50, color: "from-purple-400 to-purple-500" },
            { stage: "Bookings Made", value: stats.bookings, pct: 30, color: "from-fuchsia-400 to-fuchsia-500" },
            { stage: "Reviews Left", value: Math.round(stats.bookings * 0.4), pct: 12, color: "from-pink-400 to-pink-500" },
          ].map((step, i) => (
            <div key={step.stage} className="flex items-center gap-3">
              <p className="text-[11px] text-zinc-500 w-[100px] shrink-0 truncate">{step.stage}</p>
              <div className="flex-1 h-6 bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${step.pct}%` }}
                  transition={{ duration: 0.8, delay: i * 0.1 }}
                  className={`h-full rounded-lg bg-gradient-to-r ${step.color} flex items-center justify-end pr-2`}
                >
                  <span className="text-[10px] font-bold text-white">{step.value.toLocaleString()}</span>
                </motion.div>
              </div>
              <span className="text-[10px] text-zinc-400 w-8 text-right tabular-nums">{step.pct}%</span>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
