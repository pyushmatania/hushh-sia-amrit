import { useState } from "react";
import { motion } from "framer-motion";
import {
  Download, FileSpreadsheet, Users, CalendarCheck, IndianRupee,
  Loader2, ShoppingCart, Package, Star, Check, ArrowDownToLine
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type ExportType = "users" | "bookings" | "revenue" | "orders" | "inventory" | "loyalty";

function toCSV(headers: string[], rows: string[][]): string {
  return [headers.join(","), ...rows.map(r => r.map(c => `"${String(c ?? "").replace(/"/g, '""')}"`).join(","))].join("\n");
}

function downloadCSV(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

export default function AdminExports() {
  const [exporting, setExporting] = useState<ExportType | null>(null);
  const [lastExported, setLastExported] = useState<Record<string, { rows: number; time: string }>>({});

  const markDone = (type: ExportType, rowCount: number) => {
    setLastExported(prev => ({ ...prev, [type]: { rows: rowCount, time: new Date().toLocaleTimeString() } }));
    setExporting(null);
  };

  const exportUsers = async () => { setExporting("users"); const { data } = await supabase.from("profiles").select("*"); const h = ["User ID","Display Name","Email","Location","Loyalty Points","Tier","Bio","Created At"]; const r = (data??[]).map(p => [p.user_id,p.display_name||"","",p.location||"",String(p.loyalty_points),p.tier,p.bio||"",p.created_at]); downloadCSV(`hushh-users-${new Date().toISOString().slice(0,10)}.csv`, toCSV(h, r)); markDone("users", r.length); };
  const exportBookings = async () => { setExporting("bookings"); const { data } = await supabase.from("bookings").select("*"); const h = ["Booking ID","User ID","Property ID","Date","Slot","Guests","Total","Status","Created At","Updated At"]; const r = (data??[]).map(b => [b.booking_id,b.user_id,b.property_id,b.date,b.slot,String(b.guests),String(b.total),b.status,b.created_at,b.updated_at]); downloadCSV(`hushh-bookings-${new Date().toISOString().slice(0,10)}.csv`, toCSV(h, r)); markDone("bookings", r.length); };
  const exportRevenue = async () => { setExporting("revenue"); const [br, or] = await Promise.all([supabase.from("bookings").select("property_id,total,date,status,slot,guests"), supabase.from("orders").select("property_id,total,created_at,status")]); const h = ["Source","Property ID","Amount","Date","Status","Extra"]; const r = [...(br.data??[]).map(b=>["Booking",b.property_id,String(b.total),b.date,b.status,`${b.guests} guests`]),...(or.data??[]).map(o=>["Order",o.property_id,String(o.total),o.created_at.slice(0,10),o.status,""])]; downloadCSV(`hushh-revenue-${new Date().toISOString().slice(0,10)}.csv`, toCSV(h, r)); markDone("revenue", r.length); };
  const exportOrders = async () => { setExporting("orders"); const { data } = await supabase.from("orders").select("*,order_items(item_name,item_emoji,quantity,unit_price)"); const h = ["Order ID","User ID","Property ID","Booking ID","Total","Status","Items","Created At"]; const r = (data??[]).map(o=>{const items=(o.order_items??[]).map((i:any)=>`${i.item_emoji}${i.item_name}x${i.quantity}`).join("; ");return[o.id,o.user_id,o.property_id,o.booking_id||"",String(o.total),o.status,items,o.created_at];}); downloadCSV(`hushh-orders-${new Date().toISOString().slice(0,10)}.csv`, toCSV(h, r)); markDone("orders", r.length); };
  const exportInventory = async () => { setExporting("inventory"); const { data } = await supabase.from("inventory").select("*"); const h = ["Name","Emoji","Category","Stock","Unit Price","Low Threshold","Available","Property ID"]; const r = (data??[]).map(i=>[i.name,i.emoji,i.category,String(i.stock),String(i.unit_price),String(i.low_stock_threshold),i.available?"Yes":"No",i.property_id||""]); downloadCSV(`hushh-inventory-${new Date().toISOString().slice(0,10)}.csv`, toCSV(h, r)); markDone("inventory", r.length); };
  const exportLoyalty = async () => { setExporting("loyalty"); const { data } = await supabase.from("loyalty_transactions").select("*"); const h = ["User ID","Type","Title","Points","Icon","Created At"]; const r = (data??[]).map(t=>[t.user_id,t.type,t.title,String(t.points),t.icon||"",t.created_at]); downloadCSV(`hushh-loyalty-${new Date().toISOString().slice(0,10)}.csv`, toCSV(h, r)); markDone("loyalty", r.length); };

  const exports = [
    { type: "users" as ExportType, label: "Users", desc: "All users with loyalty tiers and profiles", icon: Users, gradient: "from-blue-50 to-indigo-50/50 dark:from-blue-500/10 dark:to-indigo-500/5", iconBg: "bg-blue-100 dark:bg-blue-500/20", iconColor: "text-blue-600", fn: exportUsers },
    { type: "bookings" as ExportType, label: "Bookings", desc: "Complete booking history with status", icon: CalendarCheck, gradient: "from-emerald-50 to-green-50/50 dark:from-emerald-500/10 dark:to-green-500/5", iconBg: "bg-emerald-100 dark:bg-emerald-500/20", iconColor: "text-emerald-600", fn: exportBookings },
    { type: "revenue" as ExportType, label: "Revenue", desc: "Combined bookings + orders revenue", icon: IndianRupee, gradient: "from-violet-50 to-purple-50/50 dark:from-violet-500/10 dark:to-purple-500/5", iconBg: "bg-violet-100 dark:bg-violet-500/20", iconColor: "text-violet-600", fn: exportRevenue },
    { type: "orders" as ExportType, label: "Orders", desc: "All orders with itemized breakdown", icon: ShoppingCart, gradient: "from-orange-50 to-amber-50/50 dark:from-orange-500/10 dark:to-amber-500/5", iconBg: "bg-orange-100 dark:bg-orange-500/20", iconColor: "text-orange-600", fn: exportOrders },
    { type: "inventory" as ExportType, label: "Inventory", desc: "Stock levels, pricing, availability", icon: Package, gradient: "from-amber-50 to-yellow-50/50 dark:from-amber-500/10 dark:to-yellow-500/5", iconBg: "bg-amber-100 dark:bg-amber-500/20", iconColor: "text-amber-600", fn: exportInventory },
    { type: "loyalty" as ExportType, label: "Loyalty", desc: "Points earned, redeemed, transactions", icon: Star, gradient: "from-pink-50 to-rose-50/50 dark:from-pink-500/10 dark:to-rose-500/5", iconBg: "bg-pink-100 dark:bg-pink-500/20", iconColor: "text-pink-600", fn: exportLoyalty },
  ];

  return (
    <motion.div className="space-y-6" initial="initial" animate="animate">
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-50 to-zinc-50 dark:from-gray-500/10 dark:to-zinc-500/10 flex items-center justify-center shadow-sm">
            <FileSpreadsheet size={20} className="text-gray-600" />
          </div>
          Export & Reports
        </h1>
        <p className="text-sm text-zinc-400 mt-1">Download your business data as CSV for offline analysis</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {exports.map((exp, i) => {
          const last = lastExported[exp.type];
          const done = !!last;
          return (
            <motion.button
              key={exp.type}
              variants={fadeUp}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.97 }}
              onClick={exp.fn}
              disabled={exporting !== null}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${exp.gradient} border border-zinc-100/80 dark:border-zinc-800/80 p-5 text-left transition-all hover:shadow-lg disabled:opacity-50 group`}
            >
              <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-white/20 dark:bg-white/5 group-hover:scale-110 transition-transform duration-500" />
              <div className="relative">
                <div className={`w-10 h-10 rounded-xl ${exp.iconBg} flex items-center justify-center mb-3 shadow-sm`}>
                  <exp.icon size={20} className={exp.iconColor} />
                </div>
                <h3 className="font-bold text-zinc-800 dark:text-zinc-100 text-sm">{exp.label}</h3>
                <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">{exp.desc}</p>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    {exporting === exp.type ? (
                      <span className="text-indigo-500 flex items-center gap-1.5"><Loader2 size={14} className="animate-spin" /> Exporting...</span>
                    ) : done ? (
                      <span className="text-emerald-600 flex items-center gap-1.5"><Check size={14} /> Exported</span>
                    ) : (
                      <span className="text-indigo-500 flex items-center gap-1.5"><ArrowDownToLine size={14} /> Download CSV</span>
                    )}
                  </div>
                  {last && <span className="text-[9px] text-zinc-400 bg-white/60 dark:bg-zinc-800/60 px-2 py-0.5 rounded-lg">{last.rows} rows</span>}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {Object.keys(lastExported).length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-zinc-100/80 dark:border-zinc-800/80 p-4">
          <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-3">Recent Exports</h3>
          <div className="space-y-2">
            {Object.entries(lastExported).map(([type, info]) => (
              <div key={type} className="flex items-center justify-between text-xs">
                <span className="capitalize font-semibold text-zinc-700 dark:text-zinc-200 flex items-center gap-2">
                  <Check size={12} className="text-emerald-500" /> {type}
                </span>
                <span className="text-zinc-400">{info.rows} rows at {info.time}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
