import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Crown, Gift, Star, Zap, ChevronRight, Copy, Share2,
  Trophy, Ticket, Coffee, Sparkles, TrendingUp, Check, Users, Loader2, Target
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
  { name: "Silver", minPts: 0, icon: "🥈" },
  { name: "Gold", minPts: 200, icon: "🥇" },
  { name: "Platinum", minPts: 500, icon: "💎" },
  { name: "Diamond", minPts: 1000, icon: "👑" },
];

const rewards = [
  { id: "r1", title: "₹100 Cashback", cost: 50, icon: Ticket, desc: "Apply to any booking", popular: true },
  { id: "r2", title: "Free Slot Upgrade", cost: 100, icon: Zap, desc: "Upgrade to next slot tier", popular: false },
  { id: "r3", title: "Complimentary Snacks", cost: 30, icon: Coffee, desc: "Snack platter for 4 guests", popular: true },
  { id: "r4", title: "Priority Booking", cost: 150, icon: Crown, desc: "Book before public release", popular: false },
  { id: "r5", title: "Birthday Special", cost: 200, icon: Gift, desc: "Free decoration setup", popular: false },
  { id: "r6", title: "₹500 Cashback", cost: 250, icon: Sparkles, desc: "Big savings on premium venues", popular: false },
];

const earnMethods = [
  { icon: "🏨", title: "Book a venue", desc: "Earn 5 pts per ₹100 spent" },
  { icon: "⭐", title: "Write a review", desc: "Earn 20 pts per review" },
  { icon: "🎁", title: "Refer a friend", desc: "Earn 100 pts per signup" },
  { icon: "🎂", title: "Birthday bonus", desc: "Earn 50 pts on your birthday" },
  { icon: "🔥", title: "Streak bonus", desc: "Book 3 months in a row +50 pts" },
];

function TabPill({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`relative px-4 py-2 rounded-full text-sm font-semibold transition-all ${active ? "text-primary-foreground" : "text-muted-foreground"}`}>
      {active && (
        <motion.div layoutId="loyaltyTab" className="absolute inset-0 bg-primary rounded-full" transition={{ type: "spring", stiffness: 400, damping: 30 }} />
      )}
      <span className="relative">{label}</span>
    </button>
  );
}

export default function LoyaltyScreen({ onBack }: LoyaltyScreenProps) {
  const { points, tier, transactions, loading, redeemPoints } = useLoyalty();
  const { toast } = useToast();
  const { user } = useAuth();
  const [tab, setTab] = useState<"rewards" | "history" | "earn" | "referral" | "spin" | "milestones">("rewards");
  const [redeemed, setRedeemed] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>(defaultMilestones);
  const [spunToday, setSpunToday] = useState(() => {
    const last = localStorage.getItem("hushh_last_spin");
    return last === new Date().toDateString();
  });

  // Load achieved milestones from DB
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      // Check spin history for today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { data: spins } = await supabase
        .from("spin_history")
        .select("id")
        .eq("user_id", user.id)
        .gte("spun_at", today.toISOString())
        .limit(1);
      if (spins && spins.length > 0) setSpunToday(true);

      // Load milestones
      const { data: achieved } = await supabase
        .from("user_milestones")
        .select("milestone_id")
        .eq("user_id", user.id);
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
        user_id: user.id,
        points_won: prize.points,
        prize_label: prize.label,
        prize_emoji: prize.emoji,
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
      className="fixed inset-0 z-50 bg-background overflow-y-auto pb-8"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-[max(12px,env(safe-area-inset-top))] pb-3">
        <motion.button whileTap={{ scale: 0.9 }} onClick={onBack} className="w-10 h-10 rounded-full glass flex items-center justify-center">
          <ArrowLeft size={20} className="text-foreground" />
        </motion.button>
        <h1 className="text-lg font-bold text-foreground flex-1">Loyalty & Rewards</h1>
        <div className="flex items-center gap-1 bg-primary/10 border border-primary/20 rounded-full px-3 py-1.5">
          <Star size={14} className="text-primary fill-primary" />
          <span className="text-sm font-bold text-primary">{points}</span>
        </div>
      </div>

      {/* Tier Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mx-5 mt-2 rounded-3xl bg-gradient-to-br from-primary/20 via-accent/10 to-gold/10 border border-primary/20 p-5"
      >
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">{currentTier.icon}</span>
          <div>
            <p className="text-xl font-bold text-foreground">{currentTier.name} Member</p>
            <p className="text-xs text-muted-foreground">{tier} tier · {points} pts</p>
          </div>
        </div>

        {nextTier && (
          <>
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span>{points} pts</span>
              <span>{nextTier.name} at {nextTier.minPts} pts</span>
            </div>
            <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-primary to-gold"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(tierProgress, 100)}%` }}
                transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              <span className="font-semibold text-foreground">{nextTier.minPts - points} pts</span> to unlock {nextTier.icon} {nextTier.name}
            </p>
          </>
        )}

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/30">
          {tiers.map((t, i) => (
            <div key={t.name} className="flex flex-col items-center gap-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                i <= currentTierIdx ? "bg-primary/20 border border-primary/40" : "bg-secondary border border-border"
              }`}>
                {t.icon}
              </div>
              <span className={`text-[10px] font-semibold ${i <= currentTierIdx ? "text-foreground" : "text-muted-foreground"}`}>{t.name}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mx-5 mt-5 mb-4 flex gap-1 p-1 rounded-full border border-border bg-secondary/50"
      >
        <TabPill active={tab === "rewards"} label="Rewards" onClick={() => setTab("rewards")} />
        <TabPill active={tab === "spin"} label="🎰 Spin" onClick={() => setTab("spin")} />
        <TabPill active={tab === "milestones"} label="🏆" onClick={() => setTab("milestones")} />
        <TabPill active={tab === "earn"} label="Earn" onClick={() => setTab("earn")} />
        <TabPill active={tab === "referral"} label="Refer" onClick={() => setTab("referral")} />
        <TabPill active={tab === "history"} label="History" onClick={() => setTab("history")} />
      </motion.div>

      <AnimatePresence mode="wait">
        {tab === "rewards" && (
          <motion.div key="rewards" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-5 space-y-3">
            {rewards.map((r, i) => {
              const canAfford = points >= r.cost;
              const isRedeemed = redeemed.has(r.id);
              return (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="glass rounded-2xl p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <r.icon size={22} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-foreground">{r.title}</h4>
                        {r.popular && (
                          <span className="text-[9px] font-bold bg-gold text-gold-foreground px-1.5 py-0.5 rounded-full">HOT</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{r.desc}</p>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleRedeem(r.id, r.cost, r.title)}
                      disabled={!canAfford || isRedeemed || redeeming === r.id}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        isRedeemed
                          ? "bg-success/10 text-success border border-success/20"
                          : canAfford
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {redeeming === r.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : isRedeemed ? (
                        <span className="flex items-center gap-1"><Check size={12} /> Claimed</span>
                      ) : (
                        <span className="flex items-center gap-1"><Star size={10} className="fill-current" /> {r.cost}</span>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {tab === "earn" && (
          <motion.div key="earn" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="px-5 space-y-3">
            <p className="text-xs text-muted-foreground mb-2">Ways to earn loyalty points</p>
            {earnMethods.map((m, i) => (
              <motion.div
                key={m.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="glass rounded-2xl p-4 flex items-center gap-3"
              >
                <span className="text-2xl">{m.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{m.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{m.desc}</p>
                </div>
                <ChevronRight size={16} className="text-muted-foreground" />
              </motion.div>
            ))}
          </motion.div>
        )}

        {tab === "referral" && (
          <motion.div key="referral" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="px-5">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-3xl p-6 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Users size={28} className="text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Give ₹200, Get ₹200</h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                Share your referral code with friends. When they book their first experience, you both get ₹200 cashback!
              </p>

              <div className="mt-5 flex items-center gap-2 bg-secondary rounded-xl p-3">
                <div className="flex-1 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Your Code</p>
                  <p className="text-xl font-bold text-foreground tracking-widest">{referralCode}</p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleCopyCode}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                    copied ? "bg-success/10 text-success" : "bg-primary/10 text-primary"
                  }`}
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                </motion.button>
              </div>

              <motion.button
                whileTap={{ scale: 0.96 }}
                className="mt-4 w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl py-3.5 text-sm font-semibold"
              >
                <Share2 size={16} /> Share with Friends
              </motion.button>
            </motion.div>
          </motion.div>
        )}

        {tab === "history" && (
          <motion.div key="history" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="px-5 space-y-2">
            {transactions.length === 0 && (
              <div className="glass rounded-2xl p-8 text-center">
                <Trophy size={36} className="text-muted-foreground mx-auto mb-3" />
                <p className="text-sm font-semibold text-foreground mb-1">No activity yet</p>
                <p className="text-xs text-muted-foreground">Book a venue to start earning points!</p>
              </div>
            )}
            {transactions.map((h, i) => (
              <motion.div
                key={h.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="glass rounded-xl px-4 py-3 flex items-center gap-3"
              >
                <span className="text-xl">{h.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{h.title}</p>
                  <p className="text-xs text-muted-foreground">{format(new Date(h.created_at), "MMM d, yyyy")}</p>
                </div>
                <span className={`text-sm font-bold ${h.type === "earn" ? "text-success" : "text-destructive"}`}>
                  {h.points > 0 ? "+" : ""}{h.points}
                </span>
              </motion.div>
            ))}
          </motion.div>
        )}

        {tab === "spin" && (
          <motion.div key="spin" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="px-5 py-4">
            <div className="glass rounded-3xl p-6 flex flex-col items-center">
              <h3 className="text-lg font-bold text-foreground mb-1">Daily Spin</h3>
              <p className="text-xs text-muted-foreground mb-5">Spin once a day to win bonus points!</p>
              <SpinWheel
                disabled={spunToday}
                onWin={handleSpinWin}
              />
            </div>
          </motion.div>
        )}

        {tab === "milestones" && (
          <motion.div key="milestones" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="px-5 space-y-3">
            <p className="text-xs text-muted-foreground mb-1">Complete milestones to earn bonus rewards</p>
            {milestones.map((ms, i) => (
              <motion.div
                key={ms.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`glass rounded-2xl p-4 flex items-center gap-3 ${ms.achieved ? "border border-success/20" : ""}`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${
                  ms.achieved ? "bg-success/10" : "bg-foreground/[0.04]"
                }`}>
                  {ms.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-foreground">{ms.title}</h4>
                    {ms.achieved && (
                      <span className="text-[9px] font-bold bg-success/10 text-success px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                        <Check size={8} /> Done
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{ms.requirement}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-primary">+{ms.rewardPts}</p>
                  <p className="text-[9px] text-muted-foreground">pts</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
