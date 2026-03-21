import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Plus, Search, UserCheck, UserX, Clock, Wallet,
  ChefHat, Car, Wrench, Briefcase, UtensilsCrossed, Pencil,
  Trash2, X, Check, Calendar, IndianRupee, Phone, Mail,
  AlertTriangle, TrendingUp, Coffee, Eye, Shield, Heart,
  Award, BarChart3, FileText, Download, Star, Timer,
  Building2, MapPin, CreditCard, CircleDot, ArrowUpDown,
  CalendarOff, CheckCircle2, XCircle, CalendarPlus
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format, differenceInDays, parseISO, startOfMonth, endOfMonth } from "date-fns";
import DeleteConfirmDialog from "./DeleteConfirmDialog";

type StaffMember = {
  id: string; name: string; email: string; phone: string;
  role: string; department: string; salary: number;
  joining_date: string; status: string; avatar_url: string | null;
  notes: string; emergency_contact: string; bank_account: string;
  created_at: string;
};

type Attendance = {
  id: string; staff_id: string; date: string;
  check_in: string | null; check_out: string | null;
  status: string; hours_worked: number; overtime_hours: number;
  meal_provided: boolean; notes: string;
};

type SalaryPayment = {
  id: string; staff_id: string; amount: number;
  month: string; year: number; status: string;
  paid_at: string | null; deductions: number; bonus: number;
  notes: string; payment_method: string;
};

type StaffLeave = {
  id: string; staff_id: string; leave_type: string;
  start_date: string; end_date: string; days: number;
  reason: string; status: string; approved_by: string | null;
  approved_at: string | null; rejection_note: string;
  created_at: string;
};

type Tab = "roster" | "attendance" | "salary" | "leaves" | "performance" | "details";

const ROLE_ICONS: Record<string, typeof Users> = {
  chef: ChefHat, cook: UtensilsCrossed, driver: Car,
  gardener: Wrench, manager: Briefcase, staff: Users,
  security: Shield, cleaner: Building2,
};

const DEPT_COLORS: Record<string, string> = {
  kitchen: "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400",
  operations: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
  housekeeping: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
  transport: "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400",
  service: "bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-400",
  maintenance: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
  security: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
};

const STATUS_COLORS: Record<string, string> = {
  present: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
  absent: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
  half_day: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
  on_leave: "bg-slate-100 text-slate-600 dark:bg-slate-500/20 dark:text-slate-400",
};

const emptyStaff: Partial<StaffMember> = {
  name: "", email: "", phone: "", role: "staff", department: "operations",
  salary: 0, joining_date: format(new Date(), "yyyy-MM-dd"), status: "active",
  notes: "", emergency_contact: "", bank_account: "",
};

export default function AdminStaffManagement() {
  const [tab, setTab] = useState<Tab>("roster");
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [salaries, setSalaries] = useState<SalaryPayment[]>([]);
  const [leaves, setLeaves] = useState<StaffLeave[]>([]);
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [newLeave, setNewLeave] = useState({ staff_id: "", leave_type: "casual", start_date: "", end_date: "", reason: "" });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Partial<StaffMember> | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StaffMember | null>(null);
  const [attendanceDate, setAttendanceDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [viewingStaff, setViewingStaff] = useState<StaffMember | null>(null);
  const [deptFilter, setDeptFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "salary" | "joining">("name");

  const loadData = async () => {
    setLoading(true);
    const [s, a, p, l] = await Promise.all([
      supabase.from("staff_members").select("*").order("name"),
      supabase.from("staff_attendance").select("*").order("date", { ascending: false }),
      supabase.from("staff_salary_payments").select("*").order("year", { ascending: false }),
      supabase.from("staff_leaves").select("*").order("created_at", { ascending: false }),
    ]);
    setStaff((s.data as any[]) ?? []);
    setAttendance((a.data as any[]) ?? []);
    setSalaries((p.data as any[]) ?? []);
    setLeaves((l.data as any[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const filtered = useMemo(() => {
    let list = staff.filter(s =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.role.toLowerCase().includes(search.toLowerCase()) ||
      s.department.toLowerCase().includes(search.toLowerCase())
    );
    if (deptFilter !== "all") list = list.filter(s => s.department === deptFilter);
    list.sort((a, b) => {
      if (sortBy === "salary") return Number(b.salary) - Number(a.salary);
      if (sortBy === "joining") return new Date(a.joining_date).getTime() - new Date(b.joining_date).getTime();
      return a.name.localeCompare(b.name);
    });
    return list;
  }, [staff, search, deptFilter, sortBy]);

  const todayAttendance = useMemo(() =>
    attendance.filter(a => a.date === attendanceDate),
    [attendance, attendanceDate]
  );

  const stats = useMemo(() => {
    const active = staff.filter(s => s.status === "active").length;
    const onLeave = staff.filter(s => s.status === "on_leave").length;
    const presentToday = todayAttendance.filter(a => a.status === "present").length;
    const absentToday = todayAttendance.filter(a => a.status === "absent").length;
    const halfDay = todayAttendance.filter(a => a.status === "half_day").length;
    const totalSalary = staff.filter(s => s.status === "active").reduce((sum, s) => sum + Number(s.salary), 0);
    const mealsToday = todayAttendance.filter(a => a.meal_provided).length;
    const totalOvertimeThisMonth = attendance
      .filter(a => a.date?.startsWith(format(new Date(), "yyyy-MM")))
      .reduce((sum, a) => sum + (Number(a.overtime_hours) || 0), 0);
    const pendingSalaries = salaries.filter(s => s.status === "pending").length;
    const departments = [...new Set(staff.map(s => s.department))];
    const deptBreakdown = departments.map(d => ({
      dept: d, count: staff.filter(s => s.department === d && s.status === "active").length,
      cost: staff.filter(s => s.department === d && s.status === "active").reduce((sum, s) => sum + Number(s.salary), 0),
    }));
    return { active, onLeave, presentToday, absentToday, halfDay, totalSalary, mealsToday, totalOvertimeThisMonth, pendingSalaries, deptBreakdown };
  }, [staff, todayAttendance, attendance, salaries]);

  // Staff performance metrics
  const getStaffPerformance = (staffId: string) => {
    const records = attendance.filter(a => a.staff_id === staffId);
    const last30 = records.filter(a => {
      const d = new Date(a.date);
      return differenceInDays(new Date(), d) <= 30;
    });
    const presentDays = last30.filter(a => a.status === "present").length;
    const totalDays = last30.length || 1;
    const attendanceRate = Math.round((presentDays / Math.max(totalDays, 1)) * 100);
    const totalHours = last30.reduce((sum, a) => sum + (Number(a.hours_worked) || 0), 0);
    const overtimeHours = last30.reduce((sum, a) => sum + (Number(a.overtime_hours) || 0), 0);
    const mealsConsumed = last30.filter(a => a.meal_provided).length;
    const lateArrivals = last30.filter(a => {
      if (!a.check_in) return false;
      const checkIn = new Date(a.check_in);
      return checkIn.getHours() >= 10;
    }).length;
    return { attendanceRate, totalHours, overtimeHours, mealsConsumed, presentDays, totalDays: last30.length, lateArrivals };
  };

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
    setShowForm(false); setEditingStaff(null); loadData();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await supabase.from("staff_attendance").delete().eq("staff_id", deleteTarget.id);
    await supabase.from("staff_salary_payments").delete().eq("staff_id", deleteTarget.id);
    const { error } = await supabase.from("staff_members").delete().eq("id", deleteTarget.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Staff removed"); setDeleteTarget(null); loadData();
  };

  const markAttendance = async (staffId: string, status: string, mealProvided: boolean, overtime = 0) => {
    const existing = todayAttendance.find(a => a.staff_id === staffId);
    const payload = {
      status, meal_provided: mealProvided,
      check_in: status === "present" || status === "half_day" ? new Date().toISOString() : null,
      hours_worked: status === "present" ? 8 : status === "half_day" ? 4 : 0,
      overtime_hours: overtime,
    };
    if (existing) {
      await supabase.from("staff_attendance").update(payload as any).eq("id", existing.id);
    } else {
      await supabase.from("staff_attendance").insert({
        staff_id: staffId, date: attendanceDate, ...payload,
      } as any);
    }
    toast.success("Attendance updated"); loadData();
  };

  const markSalaryPaid = async (paymentId: string, method: string = "bank_transfer") => {
    await supabase.from("staff_salary_payments").update({
      status: "paid", paid_at: new Date().toISOString(), payment_method: method,
    } as any).eq("id", paymentId);
    toast.success("Marked as paid"); loadData();
  };

  const generateSalarySlips = async () => {
    const month = format(new Date(), "MMMM");
    const year = new Date().getFullYear();
    const activeStaff = staff.filter(s => s.status === "active");
    const existing = salaries.filter(s => s.month === month && s.year === year);
    const toCreate = activeStaff.filter(s => !existing.find(e => e.staff_id === s.id));
    if (toCreate.length === 0) { toast.info("Salary slips already generated for this month"); return; }
    const records = toCreate.map(s => {
      const monthAttendance = attendance.filter(a =>
        a.staff_id === s.id && a.date?.startsWith(format(new Date(), "yyyy-MM"))
      );
      const absentDays = monthAttendance.filter(a => a.status === "absent").length;
      const halfDays = monthAttendance.filter(a => a.status === "half_day").length;
      const overtimeHrs = monthAttendance.reduce((sum, a) => sum + (Number(a.overtime_hours) || 0), 0);
      const dailyRate = Number(s.salary) / 30;
      const deductions = Math.round(absentDays * dailyRate + halfDays * dailyRate * 0.5);
      const overtimeBonus = Math.round(overtimeHrs * (dailyRate / 8) * 1.5);
      return {
        staff_id: s.id, month, year,
        amount: Number(s.salary) - deductions + overtimeBonus,
        deductions, bonus: overtimeBonus,
        notes: `${absentDays} absent, ${halfDays} half days, ${overtimeHrs}h OT`,
      };
    });
    const { error } = await supabase.from("staff_salary_payments").insert(records as any);
    if (error) { toast.error(error.message); return; }
    toast.success(`Generated ${records.length} salary slips`); loadData();
  };

  // Leave management
  const leaveStats = useMemo(() => {
    const pending = leaves.filter(l => l.status === "pending").length;
    const approved = leaves.filter(l => l.status === "approved").length;
    const rejected = leaves.filter(l => l.status === "rejected").length;
    const thisMonth = leaves.filter(l => l.start_date?.startsWith(format(new Date(), "yyyy-MM"))).length;
    return { pending, approved, rejected, thisMonth };
  }, [leaves]);

  const handleLeaveSubmit = async () => {
    if (!newLeave.staff_id || !newLeave.start_date || !newLeave.end_date) {
      toast.error("Please fill all required fields"); return;
    }
    const start = new Date(newLeave.start_date);
    const end = new Date(newLeave.end_date);
    if (end < start) { toast.error("End date must be after start date"); return; }
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const { error } = await supabase.from("staff_leaves").insert({
      staff_id: newLeave.staff_id, leave_type: newLeave.leave_type,
      start_date: newLeave.start_date, end_date: newLeave.end_date,
      days, reason: newLeave.reason,
    } as any);
    if (error) { toast.error(error.message); return; }
    toast.success("Leave request created");
    setShowLeaveForm(false);
    setNewLeave({ staff_id: "", leave_type: "casual", start_date: "", end_date: "", reason: "" });
    loadData();
  };

  const handleLeaveAction = async (leaveId: string, action: "approved" | "rejected", note?: string) => {
    const payload: any = {
      status: action,
      approved_at: new Date().toISOString(),
      ...(note && { rejection_note: note }),
    };
    const { error } = await supabase.from("staff_leaves").update(payload).eq("id", leaveId);
    if (error) { toast.error(error.message); return; }
    // If approved, update staff status
    if (action === "approved") {
      const leave = leaves.find(l => l.id === leaveId);
      if (leave) {
        const today = format(new Date(), "yyyy-MM-dd");
        if (leave.start_date <= today && leave.end_date >= today) {
          await supabase.from("staff_members").update({ status: "on_leave" } as any).eq("id", leave.staff_id);
        }
      }
    }
    toast.success(`Leave ${action}`); loadData();
  };

  const departments = useMemo(() => [...new Set(staff.map(s => s.department))], [staff]);

  const LEAVE_COLORS: Record<string, string> = {
    casual: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
    sick: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
    earned: "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400",
    emergency: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
  };

  const LEAVE_STATUS_COLORS: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
    approved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
    rejected: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
  };

  const tabs: { id: Tab; label: string; icon: typeof Users }[] = [
    { id: "roster", label: "Roster", icon: Users },
    { id: "attendance", label: "Attend.", icon: Calendar },
    { id: "salary", label: "Salary", icon: Wallet },
    { id: "leaves", label: "Leaves", icon: CalendarOff },
    { id: "performance", label: "Perf.", icon: BarChart3 },
    { id: "details", label: "Details", icon: FileText },
  ];

  return (
    <div className="space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Staff Management</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {stats.active} active • {stats.onLeave} on leave • {stats.pendingSalaries} pending payments
          </p>
        </div>
        <Button size="sm" onClick={() => { setEditingStaff({ ...emptyStaff }); setShowForm(true); }}
          className="gap-1.5 rounded-xl">
          <Plus size={14} /> Add Staff
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Active", value: stats.active, icon: Users, color: "text-primary" },
          { label: "Present", value: stats.presentToday, icon: UserCheck, color: "text-emerald-600" },
          { label: "Absent", value: stats.absentToday, icon: UserX, color: "text-red-500" },
          { label: "Payroll", value: `₹${(stats.totalSalary / 1000).toFixed(0)}K`, icon: IndianRupee, color: "text-amber-600" },
          { label: "Meals", value: stats.mealsToday, icon: Coffee, color: "text-orange-500" },
          { label: "OT Hours", value: `${stats.totalOvertimeThisMonth}h`, icon: Timer, color: "text-violet-500" },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="p-2.5 rounded-2xl bg-card border border-border">
            <s.icon size={14} className={s.color} />
            <p className={`text-lg font-bold mt-0.5 ${s.color}`}>{s.value}</p>
            <span className="text-[10px] text-muted-foreground">{s.label}</span>
          </motion.div>
        ))}
      </div>

      {/* Department Breakdown */}
      {stats.deptBreakdown.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {stats.deptBreakdown.map(d => (
            <button key={d.dept} onClick={() => setDeptFilter(deptFilter === d.dept ? "all" : d.dept)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-[10px] font-medium transition-all border ${
                deptFilter === d.dept
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border text-muted-foreground hover:text-foreground"
              }`}>
              <span className="capitalize">{d.dept}</span>
              <span className="ml-1 opacity-70">{d.count}</span>
            </button>
          ))}
          {deptFilter !== "all" && (
            <button onClick={() => setDeptFilter("all")}
              className="flex-shrink-0 px-3 py-1.5 rounded-xl text-[10px] font-medium bg-destructive/10 text-destructive border border-destructive/20">
              <X size={10} className="inline mr-0.5" /> Clear
            </button>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-0.5 p-1 bg-muted/50 rounded-xl overflow-x-auto">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[11px] font-medium transition-all whitespace-nowrap px-2 ${
              tab === t.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}>
            <t.icon size={12} /> {t.label}
          </button>
        ))}
      </div>

      {/* Search + Sort */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search staff..." value={search} onChange={e => setSearch(e.target.value)}
            className="pl-9 h-9 rounded-xl text-sm" />
        </div>
        <button onClick={() => setSortBy(sortBy === "name" ? "salary" : sortBy === "salary" ? "joining" : "name")}
          className="h-9 px-3 rounded-xl bg-card border border-border flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition">
          <ArrowUpDown size={12} /> {sortBy === "name" ? "A-Z" : sortBy === "salary" ? "₹" : "Date"}
        </button>
      </div>

      {/* ===== ROSTER TAB ===== */}
      {tab === "roster" && (
        <div className="space-y-2">
          {loading ? Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-muted/50 animate-pulse" />
          )) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">No staff found</div>
          ) : filtered.map((s, i) => {
            const Icon = ROLE_ICONS[s.role] || Users;
            const tenure = differenceInDays(new Date(), new Date(s.joining_date));
            const perf = getStaffPerformance(s.id);
            return (
              <motion.div key={s.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="p-3 rounded-2xl bg-card border border-border">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${DEPT_COLORS[s.department] || "bg-muted"}`}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">{s.name}</p>
                      <p className="text-[11px] text-muted-foreground capitalize">{s.role} • {s.department}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {tenure < 365 ? `${Math.round(tenure / 30)}mo tenure` : `${Math.round(tenure / 365)}yr tenure`}
                        {perf.attendanceRate > 0 && <> • {perf.attendanceRate}% attendance</>}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => setViewingStaff(s)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center bg-secondary text-muted-foreground hover:text-foreground transition">
                      <Eye size={12} />
                    </button>
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
                <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1"><IndianRupee size={10} /> ₹{Number(s.salary).toLocaleString()}/mo</span>
                  {s.phone && <span className="flex items-center gap-1"><Phone size={10} /> {s.phone}</span>}
                  <Badge className={`text-[10px] px-1.5 py-0 ${
                    s.status === "active" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" :
                    s.status === "on_leave" ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400" :
                    "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"
                  }`}>
                    {s.status.replace("_", " ")}
                  </Badge>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ===== ATTENDANCE TAB ===== */}
      {tab === "attendance" && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Input type="date" value={attendanceDate} onChange={e => setAttendanceDate(e.target.value)}
              className="h-9 rounded-xl text-sm flex-1" />
            <div className="flex gap-1">
              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 text-[10px]">
                <Coffee size={10} className="mr-1" /> {stats.mealsToday}
              </Badge>
              <Badge className="bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400 text-[10px]">
                <Clock size={10} className="mr-1" /> {stats.halfDay}½
              </Badge>
            </div>
          </div>

          {/* Quick summary bar */}
          <div className="flex rounded-xl overflow-hidden h-2 bg-muted">
            {stats.active > 0 && (
              <>
                <div className="bg-emerald-500 transition-all" style={{ width: `${(stats.presentToday / stats.active) * 100}%` }} />
                <div className="bg-amber-500 transition-all" style={{ width: `${(stats.halfDay / stats.active) * 100}%` }} />
                <div className="bg-red-500 transition-all" style={{ width: `${(stats.absentToday / stats.active) * 100}%` }} />
              </>
            )}
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
                  {["present", "half_day", "absent", "on_leave"].map(st => (
                    <button key={st} onClick={() => markAttendance(s.id, st, rec?.meal_provided || false, Number(rec?.overtime_hours) || 0)}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-medium transition ${
                        rec?.status === st
                          ? st === "present" ? "bg-emerald-500 text-white"
                          : st === "half_day" ? "bg-amber-500 text-white"
                          : st === "on_leave" ? "bg-slate-500 text-white"
                          : "bg-red-500 text-white"
                          : "bg-muted/50 text-muted-foreground hover:bg-muted"
                      }`}>
                      {st === "half_day" ? "½ Day" : st === "on_leave" ? "Leave" : st.charAt(0).toUpperCase() + st.slice(1)}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <button onClick={() => markAttendance(s.id, rec?.status || "present", !rec?.meal_provided, Number(rec?.overtime_hours) || 0)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition flex items-center gap-1 ${
                      rec?.meal_provided ? "bg-orange-500 text-white" : "bg-muted/50 text-muted-foreground hover:bg-muted"
                    }`}>
                    <UtensilsCrossed size={10} /> Meal
                  </button>
                  {[1, 2, 3].map(ot => (
                    <button key={ot}
                      onClick={() => markAttendance(s.id, rec?.status || "present", rec?.meal_provided || false, ot)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-medium transition ${
                        Number(rec?.overtime_hours) === ot ? "bg-violet-500 text-white" : "bg-muted/50 text-muted-foreground hover:bg-muted"
                      }`}>
                      +{ot}h OT
                    </button>
                  ))}
                </div>
                {rec?.check_in && (
                  <p className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1">
                    <Clock size={10} /> In: {format(new Date(rec.check_in), "hh:mm a")}
                    {rec.hours_worked > 0 && <> • {rec.hours_worked}h</>}
                    {Number(rec.overtime_hours) > 0 && <span className="text-violet-500"> +{rec.overtime_hours}h OT</span>}
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ===== SALARY TAB ===== */}
      {tab === "salary" && (
        <div className="space-y-3">
          <div className="p-3 rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Monthly Payroll</p>
                <p className="text-2xl font-bold text-foreground">₹{stats.totalSalary.toLocaleString()}</p>
              </div>
              <Button size="sm" variant="outline" className="gap-1 text-[11px] rounded-xl" onClick={generateSalarySlips}>
                <FileText size={12} /> Generate Slips
              </Button>
            </div>
            <div className="flex gap-3 mt-1.5 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1"><CircleDot size={10} className="text-amber-500" /> Pending: {stats.pendingSalaries}</span>
              <span className="flex items-center gap-1"><Check size={10} className="text-emerald-500" /> Paid: {salaries.filter(s => s.status === "paid").length}</span>
            </div>
          </div>

          {filtered.map((s, i) => {
            const payments = salaries.filter(p => p.staff_id === s.id).slice(0, 3);
            const totalPaid = salaries.filter(p => p.staff_id === s.id && p.status === "paid")
              .reduce((sum, p) => sum + Number(p.amount), 0);
            return (
              <motion.div key={s.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="p-3 rounded-2xl bg-card border border-border">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-semibold text-sm text-foreground">{s.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      ₹{Number(s.salary).toLocaleString()}/mo • {s.role}
                      <span className="ml-2 text-emerald-500">Total paid: ₹{totalPaid.toLocaleString()}</span>
                    </p>
                  </div>
                </div>
                {payments.map(p => (
                  <div key={p.id} className="flex items-center justify-between py-1.5 border-t border-border/50">
                    <div className="text-[11px]">
                      <span className="text-foreground font-medium">{p.month} {p.year}</span>
                      <span className="text-muted-foreground ml-1.5">₹{Number(p.amount).toLocaleString()}</span>
                      {Number(p.bonus) > 0 && <span className="text-emerald-500 ml-1">+₹{p.bonus}</span>}
                      {Number(p.deductions) > 0 && <span className="text-red-400 ml-1">-₹{p.deductions}</span>}
                    </div>
                    {p.status === "paid" ? (
                      <div className="flex items-center gap-1">
                        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 text-[10px]">
                          <Check size={10} className="mr-0.5" /> Paid
                        </Badge>
                        {p.payment_method && (
                          <span className="text-[9px] text-muted-foreground capitalize">{p.payment_method.replace("_", " ")}</span>
                        )}
                      </div>
                    ) : (
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" className="h-6 text-[10px] rounded-lg"
                          onClick={() => markSalaryPaid(p.id, "bank_transfer")}>
                          <CreditCard size={10} className="mr-0.5" /> Bank
                        </Button>
                        <Button size="sm" variant="outline" className="h-6 text-[10px] rounded-lg"
                          onClick={() => markSalaryPaid(p.id, "cash")}>
                          💵 Cash
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
                {payments.length > 0 && payments[0].notes && (
                  <p className="text-[9px] text-muted-foreground mt-1 italic">{payments[0].notes}</p>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ===== LEAVES TAB ===== */}
      {tab === "leaves" && (
        <div className="space-y-3">
          {/* Leave Stats */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "Pending", value: leaveStats.pending, icon: Clock, color: "text-amber-500" },
              { label: "Approved", value: leaveStats.approved, icon: CheckCircle2, color: "text-emerald-500" },
              { label: "Rejected", value: leaveStats.rejected, icon: XCircle, color: "text-red-500" },
              { label: "This Mo.", value: leaveStats.thisMonth, icon: Calendar, color: "text-primary" },
            ].map((s, i) => (
              <div key={i} className="p-2 rounded-xl bg-card border border-border text-center">
                <s.icon size={14} className={`${s.color} mx-auto`} />
                <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                <p className="text-[9px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          {/* New Leave Request */}
          <Button size="sm" variant="outline" className="w-full gap-1.5 rounded-xl" onClick={() => setShowLeaveForm(!showLeaveForm)}>
            <CalendarPlus size={14} /> {showLeaveForm ? "Cancel" : "New Leave Request"}
          </Button>

          <AnimatePresence>
            {showLeaveForm && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden">
                <div className="p-3 rounded-2xl bg-card border border-border space-y-2.5">
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Staff Member *</label>
                    <select value={newLeave.staff_id} onChange={e => setNewLeave(p => ({ ...p, staff_id: e.target.value }))}
                      className="w-full h-9 rounded-xl border border-input bg-background px-3 text-sm">
                      <option value="">Select staff...</option>
                      {staff.filter(s => s.status === "active").map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Leave Type</label>
                    <div className="flex gap-1.5">
                      {["casual", "sick", "earned", "emergency"].map(t => (
                        <button key={t} onClick={() => setNewLeave(p => ({ ...p, leave_type: t }))}
                          className={`flex-1 py-1.5 rounded-lg text-[10px] font-medium transition capitalize ${
                            newLeave.leave_type === t ? LEAVE_COLORS[t] : "bg-muted/50 text-muted-foreground"
                          }`}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Start Date *</label>
                      <Input type="date" value={newLeave.start_date} onChange={e => setNewLeave(p => ({ ...p, start_date: e.target.value }))}
                        className="rounded-xl h-9 text-sm" />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-muted-foreground mb-1 block">End Date *</label>
                      <Input type="date" value={newLeave.end_date} onChange={e => setNewLeave(p => ({ ...p, end_date: e.target.value }))}
                        className="rounded-xl h-9 text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Reason</label>
                    <Input value={newLeave.reason} onChange={e => setNewLeave(p => ({ ...p, reason: e.target.value }))}
                      className="rounded-xl h-9 text-sm" placeholder="Reason for leave..." />
                  </div>
                  <Button size="sm" className="w-full rounded-xl" onClick={handleLeaveSubmit}>
                    Submit Leave Request
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pending Leaves */}
          {leaves.filter(l => l.status === "pending").length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Clock size={12} className="text-amber-500" /> Pending Approval ({leaves.filter(l => l.status === "pending").length})
              </h3>
              {leaves.filter(l => l.status === "pending").map((l, i) => {
                const member = staff.find(s => s.id === l.staff_id);
                const Icon = ROLE_ICONS[member?.role || ""] || Users;
                return (
                  <motion.div key={l.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="p-3 rounded-2xl bg-card border-2 border-amber-500/30">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${DEPT_COLORS[member?.department || ""] || "bg-muted"}`}>
                          <Icon size={14} />
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-foreground">{member?.name || "Unknown"}</p>
                          <p className="text-[10px] text-muted-foreground capitalize">{member?.role} • {member?.department}</p>
                        </div>
                      </div>
                      <Badge className={`text-[10px] ${LEAVE_COLORS[l.leave_type]}`}>
                        {l.leave_type}
                      </Badge>
                    </div>
                    <div className="mt-2 p-2 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-2 text-[11px] text-foreground">
                        <Calendar size={11} />
                        <span>{format(new Date(l.start_date), "dd MMM")} → {format(new Date(l.end_date), "dd MMM yyyy")}</span>
                        <Badge variant="outline" className="text-[9px] px-1">{l.days} day{l.days > 1 ? "s" : ""}</Badge>
                      </div>
                      {l.reason && <p className="text-[10px] text-muted-foreground mt-1">"{l.reason}"</p>}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" className="flex-1 h-8 rounded-xl gap-1 text-[11px] bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => handleLeaveAction(l.id, "approved")}>
                        <Check size={12} /> Approve
                      </Button>
                      <Button size="sm" variant="destructive" className="flex-1 h-8 rounded-xl gap-1 text-[11px]"
                        onClick={() => handleLeaveAction(l.id, "rejected", "Leave quota exceeded")}>
                        <X size={12} /> Reject
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Leave History */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <FileText size={12} className="text-muted-foreground" /> Leave History
            </h3>
            {leaves.filter(l => l.status !== "pending").length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No leave history yet</p>
            ) : (
              leaves.filter(l => l.status !== "pending").map((l, i) => {
                const member = staff.find(s => s.id === l.staff_id);
                return (
                  <motion.div key={l.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="p-3 rounded-2xl bg-card border border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm text-foreground">{member?.name || "Unknown"}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {format(new Date(l.start_date), "dd MMM")} → {format(new Date(l.end_date), "dd MMM")} • {l.days}d
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Badge className={`text-[10px] ${LEAVE_COLORS[l.leave_type]}`}>
                          {l.leave_type}
                        </Badge>
                        <Badge className={`text-[10px] ${LEAVE_STATUS_COLORS[l.status]}`}>
                          {l.status === "approved" ? <><Check size={9} className="mr-0.5" /> Approved</> :
                           <><X size={9} className="mr-0.5" /> Rejected</>}
                        </Badge>
                      </div>
                    </div>
                    {l.reason && <p className="text-[10px] text-muted-foreground mt-1 italic">"{l.reason}"</p>}
                    {l.rejection_note && l.status === "rejected" && (
                      <p className="text-[10px] text-red-400 mt-0.5">Reason: {l.rejection_note}</p>
                    )}
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Per-staff leave summary */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <BarChart3 size={12} className="text-primary" /> Staff Leave Summary
            </h3>
            {staff.filter(s => s.status === "active").map((s, i) => {
              const staffLeaves = leaves.filter(l => l.staff_id === s.id && l.status === "approved");
              const casualDays = staffLeaves.filter(l => l.leave_type === "casual").reduce((sum, l) => sum + l.days, 0);
              const sickDays = staffLeaves.filter(l => l.leave_type === "sick").reduce((sum, l) => sum + l.days, 0);
              const earnedDays = staffLeaves.filter(l => l.leave_type === "earned").reduce((sum, l) => sum + l.days, 0);
              const totalDays = casualDays + sickDays + earnedDays;
              if (totalDays === 0 && staffLeaves.length === 0) return null;
              return (
                <motion.div key={s.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="p-3 rounded-2xl bg-card border border-border">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="font-medium text-sm text-foreground">{s.name}</p>
                    <span className="text-xs font-bold text-foreground">{totalDays}d total</span>
                  </div>
                  <div className="flex gap-2">
                    {[
                      { label: "Casual", value: casualDays, color: "bg-blue-500" },
                      { label: "Sick", value: sickDays, color: "bg-red-500" },
                      { label: "Earned", value: earnedDays, color: "bg-violet-500" },
                    ].map((t, j) => (
                      <div key={j} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <div className={`w-2 h-2 rounded-full ${t.color}`} />
                        {t.label}: {t.value}d
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===== PERFORMANCE TAB ===== */}
      {tab === "performance" && (
        <div className="space-y-3">
          <div className="p-3 rounded-2xl bg-card border border-border">
            <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
              <Award size={14} className="text-primary" /> Team Performance (Last 30 Days)
            </p>
            <div className="grid grid-cols-3 gap-2 text-center">
              {(() => {
                const allPerf = staff.filter(s => s.status === "active").map(s => ({ ...s, perf: getStaffPerformance(s.id) }));
                const avgAttendance = allPerf.length ? Math.round(allPerf.reduce((sum, s) => sum + s.perf.attendanceRate, 0) / allPerf.length) : 0;
                const totalOT = allPerf.reduce((sum, s) => sum + s.perf.overtimeHours, 0);
                const totalMeals = allPerf.reduce((sum, s) => sum + s.perf.mealsConsumed, 0);
                return [
                  { label: "Avg Attendance", value: `${avgAttendance}%`, color: avgAttendance >= 80 ? "text-emerald-600" : "text-amber-600" },
                  { label: "Total OT", value: `${totalOT}h`, color: "text-violet-600" },
                  { label: "Meals Served", value: totalMeals, color: "text-orange-600" },
                ].map((m, i) => (
                  <div key={i} className="p-2 rounded-xl bg-muted/30">
                    <p className={`text-lg font-bold ${m.color}`}>{m.value}</p>
                    <p className="text-[10px] text-muted-foreground">{m.label}</p>
                  </div>
                ));
              })()}
            </div>
          </div>

          {filtered.filter(s => s.status === "active").map((s, i) => {
            const perf = getStaffPerformance(s.id);
            const Icon = ROLE_ICONS[s.role] || Users;
            return (
              <motion.div key={s.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="p-3 rounded-2xl bg-card border border-border">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${DEPT_COLORS[s.department] || "bg-muted"}`}>
                    <Icon size={14} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-foreground">{s.name}</p>
                    <p className="text-[10px] text-muted-foreground capitalize">{s.role}</p>
                  </div>
                  <div className={`text-lg font-bold ${perf.attendanceRate >= 90 ? "text-emerald-500" : perf.attendanceRate >= 70 ? "text-amber-500" : "text-red-500"}`}>
                    {perf.attendanceRate}%
                  </div>
                </div>
                {/* Performance bar */}
                <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-2">
                  <div className={`h-full rounded-full transition-all ${
                    perf.attendanceRate >= 90 ? "bg-emerald-500" : perf.attendanceRate >= 70 ? "bg-amber-500" : "bg-red-500"
                  }`} style={{ width: `${perf.attendanceRate}%` }} />
                </div>
                <div className="grid grid-cols-4 gap-1 text-center">
                  {[
                    { label: "Present", value: perf.presentDays, color: "text-emerald-600" },
                    { label: "Hours", value: `${perf.totalHours}h`, color: "text-blue-600" },
                    { label: "OT", value: `${perf.overtimeHours}h`, color: "text-violet-600" },
                    { label: "Late", value: perf.lateArrivals, color: perf.lateArrivals > 3 ? "text-red-500" : "text-muted-foreground" },
                  ].map((m, j) => (
                    <div key={j} className="p-1.5 rounded-lg bg-muted/30">
                      <p className={`text-xs font-bold ${m.color}`}>{m.value}</p>
                      <p className="text-[9px] text-muted-foreground">{m.label}</p>
                    </div>
                  ))}
                </div>
                {perf.mealsConsumed > 0 && (
                  <p className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1">
                    <UtensilsCrossed size={10} /> {perf.mealsConsumed} meals consumed this month
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ===== DETAILS TAB ===== */}
      {tab === "details" && (
        <div className="space-y-3">
          <div className="p-3 rounded-2xl bg-card border border-border">
            <p className="text-xs font-semibold text-foreground mb-2">Department Cost Breakdown</p>
            {stats.deptBreakdown.map(d => (
              <div key={d.dept} className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    DEPT_COLORS[d.dept]?.includes("orange") ? "bg-orange-500" :
                    DEPT_COLORS[d.dept]?.includes("blue") ? "bg-blue-500" :
                    DEPT_COLORS[d.dept]?.includes("emerald") ? "bg-emerald-500" :
                    DEPT_COLORS[d.dept]?.includes("violet") ? "bg-violet-500" :
                    DEPT_COLORS[d.dept]?.includes("pink") ? "bg-pink-500" :
                    "bg-muted-foreground"
                  }`} />
                  <span className="text-[11px] text-foreground capitalize">{d.dept}</span>
                  <span className="text-[10px] text-muted-foreground">{d.count} staff</span>
                </div>
                <span className="text-[11px] font-semibold text-foreground">₹{d.cost.toLocaleString()}</span>
              </div>
            ))}
          </div>

          {filtered.map((s, i) => (
            <motion.div key={s.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="p-3 rounded-2xl bg-card border border-border">
              <p className="font-semibold text-sm text-foreground mb-2">{s.name}</p>
              <div className="space-y-1.5 text-[11px]">
                {s.email && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail size={11} /> <span>{s.email}</span>
                  </div>
                )}
                {s.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone size={11} /> <span>{s.phone}</span>
                  </div>
                )}
                {s.emergency_contact && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Heart size={11} className="text-red-400" /> <span>Emergency: {s.emergency_contact}</span>
                  </div>
                )}
                {s.bank_account && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CreditCard size={11} /> <span>Bank: {s.bank_account}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar size={11} /> <span>Joined: {format(new Date(s.joining_date), "dd MMM yyyy")}</span>
                </div>
                {s.notes && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <FileText size={11} /> <span>{s.notes}</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ===== STAFF DETAIL MODAL ===== */}
      <AnimatePresence>
        {viewingStaff && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end justify-center"
            onClick={() => setViewingStaff(null)}>
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="w-full max-w-lg bg-card rounded-t-3xl p-5 max-h-[85vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-foreground">{viewingStaff.name}</h2>
                <button onClick={() => setViewingStaff(null)}
                  className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <X size={16} />
                </button>
              </div>

              {/* Profile card */}
              <div className={`p-4 rounded-2xl mb-3 ${DEPT_COLORS[viewingStaff.department] || "bg-muted"}`}>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-white/30 flex items-center justify-center">
                    {(() => { const I = ROLE_ICONS[viewingStaff.role] || Users; return <I size={24} />; })()}
                  </div>
                  <div>
                    <p className="font-bold text-sm capitalize">{viewingStaff.role}</p>
                    <p className="text-[11px] capitalize opacity-80">{viewingStaff.department} Department</p>
                    <Badge className={`text-[10px] mt-1 ${
                      viewingStaff.status === "active" ? "bg-white/30" : "bg-red-500/30"
                    }`}>{viewingStaff.status.replace("_", " ")}</Badge>
                  </div>
                </div>
              </div>

              {/* Performance snapshot */}
              {(() => {
                const perf = getStaffPerformance(viewingStaff.id);
                return (
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {[
                      { label: "Attendance", value: `${perf.attendanceRate}%`, color: perf.attendanceRate >= 80 ? "text-emerald-500" : "text-amber-500" },
                      { label: "Hours", value: `${perf.totalHours}h`, color: "text-blue-500" },
                      { label: "OT", value: `${perf.overtimeHours}h`, color: "text-violet-500" },
                    ].map((m, j) => (
                      <div key={j} className="p-2.5 rounded-xl bg-muted/50 text-center">
                        <p className={`text-lg font-bold ${m.color}`}>{m.value}</p>
                        <p className="text-[10px] text-muted-foreground">{m.label}</p>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* Details list */}
              <div className="space-y-2">
                {[
                  { icon: IndianRupee, label: "Salary", value: `₹${Number(viewingStaff.salary).toLocaleString()}/month` },
                  { icon: Phone, label: "Phone", value: viewingStaff.phone || "—" },
                  { icon: Mail, label: "Email", value: viewingStaff.email || "—" },
                  { icon: Heart, label: "Emergency", value: viewingStaff.emergency_contact || "—" },
                  { icon: CreditCard, label: "Bank", value: viewingStaff.bank_account || "—" },
                  { icon: Calendar, label: "Joined", value: format(new Date(viewingStaff.joining_date), "dd MMM yyyy") },
                  { icon: FileText, label: "Notes", value: viewingStaff.notes || "—" },
                ].map((d, j) => (
                  <div key={j} className="flex items-center gap-3 py-2 border-b border-border/30 last:border-0">
                    <d.icon size={14} className="text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-[10px] text-muted-foreground">{d.label}</p>
                      <p className="text-sm text-foreground">{d.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Salary History */}
              <div className="mt-4">
                <p className="text-xs font-semibold text-foreground mb-2">Recent Payments</p>
                {salaries.filter(p => p.staff_id === viewingStaff.id).slice(0, 4).map(p => (
                  <div key={p.id} className="flex items-center justify-between py-1.5 text-[11px] border-b border-border/30">
                    <span className="text-foreground">{p.month} {p.year} — ₹{Number(p.amount).toLocaleString()}</span>
                    <Badge className={`text-[9px] ${p.status === "paid" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" : "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"}`}>
                      {p.status}
                    </Badge>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 mt-4">
                <Button variant="outline" className="flex-1 rounded-xl" onClick={() => { setViewingStaff(null); setEditingStaff(viewingStaff); setShowForm(true); }}>
                  <Pencil size={14} className="mr-1" /> Edit
                </Button>
                <Button variant="destructive" className="rounded-xl" onClick={() => { setViewingStaff(null); setDeleteTarget(viewingStaff); }}>
                  <Trash2 size={14} />
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                      {["staff", "chef", "cook", "manager", "driver", "gardener", "security", "cleaner"].map(r => (
                        <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Department</label>
                    <select value={editingStaff.department || "operations"}
                      onChange={e => setEditingStaff(p => ({ ...p!, department: e.target.value }))}
                      className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm">
                      {["operations", "kitchen", "housekeeping", "transport", "service", "maintenance", "security"].map(d => (
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
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Emergency Contact</label>
                    <Input value={editingStaff.emergency_contact || ""} onChange={e => setEditingStaff(p => ({ ...p!, emergency_contact: e.target.value }))}
                      className="rounded-xl h-10" placeholder="+91..." />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Bank Account</label>
                    <Input value={editingStaff.bank_account || ""} onChange={e => setEditingStaff(p => ({ ...p!, bank_account: e.target.value }))}
                      className="rounded-xl h-10" placeholder="XXXX-XXXX" />
                  </div>
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

      <DeleteConfirmDialog open={!!deleteTarget} onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete} />
    </div>
  );
}
