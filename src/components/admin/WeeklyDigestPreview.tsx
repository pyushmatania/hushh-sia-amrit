import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileBarChart, Loader2, IndianRupee, CalendarCheck, Users,
  Star, ShoppingCart, TrendingDown, RefreshCw, Sparkles
} from "lucide-react";
import { toast } from "sonner";

interface DigestMetrics {
  bookingRevenue: number; orderRevenue: number; totalRevenue: number;
  totalBookings: number; confirmedBookings: number; cancelledBookings: number;
  cancellationRate: string; newUsers: number; totalOrders: number;
  avgRating: string; reviewCount: number;
}
interface DigestData { period: string; metrics: DigestMetrics; highlights: string[]; }

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
        { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` } }
      );
      if (!resp.ok) throw new Error("Failed");
      const json = await resp.json();
      setData(json);
      toast.success("Digest loaded");
    } catch { toast.error("Failed to load digest"); }
    setLoading(false);
  };

  return (
    <div className="rounded-2xl bg-card border border-border/60 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileBarChart size={14} className="text-primary" />
          <span className="text-xs font-semibold text-foreground">Weekly Digest</span>
        </div>
        <button onClick={fetchDigest} disabled={loading}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-medium hover:bg-primary/15 transition disabled:opacity-50"
        >
          {loading ? <Loader2 size={10} className="animate-spin" /> : <RefreshCw size={10} />}
          {data ? "Refresh" : "Generate"}
        </button>
      </div>

      {!data && !loading && (
        <div className="text-center py-6">
          <FileBarChart size={20} className="mx-auto text-muted-foreground/40 mb-2" />
          <p className="text-[10px] text-muted-foreground">Click Generate to preview this week's digest</p>
        </div>
      )}

      {loading && !data && (
        <div className="flex justify-center py-6"><Loader2 className="animate-spin text-muted-foreground" size={18} /></div>
      )}

      {data && (
        <div className="space-y-3">
          <p className="text-[9px] text-muted-foreground font-medium">{data.period}</p>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { label: "Revenue", value: fmt(data.metrics.totalRevenue), icon: IndianRupee, color: "text-emerald-600" },
              { label: "Bookings", value: String(data.metrics.totalBookings), icon: CalendarCheck, color: "text-blue-600" },
              { label: "New Users", value: String(data.metrics.newUsers), icon: Users, color: "text-violet-600" },
              { label: "Orders", value: String(data.metrics.totalOrders), icon: ShoppingCart, color: "text-orange-600" },
              { label: "Rating", value: data.metrics.avgRating, icon: Star, color: "text-amber-600" },
              { label: "Cancels", value: data.metrics.cancellationRate, icon: TrendingDown, color: "text-rose-600" },
            ].map((m) => (
              <div key={m.label} className="rounded-lg bg-muted/50 p-2 text-center">
                <m.icon size={12} className={`${m.color} mx-auto mb-1`} />
                <p className="text-xs font-bold text-foreground tabular-nums">{m.value}</p>
                <p className="text-[8px] text-muted-foreground">{m.label}</p>
              </div>
            ))}
          </div>

          {data.highlights.length > 0 && (
            <div className="space-y-1">
              <h4 className="text-[10px] font-bold text-foreground flex items-center gap-1">
                <Sparkles size={10} className="text-primary" /> Highlights
              </h4>
              {data.highlights.map((h, i) => (
                <p key={i} className="text-[10px] text-muted-foreground pl-2 border-l-2 border-primary/20 py-0.5">{h}</p>
              ))}
            </div>
          )}

          <div className="rounded-lg bg-muted/50 p-2.5 space-y-1">
            <p className="text-[9px] font-bold text-foreground">Revenue Breakdown</p>
            <div className="flex justify-between text-[10px]">
              <span className="text-muted-foreground">Bookings</span>
              <span className="text-foreground font-medium tabular-nums">{fmt(data.metrics.bookingRevenue)}</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-muted-foreground">Orders</span>
              <span className="text-foreground font-medium tabular-nums">{fmt(data.metrics.orderRevenue)}</span>
            </div>
            <div className="flex justify-between text-[10px] pt-1 border-t border-border/60">
              <span className="text-foreground font-bold">Total</span>
              <span className="text-primary font-bold tabular-nums">{fmt(data.metrics.totalRevenue)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
