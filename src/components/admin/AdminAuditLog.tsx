import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ScrollText, Search, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";

interface AuditLog {
  id: string; user_id: string | null; action: string;
  entity_type: string; entity_id: string | null;
  details: any; created_at: string;
}

const actionColors: Record<string, string> = {
  create: "text-emerald-400",
  update: "text-blue-400",
  delete: "text-destructive",
  login: "text-primary",
  export: "text-amber-400",
};

export default function AdminAuditLog() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(100)
      .then(({ data }) => { setLogs((data as any) ?? []); setLoading(false); });
  }, []);

  const filtered = logs.filter(l =>
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.entity_type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ScrollText size={22} className="text-primary" /> Audit Trail
        </h1>
        <p className="text-sm text-muted-foreground">Track all admin actions</p>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search actions..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      {loading ? (
        <div className="space-y-2">{[1,2,3,4,5].map(i => <div key={i} className="h-12 rounded-lg bg-secondary animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <ScrollText size={40} className="mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No audit logs yet</p>
          <p className="text-xs text-muted-foreground mt-1">Actions will appear here as admins use the system</p>
        </div>
      ) : (
        <div className="space-y-1">
          {filtered.map((log, i) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.02 }}
              className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-secondary/50 transition"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-border shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">
                  <span className={`font-semibold capitalize ${actionColors[log.action] || "text-foreground"}`}>{log.action}</span>
                  {" "}
                  <span className="text-muted-foreground">{log.entity_type}</span>
                  {log.entity_id && <span className="text-muted-foreground font-mono text-xs"> #{log.entity_id.slice(0, 8)}</span>}
                </p>
              </div>
              <span className="text-[10px] text-muted-foreground shrink-0 tabular-nums">
                {new Date(log.created_at).toLocaleString("en", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
              </span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
