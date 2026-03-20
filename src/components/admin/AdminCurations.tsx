import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";

export default function AdminCurations() {
  const [curations, setCurations] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("curations").select("*").order("sort_order")
      .then(({ data }) => { setCurations(data ?? []); setLoading(false); });
  }, []);

  const filtered = curations.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Sparkles size={22} className="text-primary" /> Curations
        </h1>
        <p className="text-sm text-muted-foreground">{curations.length} curated experiences</p>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search curations..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 rounded-xl bg-secondary animate-pulse" />)}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{c.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm text-foreground">{c.name}</h3>
                    {c.badge && <span className="text-[10px] bg-primary/15 text-primary px-2 py-0.5 rounded-full">{c.badge}</span>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{c.tagline}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <p className="text-sm font-bold text-foreground tabular-nums">₹{Number(c.price).toLocaleString()}</p>
                    {c.original_price && (
                      <p className="text-xs text-muted-foreground line-through tabular-nums">₹{Number(c.original_price).toLocaleString()}</p>
                    )}
                    <span className={`ml-auto text-[10px] font-medium px-2 py-0.5 rounded-full ${c.active ? "bg-emerald-500/15 text-emerald-400" : "bg-muted text-muted-foreground"}`}>
                      {c.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {(c.tags || []).slice(0, 4).map((tag: string) => (
                      <span key={tag} className="text-[10px] bg-secondary text-muted-foreground px-1.5 py-0.5 rounded">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
