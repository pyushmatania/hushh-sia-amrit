import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy, Star, Target, Flame, Crown,
  IndianRupee, CalendarCheck, Users, Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Milestone {
  id: string;
  icon: string;
  title: string;
  description: string;
  target: number;
  current: number;
  type: "revenue" | "bookings" | "users";
  achieved: boolean;
}

const confettiColors = ["#a855f7", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

function ConfettiBurst() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 20 }, (_, i) => (
        <motion.div
          key={i}
          initial={{
            x: "50%", y: "50%", scale: 0, opacity: 1,
          }}
          animate={{
            x: `${Math.random() * 100}%`,
            y: `${Math.random() * 100}%`,
            scale: [0, 1, 0.5],
            opacity: [1, 1, 0],
            rotate: Math.random() * 360,
          }}
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
  const [celebrateId, setCelebrateId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const [bookingsRes, profilesRes] = await Promise.all([
        supabase.from("bookings").select("total, status").neq("status", "cancelled"),
        supabase.from("profiles").select("id"),
      ]);

      const bookings = bookingsRes.data ?? [];
      const totalRevenue = bookings.reduce((s, b) => s + Number(b.total), 0);
      const totalBookings = bookings.length;
      const totalUsers = (profilesRes.data ?? []).length;

      const defs: Milestone[] = [
        { id: "rev-10k", icon: "💰", title: "First ₹10K", description: "Earned ₹10,000 in total revenue", target: 10000, current: totalRevenue, type: "revenue", achieved: totalRevenue >= 10000 },
        { id: "rev-50k", icon: "🏆", title: "₹50K Club", description: "Reached ₹50,000 in total revenue", target: 50000, current: totalRevenue, type: "revenue", achieved: totalRevenue >= 50000 },
        { id: "rev-1l", icon: "👑", title: "₹1 Lakh Milestone", description: "One lakh in revenue! You're on fire", target: 100000, current: totalRevenue, type: "revenue", achieved: totalRevenue >= 100000 },
        { id: "rev-5l", icon: "💎", title: "₹5 Lakh Legend", description: "Half a million — legendary status", target: 500000, current: totalRevenue, type: "revenue", achieved: totalRevenue >= 500000 },
        { id: "book-10", icon: "📅", title: "10 Bookings", description: "First 10 bookings completed", target: 10, current: totalBookings, type: "bookings", achieved: totalBookings >= 10 },
        { id: "book-50", icon: "🔥", title: "50 Bookings", description: "Fifty bookings and counting", target: 50, current: totalBookings, type: "bookings", achieved: totalBookings >= 50 },
        { id: "book-100", icon: "⚡", title: "Century!", description: "100 bookings — you're unstoppable", target: 100, current: totalBookings, type: "bookings", achieved: totalBookings >= 100 },
        { id: "users-10", icon: "👥", title: "10 Users", description: "First 10 users on the platform", target: 10, current: totalUsers, type: "users", achieved: totalUsers >= 10 },
        { id: "users-50", icon: "🌟", title: "50 Users", description: "Growing community of 50+", target: 50, current: totalUsers, type: "users", achieved: totalUsers >= 50 },
        { id: "users-100", icon: "🚀", title: "100 Users", description: "Triple digit user base!", target: 100, current: totalUsers, type: "users", achieved: totalUsers >= 100 },
      ];

      setMilestones(defs);
      setLoading(false);
    };
    load();
  }, []);

  const achieved = milestones.filter(m => m.achieved);
  const pending = milestones.filter(m => !m.achieved);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Trophy size={22} className="text-primary" /> Achievements
        </h1>
        <p className="text-sm text-muted-foreground">
          {achieved.length}/{milestones.length} milestones unlocked
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-primary" size={24} />
        </div>
      ) : (
        <>
          {/* Progress bar */}
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-foreground">Overall Progress</span>
              <span className="text-xs font-bold text-primary">{Math.round((achieved.length / milestones.length) * 100)}%</span>
            </div>
            <div className="h-3 rounded-full bg-secondary overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(achieved.length / milestones.length) * 100}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
              />
            </div>
          </div>

          {/* Achieved */}
          {achieved.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Star size={14} className="text-amber-400" /> Unlocked ({achieved.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {achieved.map((m, i) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="relative rounded-xl border border-primary/20 bg-primary/5 p-4 cursor-pointer overflow-hidden"
                    onClick={() => { setCelebrateId(m.id); setTimeout(() => setCelebrateId(null), 1500); }}
                  >
                    {celebrateId === m.id && <ConfettiBurst />}
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{m.icon}</span>
                      <div>
                        <h4 className="text-sm font-bold text-foreground">{m.title}</h4>
                        <p className="text-[11px] text-muted-foreground">{m.description}</p>
                      </div>
                      <Star size={16} className="text-amber-400 ml-auto shrink-0" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Pending */}
          {pending.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Target size={14} className="text-muted-foreground" /> In Progress ({pending.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {pending.map((m, i) => {
                  const progress = Math.min(100, (m.current / m.target) * 100);
                  return (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + i * 0.05 }}
                      className="rounded-xl border border-border bg-card p-4"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl grayscale opacity-50">{m.icon}</span>
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-foreground">{m.title}</h4>
                          <p className="text-[11px] text-muted-foreground">{m.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ delay: 0.3 + i * 0.05, duration: 0.6 }}
                            className="h-full rounded-full bg-primary/50"
                          />
                        </div>
                        <span className="text-[10px] font-bold text-muted-foreground tabular-nums whitespace-nowrap">
                          {m.type === "revenue"
                            ? `₹${m.current.toLocaleString()} / ₹${m.target.toLocaleString()}`
                            : `${m.current} / ${m.target}`}
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
    </div>
  );
}
