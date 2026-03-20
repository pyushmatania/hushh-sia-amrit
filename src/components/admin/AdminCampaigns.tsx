import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Megaphone, Plus, Calendar, Users, Zap, Clock, Percent,
  IndianRupee, Trash2, Power, X
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";

interface Campaign {
  id: string; title: string; description: string; type: string;
  discount_type: string; discount_value: number;
  target_audience: string[]; target_properties: string[];
  start_date: string; end_date: string | null;
  active: boolean; banner_color: string; created_at: string;
}

const typeConfig: Record<string, { icon: typeof Zap; color: string; label: string }> = {
  flash_deal: { icon: Zap, color: "text-amber-400", label: "Flash Deal" },
  time_based: { icon: Clock, color: "text-blue-400", label: "Time-Based" },
  event_based: { icon: Calendar, color: "text-primary", label: "Event" },
  audience: { icon: Users, color: "text-emerald-400", label: "Audience" },
};

const audiences = ["all", "couples", "frequent_users", "new_users", "high_spenders", "inactive"];

export default function AdminCampaigns() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", type: "flash_deal",
    discount_type: "percentage", discount_value: 10,
    target_audience: [] as string[], start_date: "", end_date: "",
  });

  useEffect(() => {
    supabase.from("campaigns").select("*").order("created_at", { ascending: false })
      .then(({ data }) => { setCampaigns((data as any) ?? []); setLoading(false); });
  }, []);

  const create = async () => {
    if (!form.title || !user) return;
    const { data } = await supabase.from("campaigns").insert({
      title: form.title, description: form.description, type: form.type,
      discount_type: form.discount_type, discount_value: form.discount_value,
      target_audience: form.target_audience,
      start_date: form.start_date || new Date().toISOString(),
      end_date: form.end_date || null,
      created_by: user.id,
    } as any).select().single();
    if (data) setCampaigns(prev => [data as any, ...prev]);
    setShowCreate(false);
    setForm({ title: "", description: "", type: "flash_deal", discount_type: "percentage", discount_value: 10, target_audience: [], start_date: "", end_date: "" });
  };

  const toggle = async (id: string, active: boolean) => {
    await supabase.from("campaigns").update({ active: !active } as any).eq("id", id);
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, active: !active } : c));
  };

  const remove = async (id: string) => {
    await supabase.from("campaigns").delete().eq("id", id);
    setCampaigns(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Megaphone size={22} className="text-primary" /> Campaign Studio
          </h1>
          <p className="text-sm text-muted-foreground">{campaigns.length} campaigns</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold">
          <Plus size={16} /> Create
        </button>
      </div>

      {/* Create modal */}
      {showCreate && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-foreground">New Campaign</h3>
            <button onClick={() => setShowCreate(false)}><X size={18} className="text-muted-foreground" /></button>
          </div>
          <Input placeholder="Campaign title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          <Input placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground">
                {Object.entries(typeConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
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
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Start</label>
              <Input type="datetime-local" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">End</label>
              <Input type="datetime-local" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Target Audience</label>
            <div className="flex flex-wrap gap-1.5">
              {audiences.map(a => (
                <button key={a} onClick={() => setForm(f => ({
                  ...f, target_audience: f.target_audience.includes(a)
                    ? f.target_audience.filter(x => x !== a) : [...f.target_audience, a]
                }))}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium capitalize transition ${
                    form.target_audience.includes(a) ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"
                  }`}>{a}</button>
              ))}
            </div>
          </div>
          <button onClick={create}
            className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm">
            Launch Campaign
          </button>
        </motion.div>
      )}

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 rounded-xl bg-secondary animate-pulse" />)}</div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-16">
          <Megaphone size={40} className="mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No campaigns yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {campaigns.map((c, i) => {
            const tc = typeConfig[c.type] || typeConfig.flash_deal;
            return (
              <motion.div key={c.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`rounded-xl border bg-card p-4 ${c.active ? "border-border" : "border-border opacity-60"}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0`}>
                    <tc.icon size={18} className={tc.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm text-foreground">{c.title}</h3>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${c.active ? "bg-emerald-500/15 text-emerald-400" : "bg-muted text-muted-foreground"}`}>
                        {c.active ? "Live" : "Paused"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{c.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        {c.discount_type === "percentage" ? <Percent size={12} /> : <IndianRupee size={12} />}
                        {c.discount_value}{c.discount_type === "percentage" ? "% off" : " off"}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 bg-secondary rounded capitalize">{tc.label}</span>
                      {c.target_audience.length > 0 && (
                        <span className="text-[10px]">→ {c.target_audience.join(", ")}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => toggle(c.id, c.active)} className="p-1.5 rounded-lg hover:bg-secondary transition">
                      <Power size={14} className={c.active ? "text-emerald-400" : "text-muted-foreground"} />
                    </button>
                    <button onClick={() => remove(c.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 transition">
                      <Trash2 size={14} className="text-destructive" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
