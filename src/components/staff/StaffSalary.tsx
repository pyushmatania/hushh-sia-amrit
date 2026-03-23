import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Wallet, IndianRupee, TrendingUp, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

interface SalaryRecord {
  id: string;
  staff_id: string;
  month: string;
  year: number;
  amount: number;
  bonus: number | null;
  deductions: number | null;
  status: string;
  paid_at: string | null;
  payment_method: string | null;
  notes: string | null;
}

interface StaffProfile {
  id: string;
  name: string;
  role: string;
  salary: number;
  department: string;
}

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function StaffSalary() {
  const { user } = useAuth();
  const [staffProfile, setStaffProfile] = useState<StaffProfile | null>(null);
  const [salaries, setSalaries] = useState<SalaryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from("staff_members").select("id, name, role, salary, department")
      .eq("user_id", user.id).maybeSingle()
      .then(({ data }) => {
        if (data) {
          setStaffProfile(data as StaffProfile);
        } else {
          setLoading(false);
        }
      });
  }, [user]);

  const fetchSalaries = useCallback(async () => {
    if (!staffProfile) return;
    const { data } = await supabase
      .from("staff_salary_payments")
      .select("*")
      .eq("staff_id", staffProfile.id)
      .order("year", { ascending: false })
      .order("month", { ascending: false });
    setSalaries((data ?? []) as SalaryRecord[]);
    setLoading(false);
  }, [staffProfile]);

  useEffect(() => { fetchSalaries(); }, [fetchSalaries]);

  const totalEarned = salaries
    .filter((s) => s.status === "paid")
    .reduce((sum, s) => sum + s.amount + (s.bonus ?? 0) - (s.deductions ?? 0), 0);

  if (!staffProfile && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Wallet size={32} className="text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground">Staff profile not linked.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
        <Wallet size={20} className="text-primary" /> Salary
      </h1>

      {/* Salary Summary Card */}
      {staffProfile && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-muted-foreground font-medium">{staffProfile.role} · {staffProfile.department}</p>
              <p className="text-sm font-bold text-foreground mt-0.5">{staffProfile.name}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <IndianRupee size={20} className="text-primary" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Monthly</p>
              <p className="text-lg font-bold text-foreground">₹{staffProfile.salary.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Earned</p>
              <p className="text-lg font-bold text-emerald-400 flex items-center gap-1">
                <TrendingUp size={14} /> ₹{totalEarned.toLocaleString()}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Payment History */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-foreground">Payment History</h3>
        {loading ? (
          <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-16 rounded-xl bg-secondary animate-pulse" />)}</div>
        ) : salaries.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No salary records yet</p>
        ) : (
          salaries.map((sal, i) => {
            const net = sal.amount + (sal.bonus ?? 0) - (sal.deductions ?? 0);
            const monthIdx = monthNames.indexOf(sal.month);
            const monthLabel = monthIdx >= 0 ? sal.month : sal.month;
            return (
              <motion.div key={sal.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-bold text-foreground">{monthLabel} {sal.year}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {sal.payment_method ? `via ${sal.payment_method}` : ""}
                      {sal.paid_at ? ` · ${new Date(sal.paid_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}` : ""}
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    sal.status === "paid" ? "bg-emerald-500/10 text-emerald-400" :
                    sal.status === "pending" ? "bg-amber-500/10 text-amber-400" :
                    "bg-secondary text-muted-foreground"
                  }`}>{sal.status}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-[9px] text-muted-foreground uppercase">Base</p>
                    <p className="text-xs font-semibold text-foreground">₹{sal.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-muted-foreground uppercase">Bonus</p>
                    <p className={`text-xs font-semibold ${(sal.bonus ?? 0) > 0 ? "text-emerald-400" : "text-muted-foreground"}`}>
                      {(sal.bonus ?? 0) > 0 ? `+₹${sal.bonus!.toLocaleString()}` : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] text-muted-foreground uppercase">Deductions</p>
                    <p className={`text-xs font-semibold ${(sal.deductions ?? 0) > 0 ? "text-destructive" : "text-muted-foreground"}`}>
                      {(sal.deductions ?? 0) > 0 ? `-₹${sal.deductions!.toLocaleString()}` : "—"}
                    </p>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-border flex items-center justify-between">
                  <p className="text-xs font-bold text-foreground">Net: ₹{net.toLocaleString()}</p>
                  {sal.notes && <p className="text-[9px] text-muted-foreground truncate max-w-[150px]">{sal.notes}</p>}
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
