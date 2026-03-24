import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Sparkles, Award, Star, ArrowRight, Heart, Trophy, Clapperboard, Film, Ticket } from "lucide-react";
import type { Property } from "@/data/properties";
import { hapticSelection } from "@/lib/haptics";

/* ─── Golden Toggle Button ─── */
export function OscarToggle({ isOn, onToggle }: { isOn: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center justify-center py-4 md:py-6">
      <motion.button
        onClick={() => { hapticSelection(); onToggle(); }}
        className="relative flex items-center gap-3 px-5 py-2.5 md:px-7 md:py-3 rounded-full cursor-pointer select-none overflow-hidden"
        style={{
          background: isOn
            ? "linear-gradient(135deg, #FFD700, #DAA520, #FFD700)"
            : "hsl(var(--muted))",
          border: isOn ? "2px solid #FFD700" : "2px solid hsl(var(--border) / 0.4)",
          boxShadow: isOn
            ? "0 0 30px rgba(255,215,0,0.4), 0 4px 20px rgba(255,215,0,0.2), inset 0 1px 0 rgba(255,255,255,0.3)"
            : "0 2px 8px hsl(var(--foreground) / 0.06)",
          transition: "box-shadow 0.5s, border-color 0.3s",
        }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >
        {isOn && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.4) 45%, transparent 50%)" }}
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1.5 }}
          />
        )}
        <motion.div
          className="w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center z-10"
          style={{
            background: isOn ? "linear-gradient(135deg, #1a1a1a, #333)" : "hsl(var(--card))",
            border: isOn ? "2px solid #FFD700" : "1px solid hsl(var(--border))",
            boxShadow: isOn ? "0 0 12px rgba(255,215,0,0.5)" : "none",
          }}
          animate={{ rotate: isOn ? 360 : 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          <Crown size={16} className={isOn ? "text-yellow-400" : "text-muted-foreground"} />
        </motion.div>
        <div className="flex flex-col items-start z-10">
          <span className="text-[11px] md:text-xs font-black tracking-[0.15em] uppercase"
            style={{ color: isOn ? "#1a1a1a" : "hsl(var(--muted-foreground))" }}>
            {isOn ? "RED CARPET ON" : "RED CARPET"}
          </span>
          <span className="text-[8px] md:text-[9px] font-medium"
            style={{ color: isOn ? "rgba(0,0,0,0.6)" : "hsl(var(--muted-foreground) / 0.7)", fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}>
            {isOn ? "✨ Award-worthy picks" : "Tap for premium picks"}
          </span>
        </div>
        {isOn && (
          <>
            {[0, 1, 2, 3, 4].map(i => (
              <motion.div key={i} className="absolute w-1 h-1 rounded-full"
                style={{ background: "#FFD700", top: `${15 + i * 15}%`, right: `${5 + (i % 3) * 4}%`, boxShadow: "0 0 4px #FFD700" }}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </>
        )}
      </motion.button>
    </div>
  );
}

/* ─── Spotlight Beam ─── */
function SpotlightBeam({ x, delay = 0 }: { x: string; delay?: number }) {
  return (
    <motion.div
      className="absolute top-0 pointer-events-none z-[2]"
      style={{
        left: x,
        width: "200px",
        height: "100%",
        background: "conic-gradient(from 180deg at 50% 0%, transparent 30%, rgba(255,215,0,0.06) 40%, rgba(255,215,0,0.12) 50%, rgba(255,215,0,0.06) 60%, transparent 70%)",
        transformOrigin: "top center",
      }}
      animate={{ rotate: [-8, 8, -8] }}
      transition={{ duration: 6, repeat: Infinity, delay, ease: "easeInOut" }}
    />
  );
}

/* ─── Floating 3D Oscar Trophy ─── */
function FloatingTrophy({ x, y, size = 40, delay = 0 }: { x: string; y: string; size?: number; delay?: number }) {
  return (
    <motion.div
      className="absolute pointer-events-none z-[4]"
      style={{ left: x, top: y }}
      animate={{ y: [0, -12, 0], rotateY: [0, 15, -15, 0], rotateZ: [-3, 3, -3] }}
      transition={{ duration: 5, repeat: Infinity, delay, ease: "easeInOut" }}
    >
      <div style={{ filter: "drop-shadow(0 8px 20px rgba(255,215,0,0.4))", fontSize: size }}>
        🏆
      </div>
    </motion.div>
  );
}

/* ─── Film Reel Decoration ─── */
function FilmReel({ x, y, delay = 0 }: { x: string; y: string; delay?: number }) {
  return (
    <motion.div
      className="absolute pointer-events-none z-[3]"
      style={{ left: x, top: y }}
      animate={{ rotate: [0, 360] }}
      transition={{ duration: 15, repeat: Infinity, delay, ease: "linear" }}
    >
      <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border-2 border-yellow-600/30 flex items-center justify-center"
        style={{ background: "radial-gradient(circle, rgba(40,20,10,0.8), rgba(20,10,5,0.9))" }}>
        <div className="w-4 h-4 md:w-5 md:h-5 rounded-full border border-yellow-600/50" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => (
          <div key={angle} className="absolute w-1.5 h-2 rounded-sm"
            style={{
              background: "rgba(255,215,0,0.15)",
              transform: `rotate(${angle}deg) translateY(-20px)`,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

/* ─── Star Particle Field ─── */
function StarField({ count = 30 }: { count?: number }) {
  const stars = Array.from({ length: count }, (_, i) => ({
    x: `${Math.random() * 100}%`,
    y: `${Math.random() * 100}%`,
    size: 1 + Math.random() * 2,
    delay: Math.random() * 4,
    dur: 2 + Math.random() * 3,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none z-[1] overflow-hidden">
      {stars.map((s, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: s.x, top: s.y,
            width: s.size, height: s.size,
            background: i % 3 === 0 ? "#FFD700" : i % 3 === 1 ? "#FFF" : "#FFE4B5",
            boxShadow: `0 0 ${s.size * 3}px ${i % 3 === 0 ? "rgba(255,215,0,0.6)" : "rgba(255,255,255,0.4)"}`,
          }}
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
          transition={{ duration: s.dur, repeat: Infinity, delay: s.delay }}
        />
      ))}
    </div>
  );
}

/* ─── Velvet Curtain ─── */
function VelvetCurtain({ side }: { side: "left" | "right" }) {
  return (
    <div
      className="absolute top-0 bottom-0 w-8 md:w-14 z-[8] pointer-events-none"
      style={{ [side]: 0 }}
    >
      {/* Main velvet fabric */}
      <div className="absolute inset-0" style={{
        background: side === "left"
          ? "linear-gradient(90deg, #5C0A0A 0%, #8B0000 30%, #A52A2A 60%, rgba(139,0,0,0.3) 85%, transparent 100%)"
          : "linear-gradient(270deg, #5C0A0A 0%, #8B0000 30%, #A52A2A 60%, rgba(139,0,0,0.3) 85%, transparent 100%)",
      }} />
      {/* Fold highlights */}
      <div className="absolute inset-0" style={{
        background: "repeating-linear-gradient(180deg, transparent, transparent 40px, rgba(255,255,255,0.03) 40px, transparent 42px)",
      }} />
      {/* Gold trim */}
      <div className="absolute top-0 bottom-0 w-[3px]"
        style={{
          [side === "left" ? "right" : "left"]: 0,
          background: "linear-gradient(180deg, #FFD700 0%, #DAA520 30%, rgba(218,165,32,0.3) 70%, transparent 100%)",
          boxShadow: "0 0 8px rgba(255,215,0,0.3)",
        }}
      />
      {/* Gold tassel at top */}
      <motion.div
        className="absolute top-6 w-full flex justify-center"
        animate={{ y: [0, 3, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <div className="w-5 h-5 md:w-6 md:h-6 rounded-full"
          style={{ background: "radial-gradient(circle, #FFD700, #B8860B)", boxShadow: "0 0 10px rgba(255,215,0,0.5)" }} />
      </motion.div>
    </div>
  );
}

/* ─── Red Carpet Floor ─── */
function RedCarpetFloor() {
  return (
    <div className="relative h-8 md:h-12 w-full overflow-hidden">
      <div className="absolute inset-0" style={{
        background: "linear-gradient(90deg, transparent 0%, #5C0A0A 5%, #8B0000 15%, #DC143C 35%, #FF2D2D 50%, #DC143C 65%, #8B0000 85%, #5C0A0A 95%, transparent 100%)",
        boxShadow: "0 0 40px rgba(220,20,60,0.4), inset 0 3px 6px rgba(255,255,255,0.1), inset 0 -3px 6px rgba(0,0,0,0.3)",
      }} />
      {/* Walk stars */}
      {[10, 25, 40, 55, 70, 85].map((pos, i) => (
        <motion.div key={i} className="absolute top-1/2 -translate-y-1/2" style={{ left: `${pos}%` }}
          animate={{ opacity: [0.3, 0.8, 0.3], scale: [0.8, 1.1, 0.8] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.3 }}
        >
          <Star size={14} className="fill-yellow-400/60 text-yellow-400/60" />
        </motion.div>
      ))}
      {/* Perspective lines */}
      <div className="absolute inset-0" style={{
        background: "repeating-linear-gradient(90deg, transparent, transparent 15%, rgba(139,0,0,0.5) 15.3%, transparent 15.6%)",
      }} />
    </div>
  );
}

/* ─── Clapperboard Decoration ─── */
function FloatingClapperboard({ x, y, delay = 0 }: { x: string; y: string; delay?: number }) {
  return (
    <motion.div
      className="absolute pointer-events-none z-[3]"
      style={{ left: x, top: y }}
      animate={{ y: [0, -8, 0], rotate: [-5, 5, -5] }}
      transition={{ duration: 4, repeat: Infinity, delay, ease: "easeInOut" }}
    >
      <div style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.5))", fontSize: 28, opacity: 0.6 }}>🎬</div>
    </motion.div>
  );
}

/* ─── Golden Rope Divider ─── */
function GoldenRopeDivider() {
  return (
    <div className="flex items-center justify-center gap-3 py-4">
      <div className="h-px flex-1 max-w-24 md:max-w-40" style={{ background: "linear-gradient(90deg, transparent, #FFD700)" }} />
      <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity }}>
        <Award size={22} className="text-yellow-400 md:w-7 md:h-7" />
      </motion.div>
      <span className="text-[9px] md:text-xs font-black tracking-[0.3em] uppercase" style={{
        backgroundImage: "linear-gradient(135deg, #FFD700, #FFFFFF, #FFD700)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }}>
        PREMIUM COLLECTION
      </span>
      <motion.div animate={{ rotate: [0, -5, 5, 0] }} transition={{ duration: 4, repeat: Infinity }}>
        <Award size={22} className="text-yellow-400 md:w-7 md:h-7" />
      </motion.div>
      <div className="h-px flex-1 max-w-24 md:max-w-40" style={{ background: "linear-gradient(90deg, #FFD700, transparent)" }} />
    </div>
  );
}

/* ─── LED Fairy Lights ─── */
function FairyLights({ count = 14 }: { count?: number }) {
  return (
    <div className="absolute top-0 left-0 right-0 h-4 flex items-center justify-around pointer-events-none z-10 overflow-hidden px-2">
      <div className="absolute top-1.5 left-0 right-0 h-px" style={{ background: "rgba(139,69,19,0.5)" }} />
      {Array.from({ length: count }).map((_, i) => (
        <motion.div key={i} className="w-2 h-2 rounded-full relative"
          style={{
            background: i % 4 === 0 ? "#FFD700" : i % 4 === 1 ? "#FF6B35" : i % 4 === 2 ? "#FFE4B5" : "#FF4444",
            boxShadow: `0 0 8px ${i % 4 === 0 ? "rgba(255,215,0,0.9)" : i % 4 === 1 ? "rgba(255,107,53,0.8)" : i % 4 === 2 ? "rgba(255,228,181,0.8)" : "rgba(255,68,68,0.8)"}`,
          }}
          animate={{ opacity: [0.4, 1, 0.4], scale: [0.7, 1.2, 0.7] }}
          transition={{ duration: 1.2 + (i % 4) * 0.3, repeat: Infinity, delay: i * 0.12 }}
        />
      ))}
    </div>
  );
}

/* ─── Oscar Property Card ─── */
function OscarPropertyCard({ property, onTap, index, isWL, onToggleWishlist }: {
  property: Property; onTap: (p: Property) => void; index: number; isWL: boolean; onToggleWishlist?: (id: string) => void;
}) {
  const cheapest = Math.min(...property.slots.filter(s => s.available).map(s => s.price));
  const badges = ["🏆 BEST PICTURE", "⭐ AUDIENCE CHOICE", "👑 DIRECTOR'S CUT", "🎭 CRITICS' PICK", "💎 PLATINUM", "🌟 SHOWSTOPPER"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      className="relative cursor-pointer group"
      onClick={() => onTap(property)}
    >
      <FairyLights count={12} />

      {/* Gold frame card */}
      <div className="relative overflow-hidden rounded-2xl md:rounded-3xl mt-2"
        style={{
          border: "3px solid transparent",
          backgroundImage: "linear-gradient(#1a0505, #1a0505), linear-gradient(135deg, #FFD700, #DAA520, #FFD700, #B8860B, #FFD700)",
          backgroundOrigin: "border-box",
          backgroundClip: "padding-box, border-box",
          boxShadow: "0 0 30px rgba(255,215,0,0.25), 0 15px 50px rgba(0,0,0,0.5), inset 0 0 20px rgba(255,215,0,0.08)",
        }}
      >
        <div className="relative h-[280px] md:h-[340px] overflow-hidden">
          <img src={property.images[0]} alt={property.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
          <div className="absolute inset-0" style={{
            background: "linear-gradient(to top, rgba(26,5,5,0.98) 0%, rgba(26,5,5,0.6) 35%, rgba(139,0,0,0.15) 60%, transparent 100%)",
          }} />

          {/* Badge */}
          <motion.div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{ background: "linear-gradient(135deg, #FFD700, #DAA520)", boxShadow: "0 4px 16px rgba(255,215,0,0.5)" }}
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Award size={12} className="text-black" />
            <span className="text-[9px] md:text-[10px] font-black text-black tracking-wider">{badges[index % badges.length]}</span>
          </motion.div>

          {/* Trophy float */}
          <motion.div className="absolute top-4 right-4 z-10"
            animate={{ y: [0, -4, 0], rotateZ: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <div className="w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, rgba(255,215,0,0.3), rgba(139,0,0,0.3))", backdropFilter: "blur(10px)", border: "1px solid rgba(255,215,0,0.4)" }}>
              <Crown size={18} className="text-yellow-400" />
            </div>
          </motion.div>

          {onToggleWishlist && (
            <button onClick={(e) => { e.stopPropagation(); onToggleWishlist(property.id); }}
              className="absolute bottom-4 right-4 w-10 h-10 rounded-full flex items-center justify-center z-10"
              style={{ background: "rgba(26,5,5,0.7)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,215,0,0.2)" }}>
              <Heart size={16} className={isWL ? "fill-red-500 text-red-500" : "text-white"} />
            </button>
          )}

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5 z-10">
            <div className="flex items-center gap-1 mb-1.5">
              {[...Array(5)].map((_, si) => (
                <Star key={si} size={11} className={si < Math.round(property.rating) ? "fill-yellow-400 text-yellow-400" : "text-white/20"} />
              ))}
              <span className="text-[10px] font-bold text-yellow-400 ml-1">{property.rating}</span>
            </div>
            <h3 className="text-lg md:text-xl font-black text-white leading-tight"
              style={{ fontFamily: "'Playfair Display', serif", textShadow: "0 2px 12px rgba(0,0,0,0.9)" }}>
              {property.name}
            </h3>
            <p className="text-[11px] md:text-xs text-white/50 mt-1 line-clamp-1">{property.description}</p>
            <div className="flex items-center justify-between mt-3">
              <span className="text-xl md:text-2xl font-black text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                ₹{cheapest.toLocaleString()}<span className="text-xs text-white/40 font-normal"> onwards</span>
              </span>
              <motion.div className="flex items-center gap-1 px-4 py-2 rounded-full text-[11px] md:text-xs font-bold"
                style={{ background: "linear-gradient(135deg, #FFD700, #DAA520)", color: "#000", boxShadow: "0 4px 16px rgba(255,215,0,0.35)" }}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              >
                Book Now <ArrowRight size={12} />
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Red glow strip under card */}
      <div className="h-2 mx-3 md:mx-5 rounded-b-full -mt-px" style={{
        background: "linear-gradient(90deg, transparent, #DC143C, #FF2D2D, #DC143C, transparent)",
        boxShadow: "0 3px 15px rgba(220,20,60,0.35)",
      }} />
    </motion.div>
  );
}

/* ─── Oscar Themed Listing Container ─── */
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
        style={{
          background: "radial-gradient(ellipse at 50% 0%, #2a0a0a 0%, #1a0505 30%, #0d0202 60%, #050101 100%)",
        }}
      >
        {/* Star field background */}
        <StarField count={40} />

        {/* Spotlight beams */}
        <SpotlightBeam x="5%" delay={0} />
        <SpotlightBeam x="70%" delay={2} />
        <SpotlightBeam x="40%" delay={4} />

        {/* Velvet curtains */}
        <VelvetCurtain side="left" />
        <VelvetCurtain side="right" />

        {/* Floating 3D decorations */}
        <FloatingTrophy x="5%" y="8%" size={32} delay={0} />
        <FloatingTrophy x="88%" y="12%" size={28} delay={1.5} />
        <FloatingClapperboard x="92%" y="35%" delay={0.5} />
        <FloatingClapperboard x="3%" y="55%" delay={2} />
        <FilmReel x="90%" y="65%" delay={0} />
        <FilmReel x="2%" y="30%" delay={3} />

        {/* Floating emojis */}
        {["🎭", "🌟", "🎪", "🎬"].map((emoji, i) => (
          <motion.div key={i}
            className="absolute pointer-events-none z-[3]"
            style={{ left: `${15 + i * 22}%`, top: `${10 + (i % 2) * 70}%`, fontSize: 20, opacity: 0.35 }}
            animate={{ y: [0, -10, 0], rotate: [0, 10, -10, 0] }}
            transition={{ duration: 5 + i, repeat: Infinity, delay: i * 0.8 }}
          >
            {emoji}
          </motion.div>
        ))}

        {/* Red ambient light at edges */}
        <div className="absolute inset-0 pointer-events-none z-[0]" style={{
          background: "radial-gradient(ellipse at 0% 50%, rgba(220,20,60,0.12), transparent 50%), radial-gradient(ellipse at 100% 50%, rgba(220,20,60,0.12), transparent 50%)",
        }} />

        {/* Top spotlight glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[200px] pointer-events-none z-[1]" style={{
          background: "radial-gradient(ellipse, rgba(255,215,0,0.08) 0%, transparent 70%)",
        }} />

        <div className="relative z-[9] px-5 md:px-8 lg:px-16 xl:px-24 2xl:px-32 pt-8 pb-12 md:pt-14 md:pb-16">

          {/* Red carpet at top */}
          <RedCarpetFloor />

          {/* Grand header */}
          <motion.div className="text-center py-8 md:py-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.div className="flex items-center justify-center gap-3 mb-4"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
                <Star size={20} className="fill-yellow-400 text-yellow-400" />
              </motion.div>
              <Trophy size={32} className="text-yellow-400" style={{ filter: "drop-shadow(0 0 12px rgba(255,215,0,0.6))" }} />
              <motion.div animate={{ rotate: [360, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
                <Star size={20} className="fill-yellow-400 text-yellow-400" />
              </motion.div>
            </motion.div>

            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight"
              style={{
                fontFamily: "'Playfair Display', serif",
                backgroundImage: "linear-gradient(135deg, #FFD700, #FFFFFF, #FFD700, #DAA520)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                textShadow: "none",
                filter: "drop-shadow(0 0 20px rgba(255,215,0,0.3))",
              }}
            >
              The Red Carpet
            </h2>
            <p className="text-sm md:text-lg text-white/40 mt-2 max-w-md mx-auto"
              style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}>
              Only the finest, award-worthy experiences
            </p>

            {/* Decorative line */}
            <div className="flex items-center justify-center gap-3 mt-4">
              <div className="h-px w-16 md:w-24" style={{ background: "linear-gradient(90deg, transparent, #DC143C)" }} />
              <div className="w-2 h-2 rounded-full" style={{ background: "#FFD700", boxShadow: "0 0 8px rgba(255,215,0,0.6)" }} />
              <div className="h-px w-16 md:w-24" style={{ background: "linear-gradient(90deg, #DC143C, transparent)" }} />
            </div>
          </motion.div>

          {/* Gold rope divider */}
          <GoldenRopeDivider />

          {/* Cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mt-6 max-w-6xl mx-auto">
            {premiumPicks.map((p, i) => (
              <OscarPropertyCard
                key={p.id}
                property={p}
                onTap={onPropertyTap}
                index={i}
                isWL={wishlist.includes(p.id)}
                onToggleWishlist={onToggleWishlist}
              />
            ))}
          </div>

          {/* Bottom red carpet */}
          <div className="mt-10">
            <RedCarpetFloor />
          </div>

          {/* Bottom badge */}
          <motion.div className="flex justify-center mt-6"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <div className="flex items-center gap-3 px-6 py-3 rounded-full"
              style={{ background: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.2)" }}>
              <Crown size={14} className="text-yellow-400" />
              <span className="text-[10px] md:text-xs font-bold tracking-[0.25em] text-yellow-400/70 uppercase">
                Handpicked by Hushh
              </span>
              <Crown size={14} className="text-yellow-400" />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
