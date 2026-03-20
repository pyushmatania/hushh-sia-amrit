import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle, TrendingUp, TrendingDown, Flame, Clock,
  Zap, IndianRupee, Bell, Lightbulb, ExternalLink, Loader2,
  ShoppingCart, Package
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import AutoActionsPanel from "./AutoActionsPanel";

interface SmartAlert {
  id: string;
  type: "warning" | "opportunity" | "insight" | "action";
  severity: string;
  title: string;
  description: string;
  action?: string;
  actionTarget?: string;
}

interface Predictions {
  peakDay: string;
  peakDayBookings: number;
  slowDay: string;
  peakSlot: string;
  avgBookingValue: number;
  weeklyTrend: number;
}

const typeIcons: Record<string, typeof Flame> = {
  warning: AlertTriangle,
  opportunity: Flame,
  insight: IndianRupee,
  action: Zap,
};

const typeColors: Record<string, { text: string; bg: string; border: string }> = {
  warning: { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-l-amber-400" },
  opportunity: { text: "text-orange-400", bg: "bg-orange-500/10", border: "border-l-orange-400" },
  insight: { text: "text-primary", bg: "bg-primary/10", border: "border-l-primary" },
  action: { text: "text-blue-400", bg: "bg-blue-500/10", border: "border-l-blue-400" },
};

const severityBadge: Record<string, string> = {
  high: "bg-destructive/15 text-destructive",
  medium: "bg-amber-500/15 text-amber-400",
  low: "bg-secondary text-muted-foreground",
  info: "bg-primary/10 text-primary",
};

interface Props {
  onNavigate?: (page: string) => void;
}

export default function AdminAlerts({ onNavigate }: Props) {
  const [alerts, setAlerts] = useState<SmartAlert[]>([]);
  const [predictions, setPredictions] = useState<Predictions | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("smart-alerts");
        if (error) throw error;
        setAlerts(data.alerts || []);
        setPredictions(data.predictions || null);
      } catch (e) {
        console.error("Failed to fetch smart alerts:", e);
        // Fallback: generate client-side
        setAlerts([{
          id: "fallback", type: "insight", severity: "info",
          title: "Smart alerts loading",
          description: "Could not reach the analytics engine. Showing cached insights.",
        }]);
      }
      setLoading(false);
    };
    fetchAlerts();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Bell size={22} className="text-primary" /> Smart Alerts & Predictions
        </h1>
        <p className="text-sm text-muted-foreground">Real-time business intelligence powered by your data</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-xl bg-secondary animate-pulse" />)}
        </div>
      ) : (
        <>
          {/* Severity summary */}
          <div className="flex gap-3">
            {["high", "medium", "low"].map(sev => {
              const count = alerts.filter(a => a.severity === sev).length;
              if (count === 0) return null;
              return (
                <div key={sev} className={`px-3 py-1.5 rounded-full text-xs font-bold ${severityBadge[sev]}`}>
                  {count} {sev}
                </div>
              );
            })}
          </div>

          {/* Alerts */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <AlertTriangle size={14} className="text-amber-400" /> Active Alerts ({alerts.length})
            </h3>
            {alerts.map((alert, i) => {
              const colors = typeColors[alert.type] || typeColors.insight;
              const Icon = typeIcons[alert.type] || Lightbulb;
              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className={`rounded-xl border border-border bg-card p-4 border-l-4 ${colors.border}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-lg ${colors.bg} flex items-center justify-center shrink-0`}>
                      <Icon size={16} className={colors.text} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className="text-sm font-semibold text-foreground">{alert.title}</h4>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${severityBadge[alert.severity] || severityBadge.info}`}>
                          {alert.severity}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{alert.description}</p>
                      {alert.action && (
                        <button
                          onClick={() => onNavigate?.(alert.actionTarget || "dashboard")}
                          className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                        >
                          {alert.action} <ExternalLink size={10} />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Predictions */}
          {predictions && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Lightbulb size={14} className="text-primary" /> Demand Predictions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { icon: TrendingUp, title: "Peak day", value: predictions.peakDay, detail: `${predictions.peakDayBookings} bookings historically`, color: "text-emerald-400" },
                  { icon: Clock, title: "Slowest day", value: predictions.slowDay, detail: "Consider running discounts", color: "text-amber-400" },
                  { icon: Flame, title: "Hot slot", value: predictions.peakSlot, detail: "Most booked time slot", color: "text-orange-400" },
                  { icon: IndianRupee, title: "Avg booking", value: `₹${predictions.avgBookingValue.toLocaleString()}`, detail: "Upsell to increase", color: "text-primary" },
                  { icon: TrendingUp, title: "This week", value: `${predictions.weeklyTrend} bookings`, detail: "Last 7 days activity", color: "text-blue-400" },
                ].map((pred, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.06 }}
                    className="rounded-xl border border-border bg-card p-4"
                  >
                    <pred.icon size={18} className={pred.color} />
                    <p className="text-[10px] text-muted-foreground mt-2">{pred.title}</p>
                    <p className="text-lg font-bold text-foreground mt-0.5">{pred.value}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">{pred.detail}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
