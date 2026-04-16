import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet, Plus, Search, TrendingUp, TrendingDown, IndianRupee,
  PieChart, BarChart3, ArrowUpDown, X, Check, Calendar,
  Building2, UtensilsCrossed, Zap, Car, Shield, Megaphone,
  Package, FileText, Download, Filter, ChevronDown, Edit,
  Trash2, CreditCard, Banknote, CircleDot, AlertTriangle,
  ArrowRight, Receipt
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import DeleteConfirmDialog from "./DeleteConfirmDialog";

type Expense = {
  id: string; title: string; amount: number; category: string;
  subcategory: string; date: string; payment_method: string;
  vendor: string; notes: string; recurring: boolean; created_at: string;
};

type BudgetAllocation = {
  id: string; category: string; month: string; year: number;
  allocated: number; spent: number; notes: string;
};

type Tab = "overview" | "expenses" | "budgets" | "reports";

const CATEGORY_CONFIG: Record<string, { icon: typeof Wallet; color: string; label: string }> = {
  staff: { icon: Building2, color: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400", label: "Staff" },
  inventory: { icon: Package, color: "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400", label: "Inventory" },
  utilities: { icon: Zap, color: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400", label: "Utilities" },
  maintenance: { icon: Shield, color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400", label: "Maintenance" },
  marketing: { icon: Megaphone, color: "bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-400", label: "Marketing" },
  transport: { icon: Car, color: "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400", label: "Transport" },
  admin: { icon: FileText, color: "bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400", label: "Admin" },
};

const PAYMENT_ICONS: Record<string, string> = {
  cash: "💵", bank_transfer: "🏦", card: "💳", upi: "📱",
};

const emptyExpense: Partial<Expense> = {
  title: "", amount: 0, category: "operations", subcategory: "",
  date: format(new Date(), "yyyy-MM-dd"), payment_method: "cash",
  vendor: "", notes: "", recurring: false,
};

export default function AdminBudgetTracker() {
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

  const loadData = async () => {
    setLoading(true);
    const [e, b, bk, o] = await Promise.all([
      supabase.from("expenses").select("*").order("date", { ascending: false }),
      supabase.from("budget_allocations").select("*").order("year", { ascending: false }),
      supabase.from("bookings").select("total,status,date,created_at"),
      supabase.from("orders").select("total,status,created_at"),
    ]);
    setExpenses((e.data as any[]) ?? []);
    setBudgets((b.data as any[]) ?? []);
    setBookings((bk.data as any[]) ?? []);
    setOrders((o.data as any[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const currentMonth = format(new Date(), "MMMM");
  const currentYear = new Date().getFullYear();
  const currentPrefix = format(new Date(), "yyyy-MM");

  const monthExpenses = useMemo(() =>
    expenses.filter(e => e.date?.startsWith(currentPrefix)),
    [expenses, currentPrefix]
  );

  const monthBudgets = useMemo(() =>
    budgets.filter(b => b.month === currentMonth && b.year === currentYear),
    [budgets, currentMonth, currentYear]
  );

  const revenue = useMemo(() => {
    const bookingRevenue = bookings
      .filter(b => b.created_at?.startsWith(currentPrefix) && b.status !== "cancelled")
      .reduce((sum, b) => sum + Number(b.total || 0), 0);
    const orderRevenue = orders
      .filter(o => o.created_at?.startsWith(currentPrefix))
      .reduce((sum, o) => sum + Number(o.total || 0), 0);
    return { bookings: bookingRevenue, orders: orderRevenue, total: bookingRevenue + orderRevenue };
  }, [bookings, orders, currentPrefix]);

  const stats = useMemo(() => {
    const totalExpenses = monthExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const totalBudget = monthBudgets.reduce((sum, b) => sum + Number(b.allocated), 0);
    const totalSpent = monthBudgets.reduce((sum, b) => sum + Number(b.spent), 0);
    const profit = revenue.total - totalExpenses;
    const profitMargin = revenue.total > 0 ? Math.round((profit / revenue.total) * 100) : 0;
    const budgetUtilization = totalBudget > 0 ? Math.round((totalExpenses / totalBudget) * 100) : 0;

    const byCat = Object.keys(CATEGORY_CONFIG).map(cat => {
      const catExpenses = monthExpenses.filter(e => e.category === cat);
      const catTotal = catExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
      const budget = monthBudgets.find(b => b.category === cat);
      return {
        category: cat,
        spent: catTotal,
        allocated: Number(budget?.allocated || 0),
        count: catExpenses.length,
        pct: totalExpenses > 0 ? Math.round((catTotal / totalExpenses) * 100) : 0,
      };
    }).sort((a, b) => b.spent - a.spent);

    const byMethod = monthExpenses.reduce((acc, e) => {
      acc[e.payment_method] = (acc[e.payment_method] || 0) + Number(e.amount);
      return acc;
    }, {} as Record<string, number>);

    return { totalExpenses, totalBudget, totalSpent, profit, profitMargin, budgetUtilization, byCat, byMethod };
  }, [monthExpenses, monthBudgets, revenue]);

  const filteredExpenses = useMemo(() => {
    let list = expenses;
    if (search) list = list.filter(e =>
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.vendor.toLowerCase().includes(search.toLowerCase())
    );
    if (catFilter !== "all") list = list.filter(e => e.category === catFilter);
    return list;
  }, [expenses, search, catFilter]);

  // CRUD
  const handleSaveExpense = async () => {
    if (!editingExpense?.title || !editingExpense?.amount) {
      toast.error("Title and amount are required"); return;
    }
    if (editingExpense.id) {
      const { error } = await supabase.from("expenses")
        .update({ ...editingExpense, updated_at: new Date().toISOString() } as any)
        .eq("id", editingExpense.id);
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
    toast.success("Expense deleted"); setDeleteTarget(null); loadData();
  };

  const handleSaveBudget = async () => {
    if (!editingBudget?.category || !editingBudget?.allocated) {
      toast.error("Category and amount required"); return;
    }
    if (editingBudget.id) {
      const { error } = await supabase.from("budget_allocations")
        .update({ allocated: editingBudget.allocated, notes: editingBudget.notes } as any)
        .eq("id", editingBudget.id);
      if (error) { toast.error(error.message); return; }
    } else {
      const { error } = await supabase.from("budget_allocations").insert({
        category: editingBudget.category,
        month: currentMonth,
        year: currentYear,
        allocated: editingBudget.allocated,
        notes: editingBudget.notes || "",
      } as any);
      if (error) { toast.error(error.message); return; }
    }
    toast.success("Budget saved"); setShowBudgetForm(false); setEditingBudget(null); loadData();
  };

  const tabs: { id: Tab; label: string; icon: typeof Wallet }[] = [
    { id: "overview", label: "Overview", icon: PieChart },
    { id: "expenses", label: "Expenses", icon: Receipt },
    { id: "budgets", label: "Budgets", icon: BarChart3 },
    { id: "reports", label: "Reports", icon: FileText },
  ];

  return (
    <div className="space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Wallet size={20} className="text-primary" /> Budget Tracker
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">{currentMonth} {currentYear} Financial Overview</p>
        </div>
        <Button size="sm" onClick={() => { setEditingExpense({ ...emptyExpense }); setShowForm(true); }}
          className="gap-1.5 rounded-xl">
          <Plus size={14} /> Expense
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-0.5 p-1 bg-muted/50 rounded-xl">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[11px] font-medium transition-all ${
              tab === t.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}>
            <t.icon size={12} /> {t.label}
          </button>
        ))}
      </div>

      {/* ===== OVERVIEW TAB ===== */}
      {tab === "overview" && (
        <div className="space-y-3">
          {/* P&L Summary */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Net Profit / Loss</p>
            <div className="flex items-end gap-2 mt-1">
              <p className={`text-3xl font-black ${stats.profit >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                {stats.profit >= 0 ? "+" : ""}₹{Math.abs(stats.profit).toLocaleString()}
              </p>
              <Badge className={`text-[10px] mb-1 ${stats.profit >= 0 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" : "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"}`}>
                {stats.profitMargin}% margin
              </Badge>
            </div>
          </div>

          {/* Revenue vs Expenses */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 rounded-2xl bg-card border border-border">
              <TrendingUp size={14} className="text-emerald-500" />
              <p className="text-xl font-bold text-emerald-600 mt-1">₹{revenue.total.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground">Total Revenue</p>
              <div className="mt-1.5 space-y-0.5">
                <p className="text-[9px] text-muted-foreground">Bookings: ₹{revenue.bookings.toLocaleString()}</p>
                <p className="text-[9px] text-muted-foreground">Orders: ₹{revenue.orders.toLocaleString()}</p>
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-card border border-border">
              <TrendingDown size={14} className="text-red-500" />
              <p className="text-xl font-bold text-red-500 mt-1">₹{stats.totalExpenses.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground">Total Expenses</p>
              <div className="mt-1.5">
                <p className="text-[9px] text-muted-foreground">Budget: ₹{stats.totalBudget.toLocaleString()}</p>
                <p className="text-[9px] text-muted-foreground">Utilization: {stats.budgetUtilization}%</p>
              </div>
            </div>
          </div>

          {/* Budget utilization bar */}
          <div className="p-3 rounded-2xl bg-card border border-border">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-foreground">Budget Utilization</p>
              <span className={`text-xs font-bold ${stats.budgetUtilization > 100 ? "text-red-500" : stats.budgetUtilization > 80 ? "text-amber-500" : "text-emerald-500"}`}>
                {stats.budgetUtilization}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div className={`h-full rounded-full transition-all ${
                stats.budgetUtilization > 100 ? "bg-red-500" : stats.budgetUtilization > 80 ? "bg-amber-500" : "bg-emerald-500"
              }`} style={{ width: `${Math.min(stats.budgetUtilization, 100)}%` }} />
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="p-3 rounded-2xl bg-card border border-border">
            <p className="text-xs font-semibold text-foreground mb-2">Spending by Category</p>
            {stats.byCat.filter(c => c.spent > 0).map((cat, i) => {
              const cfg = CATEGORY_CONFIG[cat.category];
              if (!cfg) return null;
              const Icon = cfg.icon;
              const overBudget = cat.allocated > 0 && cat.spent > cat.allocated;
              return (
                <div key={cat.category} className="flex items-center gap-2.5 py-2 border-b border-border/30 last:border-0">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${cfg.color}`}>
                    <Icon size={13} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-medium text-foreground">{cfg.label}</p>
                      <p className="text-[11px] font-bold text-foreground">₹{cat.spent.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
                        <div className={`h-full rounded-full ${overBudget ? "bg-red-500" : "bg-primary"}`}
                          style={{ width: `${cat.allocated > 0 ? Math.min((cat.spent / cat.allocated) * 100, 100) : cat.pct}%` }} />
                      </div>
                      <span className="text-[9px] text-muted-foreground">
                        {cat.allocated > 0 ? `${Math.round((cat.spent / cat.allocated) * 100)}% of ₹${(cat.allocated / 1000).toFixed(0)}K` : `${cat.pct}%`}
                      </span>
                      {overBudget && <AlertTriangle size={10} className="text-red-500" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Payment Methods */}
          <div className="p-3 rounded-2xl bg-card border border-border">
            <p className="text-xs font-semibold text-foreground mb-2">Payment Methods</p>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(stats.byMethod).map(([method, amount]) => (
                <div key={method} className="p-2 rounded-xl bg-muted/30 flex items-center gap-2">
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

      {/* ===== EXPENSES TAB ===== */}
      {tab === "expenses" && (
        <div className="space-y-3">
          {/* Search + Filter */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search expenses..." value={search} onChange={e => setSearch(e.target.value)}
                className="pl-9 h-9 rounded-xl text-sm" />
            </div>
          </div>

          {/* Category filter chips */}
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

          {/* Expense list */}
          {loading ? Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 rounded-2xl bg-muted/50 animate-pulse" />
          )) : filteredExpenses.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">No expenses found</div>
          ) : filteredExpenses.map((e, i) => {
            const cfg = CATEGORY_CONFIG[e.category];
            const Icon = cfg?.icon || Wallet;
            return (
              <motion.div key={e.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className="p-3 rounded-2xl bg-card border border-border">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${cfg?.color || "bg-muted"}`}>
                      <Icon size={15} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">{e.title}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {e.vendor && `${e.vendor} • `}{format(new Date(e.date), "dd MMM")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-red-500">-₹{Number(e.amount).toLocaleString()}</p>
                    <span className="text-[9px] text-muted-foreground">{PAYMENT_ICONS[e.payment_method]} {e.payment_method.replace("_", " ")}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex gap-1">
                    <Badge className={`text-[9px] ${cfg?.color || "bg-muted"}`}>{cfg?.label || e.category}</Badge>
                    {e.subcategory && <Badge variant="outline" className="text-[9px]">{e.subcategory.replace("_", " ")}</Badge>}
                    {e.recurring && <Badge className="text-[9px] bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400">🔄 Recurring</Badge>}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditingExpense(e); setShowForm(true); }}
                      className="w-6 h-6 rounded-md flex items-center justify-center bg-primary/10 text-primary hover:bg-primary/20 transition">
                      <Edit size={10} />
                    </button>
                    <button onClick={() => setDeleteTarget(e)}
                      className="w-6 h-6 rounded-md flex items-center justify-center bg-destructive/10 text-destructive hover:bg-destructive/20 transition">
                      <Trash2 size={10} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ===== BUDGETS TAB ===== */}
      {tab === "budgets" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-foreground">{currentMonth} {currentYear} Budgets</p>
            <Button size="sm" variant="outline" className="gap-1 text-[11px] rounded-xl"
              onClick={() => { setEditingBudget({ category: "staff", allocated: 0, month: currentMonth, year: currentYear }); setShowBudgetForm(true); }}>
              <Plus size={12} /> Set Budget
            </Button>
          </div>

          {/* Overall */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
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
            <div className="h-2.5 rounded-full bg-muted overflow-hidden mt-2">
              <div className={`h-full rounded-full transition-all ${
                stats.budgetUtilization > 100 ? "bg-red-500" : stats.budgetUtilization > 80 ? "bg-amber-500" : "bg-emerald-500"
              }`} style={{ width: `${Math.min(stats.budgetUtilization, 100)}%` }} />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              ₹{(stats.totalBudget - stats.totalExpenses).toLocaleString()} remaining
            </p>
          </div>

          {/* Per category budgets */}
          {stats.byCat.map((cat, i) => {
            const cfg = CATEGORY_CONFIG[cat.category];
            if (!cfg) return null;
            const Icon = cfg.icon;
            const budget = monthBudgets.find(b => b.category === cat.category);
            const pctUsed = cat.allocated > 0 ? Math.round((cat.spent / cat.allocated) * 100) : 0;
            const remaining = cat.allocated - cat.spent;
            return (
              <motion.div key={cat.category} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="p-3 rounded-2xl bg-card border border-border">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cfg.color}`}>
                      <Icon size={14} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{cfg.label}</p>
                      <p className="text-[10px] text-muted-foreground">{cat.count} transactions</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {cat.allocated > 0 ? (
                      <>
                        <p className={`text-sm font-bold ${remaining < 0 ? "text-red-500" : "text-foreground"}`}>
                          {remaining >= 0 ? `₹${remaining.toLocaleString()}` : `-₹${Math.abs(remaining).toLocaleString()}`}
                        </p>
                        <p className="text-[9px] text-muted-foreground">{remaining >= 0 ? "remaining" : "over budget"}</p>
                      </>
                    ) : (
                      <Badge variant="outline" className="text-[9px]">No budget set</Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className={`h-full rounded-full ${pctUsed > 100 ? "bg-red-500" : pctUsed > 80 ? "bg-amber-500" : "bg-emerald-500"}`}
                      style={{ width: `${Math.min(pctUsed, 100)}%` }} />
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground">{pctUsed}%</span>
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

      {/* ===== REPORTS TAB ===== */}
      {tab === "reports" && (
        <div className="space-y-3">
          {/* Monthly comparison */}
          <div className="p-3 rounded-2xl bg-card border border-border">
            <p className="text-xs font-semibold text-foreground mb-2">Month-over-Month</p>
            {(() => {
              const prevMonth = budgets.filter(b => b.month !== currentMonth).slice(0, 7);
              const prevTotal = prevMonth.reduce((sum, b) => sum + Number(b.spent), 0);
              const change = prevTotal > 0 ? Math.round(((stats.totalExpenses - prevTotal) / prevTotal) * 100) : 0;
              return (
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <p className="text-[10px] text-muted-foreground">Previous Month</p>
                    <p className="text-lg font-bold text-foreground">₹{prevTotal.toLocaleString()}</p>
                  </div>
                  <ArrowRight size={16} className="text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-[10px] text-muted-foreground">This Month</p>
                    <p className="text-lg font-bold text-foreground">₹{stats.totalExpenses.toLocaleString()}</p>
                  </div>
                  <Badge className={`text-[10px] ${change > 0 ? "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"}`}>
                    {change > 0 ? "+" : ""}{change}%
                  </Badge>
                </div>
              );
            })()}
          </div>

          {/* Top expenses */}
          <div className="p-3 rounded-2xl bg-card border border-border">
            <p className="text-xs font-semibold text-foreground mb-2">Top Expenses This Month</p>
            {monthExpenses.sort((a, b) => Number(b.amount) - Number(a.amount)).slice(0, 5).map((e, i) => (
              <div key={e.id} className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-muted-foreground w-4">{i + 1}.</span>
                  <div>
                    <p className="text-[11px] font-medium text-foreground">{e.title}</p>
                    <p className="text-[9px] text-muted-foreground">{e.vendor}</p>
                  </div>
                </div>
                <p className="text-[11px] font-bold text-red-500">₹{Number(e.amount).toLocaleString()}</p>
              </div>
            ))}
          </div>

          {/* Top vendors */}
          <div className="p-3 rounded-2xl bg-card border border-border">
            <p className="text-xs font-semibold text-foreground mb-2">Top Vendors</p>
            {(() => {
              const vendorTotals = monthExpenses.reduce((acc, e) => {
                if (e.vendor) acc[e.vendor] = (acc[e.vendor] || 0) + Number(e.amount);
                return acc;
              }, {} as Record<string, number>);
              return Object.entries(vendorTotals)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([vendor, amount], i) => (
                  <div key={vendor} className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0">
                    <p className="text-[11px] text-foreground">{vendor}</p>
                    <p className="text-[11px] font-bold text-foreground">₹{Number(amount).toLocaleString()}</p>
                  </div>
                ));
            })()}
          </div>

          {/* Cash flow summary */}
          <div className="p-3 rounded-2xl bg-card border border-border">
            <p className="text-xs font-semibold text-foreground mb-2">Cash Flow Summary</p>
            <div className="space-y-2">
              {[
                { label: "Revenue (Bookings)", value: revenue.bookings, color: "text-emerald-600", prefix: "+" },
                { label: "Revenue (Orders)", value: revenue.orders, color: "text-emerald-600", prefix: "+" },
                { label: "Staff Costs", value: stats.byCat.find(c => c.category === "staff")?.spent || 0, color: "text-red-500", prefix: "-" },
                { label: "Inventory", value: stats.byCat.find(c => c.category === "inventory")?.spent || 0, color: "text-red-500", prefix: "-" },
                { label: "Utilities", value: stats.byCat.find(c => c.category === "utilities")?.spent || 0, color: "text-red-500", prefix: "-" },
                { label: "Other Expenses", value: (stats.byCat.find(c => c.category === "maintenance")?.spent || 0) +
                  (stats.byCat.find(c => c.category === "marketing")?.spent || 0) +
                  (stats.byCat.find(c => c.category === "transport")?.spent || 0) +
                  (stats.byCat.find(c => c.category === "admin")?.spent || 0), color: "text-red-500", prefix: "-" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <p className="text-[11px] text-muted-foreground">{item.label}</p>
                  <p className={`text-[11px] font-bold ${item.color}`}>{item.prefix}₹{item.value.toLocaleString()}</p>
                </div>
              ))}
              <div className="border-t border-border pt-2 flex items-center justify-between">
                <p className="text-xs font-bold text-foreground">Net Profit</p>
                <p className={`text-sm font-black ${stats.profit >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                  {stats.profit >= 0 ? "+" : ""}₹{stats.profit.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== EXPENSE FORM MODAL ===== */}
      <AnimatePresence>
        {showForm && editingExpense && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end justify-center"
            onClick={() => setShowForm(false)}>
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="w-full max-w-lg bg-card rounded-t-3xl p-5 max-h-[85vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-foreground">
                  {editingExpense.id ? "Edit Expense" : "Add Expense"}
                </h2>
                <button onClick={() => setShowForm(false)}
                  className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Title *</label>
                  <Input value={editingExpense.title || ""} onChange={e => setEditingExpense(p => ({ ...p!, title: e.target.value }))}
                    className="rounded-xl h-10" placeholder="e.g. Kitchen Supplies" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Amount (₹) *</label>
                    <Input type="number" value={editingExpense.amount || ""} onChange={e => setEditingExpense(p => ({ ...p!, amount: e.target.value === "" ? 0 : Number(e.target.value) }))}
                      className="rounded-xl h-10" placeholder="5000" />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Date</label>
                    <Input type="date" value={editingExpense.date || ""} onChange={e => setEditingExpense(p => ({ ...p!, date: e.target.value }))}
                      className="rounded-xl h-10" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Category</label>
                    <select value={editingExpense.category || "operations"}
                      onChange={e => setEditingExpense(p => ({ ...p!, category: e.target.value }))}
                      className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm">
                      {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
                        <option key={key} value={key}>{cfg.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Payment</label>
                    <select value={editingExpense.payment_method || "cash"}
                      onChange={e => setEditingExpense(p => ({ ...p!, payment_method: e.target.value }))}
                      className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm">
                      {["cash", "bank_transfer", "card", "upi"].map(m => (
                        <option key={m} value={m}>{PAYMENT_ICONS[m]} {m.replace("_", " ")}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Vendor</label>
                    <Input value={editingExpense.vendor || ""} onChange={e => setEditingExpense(p => ({ ...p!, vendor: e.target.value }))}
                      className="rounded-xl h-10" placeholder="Vendor name" />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Subcategory</label>
                    <Input value={editingExpense.subcategory || ""} onChange={e => setEditingExpense(p => ({ ...p!, subcategory: e.target.value }))}
                      className="rounded-xl h-10" placeholder="e.g. raw_materials" />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Notes</label>
                  <Input value={editingExpense.notes || ""} onChange={e => setEditingExpense(p => ({ ...p!, notes: e.target.value }))}
                    className="rounded-xl h-10" placeholder="Additional notes..." />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={editingExpense.recurring || false}
                    onChange={e => setEditingExpense(p => ({ ...p!, recurring: e.target.checked }))}
                    className="rounded" />
                  <label className="text-[11px] text-muted-foreground">Recurring expense</label>
                </div>
                <Button onClick={handleSaveExpense} className="w-full rounded-xl mt-2">
                  {editingExpense.id ? "Update Expense" : "Add Expense"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== BUDGET FORM MODAL ===== */}
      <AnimatePresence>
        {showBudgetForm && editingBudget && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end justify-center"
            onClick={() => setShowBudgetForm(false)}>
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="w-full max-w-lg bg-card rounded-t-3xl p-5"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-foreground">
                  {editingBudget.id ? "Edit Budget" : "Set Budget"}
                </h2>
                <button onClick={() => setShowBudgetForm(false)}
                  className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <X size={16} />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Category</label>
                  <select value={editingBudget.category || "staff"}
                    onChange={e => setEditingBudget(p => ({ ...p!, category: e.target.value }))}
                    disabled={!!editingBudget.id}
                    className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm disabled:opacity-50">
                    {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
                      <option key={key} value={key}>{cfg.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Allocated Amount (₹)</label>
                  <Input type="number" value={editingBudget.allocated || ""} onChange={e => setEditingBudget(p => ({ ...p!, allocated: e.target.value === "" ? 0 : Number(e.target.value) }))}
                    className="rounded-xl h-10" placeholder="50000" />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Notes</label>
                  <Input value={editingBudget.notes || ""} onChange={e => setEditingBudget(p => ({ ...p!, notes: e.target.value }))}
                    className="rounded-xl h-10" placeholder="Budget notes..." />
                </div>
                <Button onClick={handleSaveBudget} className="w-full rounded-xl mt-2">
                  Save Budget
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <DeleteConfirmDialog open={!!deleteTarget} onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteExpense} />
    </div>
  );
}
