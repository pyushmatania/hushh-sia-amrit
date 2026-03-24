import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Clock, MapPin, Users, Sparkles, Star, Heart, Share2, ChevronRight, Zap, Tag, Check } from "lucide-react";
import { useState, useCallback } from "react";
import { hapticLight, hapticMedium, hapticSelection } from "@/lib/haptics";
import type { ExperiencePack } from "@/components/home/CuratedPackCard";
import type { Property } from "@/data/properties";
import OptimizedImage from "@/components/shared/OptimizedImage";


/* Gallery images mapped to moods */
const moodGallery: Record<string, string[]> = {
  romantic: [
    "https://images.unsplash.com/photo-1529636798458-92182e662485?w=600&h=400&fit=crop&q=80",
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop&q=80",
    "https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=600&h=400&fit=crop&q=80",
    "https://images.unsplash.com/photo-1549465220-1a8b9238f4e1?w=600&h=400&fit=crop&q=80",
  ],
  party: [
    "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&h=400&fit=crop&q=80",
    "https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=600&h=400&fit=crop&q=80",
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&h=400&fit=crop&q=80",
    "https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=600&h=400&fit=crop&q=80",
  ],
  chill: [
    "https://images.unsplash.com/photo-1475483768296-6163e08872a1?w=600&h=400&fit=crop&q=80",
    "https://images.unsplash.com/photo-1514517220017-8ce97a34a7b6?w=600&h=400&fit=crop&q=80",
    "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=600&h=400&fit=crop&q=80",
    "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&h=400&fit=crop&q=80",
  ],
  work: [
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop&q=80",
    "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600&h=400&fit=crop&q=80",
    "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&h=400&fit=crop&q=80",
    "https://images.unsplash.com/photo-1501139083538-0139583c060f?w=600&h=400&fit=crop&q=80",
  ],
};

/* Highlights generated from pack data */
function getHighlights(pack: ExperiencePack) {
  const highlights = [];
  if (pack.originalPrice) {
    const pct = Math.round(((pack.originalPrice - pack.price) / pack.originalPrice) * 100);
    highlights.push({ icon: "💸", text: `${pct}% OFF — Save ₹${pack.originalPrice - pack.price}` });
  }
  highlights.push({ icon: "🕐", text: pack.slot });
  highlights.push({ icon: "📦", text: `${pack.includes.length} items included` });
  if (pack.badge) highlights.push({ icon: "⭐", text: pack.badge.replace(/[^\w\s]/g, "").trim() });
  return highlights;
}

interface ExperienceDetailScreenProps {
  pack: ExperiencePack;
  property: Property;
  onBack: () => void;
  onBook: () => void;
}

export default function ExperienceDetailScreen({ pack, property, onBack, onBook }: ExperienceDetailScreenProps) {
  const [activeGalleryIdx, setActiveGalleryIdx] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  const gallery = moodGallery[pack.mood[0]] || moodGallery.chill;
  const savings = pack.originalPrice ? pack.originalPrice - pack.price : 0;
  const savingsPct = pack.originalPrice ? Math.round((savings / pack.originalPrice) * 100) : 0;
  const highlights = getHighlights(pack);

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
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      {/* ── Hero Gallery ── */}
      <div className="relative w-full" style={{ height: "52vh", minHeight: "320px" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeGalleryIdx}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0"
          >
            <OptimizedImage
              src={gallery[activeGalleryIdx]}
              alt={pack.name}
              fill
              className="object-cover"
              sizes="100vw"
            />
          </motion.div>
        </AnimatePresence>

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" style={{ height: "30%" }} />

        {/* Top bar */}
        <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-4 pt-[env(safe-area-inset-top,12px)]" style={{ paddingTop: "max(env(safe-area-inset-top, 12px), 12px)" }}>
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

        {/* Gallery dots */}
        <div className="absolute bottom-24 inset-x-0 z-20 flex justify-center gap-1.5">
          {gallery.map((_, i) => (
            <button
              key={i}
              onClick={() => { hapticSelection(); setActiveGalleryIdx(i); }}
              className="transition-all duration-300"
              style={{
                width: i === activeGalleryIdx ? 24 : 6,
                height: 6,
                borderRadius: 3,
                background: i === activeGalleryIdx ? "hsl(var(--primary))" : "hsl(0 0% 100% / 0.4)",
              }}
            />
          ))}
        </div>

        {/* Hero content overlay */}
        <div className="absolute bottom-0 inset-x-0 z-10 px-5 pb-5">
          <div className="flex items-center gap-2 mb-2">
            {pack.badge && (
              <span className="text-[10px] font-bold text-primary-foreground bg-primary/90 px-2.5 py-1 rounded-full backdrop-blur-sm">
                {pack.badge}
              </span>
            )}
            {savings > 0 && (
              <span className="text-[10px] font-bold text-success-foreground px-2.5 py-1 rounded-full" style={{ background: "hsl(var(--success) / 0.9)" }}>
                {savingsPct}% OFF
              </span>
            )}
          </div>
          <div className="flex items-end gap-3">
            <span className="text-4xl">{pack.emoji}</span>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-black text-foreground leading-tight">{pack.name}</h1>
              <p className="text-sm text-muted-foreground mt-0.5">{pack.tagline}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 px-5 -mt-2 pb-32 space-y-6">

        {/* Quick highlights */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar -mx-5 px-5" style={{ touchAction: "pan-x" }}>
          {highlights.map((h, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.06 }}
              className="shrink-0 flex items-center gap-2 px-3.5 py-2.5 rounded-xl"
              style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
            >
              <span className="text-base">{h.icon}</span>
              <span className="text-[11px] font-semibold text-foreground whitespace-nowrap">{h.text}</span>
            </motion.div>
          ))}
        </div>

        {/* Pricing card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl p-5"
          style={{
            background: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            boxShadow: "0 8px 32px -8px hsl(var(--foreground) / 0.08)",
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-foreground">₹{pack.price.toLocaleString()}</span>
                {pack.originalPrice && (
                  <span className="text-base text-muted-foreground line-through">₹{pack.originalPrice.toLocaleString()}</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">per session · all inclusive</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock size={12} />
                <span>{pack.slot}</span>
              </div>
              {savings > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color: "hsl(var(--success))", background: "hsl(var(--success) / 0.1)" }}>
                  You save ₹{savings}
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {/* What's included */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} className="text-primary" />
            <h2 className="text-base font-bold text-foreground">What's Included</h2>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {pack.includes.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.04 }}
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border) / 0.5)" }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "hsl(var(--primary) / 0.1)" }}>
                  <Check size={14} className="text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">{item}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Venue info */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl p-4"
          style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={16} className="text-primary" />
            <h2 className="text-base font-bold text-foreground">Venue</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
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
                  <Star size={10} className="text-gold fill-current" style={{ color: "hsl(var(--gold))" }} />
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
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Tag size={14} className="text-primary" />
            <h2 className="text-sm font-bold text-foreground">Mood & Tags</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {pack.mood.map(m => (
              <span key={m} className="text-xs font-semibold px-3 py-1.5 rounded-full capitalize" style={{ background: "hsl(var(--primary) / 0.1)", color: "hsl(var(--primary))" }}>
                {m}
              </span>
            ))}
            {pack.tags.map(t => (
              <span key={t} className="text-xs font-medium px-3 py-1.5 rounded-full text-muted-foreground" style={{ background: "hsl(var(--secondary))" }}>
                #{t}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Gallery grid */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-base font-bold text-foreground mb-3">Gallery</h2>
          <div className="grid grid-cols-2 gap-2">
            {gallery.map((img, i) => (
              <div
                key={i}
                className="rounded-xl overflow-hidden aspect-[4/3] relative cursor-pointer active:scale-[0.97] transition-transform"
                onClick={() => { hapticSelection(); setActiveGalleryIdx(i); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              >
                <OptimizedImage src={img} alt={`${pack.name} gallery ${i + 1}`} fill className="object-cover" sizes="50vw" />
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Sticky bottom CTA ── */}
      <div
        className="fixed bottom-0 inset-x-0 z-30 px-5 pb-[max(env(safe-area-inset-bottom,16px),16px)] pt-3"
        style={{
          background: "linear-gradient(to top, hsl(var(--background)) 70%, hsl(var(--background) / 0))",
        }}
      >
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-foreground">₹{pack.price.toLocaleString()}</span>
              {pack.originalPrice && (
                <span className="text-xs text-muted-foreground line-through">₹{pack.originalPrice.toLocaleString()}</span>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground">{pack.slot}</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => { hapticMedium(); onBook(); }}
            className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm glow-radiate active:scale-95 transition-transform"
          >
            <Zap size={16} />
            Book Now
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
