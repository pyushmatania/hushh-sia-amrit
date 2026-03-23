import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Clock, LogIn, LogOut, CalendarDays, UtensilsCrossed } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

interface AttendanceRecord {
  id: string;
  staff_id: string;
  date: string;
  status: string;
  check_in: string | null;
  check_out: string | null;
  hours_worked: number | null;
  overtime_hours: number | null;
  meal_provided: boolean | null;
  notes: string | null;
}

export default function StaffAttendance() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [staffId, setStaffId] = useState<string | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().split("T")[0];

  // Find staff_member id linked to this user
  useEffect(() => {
    if (!user) return;
    supabase.from("staff_members").select("id").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => {
        if (data) setStaffId(data.id);
        else setLoading(false);
      });
  }, [user]);

  const fetchRecords = useCallback(async () => {
    if (!staffId) return;
    const { data } = await supabase
      .from("staff_attendance")
      .select("*")
      .eq("staff_id", staffId)
      .order("date", { ascending: false })
      .limit(30);

    const recs = (data ?? []) as AttendanceRecord[];
    setRecords(recs);
    setTodayRecord(recs.find((r) => r.date === today) ?? null);
    setLoading(false);
  }, [staffId, today]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const checkIn = async () => {
    if (!staffId) return;
    const now = new Date().toISOString();
    const { data } = await supabase
      .from("staff_attendance")
      .insert({ staff_id: staffId, date: today, status: "present", check_in: now } as never)
      .select()
      .maybeSingle();
    if (data) {
      const rec = data as AttendanceRecord;
      setTodayRecord(rec);
      setRecords((prev) => [rec, ...prev.filter((r) => r.date !== today)]);
      toast({ title: "Checked In ✅", description: `Clocked in at ${new Date(now).toLocaleTimeString()}` });
    }
  };

  const checkOut = async () => {
    if (!staffId || !todayRecord) return;
    const now = new Date().toISOString();
    let hoursWorked: number | null = null;
    if (todayRecord.check_in) {
      hoursWorked = Math.round(((new Date(now).getTime() - new Date(todayRecord.check_in).getTime()) / 3600000) * 10) / 10;
    }
    const overtime = hoursWorked && hoursWorked > 8 ? Math.round((hoursWorked - 8) * 10) / 10 : 0;

    await supabase.from("staff_attendance")
      .update({ check_out: now, hours_worked: hoursWorked, overtime_hours: overtime, status: "present" } as never)
      .eq("id", todayRecord.id);

    const updated = { ...todayRecord, check_out: now, hours_worked: hoursWorked, overtime_hours: overtime };
    setTodayRecord(updated);
    setRecords((prev) => prev.map((r) => r.id === updated.id ? updated : r));
    toast({ title: "Checked Out 👋", description: `Worked ${hoursWorked}h today${overtime > 0 ? ` (${overtime}h OT)` : ""}` });
  };

  const checkedIn = todayRecord?.check_in && !todayRecord?.check_out;
  const checkedOut = todayRecord?.check_out;

  if (!staffId && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Clock size={32} className="text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground">Your account isn't linked to a staff profile yet.</p>
        <p className="text-xs text-muted-foreground mt-1">Ask your admin to link your account.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
        <Clock size={20} className="text-primary" /> Attendance
      </h1>

      {/* Today's Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl border p-5 ${
          checkedOut ? "border-emerald-500/30 bg-emerald-500/5" :
          checkedIn ? "border-primary/30 bg-primary/5" :
          "border-border bg-card"
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-muted-foreground font-medium">Today · {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" })}</p>
            <p className="text-sm font-bold text-foreground mt-0.5">
              {checkedOut ? "Shift Complete ✅" : checkedIn ? "On Shift 🟢" : "Not Checked In"}
            </p>
          </div>
          {todayRecord?.hours_worked && (
            <div className="text-right">
              <p className="text-lg font-bold text-foreground">{todayRecord.hours_worked}h</p>
              {(todayRecord.overtime_hours ?? 0) > 0 && (
                <p className="text-[10px] text-amber-400 font-semibold">+{todayRecord.overtime_hours}h OT</p>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
          {todayRecord?.check_in && (
            <span className="flex items-center gap-1">
              <LogIn size={12} className="text-emerald-400" />
              In: {new Date(todayRecord.check_in).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          {todayRecord?.check_out && (
            <span className="flex items-center gap-1">
              <LogOut size={12} className="text-destructive" />
              Out: {new Date(todayRecord.check_out).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
        </div>

        {!checkedOut && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={checkedIn ? checkOut : checkIn}
            className={`w-full py-3 rounded-xl text-sm font-bold transition ${
              checkedIn
                ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                : "bg-primary text-primary-foreground hover:brightness-110"
            }`}
          >
            {checkedIn ? (
              <span className="flex items-center justify-center gap-2"><LogOut size={16} /> Check Out</span>
            ) : (
              <span className="flex items-center justify-center gap-2"><LogIn size={16} /> Check In</span>
            )}
          </motion.button>
        )}
      </motion.div>

      {/* Recent History */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <CalendarDays size={14} className="text-primary" /> Recent ({records.length})
        </h3>
        {loading ? (
          <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-12 rounded-xl bg-secondary animate-pulse" />)}</div>
        ) : records.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No attendance records yet</p>
        ) : (
          records.slice(0, 14).map((rec, i) => (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="rounded-xl border border-border bg-card p-3 flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-semibold text-foreground">
                  {new Date(rec.date + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {rec.check_in ? new Date(rec.check_in).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—"} →{" "}
                  {rec.check_out ? new Date(rec.check_out).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—"}
                </p>
              </div>
              <div className="text-right flex items-center gap-2">
                {rec.meal_provided && <UtensilsCrossed size={12} className="text-amber-400" />}
                <span className={`text-xs font-bold ${
                  rec.status === "present" ? "text-emerald-400" :
                  rec.status === "absent" ? "text-destructive" :
                  "text-amber-400"
                }`}>
                  {rec.hours_worked ? `${rec.hours_worked}h` : rec.status}
                </span>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
