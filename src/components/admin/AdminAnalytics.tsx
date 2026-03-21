import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, ArrowUpRight, IndianRupee, CalendarCheck, Eye, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, AreaChart, Area, CartesianGrid, RadialBarChart, RadialBar, Legend
} from "recharts";

const COLORS = ["#818cf8", "#34d399", "#fbbf24", "#60a5fa", "#f87171", "#a78bfa"];

const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };
const stagger = { animate: { transition: { staggerChildren: 0.08 } } };

export default function AdminAnalytics() {
  const [bookingsByStatus, setBookingsByStatus] = useState<any[]>([]);
  const [revenueByDay, setRevenueByDay] = useState<any[]>([]);
  const [topProperties, setTopProperties] = useState<any[]>([]);
  const [summary, setSummary] = useState({ totalRevenue: 0, avgBooking: 0, convRate: 78, peakDay: "Saturday" });

  useEffect(() => {
    const load = async () => {
      const { data: bookings } = await supabase.from("bookings").select("status, total, date, property_id, created_at");
      if (!bookings) return;

      const statusMap = new Map<string, number>();
      bookings.forEach(b => statusMap.set(b.status, (statusMap.get(b.status) || 0) + 1));
      setBookingsByStatus(Array.from(statusMap, ([name, value]) => ({ name, value })));

      const dayMap = new Map<string, number>();
      bookings.forEach(b => {
        const d = b.created_at?.slice(0, 10) || b.date;
        dayMap.set(d, (dayMap.get(d) || 0) + Number(b.total));
      });
      const sorted = Array.from(dayMap, ([day, revenue]) => ({ day: day.slice(5), revenue }))
        .sort((a, b) => a.day.localeCompare(b.day)).slice(-14);
      setRevenueByDay(sorted);

      const propMap = new Map<string, number>();
      bookings.forEach(b => propMap.set(b.property_id, (propMap.get(b.property_id) || 0) + Number(b.total)));
      setTopProperties(
        Array.from(propMap, ([property, revenue]) => ({ property: property.slice(0, 15), revenue }))
          .sort((a, b) => b.revenue - a.revenue).slice(0, 5)
      );

      const total = bookings.reduce((s, b) => s + Number(b.total), 0);
      setSummary({
        totalRevenue: total,
        avgBooking: bookings.length ? Math.round(total / bookings.length) : 0,
        convRate: 78,
        peakDay: "Saturday",
      });
    };
    load();
  }, []);

  const tooltipStyle = {
    background: "#fff", border: "1px solid #e4e4e7", borderRadius: 16, fontSize: 12,
    boxShadow: "0 8px 24px rgba(0,0,0,0.08)", padding: "10px 14px",
  };

  const summaryCards = [
    { label: "Total Revenue", value: `₹${summary.totalRevenue.toLocaleString("en-IN")}`, icon: IndianRupee, color: "text-emerald-600", bg: "from-emerald-50 to-green-50/50 dark:from-emerald-500/10 dark:to-green-500/5", change: "+12%" },
    { label: "Avg Booking Value", value: `₹${summary.avgBooking.toLocaleString("en-IN")}`, icon: CalendarCheck, color: "text-blue-600", bg: "from-blue-50 to-indigo-50/50 dark:from-blue-500/10 dark:to-indigo-500/5", change: "+5%" },
    { label: "Conversion Rate", value: `${summary.convRate}%`, icon: Target, color: "text-violet-600", bg: "from-violet-50 to-purple-50/50 dark:from-violet-500/10 dark:to-purple-500/5", change: "+3%" },
    { label: "Peak Day", value: summary.peakDay, icon: TrendingUp, color: "text-amber-600", bg: "from-amber-50 to-yellow-50/50 dark:from-amber-500/10 dark:to-yellow-500/5", change: "Sat" },
  ];

  return (
    <motion.div className="space-y-6" variants={stagger} initial="initial" animate="animate">
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-500/10 dark:to-indigo-500/10 flex items-center justify-center shadow-sm">
            <BarChart3 size={20} className="text-blue-600" />
          </div>
          Analytics
        </h1>
        <p className="text-sm text-zinc-400 mt-1">Revenue, bookings & performance insights</p>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {summaryCards.map((card, i) => (
          <motion.div key={card.label} variants={fadeUp}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.bg} p-4 border border-zinc-100/80 dark:border-zinc-800/80 hover:shadow-lg transition-shadow duration-300 group`}>
            <div className="absolute -right-3 -top-3 w-16 h-16 rounded-full bg-white/20 dark:bg-white/5 group-hover:scale-125 transition-transform duration-500" />
            <div className="relative flex items-center justify-between mb-2">
              <card.icon size={18} className={card.color} />
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                <ArrowUpRight size={9} /> {card.change}
              </span>
            </div>
            <p className="relative text-xl font-bold text-zinc-800 dark:text-zinc-100 tabular-nums">{card.value}</p>
            <p className="relative text-[10px] text-zinc-500 mt-0.5">{card.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Daily Revenue */}
        <motion.div variants={fadeUp}
          className="rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-zinc-100/80 dark:border-zinc-800/80 p-5 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
              <IndianRupee size={14} className="text-emerald-500" /> Daily Revenue
            </h3>
            <span className="text-[10px] font-semibold text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-1 rounded-lg">14 days</span>
          </div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueByDay}>
                <defs>
                  <linearGradient id="aGradPastel2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#818cf8" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#a5b4fc" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#a1a1aa" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#a1a1aa" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="revenue" stroke="#818cf8" strokeWidth={2.5} fill="url(#aGradPastel2)" dot={{ fill: "#818cf8", r: 2.5, strokeWidth: 0 }} activeDot={{ r: 5, fill: "#818cf8", stroke: "#fff", strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Booking Status Donut */}
        <motion.div variants={fadeUp}
          className="rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-zinc-100/80 dark:border-zinc-800/80 p-5 hover:shadow-lg transition-shadow duration-300">
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2 mb-4">
            <Eye size={14} className="text-violet-500" /> Booking Status
          </h3>
          <div className="h-[220px] flex items-center justify-center">
            {bookingsByStatus.length === 0 ? (
              <p className="text-sm text-zinc-400">No booking data</p>
            ) : (
              <div className="flex items-center gap-4 w-full">
                <ResponsiveContainer width="60%" height={200}>
                  <PieChart>
                    <Pie data={bookingsByStatus} cx="50%" cy="50%" outerRadius={75} innerRadius={48} dataKey="value" strokeWidth={2} stroke="#fff">
                      {bookingsByStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 flex-1">
                  {bookingsByStatus.map((item, i) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-[11px] text-zinc-600 dark:text-zinc-300 capitalize flex-1">{item.name}</span>
                      <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-200 tabular-nums">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Top Properties */}
        <motion.div variants={fadeUp}
          className="rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-zinc-100/80 dark:border-zinc-800/80 p-5 lg:col-span-2 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
              <TrendingUp size={14} className="text-amber-500" /> Top Properties by Revenue
            </h3>
            <span className="text-[10px] text-zinc-400">All time</span>
          </div>
          <div className="h-[220px]">
            {topProperties.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-zinc-400">No data yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProperties} layout="vertical" barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: "#a1a1aa" }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="property" tick={{ fontSize: 10, fill: "#a1a1aa" }} axisLine={false} tickLine={false} width={110} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="revenue" fill="#a5b4fc" radius={[0, 10, 10, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
