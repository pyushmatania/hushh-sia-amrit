import { useState, useEffect, useMemo } from "react";
import NumberTicker from "@/components/shared/NumberTicker";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet, Plus, Search, TrendingUp, TrendingDown, IndianRupee,
  PieChart, BarChart3, X, Calendar, Building2, UtensilsCrossed,
  Zap, Car, Shield, Megaphone, Package, FileText, Edit,
  Trash2, AlertTriangle, ArrowRight, Receipt, CalendarCheck,
  DollarSign, CreditCard, Banknote, Target, ArrowUpRight,
  ArrowDownRight, Percent, Eye, Layers, CircleDollarSign, Activity
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import { DEMO_EXPENSES, DEMO_BOOKINGS, DEMO_ORDERS } from "./admin-demo-data";
import DemoDataBanner from "./DemoDataBanner";
import { useDataMode } from "@/hooks/use-data-mode";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  BarChart, Bar, PieChart as RePieChart, Pie, Cell
} from "recharts";

/* ─── Types ─── */
type Expense = {
  id: string; title: string; amount: number; category: string;
  subcategory: string; date: string; payment_method: string;
  vendor: string; notes: string; recurring: boolean; created_at: string;
};

type BudgetAllocation = {
  id: string; category: string; month: string; year: number;
  allocated: number; spent: number; notes: string;
};

type Tab = "overview" | "revenue" | "expenses" | "budgets" | "reports";

/* ─── Config ─── */
const CATEGORY_CONFIG: Record<string, { icon: typeof Wallet; color: string; bg: string; label: string; gradient: string }> = {
  staff: { icon: Building2, color: "text-blue-400", bg: "bg-blue-500/15", label: "Staff", gradient: "from-blue-500 to-blue-400" },
  inventory: { icon: Package, color: "text-orange-400", bg: "bg-orange-500/15", label: "Inventory", gradient: "from-orange-500 to-orange-400" },
  utilities: { icon: Zap, color: "text-amber-400", bg: "bg-amber-500/15", label: "Utilities", gradient: "from-amber-500 to-amber-400" },
  maintenance: { icon: Shield, color: "text-emerald-400", bg: "bg-emerald-500/15", label: "Maintenance", gradient: "from-emerald-500 to-emerald-400" },
  marketing: { icon: Megaphone, color: "text-pink-400", bg: "bg-pink-500/15", label: "Marketing", gradient: "from-pink-500 to-pink-400" },
  transport: { icon: Car, color: "text-violet-400", bg: "bg-violet-500/15", label: "Transport", gradient: "from-violet-500 to-violet-400" },
  admin: { icon: FileText, color: "text-slate-400", bg: "bg-slate-500/15", label: "Admin", gradient: "from-slate-500 to-slate-400" },
};

const PAYMENT_ICONS: Record<string, string> = {
  cash: "💵", bank_transfer: "🏦", card: "💳", upi: "📱",
};

const PIE_COLORS = ["#6366f1", "#f59e0b", "#10b981", "#ec4899", "#8b5cf6", "#f97316", "#64748b"];

const formatCurrency = (v: number) => {
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
  if (v >= 1000) return `₹${(v / 1000).toFixed(1)}K`;
  return `₹${v}`;
};

const emptyExpense: Partial<Expense> = {
  title: "", amount: 0, category: "staff", subcategory: "",
  date: format(new Date(), "yyyy-MM-dd"), payment_method: "cash",
  vendor: "", notes: "", recurring: false,
};

export default function FinanceHub() {
  const [tab, setTab] = useState<Tab>("overview");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<BudgetAllocation[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Partial<Expense> | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Partial<BudgetAllocation> | null>(null);
  const [revPeriod, setRevPeriod] = useState<"week" | "month" | "all">("month");
  const [isDemo, setIsDemo] = useState(false);
  const { isDemoMode } = useDataMode();

  const loadData = async () => {
    setLoading(true);
    const [e, b, bk, o] = await Promise.all([
      supabase.from("expenses").select("*").order("date", { ascending: false }),
      supabase.from("budget_allocations").select("*").order("year", { ascending: false }),
      supabase.from("bookings").select("total,status,date,created_at,slot,property_id,guests").neq("status", "cancelled"),
      supabase.from("orders").select("total,status,created_at"),
    ]);
    const expensesData = (e.data as any[]) ?? [];
    const bookingsData = (bk.data as any[]) ?? [];
    const ordersData = (o.data as any[]) ?? [];
    if (expensesData.length === 0 && bookingsData.length === 0 && isDemoMode) {
      setExpenses(DEMO_EXPENSES as any);
      setBookings(DEMO_BOOKINGS as any);
      setOrders(DEMO_ORDERS as any);
      setIsDemo(true);
    } else {
      setExpenses(expensesData);
      setBookings(bookingsData);
      setOrders(ordersData);
      setIsDemo(false);
    }
    setBudgets((b.data as any[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [isDemoMode]);

  const currentMonth = format(new Date(), "MMMM");
  const currentYear = new Date().getFullYear();
  const currentPrefix = format(new Date(), "yyyy-MM");

  /* ─── Revenue Calculations ─── */
  const revenueData = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 86400000);
    const monthAgo = new Date(now.getTime() - 30 * 86400000);

    const totalBookingRev = bookings.reduce((s, b) => s + Number(b.total), 0);
    const totalOrderRev = orders.reduce((s, o) => s + Number(o.total || 0), 0);
    const totalRevenue = totalBookingRev + totalOrderRev;

    const thisWeekBookings = bookings.filter(b => new Date(b.created_at) >= weekAgo).reduce((s, b) => s + Number(b.total), 0);
    const thisWeekOrders = orders.filter(o => new Date(o.created_at) >= weekAgo).reduce((s, o) => s + Number(o.total || 0), 0);
    const thisWeek = thisWeekBookings + thisWeekOrders;

    const thisMonthBookings = bookings.filter(b => new Date(b.created_at) >= monthAgo).reduce((s, b) => s + Number(b.total), 0);
    const thisMonthOrders = orders.filter(o => new Date(o.created_at) >= monthAgo).reduce((s, o) => s + Number(o.total || 0), 0);
    const thisMonth = thisMonthBookings + thisMonthOrders;

    // Daily revenue (last 14 days)
    const dayMap = new Map<string, { bookings: number; orders: number }>();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000).toISOString().slice(5, 10);
      dayMap.set(d, { bookings: 0, orders: 0 });
    }
    bookings.forEach(b => {
      const d = b.created_at.slice(5, 10);
      if (dayMap.has(d)) dayMap.get(d)!.bookings += Number(b.total);
    });
    orders.forEach(o => {
      const d = o.created_at.slice(5, 10);
      if (dayMap.has(d)) dayMap.get(d)!.orders += Number(o.total || 0);
    });
    const dailyData = Array.from(dayMap, ([day, vals]) => ({ day, revenue: vals.bookings + vals.orders, bookings: vals.bookings, orders: vals.orders }));

    // Weekly (last 6 weeks)
    const weeklyData: { week: string; revenue: number; bookings: number; count: number }[] = [];
    for (let w = 5; w >= 0; w--) {
      const start = new Date(now.getTime() - (w + 1) * 7 * 86400000);
      const end = new Date(now.getTime() - w * 7 * 86400000);
      const wBookings = bookings.filter(b => { const d = new Date(b.created_at); return d >= start && d < end; });
      const wOrders = orders.filter(o => { const d = new Date(o.created_at); return d >= start && d < end; });
      weeklyData.push({
        week: `W${6 - w}`,
        revenue: wBookings.reduce((s, b) => s + Number(b.total), 0) + wOrders.reduce((s, o) => s + Number(o.total || 0), 0),
        bookings: wBookings.reduce((s, b) => s + Number(b.total), 0),
        count: wBookings.length,
      });
    }

    const days = Math.max(1, 30);
    const avgPerDay = Math.round(thisMonth / days);

    // Revenue by slot
    const slotRevenue = bookings.reduce((acc: Record<string, number>, b: any) => {
      const slot = b.slot || "Other";
      acc[slot] = (acc[slot] || 0) + Number(b.total);
      return acc;
    }, {});

    return {
      totalRevenue, totalBookingRev, totalOrderRev, thisWeek, thisMonth,
      avgPerDay, dailyData, weeklyData, slotRevenue,
      bookingCount: bookings.length, orderCount: orders.length,
      avgBookingValue: bookings.length ? Math.round(totalBookingRev / bookings.length) : 0,
    };
  }, [bookings, orders]);

  /* ─── Expense / Budget Calculations ─── */
  const monthExpenses = useMemo(() => expenses.filter(e => e.date?.startsWith(currentPrefix)), [expenses, currentPrefix]);
  const monthBudgets = useMemo(() => budgets.filter(b => b.month === currentMonth && b.year === currentYear), [budgets, currentMonth, currentYear]);

  const monthRevenue = useMemo(() => {
    const bRev = bookings.filter(b => b.created_at?.startsWith(currentPrefix)).reduce((s, b) => s + Number(b.total || 0), 0);
    const oRev = orders.filter(o => o.created_at?.startsWith(currentPrefix)).reduce((s, o) => s + Number(o.total || 0), 0);
    return { bookings: bRev, orders: oRev, total: bRev + oRev };
  }, [bookings, orders, currentPrefix]);

  const stats = useMemo(() => {
    const totalExpenses = monthExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const totalBudget = monthBudgets.reduce((sum, b) => sum + Number(b.allocated), 0);
    const profit = monthRevenue.total - totalExpenses;
    const profitMargin = monthRevenue.total > 0 ? Math.round((profit / monthRevenue.total) * 100) : 0;
    const budgetUtilization = totalBudget > 0 ? Math.round((totalExpenses / totalBudget) * 100) : 0;

    const byCat = Object.keys(CATEGORY_CONFIG).map(cat => {
      const catExpenses = monthExpenses.filter(e => e.category === cat);
      const catTotal = catExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
      const budget = monthBudgets.find(b => b.category === cat);
      return {
        category: cat, spent: catTotal,
        allocated: Number(budget?.allocated || 0),
        count: catExpenses.length,
        pct: totalExpenses > 0 ? Math.round((catTotal / totalExpenses) * 100) : 0,
      };
    }).sort((a, b) => b.spent - a.spent);

    const byMethod = monthExpenses.reduce((acc, e) => {
      acc[e.payment_method] = (acc[e.payment_method] || 0) + Number(e.amount);
      return acc;
    }, {} as Record<string, number>);

    return { totalExpenses, totalBudget, profit, profitMargin, budgetUtilization, byCat, byMethod };
  }, [monthExpenses, monthBudgets, monthRevenue]);

  const filteredExpenses = useMemo(() => {
    let list = expenses;
    if (search) list = list.filter(e => e.title.toLowerCase().includes(search.toLowerCase()) || e.vendor.toLowerCase().includes(search.toLowerCase()));
    if (catFilter !== "all") list = list.filter(e => e.category === catFilter);
    return list;
  }, [expenses, search, catFilter]);

  /* ─── CRUD ─── */
  const handleSaveExpense = async () => {
    if (!editingExpense?.title || !editingExpense?.amount) { toast.error("Title and amount required"); return; }
    if (editingExpense.id) {
      const { error } = await supabase.from("expenses").update({ ...editingExpense, updated_at: new Date().toISOString() } as any).eq("id", editingExpense.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Expense updated");
    } else {
      const { error } = await supabase.from("expenses").insert(editingExpense as any);
      if (error) { toast.error(error.message); return; }
      toast.success("Expense added");
    }
    setShowForm(false); setEditingExpense(null); loadData();
  };

  const handleDeleteExpense = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from("expenses").delete().eq("id", deleteTarget.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Deleted"); setDeleteTarget(null); loadData();
  };

  const handleSaveBudget = async () => {
    if (!editingBudget?.category || !editingBudget?.allocated) { toast.error("Category and amount required"); return; }
    if (editingBudget.id) {
      await supabase.from("budget_allocations").update({ allocated: editingBudget.allocated, notes: editingBudget.notes } as any).eq("id", editingBudget.id);
    } else {
      await supabase.from("budget_allocations").insert({ category: editingBudget.category, month: currentMonth, year: currentYear, allocated: editingBudget.allocated, notes: editingBudget.notes || "" } as any);
    }
    toast.success("Budget saved"); setShowBudgetForm(false); setEditingBudget(null); loadData();
  };

  const pieData = stats.byCat.filter(c => c.spent > 0).map(c => ({ name: CATEGORY_CONFIG[c.category]?.label || c.category, value: c.spent }));

  const tabs: { id: Tab; label: string; icon: typeof Wallet }[] = [
    { id: "overview", label: "Overview", icon: Layers },
    { id: "revenue", label: "Revenue", icon: TrendingUp },
    { id: "expenses", label: "Expenses", icon: Receipt },
    { id: "budgets", label: "Budgets", icon: Target },
    { id: "reports", label: "Reports", icon: FileText },
  ];

  if (loading) {
    return (
      <div className="space-y-4">
        {[1,2,3,4].map(i => <div key={i} className="h-28 rounded-2xl bg-muted/40 animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24">
      {isDemo && <DemoDataBanner entityName="finance" />}
      {/* ─── Header ─── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-foreground flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-primary/20 flex items-center justify-center">
              <CircleDollarSign size={18} className="text-emerald-500" />
            </div>
            Finance Hub
          </h1>
          <p className="text-xs lg:text-sm text-muted-foreground mt-0.5">{currentMonth} {currentYear} • Revenue, Expenses & Budgets</p>
        </div>
        <Button size="sm" onClick={() => { setEditingExpense({ ...emptyExpense }); setShowForm(true); }} className="gap-1.5 rounded-xl text-xs">
          <Plus size={14} /> Expense
        </Button>
      </div>

      {/* ─── Hero P&L Card ─── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card via-card to-primary/5 p-5">
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-primary/5 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-emerald-500/5 translate-y-1/2 -translate-x-1/2" />
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold relative">Net Profit / Loss • {currentMonth}</p>
        <div className="flex items-end gap-3 mt-2 relative">
          <p className={`text-4xl font-black tracking-tight ${stats.profit >= 0 ? "text-emerald-500" : "text-destructive"}`}>
            {stats.profit >= 0 ? "+" : "-"}₹<NumberTicker value={Math.abs(stats.profit)} locale="en-IN" />
          </p>
          <div className="flex items-center gap-1.5 mb-1">
            {stats.profit >= 0 ? <ArrowUpRight size={16} className="text-emerald-500" /> : <ArrowDownRight size={16} className="text-destructive" />}
            <span className={`text-sm font-bold ${stats.profit >= 0 ? "text-emerald-500" : "text-destructive"}`}>{stats.profitMargin}%</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-4 relative">
          <div>
            <p className="text-[10px] text-muted-foreground">Revenue</p>
            <p className="text-lg font-bold text-emerald-500">₹<NumberTicker value={monthRevenue.total} locale="en-IN" /></p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">Expenses</p>
            <p className="text-lg font-bold text-destructive">₹<NumberTicker value={stats.totalExpenses} locale="en-IN" /></p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">Budget Left</p>
            <p className="text-lg font-bold text-foreground">₹<NumberTicker value={Math.max(0, stats.totalBudget - stats.totalExpenses)} locale="en-IN" /></p>
          </div>
        </div>
      </motion.div>

      {/* ─── Quick Stats ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {[
          { label: "All-Time Rev", value: formatCurrency(revenueData.totalRevenue), icon: IndianRupee, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "This Week", value: formatCurrency(revenueData.thisWeek), icon: TrendingUp, color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "Avg/Day", value: formatCurrency(revenueData.avgPerDay), icon: Activity, color: "text-amber-400", bg: "bg-amber-500/10" },
          { label: "Avg Booking", value: formatCurrency(revenueData.avgBookingValue), icon: CalendarCheck, color: "text-primary", bg: "bg-primary/10" },
        ].map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="rounded-xl border border-border bg-card p-2.5 text-center">
            <div className={`w-7 h-7 rounded-lg ${card.bg} flex items-center justify-center mx-auto mb-1`}>
              <card.icon size={13} className={card.color} />
            </div>
            <p className="text-sm font-bold text-foreground">{card.value}</p>
            <p className="text-[8px] text-muted-foreground leading-tight">{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* ─── Tabs ─── */}
      <div className="flex gap-0.5 p-1 bg-muted/40 rounded-xl overflow-x-auto">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[10px] font-semibold transition-all whitespace-nowrap min-w-0 ${
              tab === t.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}>
            <t.icon size={11} /> {t.label}
          </button>
        ))}
      </div>

      {/* ══════════════ OVERVIEW ══════════════ */}
      {tab === "overview" && (
        <div className="space-y-3">
          {/* Revenue vs Expenses visual */}
          <div className="grid grid-cols-2 gap-2">
            <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              className="p-3.5 rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp size={13} className="text-emerald-500" />
                <span className="text-[10px] text-muted-foreground font-medium">Revenue</span>
              </div>
              <p className="text-2xl font-black text-emerald-500">₹{monthRevenue.total.toLocaleString()}</p>
              <div className="mt-2 space-y-0.5">
                <div className="flex justify-between text-[9px]">
                  <span className="text-muted-foreground">Bookings</span>
                  <span className="text-emerald-500 font-bold">₹{monthRevenue.bookings.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[9px]">
                  <span className="text-muted-foreground">Orders</span>
                  <span className="text-emerald-500 font-bold">₹{monthRevenue.orders.toLocaleString()}</span>
                </div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
              className="p-3.5 rounded-2xl border border-destructive/20 bg-gradient-to-br from-destructive/5 to-transparent">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingDown size={13} className="text-destructive" />
                <span className="text-[10px] text-muted-foreground font-medium">Expenses</span>
              </div>
              <p className="text-2xl font-black text-destructive">₹{stats.totalExpenses.toLocaleString()}</p>
              <div className="mt-2 space-y-0.5">
                <div className="flex justify-between text-[9px]">
                  <span className="text-muted-foreground">Budget Used</span>
                  <span className={`font-bold ${stats.budgetUtilization > 100 ? "text-destructive" : "text-foreground"}`}>{stats.budgetUtilization}%</span>
                </div>
                <div className="flex justify-between text-[9px]">
                  <span className="text-muted-foreground">Transactions</span>
                  <span className="text-foreground font-bold">{monthExpenses.length}</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Budget Utilization Bar */}
          <div className="p-3 rounded-2xl bg-card border border-border">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Target size={13} className="text-primary" /> Budget Utilization
              </p>
              <span className={`text-xs font-black tabular-nums ${stats.budgetUtilization > 100 ? "text-destructive" : stats.budgetUtilization > 80 ? "text-amber-500" : "text-emerald-500"}`}>
                {stats.budgetUtilization}%
              </span>
            </div>
            <div className="h-3 rounded-full bg-muted overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(stats.budgetUtilization, 100)}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full rounded-full ${stats.budgetUtilization > 100 ? "bg-destructive" : stats.budgetUtilization > 80 ? "bg-amber-500" : "bg-emerald-500"}`} />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1.5">
              ₹{stats.totalExpenses.toLocaleString()} of ₹{stats.totalBudget.toLocaleString()} budget used
            </p>
          </div>

          {/* Spending by Category with pie chart */}
          <div className="p-3 rounded-2xl bg-card border border-border">
            <p className="text-xs font-bold text-foreground mb-3 flex items-center gap-1.5">
              <PieChart size={13} className="text-primary" /> Spending Breakdown
            </p>
            {pieData.length > 0 && (
              <div className="h-[140px] mb-3">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} dataKey="value" paddingAngle={3}>
                      {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 11 }} />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
            )}
            {stats.byCat.filter(c => c.spent > 0).map((cat, i) => {
              const cfg = CATEGORY_CONFIG[cat.category];
              if (!cfg) return null;
              const Icon = cfg.icon;
              const overBudget = cat.allocated > 0 && cat.spent > cat.allocated;
              return (
                <div key={cat.category} className="flex items-center gap-2.5 py-2 border-b border-border/30 last:border-0">
                  <div className={`w-7 h-7 rounded-lg ${cfg.bg} flex items-center justify-center`}>
                    <Icon size={12} className={cfg.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-medium text-foreground">{cfg.label}</p>
                      <p className="text-[11px] font-bold text-foreground">₹{cat.spent.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
                        <div className={`h-full rounded-full ${overBudget ? "bg-destructive" : "bg-primary"}`}
                          style={{ width: `${cat.allocated > 0 ? Math.min((cat.spent / cat.allocated) * 100, 100) : cat.pct}%` }} />
                      </div>
                      <span className="text-[9px] text-muted-foreground tabular-nums">
                        {cat.allocated > 0 ? `${Math.round((cat.spent / cat.allocated) * 100)}%` : `${cat.pct}%`}
                      </span>
                      {overBudget && <AlertTriangle size={9} className="text-destructive" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Payment Methods */}
          <div className="p-3 rounded-2xl bg-card border border-border">
            <p className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">
              <CreditCard size={13} className="text-primary" /> Payment Methods
            </p>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(stats.byMethod).map(([method, amount]) => (
                <div key={method} className="p-2.5 rounded-xl bg-muted/30 border border-border/40 flex items-center gap-2">
                  <span className="text-lg">{PAYMENT_ICONS[method] || "💰"}</span>
                  <div>
                    <p className="text-xs font-bold text-foreground">₹{Number(amount).toLocaleString()}</p>
                    <p className="text-[9px] text-muted-foreground capitalize">{method.replace("_", " ")}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ REVENUE TAB ══════════════ */}
      {tab === "revenue" && (
        <div className="space-y-3">
          {/* Period Toggle */}
          <div className="flex gap-2">
            {(["week", "month", "all"] as const).map(p => (
              <button key={p} onClick={() => setRevPeriod(p)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${
                  revPeriod === p ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"
                }`}>{p === "all" ? "All Time" : `This ${p}`}</button>
            ))}
          </div>

          {/* Revenue Split */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 rounded-2xl bg-card border border-border">
              <CalendarCheck size={14} className="text-primary mb-1" />
              <p className="text-xl font-black text-foreground">₹{revenueData.totalBookingRev.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground">Booking Revenue</p>
              <p className="text-[9px] text-primary mt-1">{revenueData.bookingCount} bookings</p>
            </div>
            <div className="p-3 rounded-2xl bg-card border border-border">
              <Receipt size={14} className="text-amber-400 mb-1" />
              <p className="text-xl font-black text-foreground">₹{revenueData.totalOrderRev.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground">Order Revenue</p>
              <p className="text-[9px] text-amber-400 mt-1">{revenueData.orderCount} orders</p>
            </div>
          </div>

          {/* Daily Revenue Chart */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="rounded-2xl border border-border bg-card p-4">
            <h3 className="text-xs font-bold text-foreground mb-3 flex items-center gap-1.5">
              <Activity size={13} className="text-primary" /> Daily Revenue (14 days)
            </h3>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData.dailyData}>
                  <defs>
                    <linearGradient id="finRevGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={v => formatCurrency(v)} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 11 }} />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#finRevGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Weekly Breakdown */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="rounded-2xl border border-border bg-card p-4">
            <h3 className="text-xs font-bold text-foreground mb-3 flex items-center gap-1.5">
              <BarChart3 size={13} className="text-primary" /> Weekly Breakdown
            </h3>
            <div className="h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData.weeklyData} barSize={20}>
                  <XAxis dataKey="week" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={v => formatCurrency(v)} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 11 }} />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Revenue by Slot */}
          {Object.keys(revenueData.slotRevenue).length > 0 && (
            <div className="p-3 rounded-2xl bg-card border border-border">
              <p className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">
                <Layers size={13} className="text-primary" /> Revenue by Time Slot
              </p>
              {Object.entries(revenueData.slotRevenue).sort(([,a],[,b]) => Number(b) - Number(a)).map(([slot, amount]) => {
                const total = revenueData.totalBookingRev || 1;
                const pct = Math.round((Number(amount) / total) * 100);
                return (
                  <div key={slot} className="flex items-center gap-2 py-1.5 border-b border-border/30 last:border-0">
                    <span className="text-[11px] font-medium text-foreground w-28 truncate">{slot}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[10px] font-bold text-foreground tabular-nums w-16 text-right">₹{amount.toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ══════════════ EXPENSES TAB ══════════════ */}
      {tab === "expenses" && (
        <div className="space-y-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search expenses..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-9 h-9 rounded-xl text-sm" />
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            <button onClick={() => setCatFilter("all")}
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-[10px] font-medium transition border ${
                catFilter === "all" ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground"
              }`}>All</button>
            {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
              <button key={key} onClick={() => setCatFilter(catFilter === key ? "all" : key)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-[10px] font-medium transition border ${
                  catFilter === key ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground"
                }`}>{cfg.label}</button>
            ))}
          </div>

          {filteredExpenses.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">No expenses found</div>
          ) : filteredExpenses.map((e, i) => {
            const cfg = CATEGORY_CONFIG[e.category];
            const Icon = cfg?.icon || Wallet;
            return (
              <motion.div key={e.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                className="p-3 rounded-2xl bg-card border border-border hover:border-primary/30 transition">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${cfg?.bg || "bg-muted"}`}>
                      <Icon size={15} className={cfg?.color} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">{e.title}</p>
                      <p className="text-[10px] text-muted-foreground">{e.vendor && `${e.vendor} • `}{format(new Date(e.date), "dd MMM yyyy")}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-destructive">-₹{Number(e.amount).toLocaleString()}</p>
                    <span className="text-[9px] text-muted-foreground">{PAYMENT_ICONS[e.payment_method]} {e.payment_method.replace("_", " ")}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex gap-1">
                    <Badge className={`text-[9px] ${cfg?.bg} ${cfg?.color} border-0`}>{cfg?.label || e.category}</Badge>
                    {e.subcategory && <Badge variant="outline" className="text-[9px]">{e.subcategory.replace("_", " ")}</Badge>}
                    {e.recurring && <Badge className="text-[9px] bg-violet-500/15 text-violet-400 border-0">🔄 Recurring</Badge>}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditingExpense(e); setShowForm(true); }}
                      className="w-6 h-6 rounded-md flex items-center justify-center bg-primary/10 text-primary hover:bg-primary/20 transition"><Edit size={10} /></button>
                    <button onClick={() => setDeleteTarget(e)}
                      className="w-6 h-6 rounded-md flex items-center justify-center bg-destructive/10 text-destructive hover:bg-destructive/20 transition"><Trash2 size={10} /></button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ══════════════ BUDGETS TAB ══════════════ */}
      {tab === "budgets" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-foreground">{currentMonth} {currentYear} Budgets</p>
            <Button size="sm" variant="outline" className="gap-1 text-[11px] rounded-xl"
              onClick={() => { setEditingBudget({ category: "staff", allocated: 0, month: currentMonth, year: currentYear }); setShowBudgetForm(true); }}>
              <Plus size={12} /> Set Budget
            </Button>
          </div>

          {/* Overall Budget Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground">Total Budget</p>
                <p className="text-2xl font-black text-foreground">₹{stats.totalBudget.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground">Spent</p>
                <p className="text-lg font-bold text-foreground">₹{stats.totalExpenses.toLocaleString()}</p>
              </div>
            </div>
            <div className="h-3 rounded-full bg-muted overflow-hidden mt-3">
              <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(stats.budgetUtilization, 100)}%` }}
                transition={{ duration: 1 }}
                className={`h-full rounded-full ${stats.budgetUtilization > 100 ? "bg-destructive" : stats.budgetUtilization > 80 ? "bg-amber-500" : "bg-emerald-500"}`} />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">₹{Math.max(0, stats.totalBudget - stats.totalExpenses).toLocaleString()} remaining</p>
          </div>

          {/* Per-Category Budgets */}
          {stats.byCat.map((cat, i) => {
            const cfg = CATEGORY_CONFIG[cat.category];
            if (!cfg) return null;
            const Icon = cfg.icon;
            const budget = monthBudgets.find(b => b.category === cat.category);
            const pctUsed = cat.allocated > 0 ? Math.round((cat.spent / cat.allocated) * 100) : 0;
            const remaining = cat.allocated - cat.spent;
            return (
              <motion.div key={cat.category} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="p-3 rounded-2xl bg-card border border-border">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cfg.bg}`}>
                      <Icon size={14} className={cfg.color} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{cfg.label}</p>
                      <p className="text-[10px] text-muted-foreground">{cat.count} transactions</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {cat.allocated > 0 ? (
                      <>
                        <p className={`text-sm font-bold ${remaining < 0 ? "text-destructive" : "text-foreground"}`}>
                          {remaining >= 0 ? `₹${remaining.toLocaleString()}` : `-₹${Math.abs(remaining).toLocaleString()}`}
                        </p>
                        <p className="text-[9px] text-muted-foreground">{remaining >= 0 ? "remaining" : "over budget"}</p>
                      </>
                    ) : (
                      <Badge variant="outline" className="text-[9px]">No budget</Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className={`h-full rounded-full ${pctUsed > 100 ? "bg-destructive" : pctUsed > 80 ? "bg-amber-500" : "bg-emerald-500"}`}
                      style={{ width: `${Math.min(pctUsed, 100)}%` }} />
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground tabular-nums">{pctUsed}%</span>
                </div>
                <div className="flex items-center justify-between mt-1.5 text-[10px] text-muted-foreground">
                  <span>Spent: ₹{cat.spent.toLocaleString()}</span>
                  <span>Budget: ₹{cat.allocated > 0 ? cat.allocated.toLocaleString() : "—"}</span>
                </div>
                {budget && (
                  <button onClick={() => { setEditingBudget(budget); setShowBudgetForm(true); }}
                    className="mt-1.5 text-[10px] text-primary font-medium flex items-center gap-0.5">
                    <Edit size={10} /> Edit budget
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ══════════════ REPORTS TAB ══════════════ */}
      {tab === "reports" && (
        <div className="space-y-3">
          {/* Cash Flow */}
          <div className="p-4 rounded-2xl bg-card border border-border">
            <p className="text-xs font-bold text-foreground mb-3 flex items-center gap-1.5">
              <Activity size={13} className="text-primary" /> Cash Flow Statement
            </p>
            <div className="space-y-2">
              <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Inflows</p>
              {[
                { label: "Booking Revenue", value: monthRevenue.bookings },
                { label: "Order Revenue", value: monthRevenue.orders },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <p className="text-[11px] text-muted-foreground">{item.label}</p>
                  <p className="text-[11px] font-bold text-emerald-500">+₹{item.value.toLocaleString()}</p>
                </div>
              ))}
              <div className="border-t border-border my-2" />
              <p className="text-[10px] text-destructive font-bold uppercase tracking-wider">Outflows</p>
              {stats.byCat.filter(c => c.spent > 0).map(cat => {
                const cfg = CATEGORY_CONFIG[cat.category];
                return (
                  <div key={cat.category} className="flex items-center justify-between">
                    <p className="text-[11px] text-muted-foreground">{cfg?.label || cat.category}</p>
                    <p className="text-[11px] font-bold text-destructive">-₹{cat.spent.toLocaleString()}</p>
                  </div>
                );
              })}
              <div className="border-t border-border pt-2 flex items-center justify-between">
                <p className="text-xs font-bold text-foreground">Net Cash Flow</p>
                <p className={`text-base font-black ${stats.profit >= 0 ? "text-emerald-500" : "text-destructive"}`}>
                  {stats.profit >= 0 ? "+" : ""}₹{stats.profit.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Top Expenses */}
          <div className="p-3 rounded-2xl bg-card border border-border">
            <p className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">
              <ArrowUpRight size={13} className="text-destructive" /> Top Expenses This Month
            </p>
            {monthExpenses.sort((a, b) => Number(b.amount) - Number(a.amount)).slice(0, 5).map((e, i) => (
              <div key={e.id} className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-muted-foreground w-4">{i + 1}.</span>
                  <div>
                    <p className="text-[11px] font-medium text-foreground">{e.title}</p>
                    <p className="text-[9px] text-muted-foreground">{e.vendor}</p>
                  </div>
                </div>
                <p className="text-[11px] font-bold text-destructive">₹{Number(e.amount).toLocaleString()}</p>
              </div>
            ))}
          </div>

          {/* Top Vendors */}
          <div className="p-3 rounded-2xl bg-card border border-border">
            <p className="text-xs font-bold text-foreground mb-2">Top Vendors</p>
            {(() => {
              const vendorTotals = monthExpenses.reduce((acc, e) => {
                if (e.vendor) acc[e.vendor] = (acc[e.vendor] || 0) + Number(e.amount);
                return acc;
              }, {} as Record<string, number>);
              return Object.entries(vendorTotals).sort(([,a],[,b]) => Number(b) - Number(a)).slice(0, 5).map(([vendor, amount]) => (
                <div key={vendor} className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0">
                  <p className="text-[11px] text-foreground">{vendor}</p>
                  <p className="text-[11px] font-bold text-foreground">₹{Number(amount).toLocaleString()}</p>
                </div>
              ));
            })()}
          </div>

          {/* Key Metrics */}
          <div className="p-3 rounded-2xl bg-card border border-border">
            <p className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">
              <Percent size={13} className="text-primary" /> Key Metrics
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Profit Margin", value: `${stats.profitMargin}%`, good: stats.profitMargin > 0 },
                { label: "Budget Usage", value: `${stats.budgetUtilization}%`, good: stats.budgetUtilization <= 100 },
                { label: "Rev/Booking", value: formatCurrency(revenueData.avgBookingValue), good: true },
                { label: "Total Bookings", value: revenueData.bookingCount.toString(), good: true },
              ].map(m => (
                <div key={m.label} className="p-2.5 rounded-xl bg-muted/30 border border-border/40">
                  <p className="text-[9px] text-muted-foreground">{m.label}</p>
                  <p className={`text-lg font-black ${m.good ? "text-foreground" : "text-destructive"}`}>{m.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══ EXPENSE FORM MODAL ═══ */}
      <AnimatePresence>
        {showForm && editingExpense && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end justify-center" onClick={() => setShowForm(false)}>
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25 }}
              className="w-full max-w-lg bg-card rounded-t-3xl p-5 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-foreground">{editingExpense.id ? "Edit Expense" : "Add Expense"}</h2>
                <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><X size={16} /></button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Title *</label>
                  <Input value={editingExpense.title || ""} onChange={e => setEditingExpense(p => ({ ...p!, title: e.target.value }))} className="rounded-xl h-10" placeholder="e.g. Kitchen Supplies" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Amount (₹) *</label>
                    <Input type="number" value={editingExpense.amount ?? ""} onChange={e => setEditingExpense(p => ({ ...p!, amount: Number(e.target.value) }))} className="rounded-xl h-10" />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Date</label>
                    <Input type="date" value={editingExpense.date || ""} onChange={e => setEditingExpense(p => ({ ...p!, date: e.target.value }))} className="rounded-xl h-10" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Category</label>
                    <select value={editingExpense.category || "staff"} onChange={e => setEditingExpense(p => ({ ...p!, category: e.target.value }))}
                      className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm">
                      {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (<option key={key} value={key}>{cfg.label}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Payment</label>
                    <select value={editingExpense.payment_method || "cash"} onChange={e => setEditingExpense(p => ({ ...p!, payment_method: e.target.value }))}
                      className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm">
                      {["cash", "bank_transfer", "card", "upi"].map(m => (<option key={m} value={m}>{PAYMENT_ICONS[m]} {m.replace("_", " ")}</option>))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Vendor</label>
                    <Input value={editingExpense.vendor || ""} onChange={e => setEditingExpense(p => ({ ...p!, vendor: e.target.value }))} className="rounded-xl h-10" placeholder="Vendor name" />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Subcategory</label>
                    <Input value={editingExpense.subcategory || ""} onChange={e => setEditingExpense(p => ({ ...p!, subcategory: e.target.value }))} className="rounded-xl h-10" />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Notes</label>
                  <Input value={editingExpense.notes || ""} onChange={e => setEditingExpense(p => ({ ...p!, notes: e.target.value }))} className="rounded-xl h-10" placeholder="Notes..." />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={editingExpense.recurring || false} onChange={e => setEditingExpense(p => ({ ...p!, recurring: e.target.checked }))} className="rounded" />
                  <label className="text-[11px] text-muted-foreground">Recurring expense</label>
                </div>
                <Button onClick={handleSaveExpense} className="w-full rounded-xl mt-2">{editingExpense.id ? "Update" : "Add"} Expense</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ BUDGET FORM MODAL ═══ */}
      <AnimatePresence>
        {showBudgetForm && editingBudget && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end justify-center" onClick={() => setShowBudgetForm(false)}>
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25 }}
              className="w-full max-w-lg bg-card rounded-t-3xl p-5" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-foreground">{editingBudget.id ? "Edit Budget" : "Set Budget"}</h2>
                <button onClick={() => setShowBudgetForm(false)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><X size={16} /></button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Category</label>
                  <select value={editingBudget.category || "staff"} onChange={e => setEditingBudget(p => ({ ...p!, category: e.target.value }))}
                    disabled={!!editingBudget.id} className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm disabled:opacity-50">
                    {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (<option key={key} value={key}>{cfg.label}</option>))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Allocated Amount (₹)</label>
                  <Input type="number" value={editingBudget.allocated ?? ""} onChange={e => setEditingBudget(p => ({ ...p!, allocated: Number(e.target.value) }))} className="rounded-xl h-10" placeholder="50000" />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Notes</label>
                  <Input value={editingBudget.notes || ""} onChange={e => setEditingBudget(p => ({ ...p!, notes: e.target.value }))} className="rounded-xl h-10" />
                </div>
                <Button onClick={handleSaveBudget} className="w-full rounded-xl mt-2">Save Budget</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <DeleteConfirmDialog open={!!deleteTarget} onCancel={() => setDeleteTarget(null)} onConfirm={handleDeleteExpense} />
    </div>
  );
}
