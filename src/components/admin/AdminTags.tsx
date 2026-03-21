import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tag, Plus, Trash2, X, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";

interface PropertyTag {
  id: string; name: string; color: string; icon: string; created_at: string;
  assignmentCount?: number;
}

const presetIcons = ["🔥", "💑", "💰", "🎉", "🏖️", "🍺", "🎮", "💼", "🌙", "⚡", "🏷️", "🆕"];
const presetColors = [
  "bg-indigo-100 text-indigo-600", "bg-amber-100 text-amber-600", "bg-emerald-100 text-emerald-600",
  "bg-blue-100 text-blue-600", "bg-rose-100 text-rose-600", "bg-purple-100 text-purple-600",
];
const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

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
    const { data, error } = await supabase.from("property_tags").insert({ name: form.name, icon: form.icon, color: form.color } as any).select().maybeSingle();
    if (!error && data) setTags(prev => [{ ...(data as any), assignmentCount: 0 }, ...prev]);
    setShowCreate(false);
    setForm({ name: "", icon: "🏷️", color: presetColors[0] });
  };

  const remove = async (id: string) => {
    await supabase.from("property_tags").delete().eq("id", id);
    setTags(prev => prev.filter(t => t.id !== id));
  };

  return (
    <motion.div className="space-y-5" initial="initial" animate="animate">
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-stone-50 to-zinc-50 dark:from-stone-500/10 dark:to-zinc-500/10 flex items-center justify-center shadow-sm">
              <Tag size={20} className="text-stone-600" />
            </div>
            Tag Engine
          </h1>
          <p className="text-sm text-zinc-400 mt-1">{tags.length} tags · Organize and label properties</p>
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
              <h3 className="font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2"><Sparkles size={14} className="text-indigo-500" /> New Tag</h3>
              <button onClick={() => setShowCreate(false)} className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"><X size={16} className="text-zinc-400" /></button>
            </div>
            <Input placeholder="Tag name (e.g. trending, couple_fav)" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700" />
            <div>
              <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">Icon</label>
              <div className="flex flex-wrap gap-2">
                {presetIcons.map(icon => (
                  <motion.button key={icon} whileTap={{ scale: 0.85 }} onClick={() => setForm(f => ({ ...f, icon }))}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all ${
                      form.icon === icon ? "bg-indigo-50 dark:bg-indigo-500/10 ring-2 ring-indigo-400 shadow-sm" : "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                    }`}>{icon}</motion.button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">Color</label>
              <div className="flex flex-wrap gap-2">
                {presetColors.map(color => (
                  <motion.button key={color} whileTap={{ scale: 0.85 }} onClick={() => setForm(f => ({ ...f, color }))}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${color} ${
                      form.color === color ? "ring-2 ring-indigo-400 shadow-sm" : ""
                    }`}>Sample</motion.button>
                ))}
              </div>
            </div>
            <motion.button whileTap={{ scale: 0.97 }} onClick={create}
              className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-xl font-semibold text-sm shadow-md">
              🏷️ Create Tag
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">{[1,2,3,4,5,6].map(i => <div key={i} className="h-20 rounded-2xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />)}</div>
      ) : tags.length === 0 ? (
        <motion.div variants={fadeUp} className="text-center py-20">
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3 }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-stone-50 to-zinc-50 dark:from-stone-500/10 dark:to-zinc-500/10 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Tag size={28} className="text-stone-400" />
          </motion.div>
          <p className="text-zinc-500 text-sm font-medium">No tags yet</p>
          <p className="text-zinc-400 text-xs mt-1">Create tags to categorize your properties</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {tags.map((tag, i) => (
            <motion.div key={tag.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
              whileHover={{ y: -3, transition: { duration: 0.15 } }}
              className="rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-zinc-100/80 dark:border-zinc-800/80 p-4 flex items-center gap-3 hover:shadow-lg transition-all group">
              <span className="text-2xl">{tag.icon}</span>
              <div className="flex-1 min-w-0">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${tag.color}`}>{tag.name}</span>
                <p className="text-[10px] text-zinc-400 mt-1.5">{tag.assignmentCount} properties assigned</p>
              </div>
              <motion.button whileTap={{ scale: 0.85 }} onClick={() => remove(tag.id)} className="p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10 transition opacity-0 group-hover:opacity-100">
                <Trash2 size={14} className="text-rose-400" />
              </motion.button>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
