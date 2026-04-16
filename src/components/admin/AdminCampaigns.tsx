import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Megaphone, Plus, Calendar, Users, Zap, Clock, Percent,
  IndianRupee, Trash2, Power, X, ChevronRight, Target, Sparkles
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { DEMO_CAMPAIGNS } from "./admin-demo-data";
import DemoDataBanner from "./DemoDataBanner";
import { useDataMode } from "@/hooks/use-data-mode";

interface Campaign {
  id: string; title: string; description: string; type: string;
  discount_type: string; discount_value: number;
  target_audience: string[]; target_properties: string[];
  start_date: string; end_date: string | null;
  active: boolean; banner_color: string; created_at: string;
}

const typeConfig: Record<string, { icon: typeof Zap; color: string; bg: string; label: string }> = {
  flash_deal: { icon: Zap, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-500/10", label: "Flash Deal" },
  time_based: { icon: Clock, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-500/10", label: "Time-Based" },
  event_based: { icon: Calendar, color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-500/10", label: "Event" },
  audience: { icon: Users, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-500/10", label: "Audience" },
};

const audiences = ["all", "couples", "frequent_users", "new_users", "high_spenders", "inactive"];
const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

export default function AdminCampaigns() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isDemo, setIsDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const { isDemoMode } = useDataMode();
  const [form, setForm] = useState({
    title: "", description: "", type: "flash_deal",
    discount_type: "percentage", discount_value: 10,
    target_audience: [] as string[], start_date: "", end_date: "",
  });

  useEffect(() => {
    supabase.from("campaigns").select("*").order("created_at", { ascending: false })
      .then(({ data }) => {
        const rows = (data as any) ?? [];
        if (rows.length === 0 && isDemoMode) { setCampaigns(DEMO_CAMPAIGNS as any); setIsDemo(true); }
        else { setCampaigns(rows); setIsDemo(false); }
        setLoading(false);
      });
  }, [isDemoMode]);

  const create = async () => {
    if (!form.title || !user) return;
    const { data, error } = await supabase.from("campaigns").insert({
      title: form.title, description: form.description, type: form.type,
      discount_type: form.discount_type, discount_value: form.discount_value,
      target_audience: form.target_audience,
      start_date: form.start_date || new Date().toISOString(),
      end_date: form.end_date || null,
      created_by: user.id,
    } as any).select().maybeSingle();
    if (!error && data) setCampaigns(prev => [data as any, ...prev]);
    setShowCreate(false);
    setForm({ title: "", description: "", type: "flash_deal", discount_type: "percentage", discount_value: 10, target_audience: [], start_date: "", end_date: "" });
  };

  const toggle = async (id: string, active: boolean) => {
    await supabase.from("campaigns").update({ active: !active }).eq("id", id);
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, active: !active } : c));
  };

  const remove = async (id: string) => {
    await supabase.from("campaigns").delete().eq("id", id);
    setCampaigns(prev => prev.filter(c => c.id !== id));
  };

  const liveCount = campaigns.filter(c => c.active).length;

  return (
    <motion.div className="space-y-5" initial="initial" animate="animate">
      {isDemo && <DemoDataBanner entityName="campaigns" />}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-500/10 dark:to-rose-500/10 flex items-center justify-center shadow-sm">
              <Megaphone size={20} className="text-red-600" />
            </div>
            Campaign Studio
          </h1>
          <p className="text-sm text-zinc-400 mt-1">{campaigns.length} campaigns · {liveCount} live</p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-200/50 dark:shadow-indigo-900/30">
          <Plus size={16} /> Create
        </motion.button>
      </motion.div>

      {/* Quick Stats */}
      <motion.div variants={fadeUp} className="grid grid-cols-3 gap-3">
        {[
          { label: "Total", value: campaigns.length, icon: Megaphone, color: "text-red-600", bg: "bg-red-50 dark:bg-red-500/10" },
          { label: "Active", value: liveCount, icon: Sparkles, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
          { label: "Paused", value: campaigns.length - liveCount, icon: Clock, color: "text-zinc-500", bg: "bg-zinc-100 dark:bg-zinc-800" },
        ].map(s => (
          <div key={s.label} className="rounded-xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-zinc-100/80 dark:border-zinc-800/80 p-3.5 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center`}><s.icon size={16} className={s.color} /></div>
            <div><p className="text-lg font-bold text-zinc-800 dark:text-zinc-100 tabular-nums">{s.value}</p><p className="text-[10px] text-zinc-400">{s.label}</p></div>
          </div>
        ))}
      </motion.div>

      {/* Create Panel */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0, y: 12, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }} exit={{ opacity: 0, y: -8, height: 0 }}
            className="rounded-2xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm border border-zinc-100/80 dark:border-zinc-800/80 p-5 space-y-4 shadow-lg overflow-hidden">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2"><Sparkles size={14} className="text-indigo-500" /> New Campaign</h3>
              <button onClick={() => setShowCreate(false)} className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"><X size={16} className="text-zinc-400" /></button>
            </div>
            <Input placeholder="Campaign title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700" />
            <Input placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700" />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 block">Type</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-700 dark:text-zinc-200">
                  {Object.entries(typeConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 block">Discount</label>
                <div className="flex gap-2">
                  <select value={form.discount_type} onChange={e => setForm(f => ({ ...f, discount_type: e.target.value }))}
                    className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-2.5 py-2 text-sm text-zinc-700 dark:text-zinc-200">
                    <option value="percentage">%</option><option value="flat">₹</option>
                  </select>
                  <Input type="number" value={form.discount_value || ""} onChange={e => setForm(f => ({ ...f, discount_value: e.target.value === "" ? 0 : Number(e.target.value) }))} className="rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 block">Start</label><Input type="datetime-local" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} className="rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700" /></div>
              <div><label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 block">End</label><Input type="datetime-local" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} className="rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700" /></div>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 block">Target Audience</label>
              <div className="flex flex-wrap gap-1.5">
                {audiences.map(a => (
                  <button key={a} onClick={() => setForm(f => ({ ...f, target_audience: f.target_audience.includes(a) ? f.target_audience.filter(x => x !== a) : [...f.target_audience, a] }))}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-medium capitalize transition-all ${
                      form.target_audience.includes(a) ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 border border-indigo-200 dark:border-indigo-500/20" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border border-transparent"
                    }`}>{a.replace("_", " ")}</button>
                ))}
              </div>
            </div>
            <motion.button whileTap={{ scale: 0.97 }} onClick={create}
              className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-xl font-semibold text-sm shadow-md">
              🚀 Launch Campaign
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Campaigns List */}
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 rounded-2xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />)}</div>
      ) : campaigns.length === 0 ? (
        <motion.div variants={fadeUp} className="text-center py-20">
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3 }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-500/10 dark:to-rose-500/10 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Megaphone size={28} className="text-red-400" />
          </motion.div>
          <p className="text-zinc-500 text-sm font-medium">No campaigns yet</p>
          <p className="text-zinc-400 text-xs mt-1">Create your first campaign to boost bookings</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-2.5">
          {campaigns.map((c, i) => {
            const tc = typeConfig[c.type] || typeConfig.flash_deal;
            return (
              <motion.div key={c.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                whileHover={{ x: 3, transition: { duration: 0.15 } }}
                className={`rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-zinc-100/80 dark:border-zinc-800/80 p-4 transition-all hover:shadow-lg hover:shadow-zinc-100/50 group ${!c.active ? "opacity-60" : ""}`}>
                <div className="flex items-start gap-3">
                  <motion.div whileHover={{ rotate: 12 }} className={`w-11 h-11 rounded-xl ${tc.bg} flex items-center justify-center shrink-0 shadow-sm`}>
                    <tc.icon size={20} className={tc.color} />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm text-zinc-700 dark:text-zinc-200">{c.title}</h3>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${c.active ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"}`}>
                        {c.active ? "● Live" : "Paused"}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">{c.description}</p>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <span className="flex items-center gap-1 text-xs text-zinc-500 bg-zinc-50 dark:bg-zinc-800 px-2 py-0.5 rounded-lg">
                        {c.discount_type === "percentage" ? <Percent size={11} /> : <IndianRupee size={11} />}
                        {c.discount_value}{c.discount_type === "percentage" ? "% off" : " off"}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 text-zinc-500 capitalize">{tc.label}</span>
                      {c.target_audience.length > 0 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 flex items-center gap-1">
                          <Target size={9} /> {c.target_audience.length} audiences
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <motion.button whileTap={{ scale: 0.85 }} onClick={() => toggle(c.id, c.active)} className="p-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition">
                      <Power size={14} className={c.active ? "text-emerald-500" : "text-zinc-400"} />
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.85 }} onClick={() => remove(c.id)} className="p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10 transition">
                      <Trash2 size={14} className="text-rose-400" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
