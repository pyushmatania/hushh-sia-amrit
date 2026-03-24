import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Sparkles, Award, Star, ArrowRight, Heart } from "lucide-react";
import type { Property } from "@/data/properties";
import type { CuratedCombo } from "@/data/properties";
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
        {/* Shimmer effect when ON */}
        {isOn && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.4) 45%, transparent 50%)",
            }}
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1.5 }}
          />
        )}

        {/* Toggle circle */}
        <motion.div
          className="w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center z-10"
          style={{
            background: isOn
              ? "linear-gradient(135deg, #1a1a1a, #333)"
              : "hsl(var(--card))",
            border: isOn ? "2px solid #FFD700" : "1px solid hsl(var(--border))",
            boxShadow: isOn ? "0 0 12px rgba(255,215,0,0.5)" : "none",
          }}
          animate={{ rotate: isOn ? 360 : 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          <Crown size={16} className={isOn ? "text-yellow-400" : "text-muted-foreground"} />
        </motion.div>

        <div className="flex flex-col items-start z-10">
          <span
            className="text-[11px] md:text-xs font-black tracking-[0.15em] uppercase"
            style={{ color: isOn ? "#1a1a1a" : "hsl(var(--muted-foreground))" }}
          >
            {isOn ? "RED CARPET ON" : "RED CARPET"}
          </span>
          <span
            className="text-[8px] md:text-[9px] font-medium"
            style={{
              color: isOn ? "rgba(0,0,0,0.6)" : "hsl(var(--muted-foreground) / 0.7)",
              fontFamily: "'Playfair Display', serif",
              fontStyle: "italic",
            }}
          >
            {isOn ? "✨ Award-worthy picks" : "Tap for premium picks"}
          </span>
        </div>

        {/* LED light dots */}
        {isOn && (
          <>
            {[0, 1, 2, 3, 4].map(i => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full"
                style={{
                  background: "#FFD700",
                  top: `${15 + i * 15}%`,
                  right: `${5 + (i % 3) * 4}%`,
                  boxShadow: "0 0 4px #FFD700",
                }}
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

/* ─── LED Fairy Light string ─── */
function FairyLights({ count = 12 }: { count?: number }) {
  return (
    <div className="absolute top-0 left-0 right-0 h-4 flex items-center justify-around pointer-events-none z-10 overflow-hidden px-2">
      {/* Wire */}
      <div className="absolute top-1.5 left-0 right-0 h-px" style={{ background: "rgba(139,69,19,0.5)" }} />
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full relative"
          style={{
            background: i % 3 === 0 ? "#FFD700" : i % 3 === 1 ? "#FF6B35" : "#FFE4B5",
            boxShadow: `0 0 6px ${i % 3 === 0 ? "rgba(255,215,0,0.8)" : i % 3 === 1 ? "rgba(255,107,53,0.7)" : "rgba(255,228,181,0.7)"}`,
          }}
          animate={{ opacity: [0.5, 1, 0.5], scale: [0.8, 1.1, 0.8] }}
          transition={{ duration: 1.5 + (i % 4) * 0.3, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

/* ─── Gold sparkle float ─── */
function GoldSparkle({ delay, x, y }: { delay: number; x: string; y: string }) {
  return (
    <motion.div
      className="absolute pointer-events-none z-[3]"
      style={{ left: x, top: y }}
      animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5], rotate: [0, 180, 360] }}
      transition={{ duration: 3, repeat: Infinity, delay, ease: "easeInOut" }}
    >
      <Sparkles size={12} className="text-yellow-400" />
    </motion.div>
  );
}

/* ─── Red Carpet strip ─── */
function RedCarpetStrip() {
  return (
    <div className="relative h-6 md:h-8 w-full overflow-hidden my-3">
      <div className="absolute inset-0" style={{
        background: "linear-gradient(90deg, transparent 0%, #8B0000 5%, #DC143C 25%, #FF2D2D 50%, #DC143C 75%, #8B0000 95%, transparent 100%)",
        boxShadow: "0 0 30px rgba(220,20,60,0.3), inset 0 2px 4px rgba(255,255,255,0.1)",
      }} />
      {/* Gold stars on carpet */}
      {[15, 35, 50, 65, 85].map((pos, i) => (
        <motion.div
          key={i}
          className="absolute top-1/2 -translate-y-1/2"
          style={{ left: `${pos}%` }}
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
        >
          <Star size={10} className="fill-yellow-400/50 text-yellow-400/50" />
        </motion.div>
      ))}
      {/* Perspective lines */}
      <div className="absolute inset-0" style={{
        background: "repeating-linear-gradient(90deg, transparent, transparent 19%, rgba(139,0,0,0.4) 19.5%, transparent 20%)",
      }} />
    </div>
  );
}

/* ─── Curtain sides ─── */
function CurtainSide({ side }: { side: "left" | "right" }) {
  return (
    <div
      className="absolute top-0 bottom-0 w-5 md:w-8 z-[5] pointer-events-none"
      style={{
        [side]: 0,
        background: `linear-gradient(${side === "left" ? "90deg" : "270deg"}, #8B0000 0%, #DC143C 40%, rgba(220,20,60,0.3) 80%, transparent 100%)`,
      }}
    >
      {/* Fabric folds */}
      <div className="absolute inset-0" style={{
        background: `repeating-linear-gradient(180deg, transparent, transparent 30px, rgba(255,255,255,0.05) 30px, transparent 32px)`,
      }} />
    </div>
  );
}

/* ─── Ribbon decoration ─── */
function GoldRibbon() {
  return (
    <div className="flex items-center justify-center gap-3 py-3">
      <div className="h-px flex-1 max-w-20 md:max-w-32" style={{ background: "linear-gradient(90deg, transparent, #FFD700)" }} />
      <motion.div
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        <Award size={20} className="text-yellow-400 md:w-6 md:h-6" />
      </motion.div>
      <span className="text-[9px] md:text-xs font-black tracking-[0.25em] uppercase" style={{
        backgroundImage: "linear-gradient(135deg, #FFD700, #FFFFFF, #FFD700)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }}>
        RED CARPET COLLECTION
      </span>
      <motion.div
        animate={{ rotate: [0, -5, 5, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        <Award size={20} className="text-yellow-400 md:w-6 md:h-6" />
      </motion.div>
      <div className="h-px flex-1 max-w-20 md:max-w-32" style={{ background: "linear-gradient(90deg, #FFD700, transparent)" }} />
    </div>
  );
}

/* ─── Oscar Property Card ─── */
function OscarPropertyCard({ property, onTap, index, isWL, onToggleWishlist }: {
  property: Property; onTap: (p: Property) => void; index: number; isWL: boolean; onToggleWishlist?: (id: string) => void;
}) {
  const cheapest = Math.min(...property.slots.filter(s => s.available).map(s => s.price));

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      className="relative cursor-pointer group"
      onClick={() => onTap(property)}
    >
      {/* LED lights on top */}
      <FairyLights count={10} />

      {/* Gold frame card */}
      <div
        className="relative overflow-hidden rounded-2xl md:rounded-3xl mt-2"
        style={{
          border: "3px solid transparent",
          backgroundImage: "linear-gradient(hsl(var(--background)), hsl(var(--background))), linear-gradient(135deg, #FFD700, #DAA520, #FFD700, #B8860B, #FFD700)",
          backgroundOrigin: "border-box",
          backgroundClip: "padding-box, border-box",
          boxShadow: "0 0 25px rgba(255,215,0,0.2), 0 12px 40px rgba(0,0,0,0.4), inset 0 0 15px rgba(255,215,0,0.05)",
        }}
      >
        <div className="relative h-[260px] md:h-[320px] overflow-hidden">
          <img
            src={property.images[0]}
            alt={property.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          />
          <div className="absolute inset-0" style={{
            background: "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0.1) 70%, transparent 100%)",
          }} />

          {/* Award badge */}
          <motion.div
            className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{
              background: "linear-gradient(135deg, #FFD700, #DAA520)",
              boxShadow: "0 4px 16px rgba(255,215,0,0.5)",
            }}
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Award size={12} className="text-black" />
            <span className="text-[9px] md:text-[10px] font-black text-black tracking-wider">
              {index === 0 ? "🏆 BEST PICK" : index === 1 ? "⭐ TOP RATED" : "👑 PREMIUM"}
            </span>
          </motion.div>

          {/* Crown */}
          <motion.div
            className="absolute top-4 right-4 z-10"
            animate={{ y: [0, -3, 0], rotate: [0, 4, -4, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, rgba(255,215,0,0.3), rgba(218,165,32,0.2))",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,215,0,0.4)",
              }}
            >
              <Crown size={16} className="text-yellow-400" />
            </div>
          </motion.div>

          {onToggleWishlist && (
            <button
              onClick={(e) => { e.stopPropagation(); onToggleWishlist(property.id); }}
              className="absolute bottom-4 right-4 w-9 h-9 rounded-full flex items-center justify-center z-10"
              style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(10px)" }}
            >
              <Heart size={16} className={isWL ? "fill-red-500 text-red-500" : "text-white"} />
            </button>
          )}

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5 z-10">
            <div className="flex items-center gap-1 mb-1.5">
              {[...Array(5)].map((_, si) => (
                <Star key={si} size={10} className={si < Math.round(property.rating) ? "fill-yellow-400 text-yellow-400" : "text-white/20"} />
              ))}
              <span className="text-[10px] font-bold text-yellow-400 ml-1">{property.rating}</span>
            </div>
            <h3
              className="text-lg md:text-xl font-black text-white leading-tight"
              style={{ fontFamily: "'Playfair Display', serif", textShadow: "0 2px 10px rgba(0,0,0,0.8)" }}
            >
              {property.name}
            </h3>
            <p className="text-[11px] md:text-xs text-white/50 mt-1 line-clamp-1">{property.description}</p>
            <div className="flex items-center justify-between mt-3">
              <span className="text-xl md:text-2xl font-black text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                ₹{cheapest.toLocaleString()}<span className="text-xs text-white/40 font-normal"> onwards</span>
              </span>
              <motion.div
                className="flex items-center gap-1 px-4 py-2 rounded-full text-[11px] md:text-xs font-bold"
                style={{
                  background: "linear-gradient(135deg, #FFD700, #DAA520)",
                  color: "#000",
                  boxShadow: "0 4px 16px rgba(255,215,0,0.35)",
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Book Now <ArrowRight size={12} />
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Red carpet strip under card */}
      <div className="h-1.5 mx-3 md:mx-5 rounded-b-full -mt-px" style={{
        background: "linear-gradient(90deg, transparent, #DC143C, #FF2D2D, #DC143C, transparent)",
        boxShadow: "0 2px 12px rgba(220,20,60,0.25)",
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
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden"
      >
        {/* Dark cinematic background */}
        <div className="absolute inset-0 z-0" style={{
          background: "radial-gradient(ellipse at center top, rgba(139,0,0,0.12) 0%, rgba(0,0,0,0.92) 50%, hsl(var(--background)) 100%)",
        }} />

        {/* Curtain sides */}
        <CurtainSide side="left" />
        <CurtainSide side="right" />

        {/* Floating gold sparkles */}
        <GoldSparkle delay={0} x="10%" y="15%" />
        <GoldSparkle delay={0.7} x="85%" y="10%" />
        <GoldSparkle delay={1.3} x="20%" y="60%" />
        <GoldSparkle delay={1.8} x="75%" y="55%" />
        <GoldSparkle delay={0.4} x="50%" y="25%" />
        <GoldSparkle delay={2.2} x="92%" y="40%" />

        <div className="relative z-[6] px-5 md:px-8 lg:px-16 xl:px-24 2xl:px-32 py-6 md:py-10">
          {/* Red carpet at top */}
          <RedCarpetStrip />

          {/* Gold ribbon header */}
          <GoldRibbon />

          {/* Cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 mt-4 max-w-6xl mx-auto">
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
          <RedCarpetStrip />

          {/* Bottom decoration */}
          <div className="flex justify-center mt-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: "#FFD700", boxShadow: "0 0 8px rgba(255,215,0,0.5)" }} />
              <div className="h-px w-12 md:w-20" style={{ background: "linear-gradient(90deg, #FFD700, rgba(255,215,0,0.2))" }} />
              <span className="text-[8px] md:text-[10px] font-bold tracking-[0.25em] text-yellow-400/50 uppercase">Award Winners</span>
              <div className="h-px w-12 md:w-20" style={{ background: "linear-gradient(90deg, rgba(255,215,0,0.2), #FFD700)" }} />
              <div className="w-2 h-2 rounded-full" style={{ background: "#FFD700", boxShadow: "0 0 8px rgba(255,215,0,0.5)" }} />
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
