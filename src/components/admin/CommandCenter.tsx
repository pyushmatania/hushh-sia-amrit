import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  IndianRupee, CalendarCheck, Eye, Users, TrendingUp,
  ArrowUpRight, ArrowDownRight, Flame, Clock, Sparkles, Activity,
  ShoppingCart, ChevronRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar } from "recharts";
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
  { icon: Flame, text: "7–11 PM slots 85% full tonight", color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-500/10", border: "border-orange-100 dark:border-orange-500/20" },
  { icon: TrendingUp, text: "Couple experiences trending +40%", color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-500/10", border: "border-emerald-100 dark:border-emerald-500/20" },
  { icon: Clock, text: "Low bookings tomorrow 12–4 PM", color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-500/10", border: "border-amber-100 dark:border-amber-500/20" },
];

const mockChartData = Array.from({ length: 14 }, (_, i) => ({
  day: `Day ${i + 1}`,
  revenue: Math.floor(Math.random() * 15000) + 5000,
}));

const weeklyData = [
  { day: "Mon", value: 44 },
  { day: "Tue", value: 34 },
  { day: "Wed", value: 110 },
  { day: "Thu", value: 47 },
  { day: "Fri", value: 32 },
  { day: "Sat", value: 79 },
  { day: "Sun", value: 24 },
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

export default function CommandCenter({ onNavigate }: { onNavigate?: (page: AdminPage) => void }) {
  const [stats, setStats] = useState<Stats>({ revenue: 0, bookings: 0, activeListings: 0, totalUsers: 0 });

  useEffect(() => {
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
    { label: "Total Revenue", value: stats.revenue, prefix: "₹", icon: IndianRupee, bg: "bg-green-50 dark:bg-green-500/10", iconBg: "bg-green-100 dark:bg-green-500/20", iconColor: "text-green-600", change: "+12.5%", up: true },
    { label: "Total Bookings", value: stats.bookings, prefix: "", icon: CalendarCheck, bg: "bg-blue-50 dark:bg-blue-500/10", iconBg: "bg-blue-100 dark:bg-blue-500/20", iconColor: "text-blue-600", change: "+8.2%", up: true },
    { label: "Active Listings", value: stats.activeListings, prefix: "", icon: Eye, bg: "bg-violet-50 dark:bg-violet-500/10", iconBg: "bg-violet-100 dark:bg-violet-500/20", iconColor: "text-violet-600", change: "+3", up: true },
    { label: "Total Users", value: stats.totalUsers, prefix: "", icon: Users, bg: "bg-rose-50 dark:bg-rose-500/10", iconBg: "bg-rose-100 dark:bg-rose-500/20", iconColor: "text-rose-600", change: "+24", up: true },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-zinc-400 text-sm">Good morning! 👋</p>
          <h1 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">Dashboard</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <span className="text-xs text-emerald-600 font-medium">Live</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className={`rounded-2xl ${card.bg} p-4 border border-zinc-100 dark:border-zinc-800`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-xl ${card.iconBg} flex items-center justify-center`}>
                <card.icon size={18} className={card.iconColor} />
              </div>
              <span className={`flex items-center gap-0.5 text-[11px] font-semibold ${card.up ? "text-emerald-500" : "text-rose-500"}`}>
                {card.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />} {card.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 tabular-nums">
              <AnimatedCounter value={card.value} prefix={card.prefix} />
            </p>
            <p className="text-xs text-zinc-400 mt-0.5">{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Smart Insight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {smartCards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 + i * 0.06 }}
            className={`${card.bg} rounded-2xl p-3.5 flex items-center gap-3 border ${card.border}`}
          >
            <div className="w-8 h-8 rounded-xl bg-white/60 dark:bg-white/10 flex items-center justify-center shrink-0">
              <card.icon size={16} className={card.color} />
            </div>
            <p className="text-[13px] text-zinc-700 dark:text-zinc-200 font-medium leading-snug">{card.text}</p>
          </motion.div>
        ))}
      </div>

      {/* AI Command Search */}
      <NeuralSearchWidget
        title="Ask AI"
        subtitle="Business intelligence at your fingertips"
        placeholder="Ask about revenue, guests, trends..."
        examples={commandCenterExamples}
        onSearch={handleCommandCenterSearch}
      />

      {/* Live Orders */}
      <LiveOrdersWidget onViewAll={() => onNavigate?.("orders")} />

      {/* Weekly Performance Bar Chart */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100">Weekly Performance</h3>
            <p className="text-xs text-zinc-400 mt-0.5">Booking volume by day</p>
          </div>
        </div>
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} barCategoryGap="20%">
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#a1a1aa" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#a1a1aa" }} axisLine={false} tickLine={false} hide />
              <Tooltip
                contentStyle={{ background: "#fff", border: "1px solid #e4e4e7", borderRadius: 12, fontSize: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                cursor={{ fill: "rgba(99,102,241,0.05)" }}
              />
              <Bar dataKey="value" radius={[8, 8, 4, 4]} fill="#a5b4fc" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BookingHeatmap />
        <LiveActivityFeed />
      </div>

      <WeeklyDigestPreview />

      {/* Revenue Trend */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-5"
      >
        <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 mb-4">Revenue Trend (14 days)</h3>
        <div className="h-[200px] md:h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockChartData}>
              <defs>
                <linearGradient id="revGradPastel" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a5b4fc" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#a5b4fc" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#a1a1aa" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#a1a1aa" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "#fff", border: "1px solid #e4e4e7", borderRadius: 12, fontSize: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#818cf8" strokeWidth={2.5} fill="url(#revGradPastel)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
