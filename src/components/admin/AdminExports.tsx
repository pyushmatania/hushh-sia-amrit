import { useState } from "react";
import { motion } from "framer-motion";
import { Download, FileSpreadsheet, Users, CalendarCheck, IndianRupee, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type ExportType = "users" | "bookings" | "revenue";

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

  const exportUsers = async () => {
    setExporting("users");
    const { data } = await supabase.from("profiles").select("*");
    const headers = ["User ID", "Display Name", "Location", "Loyalty Points", "Tier", "Created At"];
    const rows = (data ?? []).map(p => [p.user_id, p.display_name || "", p.location || "", String(p.loyalty_points), p.tier, p.created_at]);
    downloadCSV(`hushh-users-${new Date().toISOString().slice(0, 10)}.csv`, toCSV(headers, rows));
    setExporting(null);
  };

  const exportBookings = async () => {
    setExporting("bookings");
    const { data } = await supabase.from("bookings").select("*");
    const headers = ["Booking ID", "User ID", "Property ID", "Date", "Slot", "Guests", "Total", "Status", "Created At"];
    const rows = (data ?? []).map(b => [b.booking_id, b.user_id, b.property_id, b.date, b.slot, String(b.guests), String(b.total), b.status, b.created_at]);
    downloadCSV(`hushh-bookings-${new Date().toISOString().slice(0, 10)}.csv`, toCSV(headers, rows));
    setExporting(null);
  };

  const exportRevenue = async () => {
    setExporting("revenue");
    const { data: bookings } = await supabase.from("bookings").select("property_id, total, date, status");
    const { data: orders } = await supabase.from("orders").select("property_id, total, created_at, status");
    const headers = ["Source", "Property ID", "Amount", "Date", "Status"];
    const rows = [
      ...(bookings ?? []).map(b => ["Booking", b.property_id, String(b.total), b.date, b.status]),
      ...(orders ?? []).map(o => ["Order", o.property_id, String(o.total), o.created_at.slice(0, 10), o.status]),
    ];
    downloadCSV(`hushh-revenue-${new Date().toISOString().slice(0, 10)}.csv`, toCSV(headers, rows));
    setExporting(null);
  };

  const exports = [
    { type: "users" as ExportType, label: "Export Users", desc: "All registered users with loyalty data", icon: Users, color: "from-blue-500/20 to-blue-500/5", fn: exportUsers },
    { type: "bookings" as ExportType, label: "Export Bookings", desc: "All bookings with status and details", icon: CalendarCheck, color: "from-emerald-500/20 to-emerald-500/5", fn: exportBookings },
    { type: "revenue" as ExportType, label: "Export Revenue", desc: "Combined bookings + orders revenue data", icon: IndianRupee, color: "from-primary/20 to-primary/5", fn: exportRevenue },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <FileSpreadsheet size={22} className="text-primary" /> Export & Reports
        </h1>
        <p className="text-sm text-muted-foreground">Download your business data as CSV</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {exports.map((exp, i) => (
          <motion.button
            key={exp.type}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileTap={{ scale: 0.97 }}
            onClick={exp.fn}
            disabled={exporting !== null}
            className={`rounded-2xl border border-border bg-gradient-to-br ${exp.color} p-5 text-left transition hover:shadow-lg disabled:opacity-50`}
          >
            <exp.icon size={24} className="text-foreground mb-3" />
            <h3 className="font-bold text-foreground text-sm">{exp.label}</h3>
            <p className="text-xs text-muted-foreground mt-1">{exp.desc}</p>
            <div className="mt-4 flex items-center gap-2 text-xs font-medium text-primary">
              {exporting === exp.type ? (
                <><Loader2 size={14} className="animate-spin" /> Exporting...</>
              ) : (
                <><Download size={14} /> Download CSV</>
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
