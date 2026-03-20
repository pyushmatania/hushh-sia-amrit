import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Copy, Share2, Users, Gift, Sparkles,
  Check, Loader2, ChevronRight, Crown,
} from "lucide-react";
import { useState } from "react";
import { useReferrals } from "@/hooks/use-referrals";
import { shareReferralCode } from "@/lib/share";
import { overlaySlideUp } from "@/lib/animations";

interface ReferralScreenProps {
  onBack: () => void;
}

export default function ReferralScreen({ onBack }: ReferralScreenProps) {
  const { referralCode, totalReferred, loading, generateCode } = useReferrals();
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);

  const handleCopy = async () => {
    if (!referralCode) return;
    try {
      await navigator.clipboard.writeText(referralCode.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleGenerate = async () => {
    setGenerating(true);
    await generateCode();
    setGenerating(false);
  };

  const handleShare = () => {
    if (referralCode) shareReferralCode(referralCode.code);
  };

  const rewards = [
    { icon: "🎁", title: "You get", points: "100 pts", desc: "When your friend books" },
    { icon: "🌟", title: "They get", points: "100 pts", desc: "On their first booking" },
    { icon: "👑", title: "Tier boost", points: "+1 level", desc: "After 5 referrals" },
  ];

  return (
    <motion.div
      variants={overlaySlideUp}
      initial="initial"
      animate="animate"
      exit="exit"
      className="fixed inset-0 z-50 bg-background overflow-y-auto"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={onBack} className="text-foreground active:scale-90 transition-transform">
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-lg font-bold text-foreground">Refer & Earn</h1>
        </div>
      </div>

      <div className="px-5 py-6">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center">
            <Gift size={36} className="text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Share the Love</h2>
          <p className="text-sm text-muted-foreground max-w-[280px] mx-auto">
            Invite friends to Hushh and you both earn reward points on their first booking!
          </p>
        </motion.div>

        {/* Rewards breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-2 mb-8"
        >
          {rewards.map((r, i) => (
            <div key={i} className="rounded-2xl border border-border bg-secondary/40 p-3 text-center">
              <span className="text-2xl block mb-1.5">{r.icon}</span>
              <p className="text-[10px] text-muted-foreground font-medium">{r.title}</p>
              <p className="text-base font-bold text-foreground">{r.points}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{r.desc}</p>
            </div>
          ))}
        </motion.div>

        {/* Referral Code Section */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl border border-border bg-secondary/40 p-5 mb-6"
        >
          <h3 className="text-sm font-semibold text-foreground mb-3">Your Referral Code</h3>

          {loading ? (
            <div className="flex justify-center py-4">
              <Loader2 size={24} className="animate-spin text-muted-foreground" />
            </div>
          ) : referralCode ? (
            <>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 bg-background rounded-xl px-4 py-3 border border-border font-mono text-lg font-bold text-foreground text-center tracking-widest">
                  {referralCode.code}
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleCopy}
                  className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center"
                >
                  {copied ? <Check size={18} className="text-primary" /> : <Copy size={18} className="text-primary" />}
                </motion.button>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleShare}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl font-semibold text-sm"
                style={{ boxShadow: "0 4px 16px hsl(var(--primary) / 0.25)" }}
              >
                <Share2 size={16} /> Share with Friends
              </motion.button>
            </>
          ) : (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleGenerate}
              disabled={generating}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl font-semibold text-sm disabled:opacity-60"
            >
              {generating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              {generating ? "Generating..." : "Generate My Code"}
            </motion.button>
          )}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-border bg-secondary/40 p-5"
        >
          <h3 className="text-sm font-semibold text-foreground mb-4">Your Referral Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 mx-auto mb-2 flex items-center justify-center">
                <Users size={20} className="text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground">{totalReferred}</p>
              <p className="text-[11px] text-muted-foreground">Friends Invited</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 mx-auto mb-2 flex items-center justify-center">
                <Crown size={20} className="text-amber-500" />
              </div>
              <p className="text-2xl font-bold text-foreground">{totalReferred * 100}</p>
              <p className="text-[11px] text-muted-foreground">Points Earned</p>
            </div>
          </div>
        </motion.div>

        {/* How it works */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mt-6"
        >
          <h3 className="text-sm font-semibold text-foreground mb-3">How it works</h3>
          <div className="space-y-3">
            {[
              { step: "1", title: "Share your code", desc: "Send your unique code to friends via WhatsApp, SMS, or social media" },
              { step: "2", title: "Friend signs up", desc: "They create an account and enter your code during sign up" },
              { step: "3", title: "Both earn rewards", desc: "When they complete their first booking, you both get 100 points!" },
            ].map((item) => (
              <div key={item.step} className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                  {item.step}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
