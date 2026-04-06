import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ScrollText, Search, Shield, UserCheck, Pencil, Trash2, LogIn, Download, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { DEMO_AUDIT_LOGS } from "./admin-demo-data";
import DemoDataBanner from "./DemoDataBanner";

interface AuditLog {
  id: string; user_id: string | null; action: string;
  entity_type: string; entity_id: string | null;
  details: any; created_at: string;
}

const actionConfig: Record<string, { icon: typeof Pencil; color: string; bg: string }> = {
  create: { icon: UserCheck, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
  update: { icon: Pencil, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-500/10" },
  delete: { icon: Trash2, color: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-500/10" },
  login: { icon: LogIn, color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-500/10" },
  export: { icon: Download, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-500/10" },
  view: { icon: Eye, color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-500/10" },
};

const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

export default function AdminAuditLog() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState("all");
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(100)
      .then(({ data }) => {
        const logs = (data as any) ?? [];
        if (logs.length === 0) {
          setLogs(DEMO_AUDIT_LOGS as AuditLog[]);
          setIsDemo(true);
        } else {
          setLogs(logs);
        }
        setLoading(false);
      });
  }, []);

  const filtered = logs.filter(l =>
    (filterAction === "all" || l.action === filterAction) &&
    (l.action.toLowerCase().includes(search.toLowerCase()) || l.entity_type.toLowerCase().includes(search.toLowerCase()))
  );

  const actions = ["all", ...new Set(logs.map(l => l.action))];

  return (
    <motion.div className="space-y-5" initial="initial" animate="animate">
      {isDemo && <DemoDataBanner />}
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neutral-50 to-zinc-50 dark:from-neutral-500/10 dark:to-zinc-500/10 flex items-center justify-center shadow-sm">
            <ScrollText size={20} className="text-neutral-600" />
          </div>
          Audit Trail
        </h1>
        <p className="text-sm text-zinc-400 mt-1">Track all admin actions · {logs.length} events</p>
      </motion.div>

      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <Input placeholder="Search actions, entities..." value={search} onChange={e => setSearch(e.target.value)}
            className="pl-9 rounded-xl bg-white/80 dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-700" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {actions.map(a => (
            <button key={a} onClick={() => setFilterAction(a)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-medium capitalize transition-all ${
                filterAction === a
                  ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 border border-indigo-100 dark:border-indigo-500/20 shadow-sm"
                  : "bg-white dark:bg-zinc-800 text-zinc-400 border border-zinc-100 dark:border-zinc-700"
              }`}>{a}</button>
          ))}
        </div>
      </motion.div>

      {loading ? (
        <div className="space-y-2">{[1,2,3,4,5].map(i => <div key={i} className="h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <motion.div variants={fadeUp} className="text-center py-20">
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3 }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neutral-50 to-zinc-50 dark:from-neutral-500/10 dark:to-zinc-500/10 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Shield size={28} className="text-neutral-400" />
          </motion.div>
          <p className="text-zinc-500 text-sm font-medium">No audit logs yet</p>
          <p className="text-zinc-400 text-xs mt-1">Actions will appear here as admins use the system</p>
        </motion.div>
      ) : (
        <div className="space-y-1.5">
          {filtered.map((log, i) => {
            const ac = actionConfig[log.action] || { icon: Eye, color: "text-zinc-600", bg: "bg-zinc-100 dark:bg-zinc-800" };
            const ActionIcon = ac.icon;
            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
                whileHover={{ x: 3, transition: { duration: 0.15 } }}
                className="flex items-center gap-3 py-3 px-4 rounded-2xl bg-white/60 dark:bg-zinc-900/60 border border-zinc-100/50 dark:border-zinc-800/50 hover:bg-white/90 dark:hover:bg-zinc-900/90 hover:shadow-sm transition-all group"
              >
                <div className={`w-8 h-8 rounded-xl ${ac.bg} flex items-center justify-center shrink-0`}>
                  <ActionIcon size={14} className={ac.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-700 dark:text-zinc-200">
                    <span className={`font-semibold capitalize ${ac.color}`}>{log.action}</span>
                    {" "}
                    <span className="text-zinc-500">{log.entity_type}</span>
                    {log.entity_id && <span className="text-zinc-400 font-mono text-[10px] ml-1 bg-zinc-50 dark:bg-zinc-800 px-1.5 py-0.5 rounded-md">#{log.entity_id.slice(0, 8)}</span>}
                  </p>
                  {log.user_id && (
                    <p className="text-[10px] text-zinc-400 mt-0.5">by {log.user_id.slice(0, 12)}…</p>
                  )}
                </div>
                <span className="text-[10px] text-zinc-400 shrink-0 tabular-nums bg-zinc-50 dark:bg-zinc-800 px-2 py-0.5 rounded-lg">
                  {new Date(log.created_at).toLocaleString("en", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </span>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
