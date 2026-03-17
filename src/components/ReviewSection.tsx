import { motion, AnimatePresence } from "framer-motion";
import { Star, ThumbsUp, Send, X, Camera } from "lucide-react";
import { useState, useMemo } from "react";
import type { PropertyReview } from "@/data/properties";

interface ReviewSectionProps {
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

/* ── Single review card ── */
function ReviewCard({ review, index }: { review: PropertyReview; index: number }) {
  const [liked, setLiked] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="glass rounded-2xl p-4"
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
export default function ReviewSection({ reviews, rating, reviewCount, onAddReview }: ReviewSectionProps) {
  const [showAll, setShowAll] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");

  const breakdown = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    reviews.forEach((r) => {
      if (r.rating >= 1 && r.rating <= 5) counts[r.rating - 1]++;
    });
    return counts;
  }, [reviews]);

  const displayed = showAll ? reviews : reviews.slice(0, 3);

  const handleSubmit = () => {
    if (newRating === 0 || !newComment.trim()) return;
    onAddReview?.({ rating: newRating, comment: newComment.trim() });
    setNewRating(0);
    setNewComment("");
    setShowForm(false);
  };

  const ratingLabel = rating >= 4.8 ? "Exceptional" : rating >= 4.5 ? "Excellent" : rating >= 4.0 ? "Great" : "Good";

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
            {rating}
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
            <RatingBar key={stars} stars={stars} count={breakdown[stars - 1]} total={reviews.length} />
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
            <div className="glass rounded-2xl p-4 space-y-4">
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
                className="w-full bg-secondary rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none resize-none min-h-[100px]"
                maxLength={500}
              />

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">{newComment.length}/500</span>
                <motion.button
                  onClick={handleSubmit}
                  disabled={newRating === 0 || !newComment.trim()}
                  whileTap={{ scale: 0.93 }}
                  className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-40 transition-all"
                >
                  <Send size={14} /> Submit
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Review list */}
      <div className="space-y-3 mb-4">
        {displayed.map((review, i) => (
          <ReviewCard key={review.id} review={review} index={i} />
        ))}
      </div>

      {reviews.length > 3 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-foreground underline underline-offset-2 text-sm font-semibold flex items-center gap-1 mb-6"
        >
          {showAll ? "Show fewer reviews" : `Show all ${reviews.length} reviews`}
        </button>
      )}
    </div>
  );
}
