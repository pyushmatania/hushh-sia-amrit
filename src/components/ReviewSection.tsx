import { motion, AnimatePresence } from "framer-motion";
import { Star, ThumbsUp, Send, X, Camera, Image, ShieldCheck, MessageSquare, Loader2 } from "lucide-react";
import { useState, useMemo, useRef } from "react";
import { useReviews, type Review } from "@/hooks/use-reviews";
import { useAuth } from "@/hooks/use-auth";
import { formatDistanceToNow } from "date-fns";
import type { PropertyReview } from "@/data/properties";
import PublicProfileScreen from "./PublicProfileScreen";

interface ReviewSectionProps {
  propertyId: string;
  reviews: PropertyReview[];
  rating: number;
  reviewCount: number;
  onAddReview?: (review: { rating: number; comment: string }) => void;
}

/* ── Rating breakdown bar ── */
function RatingBar({ stars, count, total }: { stars: number; count: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground w-4 text-right">{stars}</span>
      <Star size={10} className="fill-foreground text-foreground shrink-0" />
      <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ delay: 0.2 + stars * 0.05, duration: 0.5, ease: "easeOut" }}
        />
      </div>
      <span className="text-[11px] text-muted-foreground w-6 text-right">{count}</span>
    </div>
  );
}

/* ── Interactive star picker ── */
function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <motion.button
          key={n}
          type="button"
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
          whileTap={{ scale: 1.3, rotate: 15 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
          className="p-0.5"
        >
          <Star
            size={28}
            className={`transition-colors duration-150 ${
              n <= (hover || value)
                ? "fill-primary text-primary"
                : "fill-transparent text-muted-foreground/40"
            }`}
          />
        </motion.button>
      ))}
    </div>
  );
}

/* ── Photo thumbnail grid ── */
function PhotoGrid({ urls, onTap }: { urls: string[]; onTap: (url: string) => void }) {
  if (urls.length === 0) return null;
  return (
    <div className="flex gap-1.5 mt-2.5 overflow-x-auto hide-scrollbar">
      {urls.map((url, i) => (
        <motion.img
          key={i}
          src={url}
          alt={`Review photo ${i + 1}`}
          onClick={() => onTap(url)}
          className="w-16 h-16 rounded-lg object-cover cursor-pointer border border-border shrink-0"
          whileTap={{ scale: 0.95 }}
        />
      ))}
    </div>
  );
}

/* ── Image viewer ── */
function ImageViewer({ url, onClose }: { url: string; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center"
      onClick={onClose}
    >
      <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center" onClick={onClose}>
        <X size={20} className="text-white" />
      </button>
      <img src={url} alt="" className="max-w-[90vw] max-h-[80vh] object-contain rounded-lg" />
    </motion.div>
  );
}

/* ── Single review card (DB-backed) ── */
function DBReviewCard({ review, index, onImageTap, onProfileTap }: { review: Review; index: number; onImageTap: (url: string) => void; onProfileTap?: (userId: string) => void }) {
  const [liked, setLiked] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="rounded-2xl p-4 bg-secondary/40 border border-border"
    >
      <div className="flex items-center gap-2.5 mb-2.5">
        <button onClick={() => onProfileTap?.(review.user_id)} className="shrink-0">
          {review.user_avatar ? (
            <img src={review.user_avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-lg">
              {review.user_name.charAt(0).toUpperCase()}
            </div>
          )}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <button onClick={() => onProfileTap?.(review.user_id)} className="text-sm font-semibold text-foreground hover:underline">
              {review.user_name}
            </button>
            {review.verified && (
              <span className="flex items-center gap-0.5 text-[9px] font-bold text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                <ShieldCheck size={10} /> Verified Stay
              </span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground">
            {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
          </p>
        </div>
        <div className="flex items-center gap-0.5 bg-secondary rounded-lg px-2 py-1">
          <Star size={11} className="fill-primary text-primary" />
          <span className="text-xs font-semibold text-foreground">{review.rating}</span>
        </div>
      </div>

      {review.content && (
        <p className="text-sm text-foreground/80 leading-relaxed">{review.content}</p>
      )}

      {/* Review photos */}
      <PhotoGrid urls={review.photo_urls} onTap={onImageTap} />

      {/* Host response */}
      {review.response && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 ml-4 pl-3 border-l-2 border-primary/30 bg-primary/[0.03] rounded-r-xl py-2.5 pr-3"
        >
          <div className="flex items-center gap-1.5 mb-1">
            <MessageSquare size={12} className="text-primary" />
            <span className="text-[11px] font-bold text-foreground">Response from {review.response.host_name}</span>
          </div>
          <p className="text-[12px] text-foreground/70 leading-relaxed">{review.response.content}</p>
          <p className="text-[10px] text-muted-foreground mt-1">
            {formatDistanceToNow(new Date(review.response.created_at), { addSuffix: true })}
          </p>
        </motion.div>
      )}

      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-border/40">
        <motion.button
          onClick={() => setLiked(!liked)}
          whileTap={{ scale: 1.15 }}
          className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
            liked ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <ThumbsUp size={13} className={liked ? "fill-primary" : ""} />
          Helpful
        </motion.button>
      </div>
    </motion.div>
  );
}

/* ── Legacy review card (static data) ── */
function LegacyReviewCard({ review, index }: { review: PropertyReview; index: number }) {
  const [liked, setLiked] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="rounded-2xl p-4 bg-secondary/40 border border-border"
    >
      <div className="flex items-center gap-2.5 mb-2.5">
        <span className="text-2xl">{review.avatar}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{review.name}</p>
          <p className="text-[11px] text-muted-foreground">{review.date}</p>
        </div>
        <div className="flex items-center gap-0.5 bg-secondary rounded-lg px-2 py-1">
          <Star size={11} className="fill-primary text-primary" />
          <span className="text-xs font-semibold text-foreground">{review.rating}</span>
        </div>
      </div>
      <p className="text-sm text-foreground/80 leading-relaxed">{review.comment}</p>
      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-border/40">
        <motion.button
          onClick={() => setLiked(!liked)}
          whileTap={{ scale: 1.15 }}
          className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
            liked ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <ThumbsUp size={13} className={liked ? "fill-primary" : ""} />
          Helpful
        </motion.button>
      </div>
    </motion.div>
  );
}

/* ── Main section ── */
export default function ReviewSection({ propertyId, reviews: staticReviews, rating: staticRating, reviewCount: staticCount, onAddReview }: ReviewSectionProps) {
  const { user } = useAuth();
  const { reviews: dbReviews, loading, submitting, submitReview, stats } = useReviews(propertyId);
  const [showAll, setShowAll] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Merge DB + static reviews for display
  const hasDbReviews = dbReviews.length > 0;
  const rating = hasDbReviews ? Math.round(stats.average * 10) / 10 : staticRating;
  const reviewCount = hasDbReviews ? stats.count + staticCount : staticCount;

  const breakdown = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    staticReviews.forEach((r) => {
      if (r.rating >= 1 && r.rating <= 5) counts[r.rating - 1]++;
    });
    // Add DB review counts
    stats.breakdown.forEach((c, i) => { counts[i] += c; });
    return counts;
  }, [staticReviews, stats.breakdown]);

  const totalReviews = staticReviews.length + dbReviews.length;
  const displayedDbReviews = showAll ? dbReviews : dbReviews.slice(0, 3);
  const displayedStaticReviews = showAll ? staticReviews : staticReviews.slice(0, Math.max(0, 3 - dbReviews.length));

  const handlePhotoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(f => f.type.startsWith("image/"));
    if (files.length + photos.length > 5) return; // max 5 photos
    const newPhotos = [...photos, ...files];
    setPhotos(newPhotos);
    setPhotoPreviewUrls(newPhotos.map(f => URL.createObjectURL(f)));
    e.target.value = "";
  };

  const removePhoto = (idx: number) => {
    URL.revokeObjectURL(photoPreviewUrls[idx]);
    const newPhotos = photos.filter((_, i) => i !== idx);
    setPhotos(newPhotos);
    setPhotoPreviewUrls(newPhotos.map(f => URL.createObjectURL(f)));
  };

  const handleSubmit = async () => {
    if (newRating === 0 || !newComment.trim()) return;

    if (user) {
      await submitReview(newRating, newComment.trim(), photos);
    }
    // Also fire legacy callback
    onAddReview?.({ rating: newRating, comment: newComment.trim() });

    setNewRating(0);
    setNewComment("");
    setPhotos([]);
    setPhotoPreviewUrls([]);
    setShowForm(false);
  };

  const ratingLabel = rating >= 4.8 ? "Exceptional" : rating >= 4.5 ? "Excellent" : rating >= 4.0 ? "Great" : rating >= 3.0 ? "Good" : "Fair";

  return (
    <div>
      {/* Header with big score */}
      <div className="flex items-start gap-5 mb-5">
        <div className="text-center">
          <motion.span
            className="text-5xl font-bold text-foreground block"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            {rating.toFixed(1)}
          </motion.span>
          <div className="flex items-center justify-center gap-0.5 mt-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star
                key={n}
                size={12}
                className={n <= Math.round(rating) ? "fill-primary text-primary" : "fill-transparent text-muted-foreground/30"}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-1">{reviewCount} reviews</p>
        </div>

        <div className="flex-1 space-y-1.5">
          <p className="text-sm font-semibold text-foreground mb-2">{ratingLabel}</p>
          {[5, 4, 3, 2, 1].map((stars) => (
            <RatingBar key={stars} stars={stars} count={breakdown[stars - 1]} total={totalReviews} />
          ))}
        </div>
      </div>

      {/* Write a review button */}
      <motion.button
        onClick={() => setShowForm(!showForm)}
        whileTap={{ scale: 0.96 }}
        className="w-full flex items-center justify-center gap-2 rounded-xl border border-border py-3 text-sm font-semibold text-foreground hover:border-foreground/40 transition-all mb-5"
      >
        <Star size={16} className="text-primary" />
        Write a Review
      </motion.button>

      {/* Review form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-5"
          >
            <div className="rounded-2xl p-4 space-y-4 bg-secondary/40 border border-border">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-foreground">Your Rating</h4>
                <button onClick={() => setShowForm(false)} className="text-muted-foreground">
                  <X size={16} />
                </button>
              </div>

              <div className="flex justify-center">
                <StarPicker value={newRating} onChange={setNewRating} />
              </div>

              {newRating > 0 && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center text-xs text-muted-foreground"
                >
                  {newRating === 5 ? "Amazing! ✨" : newRating === 4 ? "Great experience!" : newRating === 3 ? "It was okay" : newRating === 2 ? "Could be better" : "Not good"}
                </motion.p>
              )}

              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share details of your experience..."
                className="w-full bg-background rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none resize-none min-h-[100px] border border-border focus:border-primary/30 transition-colors"
                maxLength={500}
              />

              {/* Photo upload */}
              <div>
                <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoAdd} />
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={photos.length >= 5}
                    className="flex items-center gap-1.5 text-xs font-medium text-primary px-3 py-2 rounded-lg bg-primary/5 border border-primary/20 disabled:opacity-40 active:scale-95 transition-transform"
                  >
                    <Camera size={14} /> Add Photos ({photos.length}/5)
                  </button>
                </div>
                {photoPreviewUrls.length > 0 && (
                  <div className="flex gap-2 mt-2 overflow-x-auto hide-scrollbar">
                    {photoPreviewUrls.map((url, i) => (
                      <div key={i} className="relative shrink-0">
                        <img src={url} alt="" className="w-16 h-16 rounded-lg object-cover border border-border" />
                        <button
                          onClick={() => removePhoto(i)}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-foreground/70 text-background flex items-center justify-center"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">{newComment.length}/500</span>
                <motion.button
                  onClick={handleSubmit}
                  disabled={newRating === 0 || !newComment.trim() || submitting}
                  whileTap={{ scale: 0.93 }}
                  className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-40 transition-all"
                >
                  {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  {submitting ? "Posting..." : "Submit"}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DB-backed review list */}
      {dbReviews.length > 0 && (
        <div className="space-y-3 mb-3">
          {displayedDbReviews.map((review, i) => (
            <DBReviewCard key={review.id} review={review} index={i} onImageTap={setViewingImage} />
          ))}
        </div>
      )}

      {/* Legacy static review list */}
      <div className="space-y-3 mb-4">
        {displayedStaticReviews.map((review, i) => (
          <LegacyReviewCard key={review.id} review={review} index={i + dbReviews.length} />
        ))}
      </div>

      {totalReviews > 3 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-foreground underline underline-offset-2 text-sm font-semibold flex items-center gap-1 mb-6"
        >
          {showAll ? "Show fewer reviews" : `Show all ${totalReviews} reviews`}
        </button>
      )}

      {/* Fullscreen image viewer */}
      <AnimatePresence>
        {viewingImage && <ImageViewer url={viewingImage} onClose={() => setViewingImage(null)} />}
      </AnimatePresence>
    </div>
  );
}
