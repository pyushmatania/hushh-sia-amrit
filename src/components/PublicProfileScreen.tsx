import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Star, MapPin, Calendar, Heart, ShieldCheck,
  Award, Crown, Share2, MessageCircle, BadgeCheck, Loader2,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { overlaySlideUp, staggerContainer, staggerItem } from "@/lib/animations";
import { mockProfiles, mockUserReviews, type MockUserProfile } from "@/data/mock-users";
import { useDataMode } from "@/hooks/use-data-mode";

interface PublicProfile {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  tier: string;
  loyalty_points: number;
  created_at: string;
}

interface PublicReview {
  id: string;
  property_id: string;
  rating: number;
  content: string;
  photo_urls: string[];
  verified: boolean;
  created_at: string;
}

interface PublicProfileScreenProps {
  userId: string;
  onBack: () => void;
  onMessage?: () => void;
}

/* ── Skeleton Loader ── */
function ProfileSkeleton() {
  return (
    <div className="px-5 py-6 animate-pulse">
      <div className="flex flex-col items-center mb-6">
        <div className="w-24 h-24 rounded-full bg-secondary mb-3" />
        <div className="h-5 w-36 rounded-lg bg-secondary mb-2" />
        <div className="h-3 w-24 rounded-lg bg-secondary" />
      </div>
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[0, 1, 2].map(i => (
          <div key={i} className="rounded-2xl bg-secondary h-20" />
        ))}
      </div>
      <div className="space-y-3">
        {[0, 1, 2].map(i => (
          <div key={i} className="rounded-2xl bg-secondary h-24" />
        ))}
      </div>
    </div>
  );
}

/* ── Tier Badge ── */
function TierBadge({ tier }: { tier: string }) {
  const config: Record<string, { bg: string; text: string; icon: string }> = {
    Silver: { bg: "bg-secondary", text: "text-muted-foreground", icon: "🥈" },
    Gold: { bg: "bg-amber-500/10", text: "text-amber-600", icon: "🥇" },
    Platinum: { bg: "bg-violet-500/10", text: "text-violet-600", icon: "💎" },
    Diamond: { bg: "bg-sky-500/10", text: "text-sky-600", icon: "👑" },
  };
  const c = config[tier] || config.Silver;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${c.bg} ${c.text}`}>
      {c.icon} {tier}
    </span>
  );
}

export default function PublicProfileScreen({ userId, onBack, onMessage }: PublicProfileScreenProps) {
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [bookingCount, setBookingCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { isRealMode } = useDataMode();

  const fetchProfile = useCallback(async () => {
    // Check if this is a mock user — skip in real mode
    if (userId.startsWith("mock-") && !isRealMode) {
      const mockProfile = mockProfiles[userId];
      if (mockProfile) {
        setProfile(mockProfile as PublicProfile);
        setReviews(mockUserReviews as PublicReview[]);
        setBookingCount(5);
        setWishlistCount(8);
      }
      setLoading(false);
      return;
    }

    // In real mode, mock user IDs won't resolve — just close
    if (userId.startsWith("mock-")) {
      setLoading(false);
      return;
    }

    const [{ data: prof }, { data: revs }, { count: bookings }, { count: wishlists }] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("reviews").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(10),
      supabase.from("bookings").select("*", { count: "exact", head: true }).eq("user_id", userId),
      supabase.from("wishlists").select("*", { count: "exact", head: true }).eq("user_id", userId),
    ]);

    if (prof) setProfile(prof as PublicProfile);
    if (revs) setReviews(revs as PublicReview[]);
    setBookingCount(bookings || 0);
    setWishlistCount(wishlists || 0);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const memberSince = profile ? formatDistanceToNow(new Date(profile.created_at), { addSuffix: false }) : "";

  return (
    <motion.div
      variants={overlaySlideUp}
      initial="initial"
      animate="animate"
      exit="exit"
      className="fixed inset-0 z-50 bg-background overflow-y-auto"
      style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3 md:px-8 lg:px-16 xl:px-24 2xl:px-32">
          <button onClick={onBack} className="text-foreground active:scale-90 transition-transform">
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-lg font-bold text-foreground flex-1 md:text-2xl">Profile</h1>
          <button className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center active:scale-90 transition-transform">
            <Share2 size={16} className="text-foreground" />
          </button>
        </div>
      </div>

      {loading ? (
        <ProfileSkeleton />
      ) : profile ? (
        <motion.div variants={staggerContainer} initial="initial" animate="animate">
          {/* Avatar & Name */}
          <motion.div variants={staggerItem} className="flex flex-col items-center pt-8 pb-4 px-5">
            <div className="relative mb-3">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-secondary border-2 border-primary/30"
                style={{ boxShadow: "0 0 24px hsl(var(--primary) / 0.15)" }}>
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-primary/40">
                    {profile.display_name?.charAt(0).toUpperCase() || "?"}
                  </div>
                )}
              </div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary flex items-center justify-center shadow-md"
              >
                <BadgeCheck size={16} className="text-primary-foreground" />
              </motion.div>
            </div>

            <h2 className="text-xl font-bold text-foreground">{profile.display_name || "Guest"}</h2>
            {profile.location && (
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                <MapPin size={12} /> {profile.location}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <TierBadge tier={profile.tier} />
              <span className="text-[11px] text-muted-foreground">· Member for {memberSince}</span>
            </div>

            {profile.bio && (
              <p className="text-sm text-muted-foreground text-center mt-3 max-w-[280px] leading-relaxed">
                {profile.bio}
              </p>
            )}

            {/* Action buttons */}
            {onMessage && (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onMessage}
                className="mt-4 flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-semibold"
                style={{ boxShadow: "0 4px 16px hsl(var(--primary) / 0.25)" }}
              >
                <MessageCircle size={16} /> Message
              </motion.button>
            )}
          </motion.div>

          {/* Stats */}
          <motion.div variants={staggerItem} className="px-5 grid grid-cols-3 gap-3 mb-6 md:px-8 lg:px-16 xl:px-24 2xl:px-32 md:max-w-2xl md:mx-auto md:gap-4">
            {[
              { icon: Calendar, value: bookingCount.toString(), label: "Trips" },
              { icon: Star, value: reviews.length.toString(), label: "Reviews" },
              { icon: Heart, value: wishlistCount.toString(), label: "Wishlisted" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-border bg-secondary/40 p-3 text-center">
                <stat.icon size={18} className="text-primary mx-auto mb-1.5" />
                <p className="text-xl font-bold text-foreground">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground font-medium">{stat.label}</p>
              </div>
            ))}
          </motion.div>

          {/* Reviews */}
          <motion.div variants={staggerItem} className="px-5 mb-6 md:px-8 lg:px-16 xl:px-24 2xl:px-32">
            <h3 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
              <Star size={16} className="text-primary" /> Reviews ({reviews.length})
            </h3>
            {reviews.length > 0 ? (
              <div className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
                {reviews.map((review, i) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    className="rounded-2xl border border-border bg-secondary/40 p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5 bg-primary/10 rounded-lg px-2 py-1">
                          <Star size={11} className="fill-primary text-primary" />
                          <span className="text-xs font-bold text-foreground">{review.rating}</span>
                        </div>
                        {review.verified && (
                          <span className="flex items-center gap-0.5 text-[9px] font-bold text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                            <ShieldCheck size={10} /> Verified
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    {review.content && (
                      <p className="text-sm text-foreground/80 leading-relaxed line-clamp-3">{review.content}</p>
                    )}
                    {review.photo_urls.length > 0 && (
                      <div className="flex gap-1.5 mt-2 overflow-x-auto hide-scrollbar">
                        {review.photo_urls.map((url, pi) => (
                          <img key={pi} src={url} alt="" className="w-14 h-14 rounded-lg object-cover border border-border shrink-0" />
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 rounded-2xl border border-border bg-secondary/20">
                <Star size={28} className="text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No reviews yet</p>
              </div>
            )}
          </motion.div>

          {/* Achievements */}
          <motion.div variants={staggerItem} className="px-5 mb-8 md:px-8 lg:px-16 xl:px-24 2xl:px-32">
            <h3 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
              <Award size={16} className="text-primary" /> Achievements
            </h3>
            <div className="flex gap-3 overflow-x-auto hide-scrollbar md:flex-wrap md:overflow-visible">
              {[
                { icon: "🔥", title: "Early Adopter", desc: "Joined early" },
                { icon: "⭐", title: "5-Star Guest", desc: "Perfect rating" },
                ...(bookingCount >= 3 ? [{ icon: "🎉", title: "Party Starter", desc: "3+ bookings" }] : []),
                ...(reviews.length >= 3 ? [{ icon: "📝", title: "Reviewer", desc: "3+ reviews" }] : []),
              ].map((a, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + i * 0.08 }}
                  className="shrink-0 rounded-2xl border border-border bg-secondary/40 p-3 w-[120px] text-center"
                >
                  <span className="text-2xl block mb-1">{a.icon}</span>
                  <p className="text-xs font-bold text-foreground">{a.title}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{a.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      ) : (
        <div className="text-center py-20">
          <p className="text-muted-foreground">Profile not found</p>
        </div>
      )}
    </motion.div>
  );
}
