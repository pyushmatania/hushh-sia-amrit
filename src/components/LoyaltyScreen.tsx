import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Crown, Gift, Star, Zap, ChevronRight, Copy, Share2,
  Trophy, Ticket, Coffee, Sparkles, TrendingUp, Check, Users
} from "lucide-react";
import { useState } from "react";

interface LoyaltyScreenProps {
  onBack: () => void;
}

/* ── Tier Data ── */
const tiers = [
  { name: "Silver", minPts: 0, icon: "🥈", color: "text-muted-foreground" },
  { name: "Gold", minPts: 200, icon: "🥇", color: "text-gold" },
  { name: "Platinum", minPts: 500, icon: "💎", color: "text-primary" },
  { name: "Diamond", minPts: 1000, icon: "👑", color: "text-primary" },
];

const currentPoints = 320;
const currentTierIdx = tiers.findIndex((t, i) => {
  const next = tiers[i + 1];
  return !next || currentPoints < next.minPts;
});
const currentTier = tiers[currentTierIdx];
const nextTier = tiers[currentTierIdx + 1];
const tierProgress = nextTier
  ? ((currentPoints - currentTier.minPts) / (nextTier.minPts - currentTier.minPts)) * 100
  : 100;

/* ── History ── */
const history = [
  { id: "1", type: "earn" as const, title: "Booking: Firefly Villa", points: 50, date: "Mar 10", icon: "🏊" },
  { id: "2", type: "earn" as const, title: "Review submitted", points: 20, date: "Mar 10", icon: "⭐" },
  { id: "3", type: "redeem" as const, title: "₹100 cashback", points: -50, date: "Feb 28", icon: "💸" },
  { id: "4", type: "earn" as const, title: "Booking: Koraput Garden", points: 80, date: "Feb 28", icon: "🌌" },
  { id: "5", type: "earn" as const, title: "Referral bonus", points: 100, date: "Feb 14", icon: "🎁" },
  { id: "6", type: "earn" as const, title: "Booking: Ember Grounds", points: 120, date: "Feb 14", icon: "🔥" },
];

/* ── Rewards Catalog ── */
const rewards = [
  { id: "r1", title: "₹100 Cashback", cost: 50, icon: Ticket, desc: "Apply to any booking", popular: true },
  { id: "r2", title: "Free Slot Upgrade", cost: 100, icon: Zap, desc: "Upgrade to next slot tier", popular: false },
  { id: "r3", title: "Complimentary Snacks", cost: 30, icon: Coffee, desc: "Snack platter for 4 guests", popular: true },
  { id: "r4", title: "Priority Booking", cost: 150, icon: Crown, desc: "Book before public release", popular: false },
  { id: "r5", title: "Birthday Special", cost: 200, icon: Gift, desc: "Free decoration setup", popular: false },
  { id: "r6", title: "₹500 Cashback", cost: 250, icon: Sparkles, desc: "Big savings on premium venues", popular: false },
];

/* ── Earn Methods ── */
const earnMethods = [
  { icon: "🏨", title: "Book a venue", desc: "Earn 5 pts per ₹100 spent" },
  { icon: "⭐", title: "Write a review", desc: "Earn 20 pts per review" },
  { icon: "🎁", title: "Refer a friend", desc: "Earn 100 pts per signup" },
  { icon: "🎂", title: "Birthday bonus", desc: "Earn 50 pts on your birthday" },
  { icon: "🔥", title: "Streak bonus", desc: "Book 3 months in a row +50 pts" },
];

/* ── Tab Pill ── */
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
  const [tab, setTab] = useState<"rewards" | "history" | "earn" | "referral">("rewards");
  const [redeemed, setRedeemed] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);

  const referralCode = "AKASH200";

  const handleRedeem = (id: string, cost: number) => {
    if (cost > currentPoints || redeemed.has(id)) return;
    setRedeemed((prev) => new Set(prev).add(id));
  };

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
          <span className="text-sm font-bold text-primary">{currentPoints}</span>
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
            <p className="text-xs text-muted-foreground">Member since Jan 2025</p>
          </div>
        </div>

        {nextTier && (
          <>
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span>{currentPoints} pts</span>
              <span>{nextTier.name} at {nextTier.minPts} pts</span>
            </div>
            <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-primary to-gold"
                initial={{ width: 0 }}
                animate={{ width: `${tierProgress}%` }}
                transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              <span className="font-semibold text-foreground">{nextTier.minPts - currentPoints} pts</span> to unlock {nextTier.icon} {nextTier.name}
            </p>
          </>
        )}

        {/* Tier badges */}
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
        <TabPill active={tab === "earn"} label="Earn" onClick={() => setTab("earn")} />
        <TabPill active={tab === "referral"} label="Refer" onClick={() => setTab("referral")} />
        <TabPill active={tab === "history"} label="History" onClick={() => setTab("history")} />
      </motion.div>

      <AnimatePresence mode="wait">
        {/* Rewards Tab */}
        {tab === "rewards" && (
          <motion.div key="rewards" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-5 space-y-3">
            {rewards.map((r, i) => {
              const canAfford = currentPoints >= r.cost;
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
                      onClick={() => handleRedeem(r.id, r.cost)}
                      disabled={!canAfford || isRedeemed}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        isRedeemed
                          ? "bg-success/10 text-success border border-success/20"
                          : canAfford
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {isRedeemed ? (
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

        {/* Earn Tab */}
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

        {/* Referral Tab */}
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

              {/* Referral Code */}
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

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-border/40">
                {[
                  { value: "3", label: "Referred" },
                  { value: "2", label: "Joined" },
                  { value: "₹200", label: "Earned" },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="text-lg font-bold text-foreground">{s.value}</p>
                    <p className="text-[10px] text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* History Tab */}
        {tab === "history" && (
          <motion.div key="history" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="px-5 space-y-2">
            {history.map((h, i) => (
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
                  <p className="text-xs text-muted-foreground">{h.date}</p>
                </div>
                <span className={`text-sm font-bold ${h.type === "earn" ? "text-success" : "text-destructive"}`}>
                  {h.type === "earn" ? "+" : ""}{h.points}
                </span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
