import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { History, Clock, User, Building2, Sparkles, Gift, ChevronDown, ChevronRight, ArrowUpDown, Image, DollarSign, MapPin, Tag, ToggleLeft, Loader2, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface Revision {
  id: string;
  entity_type: string;
  entity_id: string;
  entity_name: string;
  changed_by: string | null;
  changed_by_name: string;
  change_type: string;
  changes: Record<string, any>;
  snapshot: Record<string, any>;
  created_at: string;
}

const entityIcons: Record<string, { icon: typeof Building2; color: string; bg: string }> = {
  property: { icon: Building2, color: "text-indigo-600", bg: "bg-indigo-100 dark:bg-indigo-500/20" },
  curation: { icon: Sparkles, color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-500/20" },
  experience: { icon: Gift, color: "text-pink-600", bg: "bg-pink-100 dark:bg-pink-500/20" },
};

const changeIcons: Record<string, typeof DollarSign> = {
  name: Tag,
  base_price: DollarSign,
  price: DollarSign,
  status: ToggleLeft,
  images: Image,
  location: MapPin,
  category: Tag,
  capacity: User,
  active: ToggleLeft,
};

function ChangeDetail({ field, value }: { field: string; value: any }) {
  const Icon = changeIcons[field] || ArrowUpDown;

  if (typeof value === "string") {
    return (
      <div className="flex items-center gap-2 text-[11px]">
        <Icon size={11} className="text-muted-foreground shrink-0" />
        <span className="text-muted-foreground capitalize">{field}:</span>
        <span className="text-foreground font-medium">{value}</span>
      </div>
    );
  }

  if (value && typeof value === "object" && "old" in value && "new" in value) {
    return (
      <div className="flex items-center gap-2 text-[11px] flex-wrap">
        <Icon size={11} className="text-muted-foreground shrink-0" />
        <span className="text-muted-foreground capitalize">{field}:</span>
        <span className="line-through text-destructive/70">{String(value.old)}</span>
        <ChevronRight size={10} className="text-muted-foreground" />
        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{String(value.new)}</span>
      </div>
    );
  }

  if (value && typeof value === "object" && "old_count" in value) {
    return (
      <div className="flex items-center gap-2 text-[11px]">
        <Image size={11} className="text-muted-foreground shrink-0" />
        <span className="text-muted-foreground">Images:</span>
        <span className="text-foreground">{value.old_count ?? 0} → {value.new_count ?? 0}</span>
      </div>
    );
  }

  return null;
}

export default function RevisionHistoryPanel() {
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "property" | "curation" | "experience">("all");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [limit, setLimit] = useState(50);

  useEffect(() => {
    loadRevisions();
  }, [filter, limit]);

  const loadRevisions = async () => {
    setLoading(true);
    let query = supabase
      .from("listing_revisions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (filter !== "all") {
      query = query.eq("entity_type", filter);
    }

    const { data } = await query;
    setRevisions((data ?? []) as unknown as Revision[]);
    setLoading(false);
  };

  const toggleExpanded = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Group revisions by date
  const grouped = revisions.reduce<Record<string, Revision[]>>((acc, rev) => {
    const date = new Date(rev.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    if (!acc[date]) acc[date] = [];
    acc[date].push(rev);
    return acc;
  }, {});

  const filterOptions = [
    { value: "all" as const, label: "All", count: revisions.length },
    { value: "property" as const, label: "Properties", icon: Building2 },
    { value: "curation" as const, label: "Curations", icon: Sparkles },
    { value: "experience" as const, label: "Experiences", icon: Gift },
  ];

  return (
    <motion.div className="space-y-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-500/15 dark:to-purple-500/15 flex items-center justify-center shadow-sm">
            <History size={20} className="text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Revision History</h2>
            <p className="text-xs text-muted-foreground">{revisions.length} changes tracked</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-1.5 flex-wrap">
        {filterOptions.map(opt => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all flex items-center gap-1.5 ${
              filter === opt.value
                ? "bg-primary/10 text-primary border border-primary/20"
                : "bg-card text-muted-foreground border border-border hover:border-border/80"
            }`}
          >
            {opt.icon && <opt.icon size={12} />}
            {opt.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-primary" size={28} />
        </div>
      ) : revisions.length === 0 ? (
        <div className="text-center py-16 space-y-2">
          <History size={36} className="text-muted-foreground/40 mx-auto" />
          <p className="text-sm text-muted-foreground">No revision history yet</p>
          <p className="text-xs text-muted-foreground/60">Changes to listings will appear here automatically</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, dayRevisions]) => (
            <div key={date}>
              {/* Date header */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-2 h-2 rounded-full bg-primary/40" />
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{date}</p>
                <div className="flex-1 h-px bg-border/50" />
                <span className="text-[10px] text-muted-foreground/60">{dayRevisions.length} changes</span>
              </div>

              {/* Timeline entries */}
              <div className="relative ml-[3px] border-l-2 border-border/40 pl-5 space-y-2">
                {dayRevisions.map((rev, i) => {
                  const entityInfo = entityIcons[rev.entity_type] || entityIcons.property;
                  const EntityIcon = entityInfo.icon;
                  const isExpanded = expandedIds.has(rev.id);
                  const changeKeys = Object.keys(rev.changes).filter(k => k !== "action");

                  return (
                    <motion.div
                      key={rev.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="relative"
                    >
                      {/* Timeline dot */}
                      <div className={`absolute -left-[27px] top-3 w-3 h-3 rounded-full border-2 border-background ${
                        rev.change_type === "create" ? "bg-emerald-500" : "bg-primary"
                      }`} />

                      <div
                        onClick={() => toggleExpanded(rev.id)}
                        className={`rounded-xl border bg-card p-3 cursor-pointer transition-all hover:shadow-sm ${
                          isExpanded ? "border-primary/20 shadow-sm" : "border-border/60"
                        }`}
                      >
                        {/* Top row */}
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-lg ${entityInfo.bg} flex items-center justify-center shrink-0`}>
                            <EntityIcon size={13} className={entityInfo.color} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-[12px] font-semibold text-foreground truncate">{rev.entity_name}</p>
                              <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase ${
                                rev.change_type === "create"
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                  : rev.change_type === "delete"
                                  ? "bg-destructive/10 text-destructive"
                                  : "bg-primary/10 text-primary"
                              }`}>
                                {rev.change_type}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <Clock size={9} />
                                {formatDistanceToNow(new Date(rev.created_at), { addSuffix: true })}
                              </span>
                              {rev.changed_by_name !== "System" && (
                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                  <User size={9} />
                                  {rev.changed_by_name}
                                </span>
                              )}
                              {changeKeys.length > 0 && (
                                <span className="text-[10px] text-muted-foreground/60">
                                  {changeKeys.length} field{changeKeys.length > 1 ? "s" : ""}
                                </span>
                              )}
                            </div>
                          </div>
                          <ChevronDown size={14} className={`text-muted-foreground transition-transform shrink-0 ${isExpanded ? "rotate-180" : ""}`} />
                        </div>

                        {/* Expanded detail */}
                        <AnimatePresence>
                          {isExpanded && changeKeys.length > 0 && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-2.5 pt-2.5 border-t border-border/50 space-y-1.5"
                            >
                              {changeKeys.map(key => (
                                <ChangeDetail key={key} field={key} value={rev.changes[key]} />
                              ))}
                              {rev.snapshot && Object.keys(rev.snapshot).length > 0 && (
                                <div className="mt-2 pt-2 border-t border-dashed border-border/40">
                                  <p className="text-[9px] font-semibold text-muted-foreground/60 uppercase tracking-wider mb-1">Snapshot after change</p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {Object.entries(rev.snapshot).map(([k, v]) => (
                                      <span key={k} className="text-[9px] px-1.5 py-0.5 rounded-md bg-muted/50 text-muted-foreground">
                                        {k}: <span className="text-foreground font-medium">{String(v)}</span>
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Load more */}
          {revisions.length >= limit && (
            <button
              onClick={() => setLimit(l => l + 50)}
              className="w-full py-3 rounded-xl border border-border bg-card text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-primary/20 transition"
            >
              Load more revisions...
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}
