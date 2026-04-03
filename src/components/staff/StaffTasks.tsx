import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckSquare, Plus, Circle, CheckCircle2, Clock, AlertTriangle, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";

interface Task {
  id: string; title: string; description: string; priority: string;
  status: string; property_id: string | null; due_date: string | null;
  completed_at: string | null; created_at: string;
}

const priorityConfig: Record<string, { color: string; label: string }> = {
  high: { color: "text-destructive bg-destructive/10", label: "🔴 High" },
  medium: { color: "text-amber-400 bg-amber-500/10", label: "🟡 Medium" },
  low: { color: "text-emerald-400 bg-emerald-500/10", label: "🟢 Low" },
};

export default function StaffTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", priority: "medium" });

  useEffect(() => {
    supabase.from("staff_tasks").select("*").order("created_at", { ascending: false })
      .then(({ data }) => { setTasks((data as any) ?? []); setLoading(false); });
  }, []);

  const create = async () => {
    if (!form.title || !user) return;
    const { data } = await supabase.from("staff_tasks").insert({
      title: form.title, description: form.description, priority: form.priority,
      assigned_to: user.id, created_by: user.id,
    } as any).select().maybeSingle();
    if (data) setTasks(prev => [data as any, ...prev]);
    setShowCreate(false);
    setForm({ title: "", description: "", priority: "medium" });
  };

  const toggleComplete = async (id: string, current: string) => {
    const next = current === "completed" ? "pending" : "completed";
    const updates: any = { status: next };
    if (next === "completed") updates.completed_at = new Date().toISOString();
    else updates.completed_at = null;
    await supabase.from("staff_tasks").update(updates).eq("id", id);
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: next, completed_at: updates.completed_at } : t));
  };

  const pending = tasks.filter(t => t.status !== "completed");
  const completed = tasks.filter(t => t.status === "completed");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <CheckSquare size={20} className="text-primary" /> My Tasks
        </h1>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-xl text-xs font-semibold">
          <Plus size={14} /> Add
        </button>
      </div>

      {showCreate && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-foreground">New Task</h3>
            <button onClick={() => setShowCreate(false)}><X size={16} className="text-muted-foreground" /></button>
          </div>
          <Input placeholder="Task title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          <Input placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          <div className="flex gap-2">
            {["low", "medium", "high"].map(p => (
              <button key={p} onClick={() => setForm(f => ({ ...f, priority: p }))}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium capitalize transition ${
                  form.priority === p ? priorityConfig[p].color : "bg-secondary text-muted-foreground"
                }`}>{p}</button>
            ))}
          </div>
          <button onClick={create} className="w-full py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold">
            Create Task
          </button>
        </motion.div>
      )}

      {loading ? (
        <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-14 rounded-xl bg-secondary animate-pulse" />)}</div>
      ) : (
        <>
          <div className="space-y-2">
            {pending.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">All tasks completed! 🎉</p>}
            {pending.map((task, i) => {
              const pc = priorityConfig[task.priority] || priorityConfig.medium;
              return (
                <motion.div key={task.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="rounded-xl border border-border bg-card p-3 flex items-center gap-3">
                  <button onClick={() => toggleComplete(task.id, task.status)}
                    className="shrink-0 text-muted-foreground hover:text-primary transition">
                    <Circle size={20} />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{task.title}</p>
                    {task.description && <p className="text-[11px] text-muted-foreground truncate">{task.description}</p>}
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${pc.color}`}>{pc.label}</span>
                </motion.div>
              );
            })}
          </div>

          {completed.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-muted-foreground mt-4">Completed ({completed.length})</h3>
              {completed.slice(0, 5).map(task => (
                <div key={task.id} className="rounded-xl border border-border bg-card/50 p-3 flex items-center gap-3 opacity-60">
                  <button onClick={() => toggleComplete(task.id, task.status)} className="shrink-0 text-emerald-400">
                    <CheckCircle2 size={20} />
                  </button>
                  <p className="text-sm text-foreground line-through">{task.title}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
