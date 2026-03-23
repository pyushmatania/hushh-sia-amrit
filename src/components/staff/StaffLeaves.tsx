import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { CalendarOff, Plus, X, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

interface LeaveRecord {
  id: string;
  staff_id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  days: number;
  reason: string;
  status: string;
  rejection_note: string | null;
  created_at: string;
}

const leaveTypes = [
  { value: "casual", label: "Casual", emoji: "🏖️", quota: 12 },
  { value: "sick", label: "Sick", emoji: "🤒", quota: 10 },
  { value: "earned", label: "Earned", emoji: "📅", quota: 15 },
  { value: "emergency", label: "Emergency", emoji: "🚨", quota: 5 },
];

const statusConfig: Record<string, { icon: typeof CheckCircle2; color: string }> = {
  approved: { icon: CheckCircle2, color: "text-emerald-400" },
  pending: { icon: Clock, color: "text-amber-400" },
  rejected: { icon: XCircle, color: "text-destructive" },
};

export default function StaffLeaves() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [staffId, setStaffId] = useState<string | null>(null);
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    leave_type: "casual",
    start_date: "",
    end_date: "",
    reason: "",
  });

  useEffect(() => {
    if (!user) return;
    supabase.from("staff_members").select("id").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => {
        if (data) setStaffId(data.id);
        else setLoading(false);
      });
  }, [user]);

  const fetchLeaves = useCallback(async () => {
    if (!staffId) return;
    const { data } = await supabase
      .from("staff_leaves")
      .select("*")
      .eq("staff_id", staffId)
      .order("created_at", { ascending: false });
    setLeaves((data ?? []) as LeaveRecord[]);
    setLoading(false);
  }, [staffId]);

  useEffect(() => { fetchLeaves(); }, [fetchLeaves]);

  const calcDays = (start: string, end: string) => {
    if (!start || !end) return 0;
    const diff = (new Date(end).getTime() - new Date(start).getTime()) / 86400000;
    return Math.max(1, Math.ceil(diff) + 1);
  };

  const submit = async () => {
    if (!staffId || !form.start_date || !form.end_date || !form.reason) {
      toast({ title: "Missing fields", description: "Fill all fields", variant: "destructive" });
      return;
    }
    const days = calcDays(form.start_date, form.end_date);
    const { data } = await supabase.from("staff_leaves").insert({
      staff_id: staffId,
      leave_type: form.leave_type,
      start_date: form.start_date,
      end_date: form.end_date,
      days,
      reason: form.reason,
      status: "pending",
    } as never).select().maybeSingle();

    if (data) {
      setLeaves((prev) => [data as LeaveRecord, ...prev]);
      toast({ title: "Leave Requested 📝", description: `${days} day(s) ${form.leave_type} leave submitted` });
      setShowForm(false);
      setForm({ leave_type: "casual", start_date: "", end_date: "", reason: "" });
    }
  };

  // Calculate used leaves by type
  const usedByType = leaves
    .filter((l) => l.status === "approved")
    .reduce<Record<string, number>>((acc, l) => {
      acc[l.leave_type] = (acc[l.leave_type] ?? 0) + l.days;
      return acc;
    }, {});

  if (!staffId && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <CalendarOff size={32} className="text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground">Staff profile not linked.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <CalendarOff size={20} className="text-primary" /> Leaves
        </h1>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-xl text-xs font-semibold">
          <Plus size={14} /> Request
        </button>
      </div>

      {/* Quota cards */}
      <div className="grid grid-cols-2 gap-2">
        {leaveTypes.map((lt) => {
          const used = usedByType[lt.value] ?? 0;
          const remaining = lt.quota - used;
          return (
            <div key={lt.value} className="rounded-xl border border-border bg-card p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-sm">{lt.emoji}</span>
                <span className="text-[11px] font-semibold text-foreground">{lt.label}</span>
              </div>
              <div className="flex items-end justify-between">
                <span className={`text-lg font-bold ${remaining <= 2 ? "text-destructive" : "text-foreground"}`}>{remaining}</span>
                <span className="text-[10px] text-muted-foreground">/ {lt.quota}</span>
              </div>
              <div className="mt-1.5 h-1 rounded-full bg-secondary overflow-hidden">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min(100, (used / lt.quota) * 100)}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Request Form */}
      {showForm && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-foreground">New Leave Request</h3>
            <button onClick={() => setShowForm(false)}><X size={16} className="text-muted-foreground" /></button>
          </div>
          <div className="flex gap-1.5">
            {leaveTypes.map((lt) => (
              <button key={lt.value} onClick={() => setForm((f) => ({ ...f, leave_type: lt.value }))}
                className={`flex-1 py-1.5 rounded-lg text-[10px] font-medium transition ${
                  form.leave_type === lt.value ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"
                }`}>{lt.emoji} {lt.label}</button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-muted-foreground font-medium">From</label>
              <Input type="date" value={form.start_date} onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))} />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground font-medium">To</label>
              <Input type="date" value={form.end_date} onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))} />
            </div>
          </div>
          {form.start_date && form.end_date && (
            <p className="text-xs text-primary font-medium">{calcDays(form.start_date, form.end_date)} day(s)</p>
          )}
          <Input placeholder="Reason for leave..." value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} />
          <button onClick={submit} className="w-full py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold">
            Submit Request
          </button>
        </motion.div>
      )}

      {/* Leave History */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-foreground">History</h3>
        {loading ? (
          <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-14 rounded-xl bg-secondary animate-pulse" />)}</div>
        ) : leaves.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No leave records</p>
        ) : (
          leaves.map((leave, i) => {
            const sc = statusConfig[leave.status] ?? statusConfig.pending;
            const Icon = sc.icon;
            const lt = leaveTypes.find((t) => t.value === leave.leave_type);
            return (
              <motion.div key={leave.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="rounded-xl border border-border bg-card p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{lt?.emoji ?? "📅"}</span>
                    <div>
                      <p className="text-xs font-semibold text-foreground capitalize">{leave.leave_type} · {leave.days}d</p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(leave.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} – {new Date(leave.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Icon size={14} className={sc.color} />
                    <span className={`text-[10px] font-semibold capitalize ${sc.color}`}>{leave.status}</span>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">{leave.reason}</p>
                {leave.rejection_note && (
                  <p className="text-[10px] text-destructive mt-1 flex items-center gap-1">
                    <AlertCircle size={10} /> {leave.rejection_note}
                  </p>
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
