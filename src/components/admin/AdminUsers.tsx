import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users, Search, Tag, IndianRupee, CalendarCheck,
  Crown, Repeat, Moon, Sparkles, Filter
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";

interface UserProfile {
  id: string; user_id: string; display_name: string | null;
  avatar_url: string | null; loyalty_points: number; tier: string;
  created_at: string; location: string | null;
  bookingCount?: number; totalSpend?: number;
  segment?: string;
}

const tierColors: Record<string, string> = {
  Silver: "bg-muted text-muted-foreground",
  Gold: "bg-amber-500/15 text-amber-400",
  Platinum: "bg-blue-500/15 text-blue-400",
  Diamond: "bg-primary/15 text-primary",
};

const segmentConfig: Record<string, { label: string; icon: typeof Crown; color: string; bg: string }> = {
  high_spender: { label: "💰 High Spender", icon: Crown, color: "text-amber-400", bg: "bg-amber-500/10" },
  frequent: { label: "🔁 Frequent", icon: Repeat, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  inactive: { label: "😴 Inactive", icon: Moon, color: "text-muted-foreground", bg: "bg-secondary" },
  new_user: { label: "✨ New", icon: Sparkles, color: "text-blue-400", bg: "bg-blue-500/10" },
  regular: { label: "👤 Regular", icon: Users, color: "text-foreground", bg: "bg-secondary" },
};

function assignSegment(bookings: number, spend: number, daysSinceJoin: number): string {
  if (spend >= 10000) return "high_spender";
  if (bookings >= 5) return "frequent";
  if (daysSinceJoin <= 14) return "new_user";
  if (bookings === 0 && daysSinceJoin > 30) return "inactive";
  return "regular";
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState("");
  const [segmentFilter, setSegmentFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: profiles } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      const { data: bookings } = await supabase.from("bookings").select("user_id, total");

      const bookingMap = new Map<string, { count: number; spend: number }>();
      (bookings ?? []).forEach(b => {
        const existing = bookingMap.get(b.user_id) || { count: 0, spend: 0 };
        bookingMap.set(b.user_id, { count: existing.count + 1, spend: existing.spend + Number(b.total) });
      });

      const now = Date.now();
      setUsers((profiles ?? []).map(p => {
        const bData = bookingMap.get(p.user_id) || { count: 0, spend: 0 };
        const daysSinceJoin = Math.floor((now - new Date(p.created_at).getTime()) / 86400000);
        return {
          ...p,
          bookingCount: bData.count,
          totalSpend: bData.spend,
          segment: assignSegment(bData.count, bData.spend, daysSinceJoin),
        };
      }));
      setLoading(false);
    };
    load();
  }, []);

  const filtered = users.filter(u => {
    const matchSearch = (u.display_name?.toLowerCase().includes(search.toLowerCase())) ||
      u.user_id.includes(search.toLowerCase());
    const matchSegment = !segmentFilter || u.segment === segmentFilter;
    return matchSearch && matchSegment;
  });

  const segmentCounts = users.reduce((acc, u) => {
    acc[u.segment || "regular"] = (acc[u.segment || "regular"] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Users size={22} className="text-primary" /> Users (CRM)
        </h1>
        <p className="text-sm text-muted-foreground">{users.length} registered users</p>
      </div>

      {/* Segment chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSegmentFilter(null)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
            !segmentFilter ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"
          }`}
        >All ({users.length})</button>
        {Object.entries(segmentConfig).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => setSegmentFilter(segmentFilter === key ? null : key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              segmentFilter === key ? `${cfg.bg} ${cfg.color}` : "bg-secondary text-muted-foreground"
            }`}
          >{cfg.label} ({segmentCounts[key] || 0})</button>
        ))}
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search by name or ID..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 rounded-xl bg-secondary animate-pulse" />)}</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((user, i) => {
            const seg = segmentConfig[user.segment || "regular"] || segmentConfig.regular;
            return (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="rounded-xl border border-border bg-card p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center text-sm font-bold text-foreground shrink-0">
                    {user.display_name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm text-foreground truncate">{user.display_name || "Unnamed"}</h3>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${tierColors[user.tier] || tierColors.Silver}`}>
                        {user.tier}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${seg.bg} ${seg.color}`}>
                        {seg.label}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        Joined {new Date(user.created_at).toLocaleDateString("en", { month: "short", year: "numeric" })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-border">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-muted-foreground mb-0.5">
                      <CalendarCheck size={12} />
                      <span className="text-[10px]">Bookings</span>
                    </div>
                    <p className="text-sm font-bold text-foreground tabular-nums">{user.bookingCount}</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-muted-foreground mb-0.5">
                      <IndianRupee size={12} />
                      <span className="text-[10px]">Spend</span>
                    </div>
                    <p className="text-sm font-bold text-foreground tabular-nums">₹{(user.totalSpend || 0).toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-muted-foreground mb-0.5">
                      <Tag size={12} />
                      <span className="text-[10px]">Points</span>
                    </div>
                    <p className="text-sm font-bold text-foreground tabular-nums">{user.loyalty_points}</p>
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
