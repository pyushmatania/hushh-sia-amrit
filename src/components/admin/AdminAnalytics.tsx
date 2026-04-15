import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3, TrendingUp, ArrowUpRight, ArrowDownRight, IndianRupee, CalendarCheck,
  Eye, Target, Users, ShoppingCart, Clock, Star, Flame, Award, MapPin
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getListingThumbnail } from "@/lib/listing-thumbnails";
import { DEMO_BOOKINGS, DEMO_ORDERS, DEMO_ORDER_ITEMS, DEMO_LISTINGS, DEMO_PROFILES } from "./admin-demo-data";
import DemoDataBanner from "./DemoDataBanner";
import { useDataMode } from "@/hooks/use-data-mode";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, AreaChart, Area, CartesianGrid, LineChart, Line
} from "recharts";

const COLORS = ["#818cf8", "#34d399", "#fbbf24", "#60a5fa", "#f87171", "#a78bfa", "#fb923c", "#2dd4bf"];
const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };
const stagger = { animate: { transition: { staggerChildren: 0.06 } } };

interface PropertyInfo { name: string; imageUrls: string[]; location: string; rating: number | null }

export default function AdminAnalytics() {
  const [tab, setTab] = useState<"overview" | "revenue" | "guests" | "operations">("overview");
  const [bookingsByStatus, setBookingsByStatus] = useState<any[]>([]);
  const [revenueByDay, setRevenueByDay] = useState<any[]>([]);
  const [topProperties, setTopProperties] = useState<any[]>([]);
  const [hourlyData, setHourlyData] = useState<any[]>([]);
  const [slotData, setSlotData] = useState<any[]>([]);
  const [guestTiers, setGuestTiers] = useState<any[]>([]);
  const [repeatRate, setRepeatRate] = useState(0);
  const [orderStats, setOrderStats] = useState({ totalOrders: 0, avgOrderValue: 0, totalFoodRevenue: 0, topItem: "" });
  const [summary, setSummary] = useState({
    totalRevenue: 0, avgBooking: 0, totalBookings: 0, totalGuests: 0,
    thisWeekRev: 0, lastWeekRev: 0, thisWeekBookings: 0, lastWeekBookings: 0
  });
  const [propertyMap, setPropertyMap] = useState(new Map<string, PropertyInfo>());
  const [isDemo, setIsDemo] = useState(false);
  const { isDemoMode } = useDataMode();

  useEffect(() => {
    const load = async () => {
      const [bookingsRes, ordersRes, itemsRes, listingsRes, profilesRes] = await Promise.all([
        supabase.from("bookings").select("*"),
        supabase.from("orders").select("*"),
        supabase.from("order_items").select("*"),
        supabase.from("host_listings").select("id, name, image_urls, location, rating"),
        supabase.from("profiles").select("user_id, tier, loyalty_points"),
      ]);

      const hasRealData = (bookingsRes.data && bookingsRes.data.length > 0) || !isDemoMode;
      const bookings = (bookingsRes.data && bookingsRes.data.length > 0) ? bookingsRes.data! : isDemoMode ? DEMO_BOOKINGS as any[] : [];
      const orders = (bookingsRes.data && bookingsRes.data.length > 0) ? (ordersRes.data || []) : isDemoMode ? DEMO_ORDERS as any[] : [];
      const items = (bookingsRes.data && bookingsRes.data.length > 0) ? (itemsRes.data || []) : isDemoMode ? DEMO_ORDER_ITEMS as any[] : [];
      const listings = (bookingsRes.data && bookingsRes.data.length > 0) ? (listingsRes.data || []) : isDemoMode ? DEMO_LISTINGS as any[] : [];
      const profiles = (bookingsRes.data && bookingsRes.data.length > 0) ? (profilesRes.data || []) : isDemoMode ? DEMO_PROFILES as any[] : [];
      if (!hasRealData && isDemoMode) setIsDemo(true);

      // Property map
      const pMap = new Map<string, PropertyInfo>();
      listings.forEach(l => pMap.set(l.id, { name: l.name, imageUrls: l.image_urls || [], location: l.location, rating: l.rating }));
      setPropertyMap(pMap);

      // Booking status
      const statusMap = new Map<string, number>();
      bookings.forEach(b => statusMap.set(b.status, (statusMap.get(b.status) || 0) + 1));
      setBookingsByStatus(Array.from(statusMap, ([name, value]) => ({ name, value })));

      // Revenue by day (14 days)
      const dayMap = new Map<string, number>();
      bookings.forEach(b => {
        const d = b.created_at?.slice(0, 10) || b.date;
        dayMap.set(d, (dayMap.get(d) || 0) + Number(b.total));
      });
      orders.forEach(o => {
        const d = o.created_at?.slice(0, 10);
        if (d) dayMap.set(d, (dayMap.get(d) || 0) + Number(o.total));
      });
      const sortedDays = Array.from(dayMap, ([day, revenue]) => ({ day: day.slice(5), revenue }))
        .sort((a, b) => a.day.localeCompare(b.day)).slice(-14);
      setRevenueByDay(sortedDays);

      // Top properties with real names
      const propRevMap = new Map<string, number>();
      bookings.forEach(b => propRevMap.set(b.property_id, (propRevMap.get(b.property_id) || 0) + Number(b.total)));
      const topProps = Array.from(propRevMap, ([id, revenue]) => {
        const info = pMap.get(id);
        return { id, property: info?.name || id.slice(0, 12), revenue, imageUrls: info?.imageUrls || [], rating: info?.rating };
      }).sort((a, b) => b.revenue - a.revenue).slice(0, 6);
      setTopProperties(topProps);

      // Hourly distribution
      const hourMap = new Map<number, number>();
      for (let h = 6; h <= 23; h++) hourMap.set(h, 0);
      bookings.forEach(b => {
        const hour = new Date(b.created_at).getHours();
        hourMap.set(hour, (hourMap.get(hour) || 0) + 1);
      });
      setHourlyData(Array.from(hourMap, ([hour, count]) => ({
        hour: `${hour > 12 ? hour - 12 : hour}${hour >= 12 ? "pm" : "am"}`,
        bookings: count,
      })));

      // Slot performance
      const slotMap = new Map<string, { count: number; revenue: number }>();
      bookings.forEach(b => {
        const slot = b.slot || "Unknown";
        const prev = slotMap.get(slot) || { count: 0, revenue: 0 };
        slotMap.set(slot, { count: prev.count + 1, revenue: prev.revenue + Number(b.total) });
      });
      setSlotData(Array.from(slotMap, ([slot, data]) => ({ slot, ...data })).sort((a, b) => b.revenue - a.revenue));

      // Guest tiers
      const tierMap = new Map<string, number>();
      profiles.forEach(p => tierMap.set(p.tier, (tierMap.get(p.tier) || 0) + 1));
      setGuestTiers(Array.from(tierMap, ([tier, count]) => ({ tier, count })));

      // Repeat guest rate
      const userBookings = new Map<string, number>();
      bookings.forEach(b => userBookings.set(b.user_id, (userBookings.get(b.user_id) || 0) + 1));
      const repeats = Array.from(userBookings.values()).filter(c => c > 1).length;
      setRepeatRate(userBookings.size ? Math.round((repeats / userBookings.size) * 100) : 0);

      // Order stats
      const totalFoodRev = orders.reduce((s, o) => s + Number(o.total), 0);
      const itemCount = new Map<string, number>();
      items.forEach(it => itemCount.set(it.item_name, (itemCount.get(it.item_name) || 0) + it.quantity));
      const topItem = Array.from(itemCount).sort((a, b) => b[1] - a[1])[0];
      setOrderStats({
        totalOrders: orders.length,
        avgOrderValue: orders.length ? Math.round(totalFoodRev / orders.length) : 0,
        totalFoodRevenue: totalFoodRev,
        topItem: topItem ? `${topItem[0]} (${topItem[1]})` : "—",
      });

      // Summary with week comparison
      const now = new Date();
      const thisWeekStart = new Date(now); thisWeekStart.setDate(now.getDate() - now.getDay());
      const lastWeekStart = new Date(thisWeekStart); lastWeekStart.setDate(thisWeekStart.getDate() - 7);
      let twRev = 0, lwRev = 0, twBook = 0, lwBook = 0;
      bookings.forEach(b => {
        const d = new Date(b.created_at);
        if (d >= thisWeekStart) { twRev += Number(b.total); twBook++; }
        else if (d >= lastWeekStart) { lwRev += Number(b.total); lwBook++; }
      });

      const totalRev = bookings.reduce((s, b) => s + Number(b.total), 0) + totalFoodRev;
      const uniqueGuests = new Set(bookings.map(b => b.user_id)).size;
      setSummary({
        totalRevenue: totalRev,
        avgBooking: bookings.length ? Math.round(totalRev / bookings.length) : 0,
        totalBookings: bookings.length,
        totalGuests: uniqueGuests,
        thisWeekRev: twRev, lastWeekRev: lwRev,
        thisWeekBookings: twBook, lastWeekBookings: lwBook,
      });
    };
    load();
  }, [isDemoMode]);

  const revGrowth = summary.lastWeekRev ? Math.round(((summary.thisWeekRev - summary.lastWeekRev) / summary.lastWeekRev) * 100) : 0;
  const bookGrowth = summary.lastWeekBookings ? Math.round(((summary.thisWeekBookings - summary.lastWeekBookings) / summary.lastWeekBookings) * 100) : 0;

  const tooltipStyle = {
    background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 16, fontSize: 12,
    boxShadow: "0 8px 24px rgba(0,0,0,0.08)", padding: "10px 14px", color: "hsl(var(--foreground))",
  };

  const tabs = [
    { key: "overview" as const, label: "Overview", icon: BarChart3 },
    { key: "revenue" as const, label: "Revenue", icon: IndianRupee },
    { key: "guests" as const, label: "Guests", icon: Users },
    { key: "operations" as const, label: "Operations", icon: ShoppingCart },
  ];

  const summaryCards = [
    { label: "Total Revenue", value: `₹${summary.totalRevenue.toLocaleString("en-IN")}`, icon: IndianRupee, color: "text-emerald-500", bg: "bg-emerald-500/10", change: revGrowth, suffix: "vs last week" },
    { label: "Total Bookings", value: summary.totalBookings.toString(), icon: CalendarCheck, color: "text-blue-500", bg: "bg-blue-500/10", change: bookGrowth, suffix: "vs last week" },
    { label: "Unique Guests", value: summary.totalGuests.toString(), icon: Users, color: "text-violet-500", bg: "bg-violet-500/10", change: null, suffix: "all time" },
    { label: "Repeat Rate", value: `${repeatRate}%`, icon: Award, color: "text-amber-500", bg: "bg-amber-500/10", change: null, suffix: "returning guests" },
  ];

  return (
    <motion.div className="space-y-5" variants={stagger} initial="initial" animate="animate">
      {isDemo && <DemoDataBanner entityName="analytics" />}
      {/* Header */}
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <BarChart3 size={20} className="text-primary" />
          </div>
          Analytics
        </h1>
        <p className="text-sm lg:text-base text-muted-foreground mt-1">Revenue, bookings, guests & operations</p>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={fadeUp} className="flex gap-1.5 bg-secondary/50 p-1 rounded-xl overflow-x-auto">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              tab === t.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}>
            <t.icon size={13} /> {t.label}
          </button>
        ))}
      </motion.div>

      {/* Summary Cards — always visible */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {summaryCards.map((card) => (
          <motion.div key={card.label} variants={fadeUp}
            className="rounded-2xl bg-card border border-border p-4 lg:p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className={`w-8 h-8 rounded-xl ${card.bg} flex items-center justify-center`}>
                <card.icon size={16} className={card.color} />
              </div>
              {card.change !== null && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${
                  card.change >= 0 ? "text-emerald-600 bg-emerald-500/10" : "text-red-500 bg-red-500/10"
                }`}>
                  {card.change >= 0 ? <ArrowUpRight size={9} /> : <ArrowDownRight size={9} />}
                  {Math.abs(card.change)}%
                </span>
              )}
            </div>
            <p className="text-xl lg:text-2xl font-bold text-foreground tabular-nums">{card.value}</p>
            <p className="text-[10px] lg:text-xs text-muted-foreground mt-0.5">{card.label} · {card.suffix}</p>
          </motion.div>
        ))}
      </div>

      {/* === OVERVIEW TAB === */}
      {tab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Revenue Trend */}
          <motion.div variants={fadeUp} className="rounded-2xl bg-card border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <TrendingUp size={14} className="text-primary" /> Revenue Trend
              </h3>
              <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-lg">14 days</span>
            </div>
            <div className="h-[200px] lg:h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueByDay}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#818cf8" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#818cf8" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="revenue" stroke="#818cf8" strokeWidth={2.5} fill="url(#revGrad)" dot={{ fill: "#818cf8", r: 2, strokeWidth: 0 }} activeDot={{ r: 5, fill: "#818cf8", stroke: "#fff", strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Booking Status Donut */}
          <motion.div variants={fadeUp} className="rounded-2xl bg-card border border-border p-5">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-4">
              <Eye size={14} className="text-violet-500" /> Booking Status
            </h3>
            <div className="h-[200px] flex items-center justify-center">
              {bookingsByStatus.length === 0 ? (
                <p className="text-sm text-muted-foreground">No booking data</p>
              ) : (
                <div className="flex items-center gap-4 w-full">
                  <ResponsiveContainer width="55%" height={180}>
                    <PieChart>
                      <Pie data={bookingsByStatus} cx="50%" cy="50%" outerRadius={70} innerRadius={45} dataKey="value" strokeWidth={2} stroke="hsl(var(--card))">
                        {bookingsByStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 flex-1">
                    {bookingsByStatus.map((item, i) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-[11px] text-muted-foreground capitalize flex-1">{item.name}</span>
                        <span className="text-[11px] font-bold text-foreground tabular-nums">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* === REVENUE TAB === */}
      {tab === "revenue" && (
        <div className="space-y-4">
          {/* Top Properties with thumbnails */}
          <motion.div variants={fadeUp} className="rounded-2xl bg-card border border-border p-5">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-4">
              <Flame size={14} className="text-amber-500" /> Top Properties by Revenue
            </h3>
            <div className="space-y-3">
              {topProperties.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
              ) : topProperties.map((p, i) => {
                const thumb = getListingThumbnail(p.property, p?.imageUrls || [], { preferMapped: true });
                const maxRev = topProperties[0]?.revenue || 1;
                return (
                  <div key={p.id} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-muted-foreground w-5 text-right">#{i + 1}</span>
                    {thumb ? (
                      <img src={thumb} alt={p.property} className="w-9 h-9 rounded-xl object-cover ring-1 ring-border/30 shrink-0" />
                    ) : (
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">{p.property[0]}</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{p.property}</p>
                      <div className="mt-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60" style={{ width: `${(p.revenue / maxRev) * 100}%` }} />
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-foreground tabular-nums">₹{p.revenue.toLocaleString("en-IN")}</p>
                      {p.rating > 0 && <p className="text-[10px] text-muted-foreground flex items-center gap-0.5 justify-end"><Star size={9} className="text-amber-400" />{p.rating}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Slot Performance */}
          <motion.div variants={fadeUp} className="rounded-2xl bg-card border border-border p-5">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-4">
              <Clock size={14} className="text-blue-500" /> Slot Performance
            </h3>
            {slotData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No slot data</p>
            ) : (
              <div className="space-y-3">
                {slotData.map((s, i) => (
                  <div key={s.slot} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                      i === 0 ? "bg-amber-500/15 text-amber-600" : "bg-secondary text-muted-foreground"
                    }`}>{i === 0 ? "🥇" : i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground">{s.slot}</p>
                      <p className="text-[10px] text-muted-foreground">{s.count} bookings</p>
                    </div>
                    <p className="text-xs font-bold text-foreground tabular-nums">₹{s.revenue.toLocaleString("en-IN")}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Revenue by day chart */}
          <motion.div variants={fadeUp} className="rounded-2xl bg-card border border-border p-5">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-4">
              <IndianRupee size={14} className="text-emerald-500" /> Combined Revenue (Bookings + Orders)
            </h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueByDay} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="revenue" fill="#34d399" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      )}

      {/* === GUESTS TAB === */}
      {tab === "guests" && (
        <div className="space-y-4">
          {/* Guest Tier Distribution */}
          <motion.div variants={fadeUp} className="rounded-2xl bg-card border border-border p-5">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-4">
              <Award size={14} className="text-violet-500" /> Loyalty Tier Distribution
            </h3>
            <div className="h-[200px] flex items-center justify-center">
              {guestTiers.length === 0 ? (
                <p className="text-sm text-muted-foreground">No guest data</p>
              ) : (
                <div className="flex items-center gap-4 w-full">
                  <ResponsiveContainer width="55%" height={180}>
                    <PieChart>
                      <Pie data={guestTiers} cx="50%" cy="50%" outerRadius={70} innerRadius={45} dataKey="count" nameKey="tier" strokeWidth={2} stroke="hsl(var(--card))">
                        {guestTiers.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2.5 flex-1">
                    {guestTiers.map((item, i) => {
                      const tierEmoji: Record<string, string> = { Silver: "🥈", Gold: "🥇", Platinum: "💎", Diamond: "👑" };
                      return (
                        <div key={item.tier} className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          <span className="text-[11px] text-muted-foreground flex-1">{tierEmoji[item.tier] || "⭐"} {item.tier}</span>
                          <span className="text-[11px] font-bold text-foreground tabular-nums">{item.count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Guest KPIs */}
          <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-card border border-border p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center"><Users size={14} className="text-emerald-500" /></div>
              </div>
              <p className="text-lg font-bold text-foreground">{summary.totalGuests}</p>
              <p className="text-[10px] text-muted-foreground">Unique Guests</p>
            </div>
            <div className="rounded-2xl bg-card border border-border p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-violet-500/10 flex items-center justify-center"><Award size={14} className="text-violet-500" /></div>
              </div>
              <p className="text-lg font-bold text-foreground">{repeatRate}%</p>
              <p className="text-[10px] text-muted-foreground">Repeat Guest Rate</p>
            </div>
            <div className="rounded-2xl bg-card border border-border p-4 col-span-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center"><Target size={14} className="text-amber-500" /></div>
              </div>
              <p className="text-lg font-bold text-foreground">₹{summary.avgBooking.toLocaleString("en-IN")}</p>
              <p className="text-[10px] text-muted-foreground">Average Revenue Per Guest</p>
            </div>
          </motion.div>

          {/* Hourly Booking Heatmap */}
          <motion.div variants={fadeUp} className="rounded-2xl bg-card border border-border p-5">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-4">
              <Clock size={14} className="text-blue-500" /> Booking Time Heatmap
            </h3>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyData} barCategoryGap="15%">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="hour" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="bookings" fill="#818cf8" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      )}

      {/* === OPERATIONS TAB === */}
      {tab === "operations" && (
        <div className="space-y-4">
          {/* Food Order KPIs */}
          <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3">
            {[
              { label: "Total Food Orders", value: orderStats.totalOrders.toString(), icon: ShoppingCart, color: "text-blue-500", bg: "bg-blue-500/10" },
              { label: "Avg Order Value", value: `₹${orderStats.avgOrderValue.toLocaleString("en-IN")}`, icon: IndianRupee, color: "text-emerald-500", bg: "bg-emerald-500/10" },
              { label: "Food Revenue", value: `₹${orderStats.totalFoodRevenue.toLocaleString("en-IN")}`, icon: Flame, color: "text-amber-500", bg: "bg-amber-500/10" },
              { label: "Top Item", value: orderStats.topItem, icon: Star, color: "text-violet-500", bg: "bg-violet-500/10" },
            ].map(card => (
              <div key={card.label} className="rounded-2xl bg-card border border-border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-7 h-7 rounded-lg ${card.bg} flex items-center justify-center`}><card.icon size={14} className={card.color} /></div>
                </div>
                <p className="text-sm font-bold text-foreground truncate">{card.value}</p>
                <p className="text-[10px] text-muted-foreground">{card.label}</p>
              </div>
            ))}
          </motion.div>

          {/* Slot vs Revenue chart */}
          <motion.div variants={fadeUp} className="rounded-2xl bg-card border border-border p-5">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-4">
              <BarChart3 size={14} className="text-primary" /> Revenue by Slot
            </h3>
            {slotData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No slot data</p>
            ) : (
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={slotData} barCategoryGap="25%">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="slot" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="revenue" fill="#60a5fa" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="count" fill="#fbbf24" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </motion.div>

          {/* Properties by location */}
          <motion.div variants={fadeUp} className="rounded-2xl bg-card border border-border p-5">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-4">
              <MapPin size={14} className="text-emerald-500" /> Property Portfolio
            </h3>
            <div className="space-y-3">
              {Array.from(propertyMap).slice(0, 8).map(([id, info]) => {
                const thumb = getListingThumbnail(info.name, info?.imageUrls || [], { preferMapped: true });
                return (
                  <div key={id} className="flex items-center gap-3">
                    {thumb ? (
                      <img src={thumb} alt={info.name} className="w-10 h-10 rounded-xl object-cover ring-1 ring-border/30 shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">{info.name[0]}</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{info.name}</p>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1"><MapPin size={9} />{info.location}</p>
                    </div>
                    {info.rating && info.rating > 0 && (
                      <span className="text-[10px] font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        <Star size={9} /> {info.rating}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
