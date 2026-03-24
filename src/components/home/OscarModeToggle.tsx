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

/* ─── Property Card ─── */
function OscarPropertyCard({ property, onTap, index, isWL, onToggleWishlist }: {
  property: Property; onTap: (p: Property) => void; index: number; isWL: boolean; onToggleWishlist?: (id: string) => void;
}) {
  const cheapest = Math.min(...property.slots.filter(s => s.available).map(s => s.price));
  const badges = ["🏆 BEST PICK", "⭐ TOP RATED", "👑 PREMIUM", "💎 EXCLUSIVE", "🌟 FEATURED", "🎭 CURATED"];
  const [hovered, setHovered] = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      className="relative cursor-pointer group"
      onClick={() => onTap(property)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      role="button"
      tabIndex={0}
      aria-label={`${property.name} — ₹${cheapest.toLocaleString()} onwards, rated ${property.rating}`}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onTap(property); } }}
    >
      <FairyLights count={12} />

      {/* Card frame */}
      <div className="relative overflow-hidden rounded-2xl mt-2"
        style={{
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
        <div className="relative h-[260px] md:h-[320px] overflow-hidden rounded-xl">
          <img src={property.images[0]} alt={property.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700"
            style={{ transform: hovered ? "scale(1.08)" : "scale(1)" }}
            loading="lazy" />

          <div className="absolute inset-0" style={{
            background: "linear-gradient(to top, rgba(10,2,2,0.95) 0%, rgba(30,5,5,0.6) 35%, transparent 70%)",
          }} />

          {/* Badge */}
          <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
            style={{
              background: "linear-gradient(145deg, #2a1a00, #1a0d00)",
              border: "1.5px solid #DAA520",
              boxShadow: "0 3px 12px rgba(255,215,0,0.3)",
            }}>
            <img src={oscarTrophy} alt="" className="w-4 h-4 object-contain" />
            <span className="text-[9px] font-black tracking-wider"
              style={{ backgroundImage: "linear-gradient(135deg, #FFD700, #FFF, #FFD700)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              {badges[index % badges.length]}
            </span>
          </div>

          {/* Wishlist */}
          {onToggleWishlist && (
            <button onClick={(e) => { e.stopPropagation(); onToggleWishlist(property.id); }}
              className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center z-10"
              style={{ background: "rgba(30,0,0,0.7)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,215,0,0.2)" }}
              aria-label={isWL ? `Remove ${property.name} from wishlist` : `Add ${property.name} to wishlist`}>
              <Heart size={16} className={isWL ? "fill-red-400 text-red-400" : "text-white/80"} />
            </button>
          )}

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5 z-10">
            <div className="flex items-center gap-1 mb-1.5">
              {[...Array(5)].map((_, si) => (
                <Gem key={si} size={11}
                  className={si < Math.round(property.rating) ? "fill-yellow-400 text-yellow-400" : "text-white/15"}
                  style={si < Math.round(property.rating) ? { filter: "drop-shadow(0 0 3px rgba(255,215,0,0.5))" } : {}} />
              ))}
              <span className="text-[10px] font-bold ml-1" style={{ color: "#FFD700" }}>{property.rating}</span>
            </div>

            <h3 className="text-lg md:text-xl font-black text-white leading-tight"
              style={{ fontFamily: "'Playfair Display', serif", textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}>
              {property.name}
            </h3>
            <p className="text-[11px] mt-0.5 line-clamp-1" style={{ color: "rgba(255,228,181,0.5)" }}>
              {property.description}
            </p>

            <div className="flex items-center justify-between mt-2.5">
              <div>
                <span className="text-xl md:text-2xl font-black text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  ₹{cheapest.toLocaleString()}
                </span>
                <span className="text-[10px] text-white/30 ml-1">onwards</span>
              </div>
              <motion.div
                className="flex items-center gap-1 px-4 py-2 rounded-lg text-[11px] font-black"
                style={{
                  background: "linear-gradient(145deg, #FFD700, #DAA520, #B8860B)",
                  color: "#1a0d00",
                  border: "1px solid #FFD700",
                  boxShadow: "0 3px 14px rgba(255,215,0,0.35), inset 0 1px 0 rgba(255,255,255,0.3)",
                }}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.93 }}>
                Book Now <ArrowRight size={12} />
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Carpet strip */}
      <div className="h-1.5 mx-4 rounded-b-full -mt-px"
        style={{ background: "linear-gradient(90deg, transparent, #DC143C, #FF2D2D, #DC143C, transparent)", boxShadow: "0 3px 12px rgba(220,20,60,0.25)" }} />
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
  const premiumPicks = [...properties].sort((a, b) => b.rating - a.rating).slice(0, 6);

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
        <AmbientParticles count={25} />
        <SpotlightBeam x="5%" delay={0} />
        <SpotlightBeam x="70%" delay={3} />
        <VelvetCurtain side="left" />
        <VelvetCurtain side="right" />

        <div className="relative z-[9] px-5 md:px-8 lg:px-16 xl:px-24 2xl:px-32 pt-8 pb-12 md:pt-12 md:pb-16">
          {/* Header */}
          <motion.div className="text-center py-6 md:py-10"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}>

            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px w-10 md:w-16" style={{ background: "linear-gradient(90deg, transparent, #FFD700)" }} />
              <motion.img src={oscarTrophy} alt="" className="w-12 h-12 md:w-16 md:h-16 object-contain"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                style={{ filter: "drop-shadow(0 6px 20px rgba(255,215,0,0.4))" }} />
              <div className="h-px w-10 md:w-16" style={{ background: "linear-gradient(90deg, #FFD700, transparent)" }} />
            </div>

            <h2 className="text-2xl md:text-4xl lg:text-5xl font-black tracking-tight"
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

            <p className="text-sm md:text-base mt-2 max-w-md mx-auto"
              style={{ color: "rgba(255,228,181,0.5)", fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}>
              Our most exclusive, award-worthy experiences
            </p>

            <div className="flex items-center justify-center gap-2 mt-4">
              <div className="h-px w-12 md:w-20" style={{ background: "linear-gradient(90deg, transparent, #DC143C)" }} />
              <img src={oscarStar} alt="" className="w-4 h-4 object-contain" style={{ filter: "drop-shadow(0 0 6px rgba(255,215,0,0.5))" }} />
              <div className="h-px w-12 md:w-20" style={{ background: "linear-gradient(90deg, #DC143C, transparent)" }} />
            </div>
          </motion.div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto">
            {premiumPicks.map((p, i) => (
              <OscarPropertyCard key={p.id} property={p} onTap={onPropertyTap} index={i}
                isWL={wishlist.includes(p.id)} onToggleWishlist={onToggleWishlist} />
            ))}
          </div>

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
