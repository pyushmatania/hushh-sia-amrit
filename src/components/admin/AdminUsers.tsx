import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Search, Tag, IndianRupee, CalendarCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";

interface UserProfile {
  id: string; user_id: string; display_name: string | null;
  avatar_url: string | null; loyalty_points: number; tier: string;
  created_at: string; location: string | null;
  bookingCount?: number; totalSpend?: number;
}

const tierColors: Record<string, string> = {
  Silver: "bg-muted text-muted-foreground",
  Gold: "bg-amber-500/15 text-amber-400",
  Platinum: "bg-blue-500/15 text-blue-400",
  Diamond: "bg-primary/15 text-primary",
};

export default function AdminUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState("");
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

      setUsers((profiles ?? []).map(p => ({
        ...p,
        bookingCount: bookingMap.get(p.user_id)?.count || 0,
        totalSpend: bookingMap.get(p.user_id)?.spend || 0,
      })));
      setLoading(false);
    };
    load();
  }, []);

  const filtered = users.filter(u =>
    (u.display_name?.toLowerCase().includes(search.toLowerCase())) ||
    u.user_id.includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Users size={22} className="text-primary" /> Users (CRM)
        </h1>
        <p className="text-sm text-muted-foreground">{users.length} registered users</p>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search by name or ID..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 rounded-xl bg-secondary animate-pulse" />)}</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((user, i) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
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
                  <p className="text-[11px] text-muted-foreground truncate">{user.user_id.slice(0, 20)}...</p>
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
          ))}
        </div>
      )}
    </div>
  );
}
