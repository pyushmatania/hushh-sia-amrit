import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Ticket, Plus, Trash2, Power, Copy, X, Percent, IndianRupee, Save, Loader2, Pencil, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";

interface Coupon {
  id: string; code: string; description: string; discount_type: string;
  discount_value: number; min_order: number; max_uses: number | null;
  uses: number; active: boolean; expires_at: string | null; created_at: string;
  user_specific_id: string | null;
}

interface CouponForm {
  code: string; description: string; discount_type: string; discount_value: number;
  min_order: number; max_uses: string; expires_at: string;
}

const emptyForm: CouponForm = {
  code: "", description: "", discount_type: "percentage", discount_value: 10, min_order: 0, max_uses: "", expires_at: "",
};

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<CouponForm | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    supabase.from("coupons").select("*").order("created_at", { ascending: false })
      .then(({ data }) => { setCoupons((data as any) ?? []); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const filtered = coupons.filter(c =>
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase())
  );

  const genCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    return "HUSHH" + Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  };

  const startCreate = () => { setEditing({ ...emptyForm }); setEditingId(null); };

  const startEdit = (c: Coupon) => {
    setEditing({
      code: c.code, description: c.description, discount_type: c.discount_type,
      discount_value: c.discount_value, min_order: c.min_order,
      max_uses: c.max_uses ? String(c.max_uses) : "",
      expires_at: c.expires_at ? c.expires_at.slice(0, 16) : "",
    });
    setEditingId(c.id);
  };

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    const code = editing.code || genCode();
    const payload = {
      code, description: editing.description, discount_type: editing.discount_type,
      discount_value: editing.discount_value, min_order: editing.min_order,
      max_uses: editing.max_uses ? Number(editing.max_uses) : null,
      expires_at: editing.expires_at || null,
    };

    if (editingId) {
      await supabase.from("coupons").update(payload as any).eq("id", editingId);
    } else {
      await supabase.from("coupons").insert(payload as any);
    }
    setSaving(false);
    setEditing(null);
    setEditingId(null);
    load();
  };

  const toggle = async (id: string, active: boolean) => {
    await supabase.from("coupons").update({ active: !active } as any).eq("id", id);
    setCoupons(prev => prev.map(c => c.id === id ? { ...c, active: !active } : c));
  };

  const remove = async (id: string) => {
    await supabase.from("coupons").delete().eq("id", id);
    setCoupons(prev => prev.filter(c => c.id !== id));
  };

  if (editing) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Ticket size={20} className="text-primary" />
            {editingId ? "Edit Coupon" : "Create Coupon"}
          </h1>
          <button onClick={() => { setEditing(null); setEditingId(null); }}
            className="p-2 rounded-lg hover:bg-secondary"><X size={18} className="text-muted-foreground" /></button>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <div>
            <label className="text-[10px] text-muted-foreground mb-1 block">Code {!editingId && "(auto-generated if empty)"}</label>
            <Input placeholder="e.g. HUSHH20" value={editing.code}
              onChange={e => setEditing({ ...editing, code: e.target.value.toUpperCase() })} />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground mb-1 block">Description</label>
            <Input placeholder="What does this coupon do?" value={editing.description}
              onChange={e => setEditing({ ...editing, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-muted-foreground mb-1 block">Discount Type & Value</label>
              <div className="flex gap-2">
                <select value={editing.discount_type}
                  onChange={e => setEditing({ ...editing, discount_type: e.target.value })}
                  className="bg-secondary border border-border rounded-lg px-2 py-2 text-sm text-foreground">
                  <option value="percentage">%</option>
                  <option value="flat">₹</option>
                </select>
                <Input type="number" value={editing.discount_value}
                  onChange={e => setEditing({ ...editing, discount_value: Number(e.target.value) })} />
              </div>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground mb-1 block">Min Order (₹)</label>
              <Input type="number" value={editing.min_order}
                onChange={e => setEditing({ ...editing, min_order: Number(e.target.value) })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-muted-foreground mb-1 block">Max Uses</label>
              <Input type="number" placeholder="Unlimited" value={editing.max_uses}
                onChange={e => setEditing({ ...editing, max_uses: e.target.value })} />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground mb-1 block">Expires At</label>
              <Input type="datetime-local" value={editing.expires_at}
                onChange={e => setEditing({ ...editing, expires_at: e.target.value })} />
            </div>
          </div>

          <motion.button whileTap={{ scale: 0.97 }} onClick={save} disabled={saving}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {editingId ? "Update Coupon" : "Create Coupon"}
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Ticket size={22} className="text-primary" /> Coupon Engine
          </h1>
          <p className="text-sm text-muted-foreground">{coupons.length} coupons</p>
        </div>
        <motion.button whileTap={{ scale: 0.95 }} onClick={startCreate}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold">
          <Plus size={16} /> Create
        </motion.button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search coupons..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 rounded-xl bg-secondary animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Ticket size={40} className="mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">{search ? "No matches" : "No coupons yet"}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`rounded-xl border bg-card p-4 ${c.active ? "border-border" : "border-border opacity-60"}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="px-3 py-1.5 bg-secondary rounded-lg font-mono text-sm font-bold text-foreground tracking-wider shrink-0">
                    {c.code}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-foreground font-medium flex items-center gap-1">
                      {c.discount_type === "percentage" ? <Percent size={12} /> : <IndianRupee size={12} />}
                      {c.discount_value}{c.discount_type === "percentage" ? "% off" : " off"}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">{c.description || "No description"}</p>
                    {c.expires_at && (
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Expires: {new Date(c.expires_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[10px] text-muted-foreground tabular-nums mr-1">
                    {c.uses}{c.max_uses ? `/${c.max_uses}` : ""} uses
                  </span>
                  <button onClick={() => startEdit(c)} className="p-1.5 rounded-lg hover:bg-secondary transition">
                    <Pencil size={14} className="text-muted-foreground" />
                  </button>
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
