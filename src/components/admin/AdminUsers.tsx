import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users, Search, Tag, IndianRupee, CalendarCheck,
  Crown, Repeat, Moon, Sparkles
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";

interface UserProfile {
  id: string; user_id: string; display_name: string | null;
  avatar_url: string | null; loyalty_points: number; tier: string;
  created_at: string; location: string | null;
  bookingCount?: number; totalSpend?: number; segment?: string;
}

const tierColors: Record<string, string> = {
  Silver: "bg-zinc-100 dark:bg-zinc-800 text-zinc-500",
  Gold: "bg-amber-50 dark:bg-amber-500/10 text-amber-600",
  Platinum: "bg-blue-50 dark:bg-blue-500/10 text-blue-600",
  Diamond: "bg-violet-50 dark:bg-violet-500/10 text-violet-600",
};

const segmentConfig: Record<string, { label: string; icon: typeof Crown; color: string; bg: string }> = {
  high_spender: { label: "💰 High Spender", icon: Crown, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-500/10" },
  frequent: { label: "🔁 Frequent", icon: Repeat, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
  inactive: { label: "😴 Inactive", icon: Moon, color: "text-zinc-400", bg: "bg-zinc-100 dark:bg-zinc-800" },
  new_user: { label: "✨ New", icon: Sparkles, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-500/10" },
  regular: { label: "👤 Regular", icon: Users, color: "text-zinc-600", bg: "bg-zinc-100 dark:bg-zinc-800" },
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
        return { ...p, bookingCount: bData.count, totalSpend: bData.spend, segment: assignSegment(bData.count, bData.spend, daysSinceJoin) };
      }));
      setLoading(false);
    };
    load();
  }, []);

  const filtered = users.filter(u => {
    const matchSearch = u.display_name?.toLowerCase().includes(search.toLowerCase()) || u.user_id.includes(search.toLowerCase());
    return matchSearch && (!segmentFilter || u.segment === segmentFilter);
  });

  const segmentCounts = users.reduce((acc, u) => {
    acc[u.segment || "regular"] = (acc[u.segment || "regular"] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-fuchsia-50 dark:bg-fuchsia-500/10 flex items-center justify-center">
            <Users size={18} className="text-fuchsia-600" />
          </div>
          Users CRM
        </h1>
        <p className="text-sm text-zinc-400 mt-1">{users.length} registered users</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setSegmentFilter(null)}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
            !segmentFilter ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600" : "bg-white dark:bg-zinc-800 text-zinc-400 border border-zinc-100 dark:border-zinc-700"
          }`}>All ({users.length})</button>
        {Object.entries(segmentConfig).map(([key, cfg]) => (
          <button key={key} onClick={() => setSegmentFilter(segmentFilter === key ? null : key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
              segmentFilter === key ? `${cfg.bg} ${cfg.color}` : "bg-white dark:bg-zinc-800 text-zinc-400 border border-zinc-100 dark:border-zinc-700"
            }`}>{cfg.label} ({segmentCounts[key] || 0})</button>
        ))}
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        <Input placeholder="Search by name or ID..." value={search} onChange={e => setSearch(e.target.value)}
          className="pl-9 rounded-xl border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900" />
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 rounded-2xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />)}</div>
      ) : (
        <div className="space-y-2">
          {filtered.map((user, i) => {
            const seg = segmentConfig[user.segment || "regular"] || segmentConfig.regular;
            return (
              <motion.div key={user.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-500/20 dark:to-violet-500/20 flex items-center justify-center text-sm font-bold text-indigo-600 shrink-0">
                    {user.display_name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm text-zinc-700 dark:text-zinc-200 truncate">{user.display_name || "Unnamed"}</h3>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${tierColors[user.tier] || tierColors.Silver}`}>{user.tier}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-lg ${seg.bg} ${seg.color}`}>{seg.label}</span>
                      <span className="text-[10px] text-zinc-400">Joined {new Date(user.created_at).toLocaleDateString("en", { month: "short", year: "numeric" })}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  {[
                    { icon: CalendarCheck, label: "Bookings", value: user.bookingCount, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10" },
                    { icon: IndianRupee, label: "Spend", value: `₹${(user.totalSpend || 0).toLocaleString()}`, color: "text-green-500", bg: "bg-green-50 dark:bg-green-500/10" },
                    { icon: Tag, label: "Points", value: user.loyalty_points, color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-500/10" },
                  ].map(stat => (
                    <div key={stat.label} className="text-center">
                      <div className={`w-7 h-7 rounded-lg ${stat.bg} flex items-center justify-center mx-auto mb-1`}>
                        <stat.icon size={12} className={stat.color} />
                      </div>
                      <p className="text-sm font-bold text-zinc-700 dark:text-zinc-200 tabular-nums">{stat.value}</p>
                      <p className="text-[9px] text-zinc-400">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
