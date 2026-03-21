import { useState } from "react";
import { motion } from "framer-motion";
import { FileSpreadsheet, Download, BarChart3, Users, ShoppingCart, CalendarCheck, Package, Loader2, ChefHat, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type ReportType = "revenue" | "bookings" | "orders" | "inventory" | "staff" | "guests";

interface ReportConfig {
  id: ReportType;
  label: string;
  description: string;
  icon: typeof FileSpreadsheet;
  color: string;
}

const reports: ReportConfig[] = [
  { id: "revenue", label: "Revenue Summary", description: "Booking + order revenue breakdown by property and date", icon: TrendingUp, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10" },
  { id: "bookings", label: "Bookings Report", description: "All bookings with guest details, dates, and amounts", icon: CalendarCheck, color: "text-blue-600 bg-blue-50 dark:bg-blue-500/10" },
  { id: "orders", label: "Food Orders", description: "Order history with items, totals, and status", icon: ShoppingCart, color: "text-orange-600 bg-orange-50 dark:bg-orange-500/10" },
  { id: "inventory", label: "Inventory Status", description: "Current stock levels with low-stock alerts", icon: Package, color: "text-amber-600 bg-amber-50 dark:bg-amber-500/10" },
  { id: "staff", label: "Staff Attendance", description: "Attendance records, hours worked, and overtime", icon: ChefHat, color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10" },
  { id: "guests", label: "Guest Directory", description: "All registered guests with loyalty tiers and spend", icon: Users, color: "text-pink-600 bg-pink-50 dark:bg-pink-500/10" },
];

export default function AdminReports() {
  const [generating, setGenerating] = useState<string | null>(null);

  const generateCSV = async (type: ReportType) => {
    setGenerating(type);
    let rows: string[][] = [];
    let filename = `${type}-report-${new Date().toISOString().split("T")[0]}.csv`;

    try {
      switch (type) {
        case "revenue": {
          const [bookings, orders] = await Promise.all([
            supabase.from("bookings").select("*").order("created_at", { ascending: false }).limit(500),
            supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(500),
          ]);
          rows = [["Type", "ID", "Date", "Amount", "Status", "Property ID"]];
          (bookings.data ?? []).forEach(b => rows.push(["Booking", b.booking_id, b.date, String(b.total), b.status, b.property_id]));
          (orders.data ?? []).forEach(o => rows.push(["Order", o.id.slice(0, 8), o.created_at.split("T")[0], String(o.total), o.status, o.property_id]));
          break;
        }
        case "bookings": {
          const { data } = await supabase.from("bookings").select("*").order("created_at", { ascending: false }).limit(1000);
          rows = [["Booking ID", "User ID", "Property ID", "Date", "Slot", "Guests", "Total", "Status", "Created At"]];
          (data ?? []).forEach(b => rows.push([b.booking_id, b.user_id, b.property_id, b.date, b.slot, String(b.guests), String(b.total), b.status, b.created_at]));
          break;
        }
        case "orders": {
          const [ordersRes, itemsRes] = await Promise.all([
            supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(500),
            supabase.from("order_items").select("*"),
          ]);
          rows = [["Order ID", "User ID", "Property ID", "Total", "Status", "Assigned", "Items", "Created At"]];
          const itemMap = new Map<string, string>();
          (itemsRes.data ?? []).forEach(i => {
            const prev = itemMap.get(i.order_id) || "";
            itemMap.set(i.order_id, prev + (prev ? "; " : "") + `${i.item_name} x${i.quantity}`);
          });
          (ordersRes.data ?? []).forEach(o => rows.push([o.id.slice(0, 8), o.user_id, o.property_id, String(o.total), o.status, o.assigned_name || "—", itemMap.get(o.id) || "—", o.created_at]));
          break;
        }
        case "inventory": {
          const { data } = await supabase.from("inventory").select("*").order("category");
          rows = [["Name", "Category", "Stock", "Low Threshold", "Unit Price", "Available", "Emoji"]];
          (data ?? []).forEach(i => rows.push([i.name, i.category, String(i.stock), String(i.low_stock_threshold), String(i.unit_price), i.available ? "Yes" : "No", i.emoji]));
          break;
        }
        case "staff": {
          const [staff, attendance] = await Promise.all([
            supabase.from("staff_members").select("*"),
            supabase.from("staff_attendance").select("*").order("date", { ascending: false }).limit(500),
          ]);
          const staffMap = new Map<string, string>();
          (staff.data ?? []).forEach(s => staffMap.set(s.id, s.name));
          rows = [["Staff Name", "Date", "Status", "Check In", "Check Out", "Hours", "Overtime", "Meal"]];
          (attendance.data ?? []).forEach(a => rows.push([staffMap.get(a.staff_id) || a.staff_id, a.date, a.status, a.check_in || "—", a.check_out || "—", String(a.hours_worked || 0), String(a.overtime_hours || 0), a.meal_provided ? "Yes" : "No"]));
          break;
        }
        case "guests": {
          const { data } = await supabase.from("profiles").select("*").order("loyalty_points", { ascending: false });
          rows = [["Display Name", "User ID", "Tier", "Loyalty Points", "Location", "Created At"]];
          (data ?? []).forEach(p => rows.push([p.display_name || "—", p.user_id, p.tier, String(p.loyalty_points), p.location || "—", p.created_at]));
          break;
        }
      }

      // Generate and download CSV
      const csvContent = rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Report generation failed:", err);
    }
    setGenerating(null);
  };

  return (
    <motion.div className="space-y-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-500/10 dark:to-purple-500/10 flex items-center justify-center shadow-sm">
            <FileSpreadsheet size={20} className="text-violet-600" />
          </div>
          Reports & Exports
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Generate and download data reports</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {reports.map((report, i) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl bg-card border border-border/80 p-4 hover:shadow-md transition-all"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl ${report.color} flex items-center justify-center`}>
                <report.icon size={18} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{report.label}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{report.description}</p>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => generateCSV(report.id)}
              disabled={!!generating}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/15 transition disabled:opacity-50"
            >
              {generating === report.id ? (
                <><Loader2 size={14} className="animate-spin" /> Generating...</>
              ) : (
                <><Download size={14} /> Download CSV</>
              )}
            </motion.button>
          </motion.div>
        ))}
      </div>

      <div className="rounded-2xl bg-secondary/30 border border-border/60 p-4">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 size={14} className="text-primary" />
          <span className="text-xs font-semibold text-foreground">Quick Stats</span>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Reports include all available data up to the query limit (500-1000 rows). For full database exports, use the Exports section in the sidebar.
        </p>
      </div>
    </motion.div>
  );
}
