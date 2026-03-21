import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Crown, Gift, Star, Users, TrendingUp,
  Award, Loader2, UserPlus, Link2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

interface TierStats { tier: string; count: number; }
interface ReferralStats { totalCodes: number; totalUses: number; topReferrers: { user_id: string; code: string; uses: number }[]; }
interface LoyaltyOverview { totalPointsIssued: number; totalPointsRedeemed: number; avgPointsPerUser: number; transactionsByType: { type: string; count: number; total: number }[]; }

const TIER_COLORS: Record<string, string> = { Silver: "#94a3b8", Gold: "#f59e0b", Platinum: "#818cf8", Diamond: "#38bdf8" };
const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };
const stagger = { animate: { transition: { staggerChildren: 0.06 } } };

export default function AdminLoyaltyReferrals() {
  const [tierStats, setTierStats] = useState<TierStats[]>([]);
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);
  const [loyaltyOverview, setLoyaltyOverview] = useState<LoyaltyOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [profilesRes, referralCodesRes, referralUsesRes, loyaltyRes] = await Promise.all([
        supabase.from("profiles").select("tier, loyalty_points"),
        supabase.from("referral_codes").select("*"),
        supabase.from("referral_uses").select("*"),
        supabase.from("loyalty_transactions").select("type, points"),
      ]);
      const profiles = profilesRes.data ?? [];
      const tierMap: Record<string, number> = {};
      profiles.forEach(p => { tierMap[p.tier] = (tierMap[p.tier] || 0) + 1; });
      setTierStats(Object.entries(tierMap).map(([tier, count]) => ({ tier, count })));

      const codes = referralCodesRes.data ?? [];
      const uses = referralUsesRes.data ?? [];
      setReferralStats({ totalCodes: codes.length, totalUses: uses.length, topReferrers: codes.sort((a, b) => b.uses - a.uses).slice(0, 5).map(c => ({ user_id: c.user_id, code: c.code, uses: c.uses })) });

      const transactions = loyaltyRes.data ?? [];
      const earned = transactions.filter(t => t.type === "earn");
      const redeemed = transactions.filter(t => t.type === "redeem");
      setLoyaltyOverview({
        totalPointsIssued: earned.reduce((s, t) => s + Math.abs(t.points), 0),
        totalPointsRedeemed: redeemed.reduce((s, t) => s + Math.abs(t.points), 0),
        avgPointsPerUser: profiles.length > 0 ? Math.round(profiles.reduce((s, p) => s + p.loyalty_points, 0) / profiles.length) : 0,
        transactionsByType: [{ type: "Earned", count: earned.length, total: earned.reduce((s, t) => s + Math.abs(t.points), 0) }, { type: "Redeemed", count: redeemed.length, total: redeemed.reduce((s, t) => s + Math.abs(t.points), 0) }],
      });
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}><Loader2 className="text-indigo-400" size={28} /></motion.div></div>;

  const tooltipStyle = { background: "#fff", border: "1px solid #e4e4e7", borderRadius: 16, fontSize: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.08)", padding: "10px 14px" };

  return (
    <motion.div className="space-y-6" variants={stagger} initial="initial" animate="animate">
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-500/10 dark:to-rose-500/10 flex items-center justify-center shadow-sm">
            <Crown size={20} className="text-pink-600" />
          </div>
          Loyalty & Referrals
        </h1>
        <p className="text-sm text-zinc-400 mt-1">Points, tiers, and referral tracking</p>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Points Issued", value: loyaltyOverview?.totalPointsIssued ?? 0, icon: Star, color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-500/20", gradient: "from-amber-50 to-yellow-50/50 dark:from-amber-500/10 dark:to-yellow-500/5" },
          { label: "Points Redeemed", value: loyaltyOverview?.totalPointsRedeemed ?? 0, icon: Gift, color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-500/20", gradient: "from-emerald-50 to-green-50/50 dark:from-emerald-500/10 dark:to-green-500/5" },
          { label: "Avg Points/User", value: loyaltyOverview?.avgPointsPerUser ?? 0, icon: Users, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-500/20", gradient: "from-blue-50 to-indigo-50/50 dark:from-blue-500/10 dark:to-indigo-500/5" },
          { label: "Referral Uses", value: referralStats?.totalUses ?? 0, icon: UserPlus, color: "text-violet-600", bg: "bg-violet-100 dark:bg-violet-500/20", gradient: "from-violet-50 to-purple-50/50 dark:from-violet-500/10 dark:to-purple-500/5" },
        ].map((card, i) => (
          <motion.div key={card.label} variants={fadeUp}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.gradient} p-4 border border-zinc-100/80 dark:border-zinc-800/80 hover:shadow-lg transition-shadow group`}>
            <div className="absolute -right-3 -top-3 w-16 h-16 rounded-full bg-white/20 dark:bg-white/5 group-hover:scale-125 transition-transform duration-500" />
            <div className="relative">
              <div className={`w-9 h-9 rounded-xl ${card.bg} flex items-center justify-center mb-2 shadow-sm`}><card.icon size={16} className={card.color} /></div>
              <p className="text-xl font-bold text-zinc-800 dark:text-zinc-100 tabular-nums">{card.value.toLocaleString("en-IN")}</p>
              <p className="text-[10px] text-zinc-500 mt-0.5">{card.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Tier Distribution */}
        <motion.div variants={fadeUp}
          className="rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-zinc-100/80 dark:border-zinc-800/80 p-5 hover:shadow-lg transition-shadow">
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 mb-4 flex items-center gap-2">
            <Award size={14} className="text-amber-500" /> Tier Distribution
          </h3>
          {tierStats.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="55%" height={200}>
                <PieChart><Pie data={tierStats} dataKey="count" nameKey="tier" cx="50%" cy="50%" outerRadius={72} innerRadius={42} strokeWidth={3} stroke="#fff">
                  {tierStats.map(e => <Cell key={e.tier} fill={TIER_COLORS[e.tier] || "#818cf8"} />)}
                </Pie><Tooltip contentStyle={tooltipStyle} /></PieChart>
              </ResponsiveContainer>
              <div className="space-y-2.5 flex-1">
                {tierStats.map(t => (
                  <div key={t.tier} className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full shadow-sm" style={{ background: TIER_COLORS[t.tier] || "#818cf8" }} />
                    <span className="text-xs text-zinc-600 dark:text-zinc-300 font-medium flex-1">{t.tier}</span>
                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-200 tabular-nums">{t.count}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <p className="text-sm text-zinc-400 text-center py-8">No tier data yet</p>}
        </motion.div>

        {/* Points Flow */}
        <motion.div variants={fadeUp}
          className="rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-zinc-100/80 dark:border-zinc-800/80 p-5 hover:shadow-lg transition-shadow">
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 mb-4 flex items-center gap-2">
            <TrendingUp size={14} className="text-indigo-500" /> Points Flow
          </h3>
          {(loyaltyOverview?.transactionsByType ?? []).length > 0 ? (
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={loyaltyOverview?.transactionsByType ?? []} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
                  <XAxis dataKey="type" tick={{ fontSize: 11, fill: "#a1a1aa" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#a1a1aa" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="total" fill="#a5b4fc" radius={[10, 10, 4, 4]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : <p className="text-sm text-zinc-400 text-center py-8">No transactions yet</p>}
        </motion.div>
      </div>

      {/* Top Referrers */}
      <motion.div variants={fadeUp}
        className="rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-zinc-100/80 dark:border-zinc-800/80 p-5 hover:shadow-lg transition-shadow">
        <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 mb-4 flex items-center gap-2">
          <Link2 size={14} className="text-violet-500" /> Top Referrers
        </h3>
        {(referralStats?.topReferrers ?? []).length > 0 ? (
          <div className="space-y-2">
            {referralStats!.topReferrers.map((ref, i) => (
              <motion.div key={ref.code} whileHover={{ x: 3, transition: { duration: 0.15 } }}
                className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100/50 dark:border-zinc-700/30 hover:shadow-sm transition-all">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-500/20 dark:to-violet-500/20 flex items-center justify-center text-xs font-bold text-indigo-600">
                  #{i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200 font-mono">{ref.code}</p>
                  <p className="text-[10px] text-zinc-400 truncate">{ref.user_id.slice(0, 12)}…</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-zinc-700 dark:text-zinc-200 tabular-nums">{ref.uses}</p>
                  <p className="text-[9px] text-zinc-400">uses</p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : <p className="text-sm text-zinc-400 text-center py-8">No referrals yet — share codes to get started</p>}
        <div className="mt-4 flex items-center justify-between text-[11px] text-zinc-400 border-t border-zinc-100 dark:border-zinc-800 pt-3">
          <span>Total codes: {referralStats?.totalCodes ?? 0}</span>
          <span>Total conversions: {referralStats?.totalUses ?? 0}</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
