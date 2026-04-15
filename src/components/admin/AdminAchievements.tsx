import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, Target, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { DEMO_BOOKINGS, DEMO_PROFILES } from "./admin-demo-data";
import DemoDataBanner from "./DemoDataBanner";
import { useDataMode } from "@/hooks/use-data-mode";

interface Milestone {
  id: string; icon: string; title: string; description: string;
  target: number; current: number; type: "revenue" | "bookings" | "users"; achieved: boolean;
}

const confettiColors = ["#a855f7", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"];
const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

function ConfettiBurst() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 20 }, (_, i) => (
        <motion.div key={i}
          initial={{ x: "50%", y: "50%", scale: 0, opacity: 1 }}
          animate={{ x: `${Math.random() * 100}%`, y: `${Math.random() * 100}%`, scale: [0, 1, 0.5], opacity: [1, 1, 0], rotate: Math.random() * 360 }}
          transition={{ duration: 1.2, delay: i * 0.03 }}
          className="absolute w-2 h-2 rounded-full"
          style={{ backgroundColor: confettiColors[i % confettiColors.length] }}
        />
      ))}
    </div>
  );
}

export default function AdminAchievements() {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [celebrateId, setCelebrateId] = useState<string | null>(null);
  const { isDemoMode } = useDataMode();

  useEffect(() => {
    const load = async () => {
      const [bookingsRes, profilesRes] = await Promise.all([
        supabase.from("bookings").select("total, status").neq("status", "cancelled"),
        supabase.from("profiles").select("id"),
      ]);
      const bookingsRaw = bookingsRes.data ?? [];
      const profilesRaw = profilesRes.data ?? [];
      const usingDemo = bookingsRaw.length === 0 && profilesRaw.length === 0 && isDemoMode;
      setIsDemo(usingDemo);

      const bookings = usingDemo ? DEMO_BOOKINGS.filter(b => b.status !== "cancelled") : bookingsRaw;
      const totalRevenue = bookings.reduce((s, b) => s + Number(b.total), 0);
      const totalBookings = bookings.length;
      const totalUsers = usingDemo ? DEMO_PROFILES.length : profilesRaw.length;

      setMilestones([
        { id: "rev-10k", icon: "💰", title: "First ₹10K", description: "Earned ₹10,000 in total revenue", target: 10000, current: totalRevenue, type: "revenue", achieved: totalRevenue >= 10000 },
        { id: "rev-50k", icon: "🏆", title: "₹50K Club", description: "Reached ₹50,000 in total revenue", target: 50000, current: totalRevenue, type: "revenue", achieved: totalRevenue >= 50000 },
        { id: "rev-1l", icon: "👑", title: "₹1 Lakh Milestone", description: "One lakh in revenue!", target: 100000, current: totalRevenue, type: "revenue", achieved: totalRevenue >= 100000 },
        { id: "rev-5l", icon: "💎", title: "₹5 Lakh Legend", description: "Half a million — legendary", target: 500000, current: totalRevenue, type: "revenue", achieved: totalRevenue >= 500000 },
        { id: "book-10", icon: "📅", title: "10 Bookings", description: "First 10 bookings completed", target: 10, current: totalBookings, type: "bookings", achieved: totalBookings >= 10 },
        { id: "book-50", icon: "🔥", title: "50 Bookings", description: "Fifty bookings and counting", target: 50, current: totalBookings, type: "bookings", achieved: totalBookings >= 50 },
        { id: "book-100", icon: "⚡", title: "Century!", description: "100 bookings — unstoppable", target: 100, current: totalBookings, type: "bookings", achieved: totalBookings >= 100 },
        { id: "users-10", icon: "👥", title: "10 Users", description: "First 10 users on the platform", target: 10, current: totalUsers, type: "users", achieved: totalUsers >= 10 },
        { id: "users-50", icon: "🌟", title: "50 Users", description: "Growing community of 50+", target: 50, current: totalUsers, type: "users", achieved: totalUsers >= 50 },
        { id: "users-100", icon: "🚀", title: "100 Users", description: "Triple digit user base!", target: 100, current: totalUsers, type: "users", achieved: totalUsers >= 100 },
      ]);
      setLoading(false);
    };
    load();
  }, []);

  const achieved = milestones.filter(m => m.achieved);
  const pending = milestones.filter(m => !m.achieved);
  const pct = milestones.length ? Math.round((achieved.length / milestones.length) * 100) : 0;

  return (
    <motion.div className="space-y-6" initial="initial" animate="animate">
      {isDemo && <DemoDataBanner entityName="achievements" />}
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-500/10 dark:to-yellow-500/10 flex items-center justify-center shadow-sm">
            <Trophy size={20} className="text-amber-600" />
          </div>
          Achievements
        </h1>
        <p className="text-sm text-zinc-400 mt-1">{achieved.length}/{milestones.length} milestones unlocked</p>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-16"><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}><Loader2 className="text-indigo-400" size={28} /></motion.div></div>
      ) : (
        <>
          {/* Overall Progress */}
          <motion.div variants={fadeUp} className="rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-zinc-100/80 dark:border-zinc-800/80 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">Overall Progress</span>
              <span className="text-sm font-bold text-indigo-600">{pct}%</span>
            </div>
            <div className="h-3 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 shadow-sm shadow-indigo-200/50" />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-[10px] text-zinc-400">{achieved.length} unlocked</span>
              <span className="text-[10px] text-zinc-400">{pending.length} remaining</span>
            </div>
          </motion.div>

          {/* Achieved */}
          {achieved.length > 0 && (
            <div className="space-y-3">
              <motion.h3 variants={fadeUp} className="text-sm font-bold text-zinc-700 dark:text-zinc-200 flex items-center gap-2">
                <Star size={14} className="text-amber-500" /> Unlocked ({achieved.length})
              </motion.h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {achieved.map((m, i) => (
                  <motion.div key={m.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ y: -3, transition: { duration: 0.15 } }}
                    className="relative rounded-2xl bg-gradient-to-br from-amber-50/80 to-yellow-50/40 dark:from-amber-500/10 dark:to-yellow-500/5 border border-amber-100/50 dark:border-amber-500/15 p-4 cursor-pointer overflow-hidden hover:shadow-lg hover:shadow-amber-100/30 transition-all"
                    onClick={() => { setCelebrateId(m.id); setTimeout(() => setCelebrateId(null), 1500); }}>
                    {celebrateId === m.id && <ConfettiBurst />}
                    <div className="relative flex items-center gap-3">
                      <span className="text-3xl">{m.icon}</span>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-zinc-700 dark:text-zinc-200">{m.title}</h4>
                        <p className="text-[11px] text-zinc-500 mt-0.5">{m.description}</p>
                      </div>
                      <Star size={16} className="text-amber-400 shrink-0" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Pending */}
          {pending.length > 0 && (
            <div className="space-y-3">
              <motion.h3 variants={fadeUp} className="text-sm font-bold text-zinc-700 dark:text-zinc-200 flex items-center gap-2">
                <Target size={14} className="text-zinc-400" /> In Progress ({pending.length})
              </motion.h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {pending.map((m, i) => {
                  const progress = Math.min(100, (m.current / m.target) * 100);
                  return (
                    <motion.div key={m.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + i * 0.04 }}
                      className="rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-zinc-100/80 dark:border-zinc-800/80 p-4 hover:shadow-md transition-all">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl grayscale opacity-40">{m.icon}</span>
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">{m.title}</h4>
                          <p className="text-[11px] text-zinc-400">{m.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }}
                            transition={{ delay: 0.3 + i * 0.04, duration: 0.6 }}
                            className="h-full rounded-full bg-indigo-400/50" />
                        </div>
                        <span className="text-[10px] font-bold text-zinc-400 tabular-nums whitespace-nowrap">
                          {m.type === "revenue" ? `₹${m.current.toLocaleString()} / ₹${m.target.toLocaleString()}` : `${m.current} / ${m.target}`}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}
