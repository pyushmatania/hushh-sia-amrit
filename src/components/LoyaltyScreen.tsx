import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Crown, Gift, Star, Zap, ChevronRight, Copy, Share2,
  Trophy, Ticket, Coffee, Sparkles, Check, Users, Loader2, Flame, Lock
} from "lucide-react";
import { useState, useEffect } from "react";
import { useLoyalty } from "@/hooks/use-loyalty";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import SpinWheel, { milestones as defaultMilestones, type Prize, type Milestone } from "./SpinWheel";

interface LoyaltyScreenProps {
  onBack: () => void;
}

const tiers = [
  { name: "Silver", minPts: 0, icon: "🥈", gradient: "from-zinc-400/20 to-zinc-500/5" },
  { name: "Gold", minPts: 200, icon: "🥇", gradient: "from-yellow-500/20 to-amber-400/5" },
  { name: "Platinum", minPts: 500, icon: "💎", gradient: "from-cyan-400/20 to-blue-400/5" },
  { name: "Diamond", minPts: 1000, icon: "👑", gradient: "from-purple-400/20 to-pink-400/5" },
];

const rewards = [
  { id: "r1", title: "₹100 Cashback", cost: 50, icon: Ticket, desc: "Apply to any booking", popular: true, emoji: "💸" },
  { id: "r2", title: "Free Slot Upgrade", cost: 100, icon: Zap, desc: "Upgrade to next slot tier", popular: false, emoji: "⚡" },
  { id: "r3", title: "Complimentary Snacks", cost: 30, icon: Coffee, desc: "Snack platter for 4 guests", popular: true, emoji: "🍿" },
  { id: "r4", title: "Priority Booking", cost: 150, icon: Crown, desc: "Book before public release", popular: false, emoji: "👑" },
  { id: "r5", title: "Birthday Special", cost: 200, icon: Gift, desc: "Free decoration setup", popular: false, emoji: "🎂" },
  { id: "r6", title: "₹500 Cashback", cost: 250, icon: Sparkles, desc: "Big savings on premium venues", popular: false, emoji: "✨" },
];

const earnMethods = [
  { icon: "🏨", title: "Book a venue", desc: "Earn 5 pts per ₹100 spent", pts: "+5/₹100" },
  { icon: "⭐", title: "Write a review", desc: "Earn 20 pts per review", pts: "+20" },
  { icon: "🎁", title: "Refer a friend", desc: "Earn 100 pts per signup", pts: "+100" },
  { icon: "🎂", title: "Birthday bonus", desc: "50 pts on your birthday", pts: "+50" },
  { icon: "🔥", title: "Streak bonus", desc: "Book 3 months in a row", pts: "+50" },
];

type Tab = "rewards" | "spin" | "milestones" | "earn" | "referral" | "history";

function TabChip({ active, label, icon, onClick }: { active: boolean; label: string; icon?: string; onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      className={`relative shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
        active ? "text-primary-foreground" : "text-muted-foreground"
      }`}
    >
      {active && (
        <motion.div
          layoutId="loyaltyTabBg"
          className="absolute inset-0 rounded-full"
          style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))" }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}
      <span className="relative flex items-center gap-1">
        {icon && <span>{icon}</span>}
        {label}
      </span>
    </motion.button>
  );
}

export default function LoyaltyScreen({ onBack }: LoyaltyScreenProps) {
  const { points, tier, transactions, loading, redeemPoints } = useLoyalty();
  const { toast } = useToast();
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("rewards");
  const [redeemed, setRedeemed] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>(defaultMilestones);
  const [spunToday, setSpunToday] = useState(() => {
    const last = localStorage.getItem("hushh_last_spin");
    return last === new Date().toDateString();
  });

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { data: spins } = await supabase
        .from("spin_history").select("id").eq("user_id", user.id)
        .gte("spun_at", today.toISOString()).limit(1);
      if (spins && spins.length > 0) setSpunToday(true);

      const { data: achieved } = await supabase
        .from("user_milestones").select("milestone_id").eq("user_id", user.id);
      if (achieved) {
        const achievedIds = new Set(achieved.map(a => a.milestone_id));
        setMilestones(defaultMilestones.map(m => ({ ...m, achieved: achievedIds.has(m.id) })));
      }
    };
    load();
  }, [user]);

  const handleSpinWin = async (prize: Prize) => {
    setSpunToday(true);
    localStorage.setItem("hushh_last_spin", new Date().toDateString());
    toast({ title: `🎉 You won ${prize.label}!`, description: `${prize.emoji} ${prize.points} bonus points added` });
    if (user) {
      await supabase.from("spin_history").insert({
        user_id: user.id, points_won: prize.points,
        prize_label: prize.label, prize_emoji: prize.emoji,
      });
    }
  };

  const referralCode = "HUSHH200";

  const currentTierIdx = tiers.findIndex((t, i) => {
    const next = tiers[i + 1];
    return !next || points < next.minPts;
  });
  const currentTier = tiers[currentTierIdx];
  const nextTier = tiers[currentTierIdx + 1];
  const tierProgress = nextTier
    ? ((points - currentTier.minPts) / (nextTier.minPts - currentTier.minPts)) * 100
    : 100;

  const handleRedeem = async (id: string, cost: number, title: string) => {
    if (cost > points || redeemed.has(id) || redeeming) return;
    setRedeeming(id);
    const success = await redeemPoints(cost, title, "🎁");
    if (success) {
      setRedeemed((prev) => new Set(prev).add(id));
      toast({ title: "🎉 Reward Claimed!", description: title });
    } else {
      toast({ title: "Not enough points", description: "Keep booking to earn more!", variant: "destructive" });
    }
    setRedeeming(null);
  };

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: "100%" }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: "100%" }}
      transition={{ type: "spring", damping: 28, stiffness: 300 }}
      className="fixed inset-0 z-50 bg-background overflow-y-auto"
    >
      {/* ─── Header ─── */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="flex items-center gap-3 px-4 pt-[max(12px,env(safe-area-inset-top))] pb-3 md:px-8 lg:px-16 xl:px-24 2xl:px-32 md:pt-6">
          <motion.button whileTap={{ scale: 0.9 }} onClick={onBack}
            className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center">
            <ArrowLeft size={18} className="text-foreground" />
          </motion.button>
          <div className="flex-1">
            <h1 className="text-base font-bold text-foreground md:text-xl">Rewards</h1>
          </div>
          <motion.div
            className="flex items-center gap-1.5 rounded-full px-3.5 py-2"
            style={{
              background: "linear-gradient(135deg, hsl(var(--gold) / 0.15), hsl(var(--primary) / 0.1))",
              border: "1px solid hsl(var(--gold) / 0.25)",
            }}
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Star size={13} className="text-gold fill-gold" style={{ color: "hsl(var(--gold))", fill: "hsl(var(--gold))" }} />
            <span className="text-sm font-black" style={{ color: "hsl(var(--gold))" }}>{points}</span>
          </motion.div>
        </div>
      </div>

      {/* ─── Tier Hero Card ─── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="mx-4 mt-4 rounded-3xl overflow-hidden relative md:mx-8 lg:mx-16 xl:mx-24 2xl:mx-32 md:max-w-3xl"
        style={{
          background: "linear-gradient(145deg, hsl(var(--card)), hsl(var(--secondary)))",
          border: "1px solid hsl(var(--border) / 0.5)",
        }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, hsl(var(--primary)), transparent)" }} />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, hsl(var(--gold)), transparent)" }} />

        <div className="relative p-5">
          {/* Tier badge + points */}
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-3">
              <motion.div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                style={{
                  background: "linear-gradient(135deg, hsl(var(--primary) / 0.2), hsl(var(--gold) / 0.1))",
                  border: "1px solid hsl(var(--primary) / 0.3)",
                }}
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                {currentTier.icon}
              </motion.div>
              <div>
                <p className="text-lg font-bold text-foreground">{currentTier.name}</p>
                <p className="text-[11px] text-muted-foreground">Member since 2024</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-foreground">{points}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">points</p>
            </div>
          </div>

          {/* Tier progress */}
          {nextTier && (
            <div className="space-y-2">
              <div className="flex justify-between text-[11px]">
                <span className="text-muted-foreground">{currentTier.icon} {currentTier.name}</span>
                <span className="text-muted-foreground">{nextTier.icon} {nextTier.name}</span>
              </div>
              <div className="h-3 rounded-full bg-secondary/80 overflow-hidden relative">
                <motion.div
                  className="h-full rounded-full relative"
                  style={{
                    background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--gold)))",
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(tierProgress, 100)}%` }}
                  transition={{ delay: 0.4, duration: 1, ease: "easeOut" }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-md" />
                </motion.div>
              </div>
              <p className="text-[11px] text-center text-muted-foreground">
                <span className="font-bold text-foreground">{nextTier.minPts - points}</span> points to {nextTier.name}
              </p>
            </div>
          )}

          {/* Tier steps */}
          <div className="flex items-center justify-between mt-5 pt-4 border-t border-border/20">
            {tiers.map((t, i) => {
              const isActive = i <= currentTierIdx;
              const isCurrent = i === currentTierIdx;
              return (
                <div key={t.name} className="flex flex-col items-center gap-1.5 relative">
                  {i > 0 && (
                    <div
                      className="absolute top-4 -left-[calc(50%+8px)] w-[calc(100%-16px)] h-0.5"
                      style={{
                        background: i <= currentTierIdx
                          ? "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--gold)))"
                          : "hsl(var(--border))",
                      }}
                    />
                  )}
                  <motion.div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-base relative z-[1] ${
                      isCurrent ? "ring-2 ring-primary/40 ring-offset-1 ring-offset-background" : ""
                    }`}
                    style={{
                      background: isActive
                        ? "linear-gradient(135deg, hsl(var(--primary) / 0.25), hsl(var(--gold) / 0.15))"
                        : "hsl(var(--secondary))",
                      border: isActive ? "1px solid hsl(var(--primary) / 0.3)" : "1px solid hsl(var(--border))",
                    }}
                    animate={isCurrent ? { scale: [1, 1.08, 1] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {t.icon}
                  </motion.div>
                  <span className={`text-[9px] font-semibold ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                    {t.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* ─── Tabs (scrollable) ─── */}
      <div className="mx-4 mt-4 mb-3 flex gap-1 p-1 rounded-full bg-card border border-border/50 overflow-x-auto no-scrollbar md:mx-8 lg:mx-16 xl:mx-24 2xl:mx-32 md:max-w-3xl md:flex-wrap md:overflow-visible">
        <TabChip active={tab === "rewards"} label="Rewards" icon="🎁" onClick={() => setTab("rewards")} />
        <TabChip active={tab === "spin"} label="Spin" icon="🎰" onClick={() => setTab("spin")} />
        <TabChip active={tab === "milestones"} label="Quests" icon="🏆" onClick={() => setTab("milestones")} />
        <TabChip active={tab === "earn"} label="Earn" icon="💰" onClick={() => setTab("earn")} />
        <TabChip active={tab === "referral"} label="Refer" icon="🤝" onClick={() => setTab("referral")} />
        <TabChip active={tab === "history"} label="History" icon="📋" onClick={() => setTab("history")} />
      </div>

      {/* ─── Tab Content ─── */}
      <div className="pb-[max(32px,env(safe-area-inset-bottom))]">
        <AnimatePresence mode="wait">
          {/* REWARDS */}
          {tab === "rewards" && (
            <motion.div key="rewards" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="px-4 space-y-3">
              {rewards.map((r, i) => {
                const canAfford = points >= r.cost;
                const isRedeemed = redeemed.has(r.id);
                return (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-2xl p-4 flex items-center gap-3 relative overflow-hidden"
                    style={{
                      background: isRedeemed
                        ? "hsl(var(--success) / 0.06)"
                        : "hsl(var(--card))",
                      border: isRedeemed
                        ? "1px solid hsl(var(--success) / 0.2)"
                        : "1px solid hsl(var(--border) / 0.5)",
                    }}
                  >
                    {r.popular && (
                      <div className="absolute top-0 right-0 bg-gold text-gold-foreground text-[8px] font-black px-2 py-0.5 rounded-bl-lg"
                        style={{ background: "hsl(var(--gold))", color: "hsl(var(--gold-foreground))" }}>
                        🔥 HOT
                      </div>
                    )}
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                      style={{ background: "hsl(var(--primary) / 0.1)" }}>
                      {r.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-foreground">{r.title}</h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{r.desc}</p>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleRedeem(r.id, r.cost, r.title)}
                      disabled={!canAfford || isRedeemed || redeeming === r.id}
                      className="shrink-0 px-3 py-2 rounded-xl text-xs font-bold transition-all"
                      style={{
                        background: isRedeemed
                          ? "hsl(var(--success) / 0.1)"
                          : canAfford
                            ? "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))"
                            : "hsl(var(--secondary))",
                        color: isRedeemed
                          ? "hsl(var(--success))"
                          : canAfford
                            ? "hsl(var(--primary-foreground))"
                            : "hsl(var(--muted-foreground))",
                      }}
                    >
                      {redeeming === r.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : isRedeemed ? (
                        <span className="flex items-center gap-1"><Check size={12} /> Done</span>
                      ) : canAfford ? (
                        <span className="flex items-center gap-1"><Star size={10} className="fill-current" /> {r.cost}</span>
                      ) : (
                        <span className="flex items-center gap-1"><Lock size={10} /> {r.cost}</span>
                      )}
                    </motion.button>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* SPIN */}
          {tab === "spin" && (
            <motion.div key="spin" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="px-4 py-4">
              <div className="rounded-3xl p-6 flex flex-col items-center relative overflow-hidden"
                style={{
                  background: "linear-gradient(180deg, hsl(var(--card)), hsl(var(--secondary)))",
                  border: "1px solid hsl(var(--border) / 0.5)",
                }}>
                {/* Decorative glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 rounded-full opacity-15"
                  style={{ background: "radial-gradient(circle, hsl(var(--primary)), transparent)" }} />

                <h3 className="text-lg font-bold text-foreground mb-0.5 relative">Daily Spin 🎰</h3>
                <p className="text-[11px] text-muted-foreground mb-6 relative">Spin once a day to win bonus points!</p>
                <SpinWheel disabled={spunToday} onWin={handleSpinWin} />
              </div>
            </motion.div>
          )}

          {/* MILESTONES / QUESTS */}
          {tab === "milestones" && (
            <motion.div key="milestones" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="px-4 space-y-3">
              <p className="text-xs text-muted-foreground mb-1">Complete quests to earn bonus rewards 🗡️</p>
              {milestones.map((ms, i) => {
                const progressPercent = ms.achieved ? 100 : Math.floor(Math.random() * 70 + 10);
                return (
                  <motion.div
                    key={ms.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="rounded-2xl p-4 relative overflow-hidden"
                    style={{
                      background: ms.achieved
                        ? "hsl(var(--success) / 0.06)"
                        : "hsl(var(--card))",
                      border: ms.achieved
                        ? "1px solid hsl(var(--success) / 0.2)"
                        : "1px solid hsl(var(--border) / 0.5)",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <motion.div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                        style={{
                          background: ms.achieved ? "hsl(var(--success) / 0.1)" : "hsl(var(--foreground) / 0.04)",
                        }}
                        animate={ms.achieved ? { rotate: [0, 10, -10, 0] } : {}}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {ms.emoji}
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-semibold text-foreground">{ms.title}</h4>
                          {ms.achieved && (
                            <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full"
                              style={{ background: "hsl(var(--success) / 0.1)", color: "hsl(var(--success))" }}>
                              ✅ Complete
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground">{ms.requirement}</p>
                        {/* Progress bar */}
                        {!ms.achieved && (
                          <div className="mt-2 h-1.5 rounded-full bg-secondary overflow-hidden">
                            <motion.div
                              className="h-full rounded-full"
                              style={{ background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--gold)))" }}
                              initial={{ width: 0 }}
                              animate={{ width: `${progressPercent}%` }}
                              transition={{ delay: i * 0.1, duration: 0.8 }}
                            />
                          </div>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-black" style={{ color: "hsl(var(--gold))" }}>+{ms.rewardPts}</p>
                        <p className="text-[9px] text-muted-foreground">pts</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* EARN */}
          {tab === "earn" && (
            <motion.div key="earn" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="px-4 space-y-3">
              <p className="text-xs text-muted-foreground mb-1">Ways to stack more points 🚀</p>
              {earnMethods.map((m, i) => (
                <motion.div
                  key={m.title}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-2xl p-4 flex items-center gap-3"
                  style={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border) / 0.5)",
                  }}
                >
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
                    style={{ background: "hsl(var(--primary) / 0.1)" }}>
                    {m.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{m.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{m.desc}</p>
                  </div>
                  <div className="shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-bold"
                    style={{ background: "hsl(var(--success) / 0.1)", color: "hsl(var(--success))" }}>
                    {m.pts}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* REFERRAL */}
          {tab === "referral" && (
            <motion.div key="referral" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="px-4">
              <div className="rounded-3xl p-6 text-center relative overflow-hidden"
                style={{
                  background: "linear-gradient(160deg, hsl(var(--card)), hsl(var(--secondary)))",
                  border: "1px solid hsl(var(--border) / 0.5)",
                }}>
                <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full opacity-10"
                  style={{ background: "radial-gradient(circle, hsl(var(--primary)), transparent)" }} />

                <motion.div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl"
                  style={{ background: "hsl(var(--primary) / 0.1)", border: "1px solid hsl(var(--primary) / 0.2)" }}
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  🤝
                </motion.div>
                <h3 className="text-xl font-bold text-foreground">Give ₹200, Get ₹200</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-[260px] mx-auto">
                  Share your code. When they book, you both earn ₹200 cashback!
                </p>

                <div className="mt-5 flex items-center gap-2 rounded-xl p-3"
                  style={{ background: "hsl(var(--secondary))" }}>
                  <div className="flex-1 text-center">
                    <p className="text-[9px] text-muted-foreground uppercase tracking-widest mb-1">Your Code</p>
                    <p className="text-xl font-black text-foreground tracking-[0.3em]">{referralCode}</p>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleCopyCode}
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
                    style={{
                      background: copied ? "hsl(var(--success) / 0.1)" : "hsl(var(--primary) / 0.1)",
                      color: copied ? "hsl(var(--success))" : "hsl(var(--primary))",
                    }}
                  >
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                  </motion.button>
                </div>

                <motion.button
                  whileTap={{ scale: 0.96 }}
                  className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold"
                  style={{
                    background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))",
                    color: "hsl(var(--primary-foreground))",
                    boxShadow: "0 4px 20px hsl(var(--primary) / 0.3)",
                  }}
                >
                  <Share2 size={16} /> Share with Friends
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* HISTORY */}
          {tab === "history" && (
            <motion.div key="history" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="px-4 space-y-2">
              {transactions.length === 0 && (
                <div className="rounded-2xl p-8 text-center"
                  style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border) / 0.5)" }}>
                  <Trophy size={36} className="text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm font-semibold text-foreground mb-1">No activity yet</p>
                  <p className="text-xs text-muted-foreground">Book a venue to start earning!</p>
                </div>
              )}
              {transactions.map((h, i) => (
                <motion.div
                  key={h.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="rounded-xl px-4 py-3 flex items-center gap-3"
                  style={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border) / 0.3)",
                  }}
                >
                  <span className="text-xl">{h.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{h.title}</p>
                    <p className="text-[11px] text-muted-foreground">{format(new Date(h.created_at), "MMM d, yyyy")}</p>
                  </div>
                  <span className={`text-sm font-bold ${
                    h.type === "earn" ? "text-success" : "text-destructive"
                  }`} style={{
                    color: h.type === "earn" ? "hsl(var(--success))" : "hsl(var(--destructive))",
                  }}>
                    {h.points > 0 ? "+" : ""}{h.points}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
