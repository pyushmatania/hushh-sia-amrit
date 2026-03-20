import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp, TrendingDown, IndianRupee, Clock, Zap,
  ArrowUp, ArrowDown, Minus, Loader2, Flame
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SlotDemand {
  slot: string;
  bookings: number;
  revenue: number;
  avgPrice: number;
  trend: "up" | "down" | "flat";
  suggestion: string;
  suggestedChange: number; // percentage
}

export default function DynamicPricing() {
  const [slots, setSlots] = useState<SlotDemand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const analyze = async () => {
      const { data: bookings } = await supabase.from("bookings")
        .select("slot, total, date, created_at, status")
        .neq("status", "cancelled");

      if (!bookings || bookings.length === 0) { setLoading(false); return; }

      const now = Date.now();
      const weekMs = 7 * 86400000;

      const slotMap = new Map<string, { total: number; count: number; recent: number; older: number }>();

      bookings.forEach(b => {
        const slot = b.slot || "Unknown";
        const existing = slotMap.get(slot) || { total: 0, count: 0, recent: 0, older: 0 };
        existing.total += Number(b.total);
        existing.count++;
        const age = now - new Date(b.created_at).getTime();
        if (age <= weekMs) existing.recent++;
        else if (age <= 2 * weekMs) existing.older++;
        slotMap.set(slot, existing);
      });

      const totalBookings = bookings.length;
      const results: SlotDemand[] = [];

      slotMap.forEach((data, slot) => {
        const sharePercent = (data.count / totalBookings) * 100;
        const avgPrice = data.count > 0 ? Math.round(data.total / data.count) : 0;
        const recentGrowth = data.older > 0 ? ((data.recent - data.older) / data.older) * 100 : 0;

        let trend: "up" | "down" | "flat" = "flat";
        let suggestion = "";
        let suggestedChange = 0;

        if (sharePercent > 40 && recentGrowth > 10) {
          trend = "up";
          suggestedChange = Math.min(20, Math.round(recentGrowth * 0.5));
          suggestion = `High demand detected. Increase price by ${suggestedChange}% to optimize revenue.`;
        } else if (sharePercent > 30 && recentGrowth > 0) {
          trend = "up";
          suggestedChange = Math.min(10, Math.round(recentGrowth * 0.3));
          suggestion = `Growing demand. Consider a ${suggestedChange}% price increase.`;
        } else if (sharePercent < 15 || recentGrowth < -20) {
          trend = "down";
          suggestedChange = -Math.min(15, Math.abs(Math.round(recentGrowth * 0.4)));
          suggestion = `Low demand. Offer ${Math.abs(suggestedChange)}% discount to boost bookings.`;
        } else {
          suggestion = "Demand is steady. Current pricing looks good.";
        }

        results.push({
          slot, bookings: data.count, revenue: data.total,
          avgPrice, trend, suggestion, suggestedChange,
        });
      });

      results.sort((a, b) => b.bookings - a.bookings);
      setSlots(results);
      setLoading(false);
    };
    analyze();
  }, []);

  const trendIcon = (t: "up" | "down" | "flat") => {
    if (t === "up") return <ArrowUp size={14} className="text-emerald-400" />;
    if (t === "down") return <ArrowDown size={14} className="text-destructive" />;
    return <Minus size={14} className="text-muted-foreground" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Zap size={22} className="text-primary" /> Dynamic Pricing
        </h1>
        <p className="text-sm text-muted-foreground">AI-powered pricing suggestions based on demand patterns</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-primary" size={24} />
        </div>
      ) : slots.length === 0 ? (
        <div className="text-center py-12">
          <Flame size={40} className="mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">Not enough booking data for pricing analysis</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-border bg-card p-3 text-center">
              <TrendingUp size={16} className="text-emerald-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-foreground">{slots.filter(s => s.trend === "up").length}</p>
              <p className="text-[10px] text-muted-foreground">High demand</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-3 text-center">
              <Minus size={16} className="text-muted-foreground mx-auto mb-1" />
              <p className="text-lg font-bold text-foreground">{slots.filter(s => s.trend === "flat").length}</p>
              <p className="text-[10px] text-muted-foreground">Steady</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-3 text-center">
              <TrendingDown size={16} className="text-destructive mx-auto mb-1" />
              <p className="text-lg font-bold text-foreground">{slots.filter(s => s.trend === "down").length}</p>
              <p className="text-[10px] text-muted-foreground">Low demand</p>
            </div>
          </div>

          {/* Slot cards */}
          {slots.map((slot, i) => (
            <motion.div
              key={slot.slot}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`rounded-xl border bg-card p-4 ${
                slot.trend === "up" ? "border-emerald-500/30" :
                slot.trend === "down" ? "border-destructive/30" :
                "border-border"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-muted-foreground" />
                  <h3 className="font-bold text-sm text-foreground">{slot.slot}</h3>
                  {trendIcon(slot.trend)}
                </div>
                {slot.suggestedChange !== 0 && (
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    slot.suggestedChange > 0
                      ? "bg-emerald-500/15 text-emerald-400"
                      : "bg-amber-500/15 text-amber-400"
                  }`}>
                    {slot.suggestedChange > 0 ? "+" : ""}{slot.suggestedChange}%
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3 mb-3">
                <div>
                  <p className="text-[10px] text-muted-foreground">Bookings</p>
                  <p className="text-sm font-bold text-foreground tabular-nums">{slot.bookings}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Revenue</p>
                  <p className="text-sm font-bold text-foreground tabular-nums">₹{slot.revenue.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Avg Price</p>
                  <p className="text-sm font-bold text-foreground tabular-nums">₹{slot.avgPrice.toLocaleString()}</p>
                </div>
              </div>

              <div className={`rounded-lg p-2.5 text-xs ${
                slot.trend === "up" ? "bg-emerald-500/8 text-emerald-400" :
                slot.trend === "down" ? "bg-amber-500/8 text-amber-400" :
                "bg-secondary text-muted-foreground"
              }`}>
                💡 {slot.suggestion}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
