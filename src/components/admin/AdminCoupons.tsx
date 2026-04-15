import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Ticket, Plus, Trash2, Power, Copy, X, Percent, IndianRupee, Sparkles, Check, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { DEMO_COUPONS } from "./admin-demo-data";
import DemoDataBanner from "./DemoDataBanner";
import { useDataMode } from "@/hooks/use-data-mode";

interface Coupon {
  id: string; code: string; description: string; discount_type: string;
  discount_value: number; min_order: number; max_uses: number | null;
  uses: number; active: boolean; expires_at: string | null; created_at: string;
  user_specific_id: string | null;
}

const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isDemo, setIsDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [form, setForm] = useState({ code: "", description: "", discount_type: "percentage", discount_value: 10, min_order: 0, max_uses: "", expires_at: "" });
  const { getDemoFallback, isDemoMode } = useDataMode();

  useEffect(() => {
    supabase.from("coupons").select("*").order("created_at", { ascending: false })
      .then(({ data }) => {
        const rows = (data as any) ?? [];
        if (rows.length === 0) {
          const fallback = getDemoFallback(DEMO_COUPONS as unknown as Coupon[]);
          setCoupons(fallback); setIsDemo(fallback.length > 0);
        }
        else { setCoupons(rows); setIsDemo(false); }
        setLoading(false);
      });
  }, [isDemoMode]);

  const genCode = () => "HUSHH" + Array.from({ length: 5 }, () => "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random() * 36)]).join("");

  const create = async () => {
    const code = form.code || genCode();
    const { data, error } = await supabase.from("coupons").insert({
      code, description: form.description, discount_type: form.discount_type,
      discount_value: form.discount_value, min_order: form.min_order,
      max_uses: form.max_uses ? Number(form.max_uses) : null, expires_at: form.expires_at || null,
    } as any).select().maybeSingle();
    if (!error && data) setCoupons(prev => [data as any, ...prev]);
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

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <motion.div className="space-y-5" initial="initial" animate="animate">
      {isDemo && <DemoDataBanner entityName="coupons" />}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-500/10 dark:to-violet-500/10 flex items-center justify-center shadow-sm">
              <Ticket size={20} className="text-purple-600" />
            </div>
            Coupon Engine
          </h1>
          <p className="text-sm text-zinc-400 mt-1">{coupons.length} coupons · {coupons.filter(c => c.active).length} active</p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-200/50 dark:shadow-indigo-900/30">
          <Plus size={16} /> Create
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0, y: 12, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }} exit={{ opacity: 0, y: -8, height: 0 }}
            className="rounded-2xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm border border-zinc-100/80 dark:border-zinc-800/80 p-5 space-y-4 shadow-lg overflow-hidden">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2"><Sparkles size={14} className="text-purple-500" /> New Coupon</h3>
              <button onClick={() => setShowCreate(false)} className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"><X size={16} className="text-zinc-400" /></button>
            </div>
            <div><label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 block">Code (auto-generated if empty)</label>
              <Input placeholder="e.g. HUSHH20" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} className="rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 font-mono" /></div>
            <Input placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700" />
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 block">Discount</label>
                <div className="flex gap-2">
                  <select value={form.discount_type} onChange={e => setForm(f => ({ ...f, discount_type: e.target.value }))} className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-2.5 py-2 text-sm text-zinc-700 dark:text-zinc-200"><option value="percentage">%</option><option value="flat">₹</option></select>
                  <Input type="number" value={form.discount_value} onChange={e => setForm(f => ({ ...f, discount_value: Number(e.target.value) }))} className="rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700" />
                </div></div>
              <div><label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 block">Min Order (₹)</label>
                <Input type="number" value={form.min_order} onChange={e => setForm(f => ({ ...f, min_order: Number(e.target.value) }))} className="rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 block">Max Uses</label>
                <Input type="number" placeholder="Unlimited" value={form.max_uses} onChange={e => setForm(f => ({ ...f, max_uses: e.target.value }))} className="rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700" /></div>
              <div><label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 block">Expires At</label>
                <Input type="datetime-local" value={form.expires_at} onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))} className="rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700" /></div>
            </div>
            <motion.button whileTap={{ scale: 0.97 }} onClick={create}
              className="w-full py-2.5 bg-gradient-to-r from-purple-500 to-violet-500 text-white rounded-xl font-semibold text-sm shadow-md">
              🎟️ Create Coupon
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 rounded-2xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />)}</div>
      ) : coupons.length === 0 ? (
        <motion.div variants={fadeUp} className="text-center py-20">
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3 }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-500/10 dark:to-violet-500/10 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Ticket size={28} className="text-purple-400" />
          </motion.div>
          <p className="text-zinc-500 text-sm font-medium">No coupons yet</p>
          <p className="text-zinc-400 text-xs mt-1">Create discount codes for your guests</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-2.5">
          {coupons.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              whileHover={{ x: 3, transition: { duration: 0.15 } }}
              className={`rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-zinc-100/80 dark:border-zinc-800/80 p-4 transition-all hover:shadow-lg group ${!c.active ? "opacity-60" : ""}`}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="px-3.5 py-2 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-500/10 dark:to-indigo-500/10 rounded-xl font-mono text-sm font-bold text-purple-700 dark:text-purple-300 tracking-wider border border-purple-100/50 dark:border-purple-500/20 shadow-sm">
                    {c.code}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-zinc-700 dark:text-zinc-200 font-semibold flex items-center gap-1.5">
                      {c.discount_type === "percentage" ? <Percent size={12} className="text-purple-500" /> : <IndianRupee size={12} className="text-purple-500" />}
                      {c.discount_value}{c.discount_type === "percentage" ? "% off" : " off"}
                    </p>
                    <p className="text-[11px] text-zinc-400 truncate">{c.description || "No description"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] text-zinc-400 tabular-nums bg-zinc-50 dark:bg-zinc-800 px-2 py-0.5 rounded-lg">
                    {c.uses}{c.max_uses ? `/${c.max_uses}` : ""} uses
                  </span>
                  <motion.button whileTap={{ scale: 0.85 }} onClick={() => copyCode(c.code)} className="p-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition">
                    {copied === c.code ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} className="text-zinc-400" />}
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.85 }} onClick={() => toggle(c.id, c.active)} className="p-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition">
                    <Power size={14} className={c.active ? "text-emerald-500" : "text-zinc-400"} />
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.85 }} onClick={() => remove(c.id)} className="p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10 transition">
                    <Trash2 size={14} className="text-rose-400" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
