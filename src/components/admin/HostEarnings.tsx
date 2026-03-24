import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { IndianRupee, TrendingUp, CalendarCheck, Wallet, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar } from "recharts";

interface EarningsData {
  totalRevenue: number;
  thisWeek: number;
  thisMonth: number;
  avgPerDay: number;
  dailyData: { day: string; revenue: number }[];
  weeklyData: { week: string; revenue: number; bookings: number }[];
}

const formatCurrency = (v: number) => {
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
  if (v >= 1000) return `₹${(v / 1000).toFixed(1)}K`;
  return `₹${v}`;
};

export default function HostEarnings() {
  const [data, setData] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"week" | "month" | "all">("month");

  useEffect(() => {
    const load = async () => {
      const { data: bookings } = await supabase.from("bookings")
        .select("total, status, date, created_at")
        .neq("status", "cancelled");

      if (!bookings) { setLoading(false); return; }

      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 86400000);
      const monthAgo = new Date(now.getTime() - 30 * 86400000);

      const totalRevenue = bookings.reduce((s, b) => s + Number(b.total), 0);
      const thisWeek = bookings
        .filter(b => new Date(b.created_at) >= weekAgo)
        .reduce((s, b) => s + Number(b.total), 0);
      const thisMonth = bookings
        .filter(b => new Date(b.created_at) >= monthAgo)
        .reduce((s, b) => s + Number(b.total), 0);

      // Daily revenue (last 14 days)
      const dayMap = new Map<string, number>();
      for (let i = 13; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 86400000).toISOString().slice(5, 10);
        dayMap.set(d, 0);
      }
      bookings.forEach(b => {
        const d = b.created_at.slice(5, 10);
        if (dayMap.has(d)) dayMap.set(d, (dayMap.get(d) || 0) + Number(b.total));
      });
      const dailyData = Array.from(dayMap, ([day, revenue]) => ({ day, revenue }));

      // Weekly revenue (last 6 weeks)
      const weeklyData: { week: string; revenue: number; bookings: number }[] = [];
      for (let w = 5; w >= 0; w--) {
        const start = new Date(now.getTime() - (w + 1) * 7 * 86400000);
        const end = new Date(now.getTime() - w * 7 * 86400000);
        const weekBookings = bookings.filter(b => {
          const d = new Date(b.created_at);
          return d >= start && d < end;
        });
        weeklyData.push({
          week: `W${6 - w}`,
          revenue: weekBookings.reduce((s, b) => s + Number(b.total), 0),
          bookings: weekBookings.length,
        });
      }

      const days = Math.max(1, Math.ceil((now.getTime() - new Date(bookings[bookings.length - 1]?.created_at || now).getTime()) / 86400000));

      setData({
        totalRevenue, thisWeek, thisMonth,
        avgPerDay: Math.round(totalRevenue / days),
        dailyData, weeklyData,
      });
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin text-primary" size={24} />
      </div>
    );
  }

  if (!data) return <p className="text-sm text-muted-foreground text-center py-8">No earnings data</p>;

  const statCards = [
    { label: "Total Earnings", value: formatCurrency(data.totalRevenue), icon: IndianRupee, color: "text-primary", bg: "bg-primary/10" },
    { label: "This Week", value: formatCurrency(data.thisWeek), icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "This Month", value: formatCurrency(data.thisMonth), icon: CalendarCheck, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Avg/Day", value: formatCurrency(data.avgPerDay), icon: Wallet, color: "text-amber-400", bg: "bg-amber-500/10" },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Wallet size={18} className="text-primary" /> Earnings Dashboard
        </h2>
        <p className="text-xs text-muted-foreground">Revenue tracking & payout insights</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="rounded-xl border border-border bg-card p-3.5 flex items-center gap-3"
          >
            <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center shrink-0`}>
              <card.icon size={16} className={card.color} />
            </div>
            <div>
              <p className="text-base font-bold text-foreground leading-tight">{card.value}</p>
              <p className="text-[10px] text-muted-foreground">{card.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Period toggle */}
      <div className="flex gap-2">
        {(["week", "month", "all"] as const).map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition ${
              period === p ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"
            }`}
          >{p === "all" ? "All Time" : `This ${p}`}</button>
        ))}
      </div>

      {/* Daily revenue chart */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="rounded-2xl border border-border bg-card p-4"
      >
        <h3 className="text-xs font-bold text-foreground mb-3">Daily Revenue (14 days)</h3>
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.dailyData}>
              <defs>
                <linearGradient id="earnGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(160,60%,42%)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="hsl(160,60%,42%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={(v) => formatCurrency(v)} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 11 }} />
              <Area type="monotone" dataKey="revenue" stroke="hsl(160,60%,42%)" strokeWidth={2} fill="url(#earnGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Weekly breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="rounded-2xl border border-border bg-card p-4"
      >
        <h3 className="text-xs font-bold text-foreground mb-3">Weekly Breakdown</h3>
        <div className="h-[160px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.weeklyData} barSize={24}>
              <XAxis dataKey="week" tick={{ fontSize: 10, fill: "hsl(260,10%,55%)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: "hsl(260,10%,55%)" }} axisLine={false} tickLine={false} tickFormatter={(v) => formatCurrency(v)} />
              <Tooltip contentStyle={{ background: "hsl(260,18%,10%)", border: "1px solid hsl(260,15%,16%)", borderRadius: 12, fontSize: 11 }} />
              <Bar dataKey="revenue" fill="hsl(270,80%,65%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
