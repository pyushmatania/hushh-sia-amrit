import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Megaphone, Plus, Calendar, Users, Zap, Clock, Percent,
  IndianRupee, Trash2, Power, X, Save, Loader2, Pencil, Search
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

interface CampaignForm {
  title: string; description: string; type: string;
  discount_type: string; discount_value: number;
  target_audience: string[]; start_date: string; end_date: string;
  banner_color: string;
}

const emptyForm: CampaignForm = {
  title: "", description: "", type: "flash_deal",
  discount_type: "percentage", discount_value: 10,
  target_audience: [], start_date: "", end_date: "", banner_color: "from-primary to-accent",
};

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
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<CampaignForm | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    supabase.from("campaigns").select("*").order("created_at", { ascending: false })
      .then(({ data }) => { setCampaigns((data as any) ?? []); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const filtered = campaigns.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase())
  );

  const startCreate = () => { setEditing({ ...emptyForm }); setEditingId(null); };

  const startEdit = (c: Campaign) => {
    setEditing({
      title: c.title, description: c.description, type: c.type,
      discount_type: c.discount_type, discount_value: c.discount_value,
      target_audience: c.target_audience || [],
      start_date: c.start_date ? c.start_date.slice(0, 16) : "",
      end_date: c.end_date ? c.end_date.slice(0, 16) : "",
      banner_color: c.banner_color || "from-primary to-accent",
    });
    setEditingId(c.id);
  };

  const save = async () => {
    if (!editing || !editing.title) return;
    setSaving(true);
    const payload = {
      title: editing.title, description: editing.description, type: editing.type,
      discount_type: editing.discount_type, discount_value: editing.discount_value,
      target_audience: editing.target_audience,
      start_date: editing.start_date || new Date().toISOString(),
      end_date: editing.end_date || null,
      banner_color: editing.banner_color,
    };

    if (editingId) {
      await supabase.from("campaigns").update(payload as any).eq("id", editingId);
    } else {
      await supabase.from("campaigns").insert({ ...payload, created_by: user?.id } as any);
    }
    setSaving(false);
    setEditing(null);
    setEditingId(null);
    load();
  };

  const toggle = async (id: string, active: boolean) => {
    await supabase.from("campaigns").update({ active: !active } as any).eq("id", id);
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, active: !active } : c));
  };

  const remove = async (id: string) => {
    await supabase.from("campaigns").delete().eq("id", id);
    setCampaigns(prev => prev.filter(c => c.id !== id));
  };

  const toggleAudience = (a: string) => {
    if (!editing) return;
    setEditing({
      ...editing,
      target_audience: editing.target_audience.includes(a)
        ? editing.target_audience.filter(x => x !== a)
        : [...editing.target_audience, a],
    });
  };

  if (editing) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Megaphone size={20} className="text-primary" />
            {editingId ? "Edit Campaign" : "Create Campaign"}
          </h1>
          <button onClick={() => { setEditing(null); setEditingId(null); }}
            className="p-2 rounded-lg hover:bg-secondary"><X size={18} className="text-muted-foreground" /></button>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <div>
            <label className="text-[10px] text-muted-foreground mb-1 block">Title</label>
            <Input placeholder="Campaign title" value={editing.title}
              onChange={e => setEditing({ ...editing, title: e.target.value })} />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground mb-1 block">Description</label>
            <Input placeholder="What's this campaign about?" value={editing.description}
              onChange={e => setEditing({ ...editing, description: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-muted-foreground mb-1 block">Type</label>
              <select value={editing.type} onChange={e => setEditing({ ...editing, type: e.target.value })}
                className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground">
                {Object.entries(typeConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground mb-1 block">Discount</label>
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
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-muted-foreground mb-1 block">Start Date</label>
              <Input type="datetime-local" value={editing.start_date}
                onChange={e => setEditing({ ...editing, start_date: e.target.value })} />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground mb-1 block">End Date</label>
              <Input type="datetime-local" value={editing.end_date}
                onChange={e => setEditing({ ...editing, end_date: e.target.value })} />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-muted-foreground mb-2 block">Target Audience</label>
            <div className="flex flex-wrap gap-2">
              {audiences.map(a => (
                <button key={a} onClick={() => toggleAudience(a)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition ${
                    editing.target_audience.includes(a)
                      ? "bg-primary/15 text-primary ring-1 ring-primary/30"
                      : "bg-secondary text-muted-foreground"
                  }`}>{a.replace("_", " ")}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] text-muted-foreground mb-1 block">Banner Gradient</label>
            <Input placeholder="e.g. from-primary to-accent" value={editing.banner_color}
              onChange={e => setEditing({ ...editing, banner_color: e.target.value })} />
            <div className={`mt-2 h-8 rounded-lg bg-gradient-to-r ${editing.banner_color}`} />
          </div>

          <motion.button whileTap={{ scale: 0.97 }} onClick={save} disabled={saving || !editing.title}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {editingId ? "Update Campaign" : "Launch Campaign"}
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
            <Megaphone size={22} className="text-primary" /> Campaign Studio
          </h1>
          <p className="text-sm text-muted-foreground">{campaigns.length} campaigns</p>
        </div>
        <motion.button whileTap={{ scale: 0.95 }} onClick={startCreate}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold">
          <Plus size={16} /> Create
        </motion.button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search campaigns..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 rounded-xl bg-secondary animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Megaphone size={40} className="mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">{search ? "No matches" : "No campaigns yet"}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c, i) => {
            const tc = typeConfig[c.type] || typeConfig.flash_deal;
            return (
              <motion.div key={c.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`rounded-xl border bg-card p-4 ${c.active ? "border-border" : "border-border opacity-60"}`}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
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
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => startEdit(c)} className="p-1.5 rounded-lg hover:bg-secondary transition">
                      <Pencil size={14} className="text-muted-foreground" />
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
            );
          })}
        </div>
      )}
    </div>
  );
}
