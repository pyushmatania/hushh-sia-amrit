import { useState, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, ArrowRight, ArrowLeft, Heart, Gem, ChevronLeft, ChevronRight } from "lucide-react";
import type { Property } from "@/data/properties";
import { hapticSelection } from "@/lib/haptics";
import { useIsMobile } from "@/hooks/use-mobile";

import oscarTrophy from "@/assets/oscar-trophy-3d.png";
import oscarCrown from "@/assets/oscar-crown-3d.png";
import oscarStar from "@/assets/oscar-star-3d.png";
import oscarWoodTexture from "@/assets/oscar-wood-texture.jpg";

/* ─── Toggle Button ─── */
export function OscarToggle({ isOn, onToggle }: { isOn: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center justify-center py-4 md:py-6">
      <motion.button
        onClick={() => { hapticSelection(); onToggle(); }}
        className="relative flex items-center gap-3 px-5 py-3 md:px-7 md:py-3.5 rounded-2xl cursor-pointer select-none overflow-hidden"
        style={{
          background: isOn ? `url(${oscarWoodTexture})` : "hsl(var(--muted))",
          backgroundSize: "cover",
          border: isOn ? "3px solid #DAA520" : "2px solid hsl(var(--border) / 0.4)",
          boxShadow: isOn
            ? "0 0 30px rgba(255,215,0,0.4), 0 6px 20px rgba(139,0,0,0.3)"
            : "0 2px 8px hsl(var(--foreground) / 0.06)",
        }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.95 }}
        aria-pressed={isOn}
        aria-label={isOn ? "Disable Red Carpet mode" : "Enable Red Carpet mode"}
      >
        {isOn && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.2) 42%, transparent 50%)" }}
            animate={{ x: ["-100%", "250%"] }}
            transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2 }}
          />
        )}
        <motion.div
          className="w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center z-10"
          style={{
            background: isOn ? "radial-gradient(circle at 35% 35%, #FF2D55, #8B0000)" : "hsl(var(--card))",
            border: isOn ? "2px solid #FFD700" : "1px solid hsl(var(--border))",
            boxShadow: isOn ? "0 0 16px rgba(255,45,85,0.5)" : "none",
          }}
        >
          {isOn ? (
            <img src={oscarCrown} alt="" className="w-7 h-7 md:w-8 md:h-8 object-contain" />
          ) : (
            <Crown size={16} className="text-muted-foreground" />
          )}
        </motion.div>
        <div className="flex flex-col items-start z-10">
          <span className="text-[11px] md:text-xs font-black tracking-[0.15em] uppercase"
            style={{
              color: isOn ? "#FFD700" : "hsl(var(--muted-foreground))",
              fontFamily: "'Playfair Display', serif",
              textShadow: isOn ? "0 1px 4px rgba(0,0,0,0.8)" : "none",
            }}>
            {isOn ? "✦ RED CARPET ON" : "RED CARPET"}
          </span>
          <span className="text-[9px] md:text-[10px] font-medium"
            style={{
              color: isOn ? "rgba(255,228,181,0.8)" : "hsl(var(--muted-foreground) / 0.7)",
              fontStyle: "italic",
            }}>
            {isOn ? "The Gala is live" : "Tap for premium picks"}
          </span>
        </div>
      </motion.button>
    </div>
  );
}

/* ─── Ambient Particles (reduced count for performance) ─── */
function AmbientParticles({ count = 25 }: { count?: number }) {
  const particles = useMemo(() => Array.from({ length: count }, (_, i) => ({
    x: `${Math.random() * 100}%`,
    y: `${Math.random() * 100}%`,
    size: 1 + Math.random() * 2,
    delay: Math.random() * 5,
    dur: 4 + Math.random() * 4,
    color: i % 3 === 0 ? "#FFD700" : i % 3 === 1 ? "#FFE4B5" : "#FFF",
  })), [count]);

  return (
    <div className="absolute inset-0 pointer-events-none z-[2] overflow-hidden" aria-hidden="true">
      {particles.map((p, i) => (
        <motion.div key={i} className="absolute rounded-full"
          style={{
            left: p.x, top: p.y, width: p.size, height: p.size,
            background: p.color,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}66`,
          }}
          animate={{ opacity: [0, 0.8, 0] }}
          transition={{ duration: p.dur, repeat: Infinity, delay: p.delay }}
        />
      ))}
    </div>
  );
}

/* ─── Spotlight Beam ─── */
function SpotlightBeam({ x, delay = 0 }: { x: string; delay?: number }) {
  return (
    <motion.div
      className="absolute top-0 pointer-events-none z-[2]"
      aria-hidden="true"
      style={{
        left: x, width: "200px", height: "100%",
        background: "conic-gradient(from 180deg at 50% 0%, transparent 30%, rgba(255,215,0,0.06) 45%, rgba(255,215,0,0.1) 50%, rgba(255,215,0,0.06) 55%, transparent 70%)",
        transformOrigin: "top center",
      }}
      animate={{ rotate: [-10, 10, -10] }}
      transition={{ duration: 8, repeat: Infinity, delay, ease: "easeInOut" }}
    />
  );
}

/* ─── Velvet Curtain ─── */
function VelvetCurtain({ side }: { side: "left" | "right" }) {
  return (
    <div className="absolute top-0 bottom-0 w-8 md:w-16 z-[8] pointer-events-none" style={{ [side]: 0 }} aria-hidden="true">
      <div className="absolute inset-0" style={{
        background: side === "left"
          ? "linear-gradient(90deg, #3D0000 0%, #8B0000 40%, rgba(139,0,0,0.3) 80%, transparent 100%)"
          : "linear-gradient(270deg, #3D0000 0%, #8B0000 40%, rgba(139,0,0,0.3) 80%, transparent 100%)",
      }} />
      <div className="absolute top-0 bottom-0" style={{
        width: 3,
        [side === "left" ? "right" : "left"]: 0,
        background: "linear-gradient(180deg, #FFD700, #DAA520, #B8860B, #FFD700)",
        boxShadow: "0 0 8px rgba(255,215,0,0.3)",
      }} />
    </div>
  );
}

/* ─── LED Fairy Lights ─── */
function FairyLights({ count = 14 }: { count?: number }) {
  return (
    <div className="absolute top-0 left-0 right-0 h-5 flex items-end justify-around pointer-events-none z-[11] px-1" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => {
        const colors = ["#FFD700", "#FF2D55", "#FFE4B5", "#FF6B35", "#FF4444", "#FFF"];
        const c = colors[i % colors.length];
        return (
          <motion.div key={i} className="w-2 h-3 rounded-b-full rounded-t-sm"
            style={{
              background: `radial-gradient(circle at 40% 30%, ${c}, ${c}88)`,
              boxShadow: `0 0 6px ${c}aa, 0 0 12px ${c}33`,
              marginTop: i % 2 === 0 ? 4 : 8,
            }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.2 + (i % 4) * 0.3, repeat: Infinity, delay: i * 0.1 }}
          />
        );
      })}
    </div>
  );
}

/* ─── Number Ribbon Badge ─── */
function RibbonBadge({ number }: { number: number }) {
  return (
    <div className="absolute -top-1 -left-1 z-20 w-12 h-14 flex flex-col items-center justify-start pt-1.5"
      style={{
        background: "linear-gradient(180deg, #DC143C 0%, #8B0000 85%, transparent 100%)",
        clipPath: "polygon(0 0, 100% 0, 100% 80%, 50% 100%, 0 80%)",
        boxShadow: "2px 2px 10px rgba(0,0,0,0.5)",
      }}>
      <span className="text-[9px] font-black text-white/70 tracking-widest">N°</span>
      <span className="text-lg font-black text-white leading-none" style={{ fontFamily: "'Playfair Display', serif", textShadow: "0 1px 4px rgba(0,0,0,0.6)" }}>
        {number}
      </span>
    </div>
  );
}

/* ─── Corner Flourish ─── */
function CornerFlourish({ position }: { position: "tl" | "tr" | "bl" | "br" }) {
  const rot = { tl: "0", tr: "90", bl: "270", br: "180" }[position];
  const pos = {
    tl: { top: 2, left: 2 },
    tr: { top: 2, right: 2 },
    bl: { bottom: 2, left: 2 },
    br: { bottom: 2, right: 2 },
  }[position];
  return (
    <div className="absolute z-10 w-8 h-8 pointer-events-none" style={{ ...pos, transform: `rotate(${rot}deg)` }}>
      <svg viewBox="0 0 32 32" className="w-full h-full">
        <path d="M2,2 L12,2 L12,4 L4,4 L4,12 L2,12 Z" fill="#FFD700" opacity="0.8" />
        <circle cx="6" cy="6" r="1.5" fill="#FFD700" opacity="0.6" />
      </svg>
    </div>
  );
}

/* ─── Property Card ─── */
function OscarPropertyCard({ property, onTap, index, isWL, onToggleWishlist, totalCount, isSingle }: {
  property: Property; onTap: (p: Property) => void; index: number; isWL: boolean; onToggleWishlist?: (id: string) => void; totalCount?: number; isSingle?: boolean;
}) {
  const cheapest = Math.min(...property.slots.filter(s => s.available).map(s => s.price));
  const podiumTitles = ["🏆 WINNER", "🥈 RUNNER UP", "🥉 EDITORS' PICK"];
  const podiumGlows = [
    "0 0 50px rgba(255,215,0,0.35), 0 24px 80px rgba(0,0,0,0.5)",
    "0 0 40px rgba(192,192,192,0.25), 0 20px 60px rgba(0,0,0,0.5)",
    "0 0 35px rgba(205,127,50,0.25), 0 16px 50px rgba(0,0,0,0.5)",
  ];
  const [hovered, setHovered] = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: isSingle ? 0 : index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      className="relative cursor-pointer group"
      onClick={() => onTap(property)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      role="button"
      tabIndex={0}
      aria-label={`${property.name} — ₹${cheapest.toLocaleString()} onwards, rated ${property.rating}`}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onTap(property); } }}
    >
      {!isSingle && <FairyLights count={12} />}

      {/* Card frame */}
      <div className={`relative overflow-hidden ${isSingle ? "rounded-[28px]" : "rounded-2xl"} ${isSingle ? "" : "mt-2"}`}
         style={isSingle ? {
          border: "none",
          boxShadow: podiumGlows[index] || podiumGlows[0],
        } : {
          backgroundImage: `url(${oscarWoodTexture})`,
          backgroundSize: "cover",
          padding: "6px",
          border: "2px solid #B8860B",
          boxShadow: hovered
            ? "0 0 35px rgba(255,215,0,0.4), 0 16px 50px rgba(0,0,0,0.5)"
            : "0 0 15px rgba(255,215,0,0.15), 0 8px 30px rgba(0,0,0,0.3)",
          transition: "box-shadow 0.4s ease, transform 0.3s ease",
          transform: hovered ? "translateY(-3px)" : "translateY(0)",
        }}
      >
        {/* Ribbon badge */}
        {isSingle && <RibbonBadge number={index + 1} />}

        <div className={`relative ${isSingle ? "h-[440px] rounded-[28px]" : "h-[260px] md:h-[320px] rounded-xl"} overflow-hidden`}>
          <img src={property.images[0]} alt={property.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700"
            style={{ transform: hovered ? "scale(1.08)" : "scale(1)" }}
            loading="lazy" />

          {/* Cinematic gradient overlay */}
          <div className="absolute inset-0" style={{
            background: isSingle
              ? "linear-gradient(to top, rgba(5,0,0,0.97) 0%, rgba(20,2,2,0.7) 30%, rgba(0,0,0,0.15) 55%, transparent 75%)"
              : "linear-gradient(to top, rgba(10,2,2,0.95) 0%, rgba(30,5,5,0.6) 35%, transparent 70%)",
          }} />

          {/* Vignette for single */}
          {isSingle && (
            <div className="absolute inset-0 pointer-events-none z-[3]" style={{
              background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)",
            }} />
          )}

          {/* Top film grain line */}
          {isSingle && (
            <div className="absolute top-0 left-0 right-0 h-[2px] z-[5]" style={{
              background: "linear-gradient(90deg, transparent 10%, rgba(255,215,0,0.4) 30%, rgba(255,255,255,0.3) 50%, rgba(255,215,0,0.4) 70%, transparent 90%)",
            }} />
          )}

          {/* Inner gold edge glow for single */}
          {isSingle && (
            <div className="absolute inset-0 pointer-events-none z-[5] rounded-[28px]"
              style={{ boxShadow: "inset 0 0 40px rgba(139,0,0,0.3), inset 0 0 2px rgba(255,215,0,0.2)" }} />
          )}

          {/* Badge */}
          <div className={`absolute ${isSingle ? "top-4 left-14" : "top-3 left-3"} z-10 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg`}
            style={{
              background: "linear-gradient(145deg, #2a1a00, #1a0d00)",
              border: "1.5px solid #DAA520",
              boxShadow: "0 3px 12px rgba(255,215,0,0.3)",
            }}>
            <img src={oscarTrophy} alt="" className="w-4 h-4 object-contain" />
            <span className={`${isSingle ? "text-[10px]" : "text-[9px]"} font-black tracking-wider`}
              style={{ backgroundImage: "linear-gradient(135deg, #FFD700, #FFF, #FFD700)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              {podiumTitles[index] || "✦ PREMIUM"}
            </span>
          </div>

          {/* Wishlist */}
          {onToggleWishlist && (
            <button onClick={(e) => { e.stopPropagation(); onToggleWishlist(property.id); }}
              className={`absolute top-3 right-3 ${isSingle ? "w-11 h-11" : "w-9 h-9"} rounded-full flex items-center justify-center z-10`}
              style={{ background: "rgba(30,0,0,0.7)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,215,0,0.2)" }}
              aria-label={isWL ? `Remove ${property.name} from wishlist` : `Add ${property.name} to wishlist`}>
              <Heart size={isSingle ? 20 : 16} className={isWL ? "fill-red-400 text-red-400" : "text-white/80"} />
            </button>
          )}

          {/* Content */}
          <div className={`absolute bottom-0 left-0 right-0 ${isSingle ? "p-5" : "p-4 md:p-5"} z-10`}>
            <div className="flex items-center gap-1 mb-1.5">
              {[...Array(5)].map((_, si) => (
                <Gem key={si} size={isSingle ? 14 : 11}
                  className={si < Math.round(property.rating) ? "fill-yellow-400 text-yellow-400" : "text-white/15"}
                  style={si < Math.round(property.rating) ? { filter: "drop-shadow(0 0 3px rgba(255,215,0,0.5))" } : {}} />
              ))}
              <span className={`${isSingle ? "text-xs" : "text-[10px]"} font-bold ml-1`} style={{ color: "#FFD700" }}>{property.rating}</span>
            </div>

            <h3 className={`${isSingle ? "text-2xl" : "text-lg md:text-xl"} font-black text-white leading-tight`}
              style={{ fontFamily: "'Playfair Display', serif", textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}>
              {property.name}
            </h3>
            <p className={`${isSingle ? "text-xs line-clamp-2" : "text-[11px] line-clamp-1"} mt-0.5`} style={{ color: "rgba(255,228,181,0.5)" }}>
              {property.description}
            </p>

            {/* Location for single */}
            {isSingle && (
              <div className="flex items-center gap-1 mt-1.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#FFD700" }} />
                <span className="text-[10px] font-medium" style={{ color: "rgba(255,228,181,0.6)" }}>{property.location}</span>
              </div>
            )}

            <div className="flex items-center justify-between mt-2.5">
              <div>
                <span className={`${isSingle ? "text-2xl" : "text-xl md:text-2xl"} font-black text-white`} style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  ₹{cheapest.toLocaleString()}
                </span>
                <span className="text-[10px] text-white/30 ml-1">onwards</span>
              </div>
              <motion.div
                className={`flex items-center gap-1 ${isSingle ? "px-5 py-2.5 rounded-xl text-xs" : "px-4 py-2 rounded-lg text-[11px]"} font-black`}
                style={{
                  background: "linear-gradient(145deg, #FFD700, #DAA520, #B8860B)",
                  color: "#1a0d00",
                  border: "1px solid #FFD700",
                  boxShadow: "0 3px 14px rgba(255,215,0,0.35), inset 0 1px 0 rgba(255,255,255,0.3)",
                }}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.93 }}>
                Book Now <ArrowRight size={isSingle ? 14 : 12} />
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Carpet strip — cinematic glow for single */}
      {isSingle ? (
        <div className="relative h-1 mx-2 mt-[-1px]">
          <div className="absolute inset-0 rounded-b-full" style={{
            background: "linear-gradient(90deg, transparent 5%, #DC143C 25%, #FF4444 50%, #DC143C 75%, transparent 95%)",
            boxShadow: "0 4px 20px rgba(220,20,60,0.4), 0 1px 6px rgba(255,68,68,0.3)",
          }} />
        </div>
      ) : (
        <div className="h-1.5 mx-4 rounded-b-full -mt-px"
          style={{ background: "linear-gradient(90deg, transparent, #DC143C, #FF2D2D, #DC143C, transparent)", boxShadow: "0 3px 12px rgba(220,20,60,0.25)" }} />
      )}
    </motion.article>
  );
}

/* ─── Theater Background ─── */
function TheaterBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse at 50% 0%, #2a0808 0%, #1a0404 30%, #0d0202 60%, #050101 100%)",
      }} />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[250px]" style={{
        background: "radial-gradient(ellipse, rgba(255,215,0,0.05) 0%, transparent 70%)",
      }} />
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse at 0% 50%, rgba(139,0,0,0.1), transparent 40%), radial-gradient(ellipse at 100% 50%, rgba(139,0,0,0.1), transparent 40%)",
      }} />
    </div>
  );
}

/* ─── Main Oscar Themed Listing ─── */
interface OscarThemedListingProps {
  properties: Property[];
  onPropertyTap: (p: Property) => void;
  wishlist: string[];
  onToggleWishlist?: (id: string) => void;
}

export function OscarThemedListing({ properties, onPropertyTap, wishlist, onToggleWishlist }: OscarThemedListingProps) {
  // Only show top 3 premium picks — the award podium
  const premiumPicks = [...properties].sort((a, b) => b.rating - a.rating).slice(0, 3);
  const isMobile = useIsMobile();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchEndX = useRef(0);
  const isSwiping = useRef(false);
  const swipeHandled = useRef(false);

  const handlePrev = useCallback(() => {
    setCurrentIndex(i => Math.max(0, i - 1));
    hapticSelection();
  }, []);

  const handleNext = useCallback(() => {
    setCurrentIndex(i => Math.min(premiumPicks.length - 1, i + 1));
    hapticSelection();
  }, [premiumPicks.length]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchEndX.current = e.touches[0].clientX;
    isSwiping.current = false;
    swipeHandled.current = false;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
    const dx = Math.abs(touchEndX.current - touchStartX.current);
    const dy = Math.abs(e.touches[0].clientY - touchStartY.current);
    // If horizontal movement dominates, it's a swipe — prevent vertical scroll
    if (dx > 15 && dx > dy * 1.5) {
      isSwiping.current = true;
      e.preventDefault();
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!isSwiping.current) return;
    swipeHandled.current = true;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 40) {
      if (diff > 0) handleNext();
      else handlePrev();
    }
  }, [handleNext, handlePrev]);

  if (premiumPicks.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden min-h-screen"
        role="region"
        aria-label="Red Carpet Premium Collection"
      >
        <TheaterBackground />
        <AmbientParticles count={isMobile ? 15 : 25} />
        <SpotlightBeam x="5%" delay={0} />
        <SpotlightBeam x="70%" delay={3} />

        {/* Cinematic top curtain drape — mobile only */}
        {isMobile && (
          <div className="absolute top-0 left-0 right-0 h-24 z-[8] pointer-events-none" style={{
            background: "linear-gradient(180deg, #3D0000 0%, #1a0404 40%, transparent 100%)",
          }}>
            <div className="absolute bottom-0 left-0 right-0 h-[3px]" style={{
              background: "linear-gradient(90deg, transparent, #FFD700 30%, #DAA520 50%, #FFD700 70%, transparent)",
              boxShadow: "0 0 12px rgba(255,215,0,0.3)",
            }} />
          </div>
        )}

        {!isMobile && (
          <>
            <VelvetCurtain side="left" />
            <VelvetCurtain side="right" />
          </>
        )}

        {/* Side gold trim lines — mobile */}
        {isMobile && (
          <>
            <div className="absolute top-24 bottom-0 left-0 w-[2px] z-[8] pointer-events-none" style={{
              background: "linear-gradient(180deg, #FFD700, #B8860B 30%, rgba(184,134,11,0.1) 80%, transparent)",
              boxShadow: "0 0 8px rgba(255,215,0,0.2)",
            }} />
            <div className="absolute top-24 bottom-0 right-0 w-[2px] z-[8] pointer-events-none" style={{
              background: "linear-gradient(180deg, #FFD700, #B8860B 30%, rgba(184,134,11,0.1) 80%, transparent)",
              boxShadow: "0 0 8px rgba(255,215,0,0.2)",
            }} />
          </>
        )}

        <div className="relative z-[9] px-4 md:px-8 lg:px-16 xl:px-24 2xl:px-32 pt-6 pb-12 md:pt-12 md:pb-16">
          {/* Header — compact on mobile */}
          <motion.div className="text-center py-4 md:py-10"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}>

            <motion.img src={oscarTrophy} alt="" className="w-10 h-10 md:w-16 md:h-16 object-contain mx-auto mb-3"
              animate={{ y: [0, -4, 0], rotateZ: [0, 2, -2, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              style={{ filter: "drop-shadow(0 6px 20px rgba(255,215,0,0.5))" }} />

            <h2 className="text-xl md:text-4xl lg:text-5xl font-black tracking-tight"
              style={{
                fontFamily: "'Playfair Display', serif",
                backgroundImage: "linear-gradient(135deg, #FFD700 0%, #FFFFFF 40%, #FFD700 70%, #DAA520 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                filter: "drop-shadow(0 0 16px rgba(255,215,0,0.3))",
              }}>
              The Red Carpet
            </h2>

            <p className="text-xs md:text-base mt-1.5 max-w-md mx-auto"
              style={{ color: "rgba(255,228,181,0.4)", fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}>
              Our most exclusive, award-worthy experiences
            </p>
          </motion.div>

          {/* Mobile: Single big card with swipe */}
          {isMobile ? (
            <div className="relative">
              {/* Counter pill */}
              <div className="flex justify-center mb-3">
                <motion.div className="flex items-center gap-2 px-4 py-1.5 rounded-full"
                  style={{
                    background: "linear-gradient(135deg, rgba(139,0,0,0.4), rgba(30,10,0,0.6))",
                    border: "1px solid rgba(255,215,0,0.25)",
                    backdropFilter: "blur(12px)",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
                  }}
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <img src={oscarTrophy} alt="" className="w-3.5 h-3.5 object-contain" />
                  <span className="text-[10px] font-black tracking-widest uppercase" style={{ color: "#FFD700" }}>
                    {currentIndex + 1} / {premiumPicks.length}
                  </span>
                  <span className="text-[9px] font-medium" style={{ color: "rgba(255,228,181,0.5)" }}>Premium</span>
                </motion.div>
              </div>

              {/* Swipeable card */}
              <div
                className="overflow-hidden rounded-2xl"
                style={{ touchAction: "pan-y" }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onClickCapture={(e) => { if (swipeHandled.current) { e.stopPropagation(); e.preventDefault(); } }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={premiumPicks[currentIndex].id}
                    initial={{ opacity: 0, x: 80, scale: 0.96 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -80, scale: 0.96 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <OscarPropertyCard
                      property={premiumPicks[currentIndex]}
                      onTap={onPropertyTap}
                      index={currentIndex}
                      isWL={wishlist.includes(premiumPicks[currentIndex].id)}
                      onToggleWishlist={onToggleWishlist}
                      isSingle
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Progress bar style dots */}
              <div className="flex justify-center gap-1.5 mt-5 px-8">
                {premiumPicks.map((_, i) => (
                  <button key={i} onClick={() => { setCurrentIndex(i); hapticSelection(); }}
                    className="h-[3px] rounded-full transition-all duration-500 flex-1"
                    style={{
                      background: i === currentIndex
                        ? "linear-gradient(90deg, #FFD700, #FFF, #FFD700)"
                        : i < currentIndex
                          ? "rgba(255,215,0,0.35)"
                          : "rgba(255,215,0,0.1)",
                      boxShadow: i === currentIndex ? "0 0 8px rgba(255,215,0,0.5)" : "none",
                      maxWidth: 40,
                    }}
                  />
                ))}
              </div>

              {/* Swipe hint */}
              <motion.div className="flex items-center justify-center gap-3 mt-4"
                animate={{ opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 2.5, repeat: Infinity }}>
                <ChevronLeft size={12} style={{ color: "rgba(255,215,0,0.3)" }} />
                <span className="text-[9px] font-bold tracking-[0.25em] uppercase" style={{ color: "rgba(255,228,181,0.25)" }}>
                  Swipe to explore
                </span>
                <ChevronRight size={12} style={{ color: "rgba(255,215,0,0.3)" }} />
              </motion.div>
            </div>
          ) : (
            /* Desktop: Grid with arrow navigation */
            <div className="relative max-w-7xl mx-auto">
              {/* Arrow buttons */}
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="absolute -left-4 lg:-left-10 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-20 disabled:cursor-default"
                style={{
                  background: "linear-gradient(145deg, #2a1a00, #1a0d00)",
                  border: "2px solid #DAA520",
                  boxShadow: "0 0 20px rgba(255,215,0,0.25), 0 4px 15px rgba(0,0,0,0.4)",
                }}
                aria-label="Previous properties"
              >
                <ChevronLeft size={20} style={{ color: "#FFD700" }} />
              </button>

              <button
                onClick={() => { setCurrentIndex(i => Math.min(Math.max(0, premiumPicks.length - 3), i + 1)); hapticSelection(); }}
                disabled={currentIndex >= premiumPicks.length - 3}
                className="absolute -right-4 lg:-right-10 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-20 disabled:cursor-default"
                style={{
                  background: "linear-gradient(145deg, #2a1a00, #1a0d00)",
                  border: "2px solid #DAA520",
                  boxShadow: "0 0 20px rgba(255,215,0,0.25), 0 4px 15px rgba(0,0,0,0.4)",
                }}
                aria-label="Next properties"
              >
                <ChevronRight size={20} style={{ color: "#FFD700" }} />
              </button>

              {/* Sliding grid */}
              <div className="overflow-hidden">
                <motion.div
                  className="grid grid-cols-3 gap-6 md:gap-8"
                  animate={{ x: `-${currentIndex * (100 / 3)}%` }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  style={{ width: `${(premiumPicks.length / 3) * 100}%` }}
                >
                  {premiumPicks.map((p, i) => (
                    <OscarPropertyCard key={p.id} property={p} onTap={onPropertyTap} index={i}
                      isWL={wishlist.includes(p.id)} onToggleWishlist={onToggleWishlist} />
                  ))}
                </motion.div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-center mt-10">
            <div className="flex items-center gap-3 px-5 py-2.5 rounded-xl"
              style={{
                background: "rgba(30,10,0,0.6)",
                border: "1px solid rgba(255,215,0,0.2)",
                backdropFilter: "blur(8px)",
              }}>
              <img src={oscarStar} alt="" className="w-3.5 h-3.5 object-contain" />
              <span className="text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase" style={{ color: "rgba(255,215,0,0.5)" }}>
                Handpicked by Hushh
              </span>
              <img src={oscarStar} alt="" className="w-3.5 h-3.5 object-contain" />
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
