import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Flame, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const SLOTS = ["12–4 PM", "4–7 PM", "7–11 PM"];

function getIntensity(count: number, max: number): string {
  if (max === 0) return "bg-zinc-100 dark:bg-zinc-800";
  const ratio = count / max;
  if (ratio >= 0.8) return "bg-indigo-400";
  if (ratio >= 0.6) return "bg-indigo-300";
  if (ratio >= 0.4) return "bg-indigo-200 dark:bg-indigo-400/50";
  if (ratio >= 0.2) return "bg-indigo-100 dark:bg-indigo-400/25";
  if (count > 0) return "bg-indigo-50 dark:bg-indigo-400/10";
  return "bg-zinc-100 dark:bg-zinc-800";
}

function slotBucket(slot: string): number {
  if (!slot) return 0;
  const match = slot.match(/(\d+)/);
  if (!match) return 0;
  const hour = parseInt(match[1]);
  if (hour >= 12 && hour < 16) return 0;
  if (hour >= 16 && hour < 19) return 1;
  return 2;
}

function dayIndex(dateStr: string): number {
  const d = new Date(dateStr);
  return (d.getDay() + 6) % 7;
}

export default function BookingHeatmap() {
  const [grid, setGrid] = useState<number[][]>(DAYS.map(() => SLOTS.map(() => 0)));
  const [maxVal, setMaxVal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("bookings").select("date, slot, created_at");
      if (!data) { setLoading(false); return; }
      const g = DAYS.map(() => SLOTS.map(() => 0));
      let mx = 0;
      data.forEach(b => {
        const di = dayIndex(b.date || b.created_at);
        const si = slotBucket(b.slot || "");
        if (di >= 0 && di < 7 && si >= 0 && si < 3) { g[di][si]++; if (g[di][si] > mx) mx = g[di][si]; }
      });
      setGrid(g); setMaxVal(mx); setLoading(false);
    };
    load();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
      className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-5"
    >
      <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 mb-4 flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center">
          <Flame size={14} className="text-rose-600" />
        </div>
        Booking Heatmap
      </h3>

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="animate-spin text-indigo-400" size={20} /></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-[10px] text-zinc-400 font-medium text-left pr-2 pb-2" />
                {SLOTS.map(s => (
                  <th key={s} className="text-[10px] text-zinc-400 font-medium text-center pb-2 px-1">{s}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAYS.map((day, di) => (
                <tr key={day}>
                  <td className="text-[11px] text-zinc-500 font-medium pr-2 py-1">{day}</td>
                  {SLOTS.map((_, si) => {
                    const count = grid[di][si];
                    return (
                      <td key={si} className="px-1 py-1">
                        <motion.div
                          initial={{ scale: 0 }} animate={{ scale: 1 }}
                          transition={{ delay: 0.03 * (di + si) }}
                          className={`w-full aspect-square rounded-xl ${getIntensity(count, maxVal)} flex items-center justify-center min-w-[36px]`}
                          title={`${day} ${SLOTS[si]}: ${count} booking(s)`}
                        >
                          <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-200 tabular-nums">
                            {count || ""}
                          </span>
                        </motion.div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex items-center gap-2 mt-3 justify-end">
            <span className="text-[9px] text-zinc-400">Low</span>
            {["bg-indigo-50", "bg-indigo-100", "bg-indigo-200", "bg-indigo-300", "bg-indigo-400"].map(c => (
              <div key={c} className={`w-4 h-4 rounded-md ${c}`} />
            ))}
            <span className="text-[9px] text-zinc-400">High</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
