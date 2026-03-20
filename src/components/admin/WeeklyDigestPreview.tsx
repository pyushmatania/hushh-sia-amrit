import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileBarChart, Loader2, IndianRupee, CalendarCheck, Users,
  Star, ShoppingCart, TrendingDown, RefreshCw, Sparkles
} from "lucide-react";
import { toast } from "sonner";

interface DigestMetrics {
  bookingRevenue: number;
  orderRevenue: number;
  totalRevenue: number;
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  cancellationRate: string;
  newUsers: number;
  totalOrders: number;
  avgRating: string;
  reviewCount: number;
}

interface DigestData {
  period: string;
  metrics: DigestMetrics;
  highlights: string[];
}

const fmt = (v: number) => {
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
  if (v >= 1000) return `₹${(v / 1000).toFixed(1)}K`;
  return `₹${v.toLocaleString("en-IN")}`;
};

export default function WeeklyDigestPreview() {
  const [data, setData] = useState<DigestData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchDigest = async () => {
    setLoading(true);
    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/weekly-digest`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
        }
      );
      if (!resp.ok) throw new Error("Failed");
      const json = await resp.json();
      setData(json);
      toast.success("Digest loaded");
    } catch {
      toast.error("Failed to load digest");
    }
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.55 }}
      className="rounded-2xl border border-border bg-card p-4"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <FileBarChart size={14} className="text-primary" />
          Weekly Digest Preview
        </h3>
        <button
          onClick={fetchDigest}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-[11px] font-medium hover:bg-primary/20 transition disabled:opacity-50"
        >
          {loading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
          {data ? "Refresh" : "Generate"}
        </button>
      </div>

      {!data && !loading && (
        <div className="text-center py-6">
          <FileBarChart size={28} className="text-muted-foreground mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">
            Click Generate to preview this week's digest
          </p>
        </div>
      )}

      {loading && !data && (
        <div className="flex justify-center py-8">
          <Loader2 className="animate-spin text-primary" size={20} />
        </div>
      )}

      {data && (
        <div className="space-y-4">
          <p className="text-[10px] text-muted-foreground font-medium">{data.period}</p>

          {/* Metric cards */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Revenue", value: fmt(data.metrics.totalRevenue), icon: IndianRupee, color: "text-primary", bg: "bg-primary/10" },
              { label: "Bookings", value: String(data.metrics.totalBookings), icon: CalendarCheck, color: "text-emerald-500", bg: "bg-emerald-500/10" },
              { label: "New Users", value: String(data.metrics.newUsers), icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
              { label: "Orders", value: String(data.metrics.totalOrders), icon: ShoppingCart, color: "text-amber-400", bg: "bg-amber-500/10" },
              { label: "Avg Rating", value: data.metrics.avgRating, icon: Star, color: "text-yellow-400", bg: "bg-yellow-500/10" },
              { label: "Cancel Rate", value: data.metrics.cancellationRate, icon: TrendingDown, color: "text-destructive", bg: "bg-destructive/10" },
            ].map((m, i) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05 * i }}
                className="rounded-xl border border-border p-2.5 text-center"
              >
                <div className={`w-7 h-7 rounded-lg ${m.bg} flex items-center justify-center mx-auto mb-1.5`}>
                  <m.icon size={14} className={m.color} />
                </div>
                <p className="text-sm font-bold text-foreground tabular-nums">{m.value}</p>
                <p className="text-[9px] text-muted-foreground">{m.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Highlights */}
          {data.highlights.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="text-[11px] font-bold text-foreground flex items-center gap-1">
                <Sparkles size={12} className="text-primary" /> Highlights
              </h4>
              {data.highlights.map((h, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  className="text-xs text-muted-foreground pl-2 border-l-2 border-primary/30 py-0.5"
                >
                  {h}
                </motion.p>
              ))}
            </div>
          )}

          {/* Revenue breakdown */}
          <div className="rounded-xl bg-secondary/50 p-3 space-y-1.5">
            <p className="text-[10px] font-bold text-foreground">Revenue Breakdown</p>
            <div className="flex justify-between text-[11px]">
              <span className="text-muted-foreground">Booking revenue</span>
              <span className="text-foreground font-medium tabular-nums">{fmt(data.metrics.bookingRevenue)}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-muted-foreground">Order revenue</span>
              <span className="text-foreground font-medium tabular-nums">{fmt(data.metrics.orderRevenue)}</span>
            </div>
            <div className="flex justify-between text-[11px] pt-1.5 border-t border-border">
              <span className="text-foreground font-bold">Total</span>
              <span className="text-primary font-bold tabular-nums">{fmt(data.metrics.totalRevenue)}</span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
