import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, AreaChart, Area
} from "recharts";

const COLORS = ["#818cf8", "#34d399", "#fbbf24", "#60a5fa", "#f87171"];

export default function AdminAnalytics() {
  const [bookingsByStatus, setBookingsByStatus] = useState<any[]>([]);
  const [revenueByDay, setRevenueByDay] = useState<any[]>([]);
  const [topProperties, setTopProperties] = useState<any[]>([]);

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
    };
    load();
  }, []);

  const tooltipStyle = {
    background: "#fff", border: "1px solid #e4e4e7", borderRadius: 12, fontSize: 12,
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
            <BarChart3 size={18} className="text-blue-600" />
          </div>
          Analytics
        </h1>
        <p className="text-sm text-zinc-400 mt-1">Revenue, bookings & performance insights</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-5">
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 mb-4">Daily Revenue</h3>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueByDay}>
                <defs>
                  <linearGradient id="aGradPastel" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a5b4fc" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#a5b4fc" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#a1a1aa" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#a1a1aa" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="revenue" stroke="#818cf8" strokeWidth={2.5} fill="url(#aGradPastel)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-5">
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 mb-4">Booking Status</h3>
          <div className="h-[220px] flex items-center justify-center">
            {bookingsByStatus.length === 0 ? (
              <p className="text-sm text-zinc-400">No booking data</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={bookingsByStatus} cx="50%" cy="50%" outerRadius={80} innerRadius={45} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {bookingsByStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-5 lg:col-span-2">
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 mb-4">Top Properties by Revenue</h3>
          <div className="h-[200px]">
            {topProperties.length === 0 ? (
              <p className="text-sm text-zinc-400 text-center py-8">No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProperties} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 10, fill: "#a1a1aa" }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="property" tick={{ fontSize: 10, fill: "#a1a1aa" }} axisLine={false} tickLine={false} width={100} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="revenue" fill="#a5b4fc" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
