import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Clock, MapPin, Users, Sparkles, Star, Heart, Share2, ChevronRight, Zap, Tag, Check } from "lucide-react";
import { useState, useCallback, useEffect, useRef } from "react";
import { hapticLight, hapticMedium, hapticSelection } from "@/lib/haptics";
import type { ExperiencePack } from "@/components/home/CuratedPackCard";
import type { Property } from "@/data/properties";
import OptimizedImage from "@/components/shared/OptimizedImage";

/* Gallery images mapped to moods — reliable Unsplash photos */
const moodGallery: Record<string, string[]> = {
  romantic: [
    "https://images.unsplash.com/photo-1529636798458-92182e662485?w=800&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop&q=80",
  ],
  party: [
    "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=600&fit=crop&q=80",
  ],
  chill: [
    "https://images.unsplash.com/photo-1475483768296-6163e08872a1?w=800&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&h=600&fit=crop&q=80",
  ],
  work: [
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=600&fit=crop&q=80",
  ],
};

function getGalleryImages(pack: ExperiencePack): string[] {
  // Prefer database image_urls, then fallback to mood gallery
  if (pack.imageUrls && pack.imageUrls.length > 0) {
    const valid = pack.imageUrls.filter(u => u && u.trim().length > 0);
    if (valid.length > 0) return valid;
  }
  return moodGallery[pack.mood[0]] || moodGallery.chill;
}

interface ExperienceDetailScreenProps {
  pack: ExperiencePack;
  property: Property;
  onBack: () => void;
  onBook: () => void;
}

export default function ExperienceDetailScreen({ pack, property, onBack, onBook }: ExperienceDetailScreenProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  const gallery = getGalleryImages(pack);
  const savings = pack.originalPrice ? pack.originalPrice - pack.price : 0;
  const savingsPct = pack.originalPrice ? Math.round((savings / pack.originalPrice) * 100) : 0;

  // Auto-advance hero gallery
  useEffect(() => {
    if (gallery.length <= 1) return;
    const timer = setInterval(() => setActiveIdx(p => (p + 1) % gallery.length), 4000);
    return () => clearInterval(timer);
  }, [gallery.length]);

  const handleShare = useCallback(() => {
    hapticLight();
    if (navigator.share) {
      navigator.share({ title: `${pack.name} — Hushh Experience`, text: `${pack.tagline}\n₹${pack.price}` }).catch(() => {});
    }
  }, [pack]);

  const handleLike = useCallback(() => {
    hapticMedium();
    setIsLiked(prev => !prev);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 30 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed inset-0 z-50 bg-background overflow-y-auto overflow-x-hidden"
      style={{ WebkitOverflowScrolling: "touch", overscrollBehavior: "contain" }}
    >
      {/* ── Hero Gallery ── */}
      <div ref={heroRef} className="relative w-full" style={{ height: "56vh", minHeight: "340px" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIdx}
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            <OptimizedImage
              src={gallery[activeIdx]}
              alt={pack.name}
              fill
              className="object-cover"
              sizes="100vw"
            />
          </motion.div>
        </AnimatePresence>

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent" style={{ height: "35%" }} />

        {/* Top bar */}
        <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-4" style={{ paddingTop: "max(env(safe-area-inset-top, 12px), 12px)" }}>
          <button
            onClick={() => { hapticLight(); onBack(); }}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-black/40 backdrop-blur-md active:scale-90 transition-transform"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <div className="flex gap-2">
            <button
              onClick={handleShare}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-black/40 backdrop-blur-md active:scale-90 transition-transform"
            >
              <Share2 size={18} className="text-white" />
            </button>
            <button
              onClick={handleLike}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-black/40 backdrop-blur-md active:scale-90 transition-transform"
            >
              <Heart size={18} className={isLiked ? "text-red-500 fill-red-500" : "text-white"} />
            </button>
          </div>
        </div>

        {/* Gallery indicator */}
        <div className="absolute bottom-28 inset-x-0 z-20 flex justify-center gap-1.5">
          {gallery.map((_, i) => (
            <button
              key={i}
              onClick={() => { hapticSelection(); setActiveIdx(i); }}
              className="transition-all duration-300"
              style={{
                width: i === activeIdx ? 24 : 6,
                height: 6,
                borderRadius: 3,
                background: i === activeIdx ? "hsl(var(--primary))" : "hsl(0 0% 100% / 0.45)",
              }}
            />
          ))}
        </div>

        {/* Hero content overlay */}
        <div className="absolute bottom-0 inset-x-0 z-10 px-5 pb-5">
          {/* Badges */}
          <div className="flex items-center gap-2 mb-2.5">
            {pack.badge && (
              <span className="text-[10px] font-bold text-primary-foreground bg-primary/90 px-2.5 py-1 rounded-full backdrop-blur-sm">
                {pack.badge}
              </span>
            )}
            {savings > 0 && (
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm" style={{ background: "hsl(142 71% 45% / 0.9)", color: "#fff" }}>
                {savingsPct}% OFF
              </span>
            )}
          </div>
          <div className="flex items-end gap-3">
            <span className="text-5xl drop-shadow-lg">{pack.emoji}</span>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-black text-foreground leading-tight drop-shadow-sm">{pack.name}</h1>
              <p className="text-sm text-muted-foreground mt-0.5 leading-snug">{pack.tagline}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 px-5 -mt-1 pb-32 space-y-5">

        {/* Quick info chips */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar -mx-5 px-5 pt-1" style={{ touchAction: "pan-x" }}>
          {[
            { icon: "🕐", text: pack.slot },
            { icon: "📦", text: `${pack.includes.length} items included` },
            ...(savings > 0 ? [{ icon: "💸", text: `Save ₹${savings}` }] : []),
            ...(pack.badge ? [{ icon: "⭐", text: pack.badge.replace(/[^\w\s]/g, "").trim() }] : []),
          ].map((chip, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 + i * 0.05 }}
              className="shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl border border-border bg-card"
            >
              <span className="text-sm">{chip.icon}</span>
              <span className="text-[11px] font-semibold text-foreground whitespace-nowrap">{chip.text}</span>
            </motion.div>
          ))}
        </div>

        {/* Pricing card */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl p-5 bg-card border border-border"
          style={{ boxShadow: "0 6px 24px -6px hsl(var(--foreground) / 0.06)" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-foreground">₹{pack.price.toLocaleString("en-IN")}</span>
                {pack.originalPrice && (
                  <span className="text-sm text-muted-foreground line-through">₹{pack.originalPrice.toLocaleString("en-IN")}</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">per session · all inclusive</p>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock size={12} />
                <span>{pack.slot}</span>
              </div>
              {savings > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color: "hsl(142 71% 45%)", background: "hsl(142 71% 45% / 0.1)" }}>
                  You save ₹{savings.toLocaleString("en-IN")}
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {/* What's included */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} className="text-primary" />
            <h2 className="text-base font-bold text-foreground">What's Included</h2>
          </div>
          <div className="grid grid-cols-1 gap-1.5">
            {pack.includes.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.26 + i * 0.035 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50"
              >
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-primary/10">
                  <Check size={13} className="text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">{item}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Venue info */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32 }}
          className="rounded-2xl p-4 bg-card border border-border"
        >
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={16} className="text-primary" />
            <h2 className="text-base font-bold text-foreground">Venue</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 relative">
              <OptimizedImage
                src={property.images[0]}
                alt={property.name}
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-foreground truncate">{property.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{property.location}</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-0.5">
                  <Star size={10} className="text-primary fill-primary" />
                  <span className="text-[10px] font-semibold text-foreground">{property.rating}</span>
                </div>
                <span className="text-[9px] text-muted-foreground">·</span>
                <div className="flex items-center gap-0.5">
                  <Users size={10} className="text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">Up to {property.capacity}</span>
                </div>
              </div>
            </div>
            <ChevronRight size={16} className="text-muted-foreground shrink-0" />
          </div>
        </motion.div>

        {/* Tags */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Tag size={14} className="text-primary" />
            <h2 className="text-sm font-bold text-foreground">Mood & Tags</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {pack.mood.map(m => (
              <span key={m} className="text-xs font-semibold px-3 py-1.5 rounded-full capitalize bg-primary/10 text-primary">
                {m}
              </span>
            ))}
            {pack.tags.map(t => (
              <span key={t} className="text-xs font-medium px-3 py-1.5 rounded-full text-muted-foreground bg-secondary">
                #{t}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Gallery grid — only show if multiple images */}
        {gallery.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.42 }}
          >
            <h2 className="text-base font-bold text-foreground mb-3">Gallery</h2>
            <div className="grid grid-cols-2 gap-2">
              {gallery.map((img, i) => (
                <div
                  key={i}
                  className="rounded-xl overflow-hidden aspect-[4/3] relative cursor-pointer active:scale-[0.97] transition-transform"
                  onClick={() => { hapticSelection(); setActiveIdx(i); heroRef.current?.scrollIntoView({ behavior: "smooth" }); }}
                >
                  <OptimizedImage src={img} alt={`${pack.name} ${i + 1}`} fill className="object-cover" sizes="50vw" />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* ── Sticky bottom CTA ── */}
      <div
        className="fixed bottom-0 inset-x-0 z-30 px-5 pb-[max(env(safe-area-inset-bottom,16px),16px)] pt-4"
        style={{
          background: "linear-gradient(to top, hsl(var(--background)) 60%, hsl(var(--background) / 0.9) 80%, hsl(var(--background) / 0))",
        }}
      >
        <div className="flex items-center gap-3 p-3 rounded-2xl" style={{
          background: "hsl(var(--card) / 0.85)",
          backdropFilter: "blur(20px) saturate(1.4)",
          WebkitBackdropFilter: "blur(20px) saturate(1.4)",
          border: "1px solid hsl(var(--border) / 0.4)",
          boxShadow: "0 -2px 20px -4px hsl(var(--foreground) / 0.1)",
        }}>
          <div className="flex-1 min-w-0 pl-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-foreground">₹{pack.price.toLocaleString("en-IN")}</span>
              {pack.originalPrice && (
                <span className="text-xs text-muted-foreground line-through">₹{pack.originalPrice.toLocaleString("en-IN")}</span>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">{pack.slot}</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => { hapticMedium(); onBook(); }}
            className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm active:scale-95 transition-transform"
            style={{
              boxShadow: "0 4px 16px -2px hsl(var(--primary) / 0.4), 0 0 0 1px hsl(var(--primary) / 0.2)",
            }}
          >
            <Zap size={15} />
            Book Now
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
