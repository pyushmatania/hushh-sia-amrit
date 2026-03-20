import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle, TrendingUp, TrendingDown, Flame, Clock,
  Users, Zap, IndianRupee, Bell, Lightbulb
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Alert {
  id: string;
  type: "warning" | "opportunity" | "insight" | "action";
  icon: typeof Flame;
  title: string;
  description: string;
  color: string;
  bgColor: string;
}

export default function AdminAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const analyze = async () => {
      const [bookingsRes, listingsRes, ordersRes] = await Promise.all([
        supabase.from("bookings").select("total, status, date, slot, created_at"),
        supabase.from("host_listings").select("id, name, base_price, status"),
        supabase.from("orders").select("total, status, created_at"),
      ]);

      const bookings = bookingsRes.data ?? [];
      const listings = listingsRes.data ?? [];
      const orders = ordersRes.data ?? [];

      const generatedAlerts: Alert[] = [];

      // Low bookings alert
      const today = new Date().toISOString().slice(0, 10);
      const todayBookings = bookings.filter(b => b.date === today).length;
      if (todayBookings < 3) {
        generatedAlerts.push({
          id: "low-bookings",
          type: "warning",
          icon: AlertTriangle,
          title: "Low bookings today",
          description: `Only ${todayBookings} booking(s) today. Consider running a flash deal to boost demand.`,
          color: "text-amber-400",
          bgColor: "bg-amber-500/10",
        });
      }

      // Evening slot demand
      const eveningBookings = bookings.filter(b => b.slot?.includes("7") || b.slot?.includes("8") || b.slot?.includes("9")).length;
      const totalBookings = bookings.length || 1;
      const eveningRatio = eveningBookings / totalBookings;
      if (eveningRatio > 0.4) {
        generatedAlerts.push({
          id: "evening-demand",
          type: "opportunity",
          icon: Flame,
          title: "High evening demand detected",
          description: `${Math.round(eveningRatio * 100)}% of bookings are for evening slots. Consider premium pricing for 7-11 PM.`,
          color: "text-orange-400",
          bgColor: "bg-orange-500/10",
        });
      }

      // Paused listings
      const pausedListings = listings.filter(l => l.status === "paused").length;
      if (pausedListings > 0) {
        generatedAlerts.push({
          id: "paused-listings",
          type: "action",
          icon: Clock,
          title: `${pausedListings} listing(s) paused`,
          description: "Paused listings reduce your potential revenue. Review and reactivate if possible.",
          color: "text-blue-400",
          bgColor: "bg-blue-500/10",
        });
      }

      // Revenue trend
      const totalRevenue = bookings.reduce((s, b) => s + Number(b.total), 0);
      const orderRevenue = orders.reduce((s, o) => s + Number(o.total), 0);
      generatedAlerts.push({
        id: "revenue-insight",
        type: "insight",
        icon: IndianRupee,
        title: "Revenue breakdown",
        description: `Bookings: ₹${totalRevenue.toLocaleString()} | Orders: ₹${orderRevenue.toLocaleString()} | Combined: ₹${(totalRevenue + orderRevenue).toLocaleString()}`,
        color: "text-primary",
        bgColor: "bg-primary/10",
      });

      // Cancelled bookings ratio
      const cancelledCount = bookings.filter(b => b.status === "cancelled").length;
      const cancelRatio = totalBookings > 0 ? cancelledCount / totalBookings : 0;
      if (cancelRatio > 0.15) {
        generatedAlerts.push({
          id: "cancellation-alert",
          type: "warning",
          icon: TrendingDown,
          title: "High cancellation rate",
          description: `${Math.round(cancelRatio * 100)}% of bookings are cancelled. Investigate causes — consider partial refund policies.`,
          color: "text-destructive",
          bgColor: "bg-destructive/10",
        });
      }

      // Pending orders
      const pendingOrders = orders.filter(o => o.status === "pending").length;
      if (pendingOrders > 0) {
        generatedAlerts.push({
          id: "pending-orders",
          type: "action",
          icon: Zap,
          title: `${pendingOrders} pending order(s)`,
          description: "Orders awaiting preparation. Ensure kitchen/service staff are notified.",
          color: "text-emerald-400",
          bgColor: "bg-emerald-500/10",
        });
      }

      setAlerts(generatedAlerts);

      // Generate predictions
      const dayMap = new Map<string, number>();
      bookings.forEach(b => {
        const day = new Date(b.created_at).toLocaleDateString("en", { weekday: "long" });
        dayMap.set(day, (dayMap.get(day) || 0) + 1);
      });
      const sortedDays = Array.from(dayMap.entries()).sort((a, b) => b[1] - a[1]);

      setPredictions([
        {
          icon: TrendingUp,
          title: "Peak day prediction",
          value: sortedDays[0]?.[0] || "N/A",
          detail: `${sortedDays[0]?.[1] || 0} bookings historically`,
          color: "text-emerald-400",
        },
        {
          icon: Clock,
          title: "Slowest day",
          value: sortedDays[sortedDays.length - 1]?.[0] || "N/A",
          detail: `Consider discounts on ${sortedDays[sortedDays.length - 1]?.[0] || "slow days"}`,
          color: "text-amber-400",
        },
        {
          icon: Lightbulb,
          title: "Avg booking value",
          value: `₹${totalBookings > 0 ? Math.round(totalRevenue / totalBookings).toLocaleString() : 0}`,
          detail: "Upsell add-ons to increase this",
          color: "text-primary",
        },
      ]);

      setLoading(false);
    };
    analyze();
  }, []);

  const typeColors: Record<string, string> = {
    warning: "border-l-amber-400",
    opportunity: "border-l-orange-400",
    insight: "border-l-primary",
    action: "border-l-blue-400",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Bell size={22} className="text-primary" /> Smart Alerts & Predictions
        </h1>
        <p className="text-sm text-muted-foreground">AI-powered insights for your business</p>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 rounded-xl bg-secondary animate-pulse" />)}</div>
      ) : (
        <>
          {/* Alerts */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <AlertTriangle size={14} className="text-amber-400" /> Active Alerts
            </h3>
            {alerts.map((alert, i) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className={`rounded-xl border border-border bg-card p-4 border-l-4 ${typeColors[alert.type]}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-lg ${alert.bgColor} flex items-center justify-center shrink-0`}>
                    <alert.icon size={16} className={alert.color} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">{alert.title}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{alert.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Predictions */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Lightbulb size={14} className="text-primary" /> Demand Predictions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {predictions.map((pred, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  className="rounded-xl border border-border bg-card p-4"
                >
                  <pred.icon size={18} className={pred.color} />
                  <p className="text-xs text-muted-foreground mt-2">{pred.title}</p>
                  <p className="text-lg font-bold text-foreground mt-0.5">{pred.value}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">{pred.detail}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
