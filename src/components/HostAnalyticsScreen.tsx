import { motion } from "framer-motion";
import { ArrowLeft, TrendingUp, IndianRupee, Users, CalendarDays, BarChart3 } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface HostAnalyticsScreenProps {
  onBack: () => void;
}

// Mock data — in production this would come from aggregated booking queries
const weeklyBookings = [
  { name: "Mon", bookings: 3, revenue: 8400 },
  { name: "Tue", bookings: 2, revenue: 5600 },
  { name: "Wed", bookings: 5, revenue: 14000 },
  { name: "Thu", bookings: 4, revenue: 11200 },
  { name: "Fri", bookings: 8, revenue: 22400 },
  { name: "Sat", bookings: 12, revenue: 33600 },
  { name: "Sun", bookings: 9, revenue: 25200 },
];

const monthlyRevenue = [
  { name: "Jan", revenue: 28000 },
  { name: "Feb", revenue: 42000 },
  { name: "Mar", revenue: 35000 },
  { name: "Apr", revenue: 51000 },
  { name: "May", revenue: 47000 },
  { name: "Jun", revenue: 62000 },
];

const categoryBreakdown = [
  { name: "Stays", value: 45, color: "hsl(270, 80%, 65%)" },
  { name: "Experiences", value: 25, color: "hsl(160, 60%, 42%)" },
  { name: "Party", value: 20, color: "hsl(43, 96%, 56%)" },
  { name: "Dining", value: 10, color: "hsl(320, 80%, 65%)" },
];

const summaryStats = [
  { label: "Total Revenue", value: "₹2.65L", icon: IndianRupee, color: "text-primary", bg: "bg-primary/10" },
  { label: "Total Bookings", value: "143", icon: CalendarDays, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { label: "Avg. Per Booking", value: "₹1,853", icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-500/10" },
  { label: "Repeat Guests", value: "34%", icon: Users, color: "text-amber-500", bg: "bg-amber-500/10" },
];

const occupancyData = [
  { name: "Morning", occupied: 65, total: 100 },
  { name: "Afternoon", occupied: 82, total: 100 },
  { name: "Evening", occupied: 95, total: 100 },
  { name: "Night", occupied: 78, total: 100 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl px-3 py-2 text-xs">
      <p className="font-semibold text-foreground">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-muted-foreground">
          {p.name}: {p.name === "revenue" ? `₹${(p.value / 1000).toFixed(1)}K` : p.value}
        </p>
      ))}
    </div>
  );
};

export default function HostAnalyticsScreen({ onBack }: HostAnalyticsScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      className="pb-24 bg-mesh min-h-screen"
    >
      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex items-center gap-3">
        <motion.button whileTap={{ scale: 0.9 }} onClick={onBack} className="w-9 h-9 rounded-full glass flex items-center justify-center">
          <ArrowLeft size={18} className="text-foreground" />
        </motion.button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Analytics</h1>
          <p className="text-xs text-muted-foreground">Last 6 months overview</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="px-5 grid grid-cols-2 gap-3 mb-6">
        {summaryStats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + i * 0.05 }}
            className="glass rounded-2xl p-4 flex items-center gap-3"
          >
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
              <stat.icon size={18} className={stat.color} />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground leading-tight">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Weekly Bookings Chart */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mx-5 mb-6 glass rounded-2xl p-4"
      >
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={16} className="text-primary" />
          <h3 className="text-sm font-bold text-foreground">Weekly Bookings</h3>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={weeklyBookings} barSize={20}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsla(260, 15%, 30%, 0.3)" />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(260, 10%, 55%)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "hsl(260, 10%, 55%)" }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="bookings" fill="hsl(270, 80%, 65%)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Revenue Trend */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mx-5 mb-6 glass rounded-2xl p-4"
      >
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={16} className="text-emerald-500" />
          <h3 className="text-sm font-bold text-foreground">Monthly Revenue</h3>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={monthlyRevenue}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(160, 60%, 42%)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="hsl(160, 60%, 42%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsla(260, 15%, 30%, 0.3)" />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(260, 10%, 55%)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "hsl(260, 10%, 55%)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}K`} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="revenue" stroke="hsl(160, 60%, 42%)" fill="url(#revenueGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Category Breakdown + Occupancy side by side */}
      <div className="px-5 grid grid-cols-2 gap-3 mb-6">
        {/* Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass rounded-2xl p-4"
        >
          <h3 className="text-xs font-bold text-foreground mb-2">By Category</h3>
          <ResponsiveContainer width="100%" height={120}>
            <PieChart>
              <Pie data={categoryBreakdown} cx="50%" cy="50%" innerRadius={30} outerRadius={50} dataKey="value" strokeWidth={0}>
                {categoryBreakdown.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1 mt-1">
            {categoryBreakdown.map((c) => (
              <div key={c.name} className="flex items-center gap-1.5 text-[10px]">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                <span className="text-muted-foreground">{c.name}</span>
                <span className="ml-auto font-medium text-foreground">{c.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Occupancy Bars */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-2xl p-4"
        >
          <h3 className="text-xs font-bold text-foreground mb-3">Slot Occupancy</h3>
          <div className="space-y-3">
            {occupancyData.map((slot) => (
              <div key={slot.name}>
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-muted-foreground">{slot.name}</span>
                  <span className="font-medium text-foreground">{slot.occupied}%</span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${slot.occupied}%` }}
                    transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
                    className={`h-full rounded-full ${
                      slot.occupied >= 90 ? "bg-primary" : slot.occupied >= 70 ? "bg-emerald-500" : "bg-amber-500"
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Performance */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="mx-5 mb-6 glass rounded-2xl p-4"
      >
        <h3 className="text-sm font-bold text-foreground mb-3">Top Performing Listings</h3>
        <div className="space-y-3">
          {[
            { name: "The Firefly Villa", bookings: 42, revenue: "₹1.18L", growth: "+12%" },
            { name: "Ember Grounds", bookings: 38, revenue: "₹89K", growth: "+8%" },
            { name: "Moonrise Terrace", bookings: 31, revenue: "₹62K", growth: "+15%" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{item.name}</p>
                <p className="text-[10px] text-muted-foreground">{item.bookings} bookings · {item.revenue}</p>
              </div>
              <span className="text-xs font-semibold text-emerald-500">{item.growth}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
