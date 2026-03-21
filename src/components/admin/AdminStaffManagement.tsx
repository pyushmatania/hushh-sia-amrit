import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Plus, Search, UserCheck, UserX, Clock, Wallet,
  ChefHat, Car, Wrench, Briefcase, UtensilsCrossed, Pencil,
  Trash2, X, Check, Calendar, IndianRupee, Phone, Mail,
  AlertTriangle, TrendingUp, Coffee
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import DeleteConfirmDialog from "./DeleteConfirmDialog";

type StaffMember = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  salary: number;
  joining_date: string;
  status: string;
  avatar_url: string | null;
  notes: string;
  created_at: string;
};

type Attendance = {
  id: string;
  staff_id: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: string;
  hours_worked: number;
  meal_provided: boolean;
  notes: string;
};

type SalaryPayment = {
  id: string;
  staff_id: string;
  amount: number;
  month: string;
  year: number;
  status: string;
  paid_at: string | null;
  deductions: number;
  bonus: number;
  notes: string;
};

type Tab = "roster" | "attendance" | "salary";

const ROLE_ICONS: Record<string, typeof Users> = {
  chef: ChefHat, cook: UtensilsCrossed, driver: Car,
  gardener: Wrench, manager: Briefcase, staff: Users,
};

const DEPT_COLORS: Record<string, string> = {
  kitchen: "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400",
  operations: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
  housekeeping: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
  transport: "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400",
  service: "bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-400",
  maintenance: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
};

const STATUS_COLORS: Record<string, string> = {
  present: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
  absent: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
  half_day: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
  on_leave: "bg-slate-100 text-slate-600 dark:bg-slate-500/20 dark:text-slate-400",
};

const emptyStaff: Partial<StaffMember> = {
  name: "", email: "", phone: "", role: "staff", department: "operations",
  salary: 0, joining_date: format(new Date(), "yyyy-MM-dd"), status: "active", notes: "",
};

export default function AdminStaffManagement() {
  const [tab, setTab] = useState<Tab>("roster");
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [salaries, setSalaries] = useState<SalaryPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Partial<StaffMember> | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StaffMember | null>(null);
  const [attendanceDate, setAttendanceDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const loadData = async () => {
    setLoading(true);
    const [s, a, p] = await Promise.all([
      supabase.from("staff_members").select("*").order("name"),
      supabase.from("staff_attendance").select("*").order("date", { ascending: false }),
      supabase.from("staff_salary_payments").select("*").order("year", { ascending: false }),
    ]);
    setStaff((s.data as any[]) ?? []);
    setAttendance((a.data as any[]) ?? []);
    setSalaries((p.data as any[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const filtered = useMemo(() =>
    staff.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.role.toLowerCase().includes(search.toLowerCase()) ||
      s.department.toLowerCase().includes(search.toLowerCase())),
    [staff, search]
  );

  const todayAttendance = useMemo(() =>
    attendance.filter(a => a.date === attendanceDate),
    [attendance, attendanceDate]
  );

  const stats = useMemo(() => {
    const active = staff.filter(s => s.status === "active").length;
    const presentToday = todayAttendance.filter(a => a.status === "present").length;
    const absentToday = todayAttendance.filter(a => a.status === "absent").length;
    const totalSalary = staff.filter(s => s.status === "active").reduce((sum, s) => sum + Number(s.salary), 0);
    const mealsToday = todayAttendance.filter(a => a.meal_provided).length;
    return { active, presentToday, absentToday, totalSalary, mealsToday };
  }, [staff, todayAttendance]);

  // CRUD
  const handleSave = async () => {
    if (!editingStaff?.name) { toast.error("Name is required"); return; }
    if (editingStaff.id) {
      const { error } = await supabase.from("staff_members")
        .update({ ...editingStaff, updated_at: new Date().toISOString() } as any)
        .eq("id", editingStaff.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Staff updated");
    } else {
      const { error } = await supabase.from("staff_members").insert(editingStaff as any);
      if (error) { toast.error(error.message); return; }
      toast.success("Staff added");
    }
    setShowForm(false);
    setEditingStaff(null);
    loadData();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from("staff_members").delete().eq("id", deleteTarget.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Staff removed");
    setDeleteTarget(null);
    loadData();
  };

  const markAttendance = async (staffId: string, status: string, mealProvided: boolean) => {
    const existing = todayAttendance.find(a => a.staff_id === staffId);
    if (existing) {
      await supabase.from("staff_attendance").update({
        status, meal_provided: mealProvided,
        check_in: status === "present" || status === "half_day" ? new Date().toISOString() : null,
        hours_worked: status === "present" ? 8 : status === "half_day" ? 4 : 0,
      } as any).eq("id", existing.id);
    } else {
      await supabase.from("staff_attendance").insert({
        staff_id: staffId, date: attendanceDate, status,
        meal_provided: mealProvided,
        check_in: status !== "absent" ? new Date().toISOString() : null,
        hours_worked: status === "present" ? 8 : status === "half_day" ? 4 : 0,
      } as any);
    }
    toast.success("Attendance updated");
    loadData();
  };

  const markSalaryPaid = async (paymentId: string) => {
    await supabase.from("staff_salary_payments").update({
      status: "paid", paid_at: new Date().toISOString(),
    } as any).eq("id", paymentId);
    toast.success("Marked as paid");
    loadData();
  };

  const tabs: { id: Tab; label: string; icon: typeof Users }[] = [
    { id: "roster", label: "Roster", icon: Users },
    { id: "attendance", label: "Attendance", icon: Calendar },
    { id: "salary", label: "Salary", icon: Wallet },
  ];

  return (
    <div className="space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Staff Management</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Manage team, attendance & payroll</p>
        </div>
        <Button size="sm" onClick={() => { setEditingStaff({ ...emptyStaff }); setShowForm(true); }}
          className="gap-1.5 rounded-xl">
          <Plus size={14} /> Add Staff
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "Active Staff", value: stats.active, icon: Users, color: "text-primary" },
          { label: "Present Today", value: stats.presentToday, icon: UserCheck, color: "text-emerald-600" },
          { label: "Absent Today", value: stats.absentToday, icon: UserX, color: "text-red-500" },
          { label: "Monthly Payroll", value: `₹${(stats.totalSalary / 1000).toFixed(0)}K`, icon: IndianRupee, color: "text-amber-600" },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-3 rounded-2xl bg-card border border-border">
            <div className="flex items-center gap-2">
              <s.icon size={16} className={s.color} />
              <span className="text-[11px] text-muted-foreground">{s.label}</span>
            </div>
            <p className={`text-lg font-bold mt-1 ${s.color}`}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted/50 rounded-xl">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
              tab === t.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}>
            <t.icon size={13} /> {t.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search staff..." value={search} onChange={e => setSearch(e.target.value)}
          className="pl-9 h-9 rounded-xl text-sm" />
      </div>

      {/* Tab Content */}
      {tab === "roster" && (
        <div className="space-y-2">
          {loading ? Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-muted/50 animate-pulse" />
          )) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">No staff found</div>
          ) : filtered.map((s, i) => {
            const Icon = ROLE_ICONS[s.role] || Users;
            return (
              <motion.div key={s.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="p-3 rounded-2xl bg-card border border-border">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${DEPT_COLORS[s.department] || "bg-muted"}`}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">{s.name}</p>
                      <p className="text-[11px] text-muted-foreground capitalize">{s.role} • {s.department}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditingStaff(s); setShowForm(true); }}
                      className="w-7 h-7 rounded-lg flex items-center justify-center bg-primary/10 text-primary hover:bg-primary/20 transition">
                      <Pencil size={12} />
                    </button>
                    <button onClick={() => setDeleteTarget(s)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center bg-destructive/10 text-destructive hover:bg-destructive/20 transition">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1"><IndianRupee size={10} /> ₹{Number(s.salary).toLocaleString()}/mo</span>
                  <span className="flex items-center gap-1"><Phone size={10} /> {s.phone || "—"}</span>
                  <Badge className={`text-[10px] px-1.5 py-0 ${STATUS_COLORS[s.status] || "bg-muted"}`}>
                    {s.status.replace("_", " ")}
                  </Badge>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {tab === "attendance" && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Input type="date" value={attendanceDate} onChange={e => setAttendanceDate(e.target.value)}
              className="h-9 rounded-xl text-sm flex-1" />
            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 text-[10px]">
              <Coffee size={10} className="mr-1" /> {stats.mealsToday} meals
            </Badge>
          </div>
          {filtered.filter(s => s.status === "active").map((s, i) => {
            const rec = todayAttendance.find(a => a.staff_id === s.id);
            const Icon = ROLE_ICONS[s.role] || Users;
            return (
              <motion.div key={s.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="p-3 rounded-2xl bg-card border border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${DEPT_COLORS[s.department] || "bg-muted"}`}>
                      <Icon size={14} />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-foreground">{s.name}</p>
                      <p className="text-[10px] text-muted-foreground capitalize">{s.role}</p>
                    </div>
                  </div>
                  <Badge className={`text-[10px] ${STATUS_COLORS[rec?.status || "absent"] || "bg-muted"}`}>
                    {rec?.status?.replace("_", " ") || "not marked"}
                  </Badge>
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  {["present", "half_day", "absent"].map(st => (
                    <button key={st} onClick={() => markAttendance(s.id, st, rec?.meal_provided || false)}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-medium transition ${
                        rec?.status === st
                          ? st === "present" ? "bg-emerald-500 text-white" : st === "half_day" ? "bg-amber-500 text-white" : "bg-red-500 text-white"
                          : "bg-muted/50 text-muted-foreground hover:bg-muted"
                      }`}>
                      {st === "half_day" ? "Half" : st.charAt(0).toUpperCase() + st.slice(1)}
                    </button>
                  ))}
                  <button onClick={() => markAttendance(s.id, rec?.status || "present", !rec?.meal_provided)}
                    className={`px-2 py-1.5 rounded-lg text-[10px] font-medium transition flex items-center gap-1 ${
                      rec?.meal_provided ? "bg-orange-500 text-white" : "bg-muted/50 text-muted-foreground hover:bg-muted"
                    }`}>
                    <UtensilsCrossed size={10} /> Meal
                  </button>
                </div>
                {rec?.hours_worked ? (
                  <p className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1">
                    <Clock size={10} /> {rec.hours_worked}h worked
                    {rec.check_in && <> • In: {format(new Date(rec.check_in), "hh:mm a")}</>}
                  </p>
                ) : null}
              </motion.div>
            );
          })}
        </div>
      )}

      {tab === "salary" && (
        <div className="space-y-3">
          <div className="p-3 rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
            <p className="text-xs text-muted-foreground">Total Monthly Payroll</p>
            <p className="text-2xl font-bold text-foreground">₹{stats.totalSalary.toLocaleString()}</p>
            <div className="flex gap-3 mt-1 text-[11px] text-muted-foreground">
              <span>Pending: {salaries.filter(s => s.status === "pending").length}</span>
              <span>Paid: {salaries.filter(s => s.status === "paid").length}</span>
            </div>
          </div>

          {filtered.map((s, i) => {
            const payments = salaries.filter(p => p.staff_id === s.id).slice(0, 2);
            return (
              <motion.div key={s.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="p-3 rounded-2xl bg-card border border-border">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-semibold text-sm text-foreground">{s.name}</p>
                    <p className="text-[11px] text-muted-foreground">₹{Number(s.salary).toLocaleString()}/mo • {s.role}</p>
                  </div>
                </div>
                {payments.map(p => (
                  <div key={p.id} className="flex items-center justify-between py-1.5 border-t border-border/50">
                    <div className="text-[11px]">
                      <span className="text-foreground">{p.month} {p.year}</span>
                      {p.bonus > 0 && <span className="text-emerald-500 ml-1">+₹{p.bonus}</span>}
                      {p.deductions > 0 && <span className="text-red-400 ml-1">-₹{p.deductions}</span>}
                    </div>
                    {p.status === "paid" ? (
                      <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 text-[10px]">
                        <Check size={10} className="mr-0.5" /> Paid
                      </Badge>
                    ) : (
                      <Button size="sm" variant="outline" className="h-6 text-[10px] rounded-lg"
                        onClick={() => markSalaryPaid(p.id)}>
                        Mark Paid
                      </Button>
                    )}
                  </div>
                ))}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Form Modal */}
      <AnimatePresence>
        {showForm && editingStaff && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end justify-center"
            onClick={() => setShowForm(false)}>
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="w-full max-w-lg bg-card rounded-t-3xl p-5 max-h-[85vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-foreground">
                  {editingStaff.id ? "Edit Staff" : "Add Staff"}
                </h2>
                <button onClick={() => setShowForm(false)}
                  className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Name *</label>
                  <Input value={editingStaff.name || ""} onChange={e => setEditingStaff(p => ({ ...p!, name: e.target.value }))}
                    className="rounded-xl h-10" placeholder="Full name" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Email</label>
                    <Input value={editingStaff.email || ""} onChange={e => setEditingStaff(p => ({ ...p!, email: e.target.value }))}
                      className="rounded-xl h-10" placeholder="email@..." />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Phone</label>
                    <Input value={editingStaff.phone || ""} onChange={e => setEditingStaff(p => ({ ...p!, phone: e.target.value }))}
                      className="rounded-xl h-10" placeholder="+91..." />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Role</label>
                    <select value={editingStaff.role || "staff"}
                      onChange={e => setEditingStaff(p => ({ ...p!, role: e.target.value }))}
                      className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm">
                      {["staff", "chef", "cook", "manager", "driver", "gardener"].map(r => (
                        <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Department</label>
                    <select value={editingStaff.department || "operations"}
                      onChange={e => setEditingStaff(p => ({ ...p!, department: e.target.value }))}
                      className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm">
                      {["operations", "kitchen", "housekeeping", "transport", "service", "maintenance"].map(d => (
                        <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Salary (₹/month)</label>
                    <Input type="number" value={editingStaff.salary ?? ""} onChange={e => setEditingStaff(p => ({ ...p!, salary: Number(e.target.value) }))}
                      className="rounded-xl h-10" placeholder="15000" />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Status</label>
                    <select value={editingStaff.status || "active"}
                      onChange={e => setEditingStaff(p => ({ ...p!, status: e.target.value }))}
                      className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm">
                      {["active", "on_leave", "terminated"].map(s => (
                        <option key={s} value={s}>{s.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Joining Date</label>
                  <Input type="date" value={editingStaff.joining_date || ""} onChange={e => setEditingStaff(p => ({ ...p!, joining_date: e.target.value }))}
                    className="rounded-xl h-10" />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Notes</label>
                  <Input value={editingStaff.notes || ""} onChange={e => setEditingStaff(p => ({ ...p!, notes: e.target.value }))}
                    className="rounded-xl h-10" placeholder="Any notes..." />
                </div>
                <Button onClick={handleSave} className="w-full rounded-xl mt-2">
                  {editingStaff.id ? "Update Staff" : "Add Staff Member"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <DeleteConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete} entityName={deleteTarget?.name || ""} entityType="staff member" />
    </div>
  );
}
