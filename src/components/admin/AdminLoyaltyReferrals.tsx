import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Crown, Gift, Star, Users, TrendingUp, IndianRupee,
  Award, Loader2, UserPlus, Link2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis } from "recharts";

interface TierStats {
  tier: string;
  count: number;
}

interface ReferralStats {
  totalCodes: number;
  totalUses: number;
  topReferrers: { user_id: string; code: string; uses: number }[];
}

interface LoyaltyOverview {
  totalPointsIssued: number;
  totalPointsRedeemed: number;
  avgPointsPerUser: number;
  transactionsByType: { type: string; count: number; total: number }[];
}

const TIER_COLORS: Record<string, string> = {
  Silver: "hsl(220, 15%, 60%)",
  Gold: "hsl(45, 85%, 55%)",
  Platinum: "hsl(260, 40%, 60%)",
  Diamond: "hsl(200, 80%, 60%)",
};

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

      // Tier distribution
      const profiles = profilesRes.data ?? [];
      const tierMap: Record<string, number> = {};
      profiles.forEach(p => { tierMap[p.tier] = (tierMap[p.tier] || 0) + 1; });
      setTierStats(Object.entries(tierMap).map(([tier, count]) => ({ tier, count })));

      // Referrals
      const codes = referralCodesRes.data ?? [];
      const uses = referralUsesRes.data ?? [];
      const topReferrers = codes
        .sort((a, b) => b.uses - a.uses)
        .slice(0, 5)
        .map(c => ({ user_id: c.user_id, code: c.code, uses: c.uses }));
      setReferralStats({ totalCodes: codes.length, totalUses: uses.length, topReferrers });

      // Loyalty overview
      const transactions = loyaltyRes.data ?? [];
      const earned = transactions.filter(t => t.type === "earn");
      const redeemed = transactions.filter(t => t.type === "redeem");
      const totalIssued = earned.reduce((s, t) => s + Math.abs(t.points), 0);
      const totalRedeemed = redeemed.reduce((s, t) => s + Math.abs(t.points), 0);
      setLoyaltyOverview({
        totalPointsIssued: totalIssued,
        totalPointsRedeemed: totalRedeemed,
        avgPointsPerUser: profiles.length > 0 ? Math.round(profiles.reduce((s, p) => s + p.loyalty_points, 0) / profiles.length) : 0,
        transactionsByType: [
          { type: "Earned", count: earned.length, total: totalIssued },
          { type: "Redeemed", count: redeemed.length, total: totalRedeemed },
        ],
      });

      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary" size={28} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Crown size={22} className="text-primary" /> Loyalty & Referrals
        </h1>
        <p className="text-sm text-muted-foreground">Manage points, tiers, and referral tracking</p>
      </div>

      {/* Loyalty Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Points Issued", value: loyaltyOverview?.totalPointsIssued ?? 0, icon: Star, color: "text-amber-400" },
          { label: "Points Redeemed", value: loyaltyOverview?.totalPointsRedeemed ?? 0, icon: Gift, color: "text-emerald-400" },
          { label: "Avg Points/User", value: loyaltyOverview?.avgPointsPerUser ?? 0, icon: Users, color: "text-blue-400" },
          { label: "Referral Uses", value: referralStats?.totalUses ?? 0, icon: UserPlus, color: "text-primary" },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="rounded-xl border border-border bg-card p-4"
          >
            <card.icon size={18} className={card.color} />
            <p className="text-2xl font-bold text-foreground mt-2 tabular-nums">{card.value.toLocaleString("en-IN")}</p>
            <p className="text-[11px] text-muted-foreground mt-1">{card.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Tier Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-border bg-card p-5"
        >
          <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
            <Award size={14} className="text-primary" /> Tier Distribution
          </h3>
          {tierStats.length > 0 ? (
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tierStats}
                    dataKey="count"
                    nameKey="tier"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    innerRadius={40}
                    strokeWidth={2}
                    stroke="hsl(var(--background))"
                  >
                    {tierStats.map((entry) => (
                      <Cell key={entry.tier} fill={TIER_COLORS[entry.tier] || "hsl(var(--primary))"} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No tier data yet</p>
          )}
          <div className="flex flex-wrap gap-3 mt-3 justify-center">
            {tierStats.map(t => (
              <div key={t.tier} className="flex items-center gap-1.5 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: TIER_COLORS[t.tier] || "hsl(var(--primary))" }} />
                <span className="text-foreground font-medium">{t.tier}</span>
                <span className="text-muted-foreground">({t.count})</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Points Flow */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-border bg-card p-5"
        >
          <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp size={14} className="text-primary" /> Points Flow
          </h3>
          {(loyaltyOverview?.transactionsByType ?? []).length > 0 ? (
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={loyaltyOverview?.transactionsByType ?? []}>
                  <XAxis dataKey="type" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }}
                  />
                  <Bar dataKey="total" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No transactions yet</p>
          )}
        </motion.div>
      </div>

      {/* Top Referrers */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-2xl border border-border bg-card p-5"
      >
        <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
          <Link2 size={14} className="text-primary" /> Top Referrers
        </h3>
        {(referralStats?.topReferrers ?? []).length > 0 ? (
          <div className="space-y-2">
            {referralStats!.topReferrers.map((ref, i) => (
              <div key={ref.code} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                  #{i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground font-mono">{ref.code}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{ref.user_id.slice(0, 8)}...</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">{ref.uses}</p>
                  <p className="text-[10px] text-muted-foreground">uses</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">No referrals yet — share codes to get started</p>
        )}
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3">
          <span>Total referral codes: {referralStats?.totalCodes ?? 0}</span>
          <span>Total conversions: {referralStats?.totalUses ?? 0}</span>
        </div>
      </motion.div>
    </div>
  );
}
