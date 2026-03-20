import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Ticket, Plus, Trash2, Power, Copy, X, Percent, IndianRupee } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";

interface Coupon {
  id: string; code: string; description: string; discount_type: string;
  discount_value: number; min_order: number; max_uses: number | null;
  uses: number; active: boolean; expires_at: string | null; created_at: string;
  user_specific_id: string | null;
}

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    code: "", description: "", discount_type: "percentage", discount_value: 10,
    min_order: 0, max_uses: "", expires_at: "",
  });

  useEffect(() => {
    supabase.from("coupons").select("*").order("created_at", { ascending: false })
      .then(({ data }) => { setCoupons((data as any) ?? []); setLoading(false); });
  }, []);

  const genCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    return "HUSHH" + Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  };

  const create = async () => {
    const code = form.code || genCode();
    const { data, error } = await supabase.from("coupons").insert({
      code, description: form.description, discount_type: form.discount_type,
      discount_value: form.discount_value, min_order: form.min_order,
      max_uses: form.max_uses ? Number(form.max_uses) : null,
      expires_at: form.expires_at || null,
    } as any).select().maybeSingle();
    if (error) return;
    if (data) setCoupons(prev => [data as any, ...prev]);
    setShowCreate(false);
    setForm({ code: "", description: "", discount_type: "percentage", discount_value: 10, min_order: 0, max_uses: "", expires_at: "" });
  };

  const toggle = async (id: string, active: boolean) => {
    await supabase.from("coupons").update({ active: !active }).eq("id", id);
    setCoupons(prev => prev.map(c => c.id === id ? { ...c, active: !active } : c));
  };

  const remove = async (id: string) => {
    await supabase.from("coupons").delete().eq("id", id);
    setCoupons(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Ticket size={22} className="text-primary" /> Coupon Engine
          </h1>
          <p className="text-sm text-muted-foreground">{coupons.length} coupons</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold">
          <Plus size={16} /> Create
        </button>
      </div>

      {showCreate && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-foreground">New Coupon</h3>
            <button onClick={() => setShowCreate(false)}><X size={18} className="text-muted-foreground" /></button>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Code (auto-generated if empty)</label>
            <Input placeholder="e.g. HUSHH20" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} />
          </div>
          <Input placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Discount</label>
              <div className="flex gap-2">
                <select value={form.discount_type} onChange={e => setForm(f => ({ ...f, discount_type: e.target.value }))}
                  className="bg-secondary border border-border rounded-lg px-2 py-2 text-sm text-foreground">
                  <option value="percentage">%</option>
                  <option value="flat">₹</option>
                </select>
                <Input type="number" value={form.discount_value} onChange={e => setForm(f => ({ ...f, discount_value: Number(e.target.value) }))} />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Min Order (₹)</label>
              <Input type="number" value={form.min_order} onChange={e => setForm(f => ({ ...f, min_order: Number(e.target.value) }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Max Uses</label>
              <Input type="number" placeholder="Unlimited" value={form.max_uses} onChange={e => setForm(f => ({ ...f, max_uses: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Expires At</label>
              <Input type="datetime-local" value={form.expires_at} onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))} />
            </div>
          </div>
          <button onClick={create}
            className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm">
            Create Coupon
          </button>
        </motion.div>
      )}

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 rounded-xl bg-secondary animate-pulse" />)}</div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-16">
          <Ticket size={40} className="mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No coupons yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {coupons.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`rounded-xl border bg-card p-4 ${c.active ? "border-border" : "border-border opacity-60"}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1.5 bg-secondary rounded-lg font-mono text-sm font-bold text-foreground tracking-wider">
                    {c.code}
                  </div>
                  <div>
                    <p className="text-sm text-foreground font-medium flex items-center gap-1">
                      {c.discount_type === "percentage" ? <Percent size={12} /> : <IndianRupee size={12} />}
                      {c.discount_value}{c.discount_type === "percentage" ? "% off" : " off"}
                    </p>
                    <p className="text-[11px] text-muted-foreground">{c.description || "No description"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground tabular-nums">
                    {c.uses}{c.max_uses ? `/${c.max_uses}` : ""} uses
                  </span>
                  <button onClick={() => navigator.clipboard.writeText(c.code)} className="p-1.5 rounded-lg hover:bg-secondary transition">
                    <Copy size={14} className="text-muted-foreground" />
                  </button>
                  <button onClick={() => toggle(c.id, c.active)} className="p-1.5 rounded-lg hover:bg-secondary transition">
                    <Power size={14} className={c.active ? "text-emerald-400" : "text-muted-foreground"} />
                  </button>
                  <button onClick={() => remove(c.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 transition">
                    <Trash2 size={14} className="text-destructive" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
