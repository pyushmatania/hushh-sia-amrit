import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  IndianRupee, CalendarCheck, Eye, Users, TrendingUp,
  ArrowUpRight, ArrowDownRight, Flame, Clock, Sparkles, Activity,
  ShoppingCart, ChevronRight, Zap, BarChart3, Target
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid } from "recharts";
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

export default function CommandCenter({ onNavigate }: { onNavigate?: (page: AdminPage) => void }) {
  const [stats, setStats] = useState<Stats>({ revenue: 0, bookings: 0, activeListings: 0, totalUsers: 0 });
  const [greeting, setGreeting] = useState("Good morning");

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening");

    Promise.all([
      supabase.from("bookings").select("total, status"),
      supabase.from("host_listings").select("id, status"),
      supabase.from("profiles").select("id"),
    ]).then(([bookingsRes, listingsRes, usersRes]) => {
      const bookings = bookingsRes.data ?? [];
      const listings = listingsRes.data ?? [];
      const users = usersRes.data ?? [];
      setStats({
        revenue: bookings.reduce((s, b) => s + Number(b.total), 0),
        bookings: bookings.length,
        activeListings: listings.filter(l => l.status === "published").length,
        totalUsers: users.length,
      });
    });
  }, []);

  const statCards = [
    { label: "Total Revenue", value: stats.revenue, prefix: "₹", icon: IndianRupee, gradient: "from-green-50 to-emerald-50/50 dark:from-green-500/10 dark:to-emerald-500/5", iconBg: "bg-green-100 dark:bg-green-500/20", iconColor: "text-green-600", change: "+12.5%", up: true, glow: "hover:shadow-green-100/50" },
    { label: "Total Bookings", value: stats.bookings, prefix: "", icon: CalendarCheck, gradient: "from-blue-50 to-indigo-50/50 dark:from-blue-500/10 dark:to-indigo-500/5", iconBg: "bg-blue-100 dark:bg-blue-500/20", iconColor: "text-blue-600", change: "+8.2%", up: true, glow: "hover:shadow-blue-100/50" },
    { label: "Active Listings", value: stats.activeListings, prefix: "", icon: Eye, gradient: "from-violet-50 to-purple-50/50 dark:from-violet-500/10 dark:to-purple-500/5", iconBg: "bg-violet-100 dark:bg-violet-500/20", iconColor: "text-violet-600", change: "+3", up: true, glow: "hover:shadow-violet-100/50" },
    { label: "Total Users", value: stats.totalUsers, prefix: "", icon: Users, gradient: "from-rose-50 to-pink-50/50 dark:from-rose-500/10 dark:to-pink-500/5", iconBg: "bg-rose-100 dark:bg-rose-500/20", iconColor: "text-rose-600", change: "+24", up: true, glow: "hover:shadow-rose-100/50" },
  ];

  return (
    <motion.div className="space-y-6" variants={stagger} initial="initial" animate="animate">
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <p className="text-zinc-400 text-sm">{greeting}! 👋</p>
          <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mt-0.5">Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
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

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            variants={fadeUp}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.gradient} p-4 border border-zinc-100/80 dark:border-zinc-800/80 cursor-pointer transition-shadow duration-300 ${card.glow} hover:shadow-lg group`}
          >
            {/* Decorative circle */}
            <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-white/20 dark:bg-white/5 group-hover:scale-110 transition-transform duration-500" />

            <div className="relative flex items-center justify-between mb-3">
              <motion.div
                whileHover={{ rotate: 12 }}
                className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center shadow-sm`}
              >
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

      {/* Quick Actions */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {[
          { label: "New Booking", icon: CalendarCheck, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-500/10", page: "bookings" as AdminPage },
          { label: "View Orders", icon: ShoppingCart, color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-500/10", page: "orders" as AdminPage },
          { label: "Analytics", icon: BarChart3, color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-500/10", page: "analytics" as AdminPage },
          { label: "Campaigns", icon: Target, color: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-500/10", page: "campaigns" as AdminPage },
        ].map(action => (
          <motion.button
            key={action.label}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onNavigate?.(action.page)}
            className={`${action.bg} rounded-xl p-3 flex items-center gap-2.5 border border-zinc-100/50 dark:border-zinc-800/50 hover:shadow-sm transition group`}
          >
            <action.icon size={16} className={action.color} />
            <span className="text-[12px] font-semibold text-zinc-600 dark:text-zinc-300">{action.label}</span>
          </motion.button>
        ))}
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
                cursor={{ fill: "rgba(99,102,241,0.04)", radius: 8 }}
              />
              <Bar dataKey="value" radius={[10, 10, 4, 4]} fill="#a5b4fc" />
            </BarChart>
          </ResponsiveContainer>
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
    </motion.div>
  );
}
