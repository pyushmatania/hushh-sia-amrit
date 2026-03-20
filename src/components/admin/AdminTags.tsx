import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Tag, Plus, Trash2, X, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";

interface PropertyTag {
  id: string; name: string; color: string; icon: string; created_at: string;
  assignmentCount?: number;
}

const presetIcons = ["🔥", "💑", "💰", "🎉", "🏖️", "🍺", "🎮", "💼", "🌙", "⚡", "🏷️", "🆕"];
const presetColors = [
  "bg-primary/15 text-primary",
  "bg-amber-500/15 text-amber-400",
  "bg-emerald-500/15 text-emerald-400",
  "bg-blue-500/15 text-blue-400",
  "bg-rose-500/15 text-rose-400",
  "bg-purple-500/15 text-purple-400",
];

export default function AdminTags() {
  const [tags, setTags] = useState<PropertyTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", icon: "🏷️", color: presetColors[0] });

  useEffect(() => {
    const load = async () => {
      const { data: tagsData } = await supabase.from("property_tags").select("*").order("created_at", { ascending: false });
      const { data: assignments } = await supabase.from("tag_assignments").select("tag_id");

      const countMap = new Map<string, number>();
      (assignments ?? []).forEach((a: any) => countMap.set(a.tag_id, (countMap.get(a.tag_id) || 0) + 1));

      setTags(((tagsData as any) ?? []).map((t: any) => ({ ...t, assignmentCount: countMap.get(t.id) || 0 })));
      setLoading(false);
    };
    load();
  }, []);

  const create = async () => {
    if (!form.name) return;
    const { data } = await supabase.from("property_tags").insert({
      name: form.name, icon: form.icon, color: form.color
    } as any).select().single();
    if (data) setTags(prev => [{ ...(data as any), assignmentCount: 0 }, ...prev]);
    setShowCreate(false);
    setForm({ name: "", icon: "🏷️", color: presetColors[0] });
  };

  const remove = async (id: string) => {
    await supabase.from("property_tags").delete().eq("id", id);
    setTags(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Tag size={22} className="text-primary" /> Tag Engine
          </h1>
          <p className="text-sm text-muted-foreground">{tags.length} tags</p>
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
            <h3 className="font-bold text-foreground">New Tag</h3>
            <button onClick={() => setShowCreate(false)}><X size={18} className="text-muted-foreground" /></button>
          </div>
          <Input placeholder="Tag name (e.g. trending, couple_fav)" value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Icon</label>
            <div className="flex flex-wrap gap-2">
              {presetIcons.map(icon => (
                <button key={icon} onClick={() => setForm(f => ({ ...f, icon }))}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg transition ${
                    form.icon === icon ? "bg-primary/15 ring-2 ring-primary" : "bg-secondary"
                  }`}>{icon}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Color</label>
            <div className="flex flex-wrap gap-2">
              {presetColors.map(color => (
                <button key={color} onClick={() => setForm(f => ({ ...f, color }))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${color} ${
                    form.color === color ? "ring-2 ring-ring" : ""
                  }`}>Sample</button>
              ))}
            </div>
          </div>
          <button onClick={create}
            className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm">
            Create Tag
          </button>
        </motion.div>
      )}

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-14 rounded-xl bg-secondary animate-pulse" />)}</div>
      ) : tags.length === 0 ? (
        <div className="text-center py-16">
          <Tag size={40} className="mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No tags yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {tags.map((tag, i) => (
            <motion.div key={tag.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
              <span className="text-xl">{tag.icon}</span>
              <div className="flex-1 min-w-0">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${tag.color}`}>{tag.name}</span>
                <p className="text-[10px] text-muted-foreground mt-1">{tag.assignmentCount} assigned</p>
              </div>
              <button onClick={() => remove(tag.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 transition">
                <Trash2 size={14} className="text-destructive" />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
