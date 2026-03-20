import { useState } from "react";
import { motion } from "framer-motion";
import {
  Download, FileSpreadsheet, Users, CalendarCheck, IndianRupee,
  Loader2, ShoppingCart, Package, Star, Filter
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type ExportType = "users" | "bookings" | "revenue" | "orders" | "inventory" | "loyalty";

function toCSV(headers: string[], rows: string[][]): string {
  return [headers.join(","), ...rows.map(r => r.map(c => `"${String(c ?? "").replace(/"/g, '""')}"`).join(","))].join("\n");
}

function downloadCSV(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function AdminExports() {
  const [exporting, setExporting] = useState<ExportType | null>(null);
  const [lastExported, setLastExported] = useState<Record<string, { rows: number; time: string }>>({});

  const markDone = (type: ExportType, rowCount: number) => {
    setLastExported(prev => ({
      ...prev,
      [type]: { rows: rowCount, time: new Date().toLocaleTimeString() },
    }));
    setExporting(null);
  };

  const exportUsers = async () => {
    setExporting("users");
    const { data } = await supabase.from("profiles").select("*");
    const headers = ["User ID", "Display Name", "Email", "Location", "Loyalty Points", "Tier", "Bio", "Created At"];
    const rows = (data ?? []).map(p => [p.user_id, p.display_name || "", "", p.location || "", String(p.loyalty_points), p.tier, p.bio || "", p.created_at]);
    downloadCSV(`hushh-users-${new Date().toISOString().slice(0, 10)}.csv`, toCSV(headers, rows));
    markDone("users", rows.length);
  };

  const exportBookings = async () => {
    setExporting("bookings");
    const { data } = await supabase.from("bookings").select("*");
    const headers = ["Booking ID", "User ID", "Property ID", "Date", "Slot", "Guests", "Total (₹)", "Status", "Created At", "Updated At"];
    const rows = (data ?? []).map(b => [b.booking_id, b.user_id, b.property_id, b.date, b.slot, String(b.guests), String(b.total), b.status, b.created_at, b.updated_at]);
    downloadCSV(`hushh-bookings-${new Date().toISOString().slice(0, 10)}.csv`, toCSV(headers, rows));
    markDone("bookings", rows.length);
  };

  const exportRevenue = async () => {
    setExporting("revenue");
    const { data: bookings } = await supabase.from("bookings").select("property_id, total, date, status, slot, guests");
    const { data: orders } = await supabase.from("orders").select("property_id, total, created_at, status");
    const headers = ["Source", "Property ID", "Amount (₹)", "Date", "Status", "Extra"];
    const rows = [
      ...(bookings ?? []).map(b => ["Booking", b.property_id, String(b.total), b.date, b.status, `${b.guests} guests, ${b.slot}`]),
      ...(orders ?? []).map(o => ["Order", o.property_id, String(o.total), o.created_at.slice(0, 10), o.status, ""]),
    ];
    downloadCSV(`hushh-revenue-${new Date().toISOString().slice(0, 10)}.csv`, toCSV(headers, rows));
    markDone("revenue", rows.length);
  };

  const exportOrders = async () => {
    setExporting("orders");
    const { data: orders } = await supabase.from("orders").select("*, order_items(item_name, item_emoji, quantity, unit_price)");
    const headers = ["Order ID", "User ID", "Property ID", "Booking ID", "Total (₹)", "Status", "Items", "Created At"];
    const rows = (orders ?? []).map(o => {
      const items = (o.order_items ?? []).map((i: any) => `${i.item_emoji}${i.item_name}x${i.quantity}`).join("; ");
      return [o.id, o.user_id, o.property_id, o.booking_id || "", String(o.total), o.status, items, o.created_at];
    });
    downloadCSV(`hushh-orders-${new Date().toISOString().slice(0, 10)}.csv`, toCSV(headers, rows));
    markDone("orders", rows.length);
  };

  const exportInventory = async () => {
    setExporting("inventory");
    const { data } = await supabase.from("inventory").select("*");
    const headers = ["Name", "Emoji", "Category", "Stock", "Unit Price (₹)", "Low Threshold", "Available", "Property ID"];
    const rows = (data ?? []).map(i => [i.name, i.emoji, i.category, String(i.stock), String(i.unit_price), String(i.low_stock_threshold), i.available ? "Yes" : "No", i.property_id || ""]);
    downloadCSV(`hushh-inventory-${new Date().toISOString().slice(0, 10)}.csv`, toCSV(headers, rows));
    markDone("inventory", rows.length);
  };

  const exportLoyalty = async () => {
    setExporting("loyalty");
    const { data } = await supabase.from("loyalty_transactions").select("*");
    const headers = ["User ID", "Type", "Title", "Points", "Icon", "Created At"];
    const rows = (data ?? []).map(t => [t.user_id, t.type, t.title, String(t.points), t.icon || "", t.created_at]);
    downloadCSV(`hushh-loyalty-${new Date().toISOString().slice(0, 10)}.csv`, toCSV(headers, rows));
    markDone("loyalty", rows.length);
  };

  const exports = [
    { type: "users" as ExportType, label: "Users", desc: "All users with loyalty tiers and profiles", icon: Users, color: "from-blue-500/20 to-blue-500/5", fn: exportUsers },
    { type: "bookings" as ExportType, label: "Bookings", desc: "Complete booking history with status", icon: CalendarCheck, color: "from-emerald-500/20 to-emerald-500/5", fn: exportBookings },
    { type: "revenue" as ExportType, label: "Revenue", desc: "Combined bookings + orders revenue", icon: IndianRupee, color: "from-primary/20 to-primary/5", fn: exportRevenue },
    { type: "orders" as ExportType, label: "Orders", desc: "All orders with itemized breakdown", icon: ShoppingCart, color: "from-orange-500/20 to-orange-500/5", fn: exportOrders },
    { type: "inventory" as ExportType, label: "Inventory", desc: "Stock levels, pricing, availability", icon: Package, color: "from-amber-500/20 to-amber-500/5", fn: exportInventory },
    { type: "loyalty" as ExportType, label: "Loyalty", desc: "Points earned, redeemed, transactions", icon: Star, color: "from-pink-500/20 to-pink-500/5", fn: exportLoyalty },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <FileSpreadsheet size={22} className="text-primary" /> Export & Reports
        </h1>
        <p className="text-sm text-muted-foreground">Download your business data as CSV for offline analysis</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {exports.map((exp, i) => {
          const last = lastExported[exp.type];
          return (
            <motion.button
              key={exp.type}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileTap={{ scale: 0.97 }}
              onClick={exp.fn}
              disabled={exporting !== null}
              className={`rounded-2xl border border-border bg-gradient-to-br ${exp.color} p-5 text-left transition hover:shadow-lg disabled:opacity-50`}
            >
              <exp.icon size={22} className="text-foreground mb-3" />
              <h3 className="font-bold text-foreground text-sm">{exp.label}</h3>
              <p className="text-xs text-muted-foreground mt-1">{exp.desc}</p>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-medium text-primary">
                  {exporting === exp.type ? (
                    <><Loader2 size={14} className="animate-spin" /> Exporting...</>
                  ) : (
                    <><Download size={14} /> Download CSV</>
                  )}
                </div>
                {last && (
                  <span className="text-[10px] text-muted-foreground">
                    {last.rows} rows • {last.time}
                  </span>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {Object.keys(lastExported).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border bg-card p-4"
        >
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Recent Exports</h3>
          <div className="space-y-1.5">
            {Object.entries(lastExported).map(([type, info]) => (
              <div key={type} className="flex items-center justify-between text-xs text-foreground">
                <span className="capitalize font-medium">{type}</span>
                <span className="text-muted-foreground">{info.rows} rows exported at {info.time}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
