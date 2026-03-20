import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  IndianRupee, CalendarCheck, Eye, Users, TrendingUp,
  ArrowUpRight, Flame, Clock, Sparkles
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import LiveActivityFeed from "./LiveActivityFeed";
import BookingHeatmap from "./BookingHeatmap";
import WeeklyDigestPreview from "./WeeklyDigestPreview";

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
  { icon: Flame, text: "7–11 PM slots 85% full tonight", color: "text-orange-400", bg: "bg-orange-500/10" },
  { icon: TrendingUp, text: "Couple experiences trending +40%", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { icon: Clock, text: "Low bookings tomorrow 12–4 PM", color: "text-amber-400", bg: "bg-amber-500/10" },
];

const mockChartData = Array.from({ length: 14 }, (_, i) => ({
  day: `Day ${i + 1}`,
  revenue: Math.floor(Math.random() * 15000) + 5000,
}));

export default function CommandCenter() {
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
    { label: "Total Revenue", value: stats.revenue, prefix: "₹", icon: IndianRupee, color: "from-primary/20 to-primary/5", iconColor: "text-primary", change: "+12.5%" },
    { label: "Total Bookings", value: stats.bookings, prefix: "", icon: CalendarCheck, color: "from-emerald-500/20 to-emerald-500/5", iconColor: "text-emerald-400", change: "+8.2%" },
    { label: "Active Listings", value: stats.activeListings, prefix: "", icon: Eye, color: "from-blue-500/20 to-blue-500/5", iconColor: "text-blue-400", change: "+3" },
    { label: "Total Users", value: stats.totalUsers, prefix: "", icon: Users, color: "from-amber-500/20 to-amber-500/5", iconColor: "text-amber-400", change: "+24" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Command Center</h1>
        <p className="text-sm text-muted-foreground mt-1">Real-time overview of your operations</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`rounded-2xl border border-border bg-gradient-to-br ${card.color} p-4 relative overflow-hidden`}
          >
            <div className="flex items-center justify-between mb-3">
              <card.icon size={20} className={card.iconColor} />
              <span className="flex items-center gap-0.5 text-[11px] font-medium text-emerald-400">
                <ArrowUpRight size={12} /> {card.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground tabular-nums">
              <AnimatedCounter value={card.value} prefix={card.prefix} />
            </p>
            <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {smartCards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.08 }}
            className={`${card.bg} rounded-xl p-3 flex items-center gap-3 border border-border`}
          >
            <card.icon size={18} className={card.color} />
            <p className="text-sm text-foreground font-medium">{card.text}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BookingHeatmap />
        <LiveActivityFeed />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-2xl border border-border bg-card p-4"
      >
        <h3 className="text-sm font-bold text-foreground mb-4">Revenue Trend (14 days)</h3>
        <div className="h-[200px] md:h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockChartData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(270,80%,65%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(270,80%,65%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(260,10%,55%)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(260,10%,55%)" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "hsl(260,18%,10%)", border: "1px solid hsl(260,15%,16%)", borderRadius: 12, fontSize: 12 }}
                labelStyle={{ color: "hsl(0,0%,96%)" }}
              />
              <Area type="monotone" dataKey="revenue" stroke="hsl(270,80%,65%)" strokeWidth={2} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
