import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, IndianRupee, Users, CalendarCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, AreaChart, Area
} from "recharts";

const COLORS = ["hsl(270,80%,65%)", "hsl(160,60%,42%)", "hsl(43,96%,56%)", "hsl(200,80%,55%)", "hsl(0,72%,55%)"];

export default function AdminAnalytics() {
  const [bookingsByStatus, setBookingsByStatus] = useState<any[]>([]);
  const [revenueByDay, setRevenueByDay] = useState<any[]>([]);
  const [topProperties, setTopProperties] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data: bookings } = await supabase.from("bookings").select("status, total, date, property_id, created_at");
      if (!bookings) return;

      // Status breakdown
      const statusMap = new Map<string, number>();
      bookings.forEach(b => statusMap.set(b.status, (statusMap.get(b.status) || 0) + 1));
      setBookingsByStatus(Array.from(statusMap, ([name, value]) => ({ name, value })));

      // Revenue by day (last 14 days)
      const dayMap = new Map<string, number>();
      bookings.forEach(b => {
        const d = b.created_at?.slice(0, 10) || b.date;
        dayMap.set(d, (dayMap.get(d) || 0) + Number(b.total));
      });
      const sorted = Array.from(dayMap, ([day, revenue]) => ({ day: day.slice(5), revenue }))
        .sort((a, b) => a.day.localeCompare(b.day)).slice(-14);
      setRevenueByDay(sorted);

      // Top properties
      const propMap = new Map<string, number>();
      bookings.forEach(b => propMap.set(b.property_id, (propMap.get(b.property_id) || 0) + Number(b.total)));
      setTopProperties(
        Array.from(propMap, ([property, revenue]) => ({ property: property.slice(0, 15), revenue }))
          .sort((a, b) => b.revenue - a.revenue).slice(0, 5)
      );
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <BarChart3 size={22} className="text-primary" /> Analytics
        </h1>
        <p className="text-sm text-muted-foreground">Revenue, bookings & performance insights</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue by Day */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border bg-card p-4">
          <h3 className="text-sm font-bold text-foreground mb-4">Daily Revenue</h3>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueByDay}>
                <defs>
                  <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(270,80%,65%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(270,80%,65%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(260,10%,55%)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(260,10%,55%)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "hsl(260,18%,10%)", border: "1px solid hsl(260,15%,16%)", borderRadius: 12, fontSize: 12 }} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(270,80%,65%)" strokeWidth={2} fill="url(#aGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Booking Status Pie */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl border border-border bg-card p-4">
          <h3 className="text-sm font-bold text-foreground mb-4">Booking Status Breakdown</h3>
          <div className="h-[220px] flex items-center justify-center">
            {bookingsByStatus.length === 0 ? (
              <p className="text-sm text-muted-foreground">No booking data</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={bookingsByStatus} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {bookingsByStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* Top Properties */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-2xl border border-border bg-card p-4 lg:col-span-2">
          <h3 className="text-sm font-bold text-foreground mb-4">Top Properties by Revenue</h3>
          <div className="h-[200px]">
            {topProperties.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProperties} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(260,10%,55%)" }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="property" tick={{ fontSize: 10, fill: "hsl(260,10%,55%)" }} axisLine={false} tickLine={false} width={100} />
                  <Tooltip contentStyle={{ background: "hsl(260,18%,10%)", border: "1px solid hsl(260,15%,16%)", borderRadius: 12, fontSize: 12 }} />
                  <Bar dataKey="revenue" fill="hsl(270,80%,65%)" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
