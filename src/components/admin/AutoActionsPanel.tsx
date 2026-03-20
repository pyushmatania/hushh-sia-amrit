import { useState } from "react";
import { motion } from "framer-motion";
import { Zap, TrendingDown, Flame, Package, Bell, CheckCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AutoAction {
  id: string;
  icon: typeof Zap;
  title: string;
  description: string;
  color: string;
  bg: string;
  running: boolean;
}

export default function AutoActionsPanel() {
  const { toast } = useToast();
  const [actions, setActions] = useState<AutoAction[]>([
    { id: "low-stock", icon: Package, title: "Check Low Stock", description: "Scan inventory and auto-disable out-of-stock items", color: "text-amber-400", bg: "bg-amber-500/10", running: false },
    { id: "notify-admins", icon: Bell, title: "Run Notification Scan", description: "Detect spikes, low stock, cancellations and notify admins", color: "text-primary", bg: "bg-primary/10", running: false },
    { id: "slow-slots", icon: TrendingDown, title: "Flag Slow Slots", description: "Identify underbooked slots for discount suggestions", color: "text-blue-400", bg: "bg-blue-500/10", running: false },
  ]);

  const [results, setResults] = useState<string[]>([]);

  const runAction = async (actionId: string) => {
    setActions(prev => prev.map(a => a.id === actionId ? { ...a, running: true } : a));

    try {
      if (actionId === "low-stock") {
        const { data: items } = await supabase.from("inventory").select("id, name, stock, low_stock_threshold, available");
        const outOfStock = (items ?? []).filter(i => i.stock <= 0 && i.available);
        for (const item of outOfStock) {
          await supabase.from("inventory").update({ available: false }).eq("id", item.id);
        }
        const msg = outOfStock.length > 0
          ? `Disabled ${outOfStock.length} out-of-stock items: ${outOfStock.map(i => i.name).join(", ")}`
          : "All inventory items are in stock ✓";
        setResults(prev => [msg, ...prev]);
        toast({ title: "Low Stock Check", description: msg });
      }

      if (actionId === "notify-admins") {
        const { data, error } = await supabase.functions.invoke("auto-notifications");
        if (error) throw error;
        const msgs = data?.results ?? [];
        const msg = msgs.length > 0 ? `Sent ${msgs.length} alert(s)` : "No alerts triggered — all clear ✓";
        setResults(prev => [msg, ...prev]);
        toast({ title: "Notification Scan", description: msg });
      }

      if (actionId === "slow-slots") {
        const { data: bookings } = await supabase.from("bookings").select("slot, date")
          .gte("date", new Date().toISOString().split("T")[0]);
        const slotCounts: Record<string, number> = {};
        for (const b of bookings ?? []) {
          slotCounts[b.slot] = (slotCounts[b.slot] || 0) + 1;
        }
        const allSlots = ["12 PM – 4 PM", "4 PM – 7 PM", "7 PM – 11 PM", "11 PM – 7 AM"];
        const slowSlots = allSlots.filter(s => (slotCounts[s] || 0) <= 1);
        const msg = slowSlots.length > 0
          ? `Slow slots detected: ${slowSlots.join(", ")} — consider adding discounts`
          : "All slots performing well ✓";
        setResults(prev => [msg, ...prev]);
        toast({ title: "Slow Slot Scan", description: msg });
      }
    } catch (e) {
      const msg = `Error running ${actionId}: ${e instanceof Error ? e.message : "Unknown"}`;
      setResults(prev => [msg, ...prev]);
      toast({ title: "Error", description: msg, variant: "destructive" });
    }

    setActions(prev => prev.map(a => a.id === actionId ? { ...a, running: false } : a));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Zap size={16} className="text-primary" />
        <h3 className="text-sm font-bold text-foreground">Auto Actions</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {actions.map((action, i) => (
          <motion.button
            key={action.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => runAction(action.id)}
            disabled={action.running}
            className={`${action.bg} rounded-xl border border-border p-4 text-left hover:brightness-110 transition disabled:opacity-60`}
          >
            <div className="flex items-center gap-2 mb-2">
              {action.running ? (
                <Loader2 size={16} className="animate-spin text-primary" />
              ) : (
                <action.icon size={16} className={action.color} />
              )}
              <span className="text-sm font-semibold text-foreground">{action.title}</span>
            </div>
            <p className="text-[11px] text-muted-foreground">{action.description}</p>
          </motion.button>
        ))}
      </div>

      {results.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4 space-y-2">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Action Log</h4>
          {results.slice(0, 10).map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-start gap-2 text-xs text-foreground"
            >
              <CheckCircle size={12} className="text-emerald-400 mt-0.5 shrink-0" />
              <span>{r}</span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
