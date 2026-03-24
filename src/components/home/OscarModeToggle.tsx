import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Sparkles, Award, Star, ArrowRight, Heart, Trophy, Gem } from "lucide-react";
import type { Property } from "@/data/properties";
import { hapticSelection } from "@/lib/haptics";

/* 3D Asset imports */
import oscarTrophy from "@/assets/oscar-trophy-3d.png";
import oscarCrown from "@/assets/oscar-crown-3d.png";
import oscarClapper from "@/assets/oscar-clapper-3d.png";
import oscarStar from "@/assets/oscar-star-3d.png";
import oscarWoodTexture from "@/assets/oscar-wood-texture.jpg";
import oscarVelvetRope from "@/assets/oscar-velvet-rope-3d.png";

/* ─── Skeuomorphic Toggle Button (Ruby & Gold) ─── */
export function OscarToggle({ isOn, onToggle }: { isOn: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center justify-center py-4 md:py-6">
      <motion.button
        onClick={() => { hapticSelection(); onToggle(); }}
        className="relative flex items-center gap-3 px-5 py-3 md:px-7 md:py-3.5 rounded-2xl cursor-pointer select-none overflow-hidden"
        style={{
          background: isOn
            ? `url(${oscarWoodTexture})`
            : "hsl(var(--muted))",
          backgroundSize: "cover",
          border: isOn ? "3px solid #DAA520" : "2px solid hsl(var(--border) / 0.4)",
          boxShadow: isOn
            ? "0 0 40px rgba(255,215,0,0.5), 0 8px 30px rgba(139,0,0,0.4), inset 0 2px 0 rgba(255,255,255,0.2), inset 0 -2px 4px rgba(0,0,0,0.4)"
            : "0 2px 8px hsl(var(--foreground) / 0.06)",
          transition: "box-shadow 0.5s, border-color 0.3s",
        }}
        whileHover={{ scale: 1.04, boxShadow: isOn ? "0 0 50px rgba(255,215,0,0.6)" : undefined }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Inner gold bevel border */}
        {isOn && (
          <div className="absolute inset-[3px] rounded-xl pointer-events-none"
            style={{ border: "1px solid rgba(255,215,0,0.25)", boxShadow: "inset 0 1px 0 rgba(255,215,0,0.15)" }} />
        )}
        {/* Shine sweep */}
        {isOn && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.25) 42%, transparent 50%)" }}
            animate={{ x: ["-100%", "250%"] }}
            transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2 }}
          />
        )}
        {/* Ruby gemstone icon */}
        <motion.div
          className="w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center z-10"
          style={{
            background: isOn
              ? "radial-gradient(circle at 35% 35%, #FF2D55, #8B0000)"
              : "hsl(var(--card))",
            border: isOn ? "2px solid #FFD700" : "1px solid hsl(var(--border))",
            boxShadow: isOn
              ? "0 0 20px rgba(255,45,85,0.6), inset 0 2px 4px rgba(255,255,255,0.3), inset 0 -2px 4px rgba(0,0,0,0.4)"
              : "none",
          }}
          animate={isOn ? { scale: [1, 1.08, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {isOn ? (
            <img src={oscarCrown} alt="" className="w-7 h-7 md:w-8 md:h-8 object-contain" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }} />
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
              fontFamily: "'Playfair Display', serif",
              fontStyle: "italic",
              textShadow: isOn ? "0 1px 3px rgba(0,0,0,0.6)" : "none",
            }}>
            {isOn ? "The Gala is live" : "Tap for premium picks"}
          </span>
        </div>
        {/* Floating sparkle particles */}
        {isOn && (
          <>
            {[0, 1, 2, 3, 4, 5].map(i => (
              <motion.div key={i} className="absolute rounded-full"
                style={{
                  width: 3 + (i % 3),
                  height: 3 + (i % 3),
                  background: i % 2 === 0 ? "#FFD700" : "#FF2D55",
                  top: `${10 + i * 14}%`,
                  right: `${3 + (i % 4) * 5}%`,
                  boxShadow: `0 0 6px ${i % 2 === 0 ? "#FFD700" : "#FF2D55"}`,
                }}
                animate={{ opacity: [0.2, 1, 0.2], y: [0, -4, 0] }}
                transition={{ duration: 1 + i * 0.2, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </>
        )}
      </motion.button>
    </div>
  );
}

/* ─── Magical Particle System ─── */
function MagicalParticles({ count = 50 }: { count?: number }) {
  const particles = useMemo(() => Array.from({ length: count }, (_, i) => ({
    x: `${Math.random() * 100}%`,
    y: `${Math.random() * 100}%`,
    size: 1 + Math.random() * 3,
    delay: Math.random() * 5,
    dur: 3 + Math.random() * 4,
    type: i % 5,
  })), [count]);

  return (
    <div className="absolute inset-0 pointer-events-none z-[2] overflow-hidden">
      {particles.map((p, i) => (
        <motion.div key={i}
          className="absolute rounded-full"
          style={{
            left: p.x, top: p.y,
            width: p.size, height: p.size,
            background: p.type === 0 ? "#FFD700" : p.type === 1 ? "#FF2D55" : p.type === 2 ? "#FFE4B5" : p.type === 3 ? "#FFF" : "#FF6B35",
            boxShadow: `0 0 ${p.size * 4}px ${p.type === 0 ? "rgba(255,215,0,0.8)" : p.type === 1 ? "rgba(255,45,85,0.6)" : "rgba(255,255,255,0.4)"}`,
          }}
          animate={{ opacity: [0, 1, 0], scale: [0.3, 1.2, 0.3], y: [0, -20, 0] }}
          transition={{ duration: p.dur, repeat: Infinity, delay: p.delay }}
        />
      ))}
    </div>
  );
}

/* ─── 3D Floating Asset ─── */
function Floating3DAsset({ src, x, y, size, delay = 0, rotRange = 10 }: {
  src: string; x: string; y: string; size: number; delay?: number; rotRange?: number;
}) {
  return (
    <motion.div
      className="absolute pointer-events-none z-[5]"
      style={{ left: x, top: y }}
      animate={{
        y: [0, -15, 0],
        rotateZ: [-rotRange / 2, rotRange / 2, -rotRange / 2],
        rotateY: [0, 15, -15, 0],
      }}
      transition={{ duration: 5 + delay, repeat: Infinity, delay, ease: "easeInOut" }}
    >
      <img src={src} alt="" loading="lazy"
        className="object-contain"
        style={{
          width: size, height: size,
          filter: "drop-shadow(0 12px 30px rgba(0,0,0,0.6))",
        }}
      />
    </motion.div>
  );
}

/* ─── Spotlight Beam ─── */
function SpotlightBeam({ x, delay = 0, color = "rgba(255,215,0,0.08)" }: { x: string; delay?: number; color?: string }) {
  return (
    <motion.div
      className="absolute top-0 pointer-events-none z-[2]"
      style={{
        left: x,
        width: "250px",
        height: "100%",
        background: `conic-gradient(from 180deg at 50% 0%, transparent 28%, ${color} 40%, rgba(255,215,0,0.15) 50%, ${color} 60%, transparent 72%)`,
        transformOrigin: "top center",
      }}
      animate={{ rotate: [-12, 12, -12] }}
      transition={{ duration: 8, repeat: Infinity, delay, ease: "easeInOut" }}
    />
  );
}

/* ─── Velvet Curtain with 3D Fabric ─── */
function VelvetCurtain3D({ side }: { side: "left" | "right" }) {
  return (
    <div className="absolute top-0 bottom-0 w-10 md:w-20 z-[8] pointer-events-none" style={{ [side]: 0 }}>
      {/* Multi-layered velvet */}
      <div className="absolute inset-0" style={{
        background: side === "left"
          ? "linear-gradient(90deg, #3D0000 0%, #6B0000 15%, #8B0000 30%, #A52A2A 50%, rgba(139,0,0,0.4) 75%, transparent 100%)"
          : "linear-gradient(270deg, #3D0000 0%, #6B0000 15%, #8B0000 30%, #A52A2A 50%, rgba(139,0,0,0.4) 75%, transparent 100%)",
        boxShadow: side === "left"
          ? "inset -8px 0 20px rgba(0,0,0,0.5)"
          : "inset 8px 0 20px rgba(0,0,0,0.5)",
      }} />
      {/* Fabric fold detail */}
      <div className="absolute inset-0" style={{
        background: "repeating-linear-gradient(180deg, transparent 0px, transparent 30px, rgba(255,255,255,0.04) 31px, transparent 33px, transparent 50px, rgba(0,0,0,0.1) 51px, transparent 53px)",
      }} />
      {/* Gold braid trim */}
      <div className="absolute top-0 bottom-0"
        style={{
          width: 4,
          [side === "left" ? "right" : "left"]: 0,
          background: "linear-gradient(180deg, #FFD700 0%, #DAA520 20%, #B8860B 40%, #FFD700 60%, #DAA520 80%, #B8860B 100%)",
          boxShadow: "0 0 12px rgba(255,215,0,0.4)",
        }}
      />
      {/* Gold tassel ornament */}
      <motion.div className="absolute top-8" style={{ [side === "left" ? "right" : "left"]: -6 }}
        animate={{ y: [0, 5, 0], rotate: [-3, 3, -3] }}
        transition={{ duration: 4, repeat: Infinity }}>
        <div className="flex flex-col items-center gap-0.5">
          <div className="w-4 h-4 rounded-full" style={{ background: "radial-gradient(circle at 35% 35%, #FFD700, #8B6914)", boxShadow: "0 0 10px rgba(255,215,0,0.5)" }} />
          <div className="w-px h-6" style={{ background: "linear-gradient(180deg, #DAA520, transparent)" }} />
        </div>
      </motion.div>
    </div>
  );
}

/* ─── 3D Red Carpet Floor (perspective) ─── */
function RedCarpetFloor3D() {
  return (
    <div className="relative w-full overflow-hidden" style={{ perspective: "800px" }}>
      <motion.div
        className="relative h-16 md:h-24 w-[90%] md:w-[80%] mx-auto"
        style={{
          background: "linear-gradient(90deg, transparent 0%, #3D0000 3%, #5C0A0A 8%, #8B0000 20%, #DC143C 40%, #FF2D2D 50%, #DC143C 60%, #8B0000 80%, #5C0A0A 92%, #3D0000 97%, transparent 100%)",
          transform: "rotateX(55deg)",
          transformOrigin: "center bottom",
          borderRadius: "4px",
          boxShadow: "0 15px 40px rgba(220,20,60,0.3), inset 0 3px 8px rgba(255,255,255,0.15), inset 0 -3px 8px rgba(0,0,0,0.4)",
        }}
        animate={{ boxShadow: [
          "0 15px 40px rgba(220,20,60,0.3), inset 0 3px 8px rgba(255,255,255,0.15), inset 0 -3px 8px rgba(0,0,0,0.4)",
          "0 15px 60px rgba(220,20,60,0.5), inset 0 3px 8px rgba(255,255,255,0.2), inset 0 -3px 8px rgba(0,0,0,0.4)",
          "0 15px 40px rgba(220,20,60,0.3), inset 0 3px 8px rgba(255,255,255,0.15), inset 0 -3px 8px rgba(0,0,0,0.4)",
        ] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        {/* Walk of fame stars on carpet */}
        <div className="absolute inset-0 flex items-center justify-around px-4">
          {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
            <motion.div key={i}
              animate={{ opacity: [0.3, 0.8, 0.3], scale: [0.8, 1.1, 0.8] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.25 }}>
              <img src={oscarStar} alt="" className="w-4 h-4 md:w-6 md:h-6 object-contain opacity-60" />
            </motion.div>
          ))}
        </div>
        {/* Velvet texture overlay */}
        <div className="absolute inset-0" style={{
          background: "repeating-linear-gradient(0deg, transparent 0px, transparent 4px, rgba(255,255,255,0.02) 4px, transparent 5px)",
        }} />
      </motion.div>
    </div>
  );
}

/* ─── Velvet Rope Barrier ─── */
function VelvetRopeBarrier() {
  return (
    <div className="relative flex justify-center items-center py-3 z-[6]">
      <motion.img src={oscarVelvetRope} alt="" loading="lazy"
        className="w-[min(80%,500px)] h-auto object-contain"
        style={{ filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.5))" }}
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

/* ─── LED Fairy Lights (3D bulbs) ─── */
function FairyLights3D({ count = 16 }: { count?: number }) {
  return (
    <div className="absolute top-0 left-0 right-0 h-6 flex items-end justify-around pointer-events-none z-[11] px-1">
      {/* Wire */}
      <svg className="absolute top-0 left-0 right-0 h-4 w-full" preserveAspectRatio="none">
        <path d={`M0,8 ${Array.from({ length: count + 1 }, (_, i) => `Q${(i * 100) / count + 2}%,${i % 2 === 0 ? 2 : 14} ${((i + 0.5) * 100) / count}%,8`).join(" ")}`}
          fill="none" stroke="rgba(80,40,20,0.7)" strokeWidth="1.5" />
      </svg>
      {Array.from({ length: count }).map((_, i) => {
        const colors = ["#FFD700", "#FF2D55", "#FFE4B5", "#FF6B35", "#FF4444", "#FFD700", "#FF2D55", "#FFF"];
        const c = colors[i % colors.length];
        return (
          <motion.div key={i} className="relative z-10"
            style={{ marginTop: i % 2 === 0 ? 6 : 10 }}>
            {/* Bulb */}
            <motion.div className="w-2.5 h-3.5 rounded-b-full rounded-t-sm"
              style={{
                background: `radial-gradient(circle at 40% 30%, ${c}, ${c}88)`,
                boxShadow: `0 0 8px ${c}aa, 0 0 16px ${c}44, inset 0 1px 2px rgba(255,255,255,0.5)`,
                border: "0.5px solid rgba(255,255,255,0.2)",
              }}
              animate={{ opacity: [0.5, 1, 0.5], scale: [0.85, 1.15, 0.85] }}
              transition={{ duration: 1 + (i % 5) * 0.3, repeat: Infinity, delay: i * 0.1 }}
            />
          </motion.div>
        );
      })}
    </div>
  );
}

/* ─── Mahogany & Gold Card Frame ─── */
function SkeuomorphicCard({ property, onTap, index, isWL, onToggleWishlist }: {
  property: Property; onTap: (p: Property) => void; index: number; isWL: boolean; onToggleWishlist?: (id: string) => void;
}) {
  const cheapest = Math.min(...property.slots.filter(s => s.available).map(s => s.price));
  const badges = ["🏆 BEST PICTURE", "⭐ AUDIENCE CHOICE", "👑 DIRECTOR'S CUT", "🎭 CRITICS' PICK", "💎 PLATINUM", "🌟 SHOWSTOPPER"];
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.85, rotateX: 15 }}
      animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
      transition={{ duration: 0.8, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="relative cursor-pointer group"
      style={{ perspective: "1000px" }}
      onClick={() => onTap(property)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Fairy lights on top */}
      <FairyLights3D count={12} />

      {/* Mahogany wood + gold outer frame */}
      <div className="relative overflow-hidden rounded-2xl md:rounded-3xl mt-3"
        style={{
          backgroundImage: `url(${oscarWoodTexture})`,
          backgroundSize: "cover",
          padding: "8px",
          border: "3px solid #B8860B",
          boxShadow: hovered
            ? "0 0 50px rgba(255,215,0,0.5), 0 25px 70px rgba(0,0,0,0.6), inset 0 0 30px rgba(255,215,0,0.15), inset 0 2px 0 rgba(255,255,255,0.1)"
            : "0 0 25px rgba(255,215,0,0.2), 0 15px 50px rgba(0,0,0,0.4), inset 0 2px 0 rgba(255,255,255,0.08)",
          transition: "box-shadow 0.5s ease, transform 0.4s ease",
          transform: hovered ? "translateY(-4px) scale(1.01)" : "translateY(0)",
        }}
      >
        {/* Gold inner bevel */}
        <div className="absolute inset-[4px] rounded-xl pointer-events-none z-20"
          style={{ border: "1.5px solid rgba(255,215,0,0.35)", boxShadow: "inset 0 1px 0 rgba(255,215,0,0.2)" }} />

        {/* Image container */}
        <div className="relative h-[280px] md:h-[340px] overflow-hidden rounded-xl">
          <img src={property.images[0]} alt={property.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000"
            style={{ transform: hovered ? "scale(1.12)" : "scale(1)" }} />

          {/* Cinematic gradient overlay */}
          <div className="absolute inset-0" style={{
            background: "linear-gradient(to top, rgba(15,2,2,0.98) 0%, rgba(40,5,5,0.7) 30%, rgba(80,10,10,0.2) 55%, transparent 100%)",
          }} />

          {/* Vignette */}
          <div className="absolute inset-0" style={{
            background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.5) 100%)",
          }} />

          {/* 3D Trophy badge */}
          <motion.div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{
              background: "linear-gradient(145deg, #2a1a00, #1a0d00)",
              border: "2px solid #DAA520",
              boxShadow: "0 4px 20px rgba(255,215,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -1px 3px rgba(0,0,0,0.5)",
            }}
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 2, repeat: Infinity }}>
            <img src={oscarTrophy} alt="" className="w-5 h-5 object-contain" />
            <span className="text-[9px] md:text-[10px] font-black tracking-wider"
              style={{
                backgroundImage: "linear-gradient(135deg, #FFD700, #FFF, #FFD700)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
              {badges[index % badges.length]}
            </span>
          </motion.div>

          {/* Floating crown */}
          <motion.div className="absolute top-4 right-4 z-10"
            animate={{ y: [0, -6, 0], rotateZ: [0, 8, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity }}>
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center"
              style={{
                background: "radial-gradient(circle at 35% 35%, rgba(255,215,0,0.25), rgba(139,0,0,0.3))",
                backdropFilter: "blur(10px)",
                border: "2px solid rgba(255,215,0,0.3)",
                boxShadow: "0 0 20px rgba(255,215,0,0.3)",
              }}>
              <img src={oscarCrown} alt="" className="w-8 h-8 md:w-9 md:h-9 object-contain" />
            </div>
          </motion.div>

          {/* Wishlist */}
          {onToggleWishlist && (
            <button onClick={(e) => { e.stopPropagation(); onToggleWishlist(property.id); }}
              className="absolute bottom-4 right-4 w-11 h-11 rounded-full flex items-center justify-center z-10"
              style={{
                background: "radial-gradient(circle at 35% 35%, rgba(139,0,0,0.8), rgba(50,0,0,0.9))",
                border: "2px solid rgba(255,215,0,0.3)",
                boxShadow: "0 4px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15)",
              }}>
              <Heart size={16} className={isWL ? "fill-red-400 text-red-400" : "text-white/80"} />
            </button>
          )}

          {/* Content overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 z-10">
            {/* Star rating as gemstones */}
            <div className="flex items-center gap-1.5 mb-2">
              {[...Array(5)].map((_, si) => (
                <motion.div key={si}
                  animate={si < Math.round(property.rating) ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity, delay: si * 0.2 }}>
                  <Gem size={12}
                    className={si < Math.round(property.rating) ? "fill-yellow-400 text-yellow-400" : "text-white/15"}
                    style={si < Math.round(property.rating) ? { filter: "drop-shadow(0 0 4px rgba(255,215,0,0.6))" } : {}} />
                </motion.div>
              ))}
              <span className="text-[10px] font-black ml-1"
                style={{ backgroundImage: "linear-gradient(135deg, #FFD700, #FFF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                {property.rating}
              </span>
            </div>

            <h3 className="text-xl md:text-2xl font-black text-white leading-tight"
              style={{ fontFamily: "'Playfair Display', serif", textShadow: "0 2px 12px rgba(0,0,0,0.9), 0 0 30px rgba(139,0,0,0.3)" }}>
              {property.name}
            </h3>
            <p className="text-[11px] md:text-xs mt-1 line-clamp-1"
              style={{ color: "rgba(255,228,181,0.5)", fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}>
              {property.description}
            </p>

            <div className="flex items-center justify-between mt-3">
              <div>
                <span className="text-2xl md:text-3xl font-black text-white" style={{ fontFamily: "'Space Grotesk', sans-serif", textShadow: "0 0 20px rgba(255,215,0,0.3)" }}>
                  ₹{cheapest.toLocaleString()}
                </span>
                <span className="text-[10px] text-white/30 ml-1.5">onwards</span>
              </div>

              {/* Skeuomorphic gold bar button */}
              <motion.div
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-[11px] md:text-xs font-black"
                style={{
                  background: "linear-gradient(145deg, #FFD700, #DAA520, #B8860B)",
                  color: "#1a0d00",
                  border: "1px solid #FFD700",
                  boxShadow: "0 4px 20px rgba(255,215,0,0.4), inset 0 2px 0 rgba(255,255,255,0.4), inset 0 -2px 4px rgba(0,0,0,0.2)",
                  textShadow: "0 1px 0 rgba(255,255,255,0.3)",
                }}
                whileHover={{ scale: 1.05, boxShadow: "0 6px 30px rgba(255,215,0,0.6)" }}
                whileTap={{ scale: 0.93, boxShadow: "0 2px 10px rgba(255,215,0,0.3)", y: 2 }}>
                Book Now <ArrowRight size={12} />
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Glowing carpet strip under card */}
      <motion.div className="h-2.5 mx-4 md:mx-6 rounded-b-full -mt-px"
        style={{
          background: "linear-gradient(90deg, transparent, #8B0000, #DC143C, #FF2D2D, #DC143C, #8B0000, transparent)",
          boxShadow: "0 4px 20px rgba(220,20,60,0.4)",
        }}
        animate={{ boxShadow: ["0 4px 20px rgba(220,20,60,0.4)", "0 4px 30px rgba(220,20,60,0.6)", "0 4px 20px rgba(220,20,60,0.4)"] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </motion.div>
  );
}

/* ─── Grand Theater Background ─── */
function TheaterBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      {/* Deep dramatic gradient */}
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse at 50% 0%, #2a0808 0%, #1a0404 25%, #0d0202 50%, #050101 75%, #020000 100%)",
      }} />
      {/* Marble floor reflection at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[30%]" style={{
        background: "linear-gradient(to top, rgba(20,8,4,0.9), transparent)",
      }} />
      {/* Gold ambient light from top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px]" style={{
        background: "radial-gradient(ellipse, rgba(255,215,0,0.06) 0%, transparent 70%)",
      }} />
      {/* Red ambient edges */}
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse at 0% 50%, rgba(139,0,0,0.15), transparent 40%), radial-gradient(ellipse at 100% 50%, rgba(139,0,0,0.15), transparent 40%)",
      }} />
      {/* Checkerboard marble floor hint */}
      <div className="absolute bottom-0 left-0 right-0 h-[15%] opacity-[0.03]" style={{
        backgroundImage: "repeating-conic-gradient(rgba(255,215,0,0.5) 0% 25%, transparent 0% 50%)",
        backgroundSize: "40px 40px",
        transform: "perspective(500px) rotateX(60deg)",
        transformOrigin: "bottom center",
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
        transition={{ duration: 0.8 }}
        className="relative overflow-hidden min-h-screen"
      >
        {/* Theater background */}
        <TheaterBackground />

        {/* Magical particles */}
        <MagicalParticles count={50} />

        {/* Spotlight beams */}
        <SpotlightBeam x="0%" delay={0} />
        <SpotlightBeam x="65%" delay={2.5} />
        <SpotlightBeam x="35%" delay={5} color="rgba(220,20,60,0.06)" />

        {/* 3D Velvet curtains */}
        <VelvetCurtain3D side="left" />
        <VelvetCurtain3D side="right" />

        {/* Floating 3D assets */}
        <Floating3DAsset src={oscarTrophy} x="3%" y="6%" size={60} delay={0} />
        <Floating3DAsset src={oscarTrophy} x="88%" y="4%" size={50} delay={1.5} />
        <Floating3DAsset src={oscarClapper} x="90%" y="30%" size={55} delay={0.5} rotRange={15} />
        <Floating3DAsset src={oscarClapper} x="2%" y="45%" size={45} delay={2.5} rotRange={12} />
        <Floating3DAsset src={oscarStar} x="85%" y="60%" size={40} delay={1} />
        <Floating3DAsset src={oscarStar} x="5%" y="70%" size={35} delay={3} />
        <Floating3DAsset src={oscarCrown} x="92%" y="80%" size={45} delay={2} />
        <Floating3DAsset src={oscarCrown} x="4%" y="25%" size={40} delay={0.8} />

        {/* Content */}
        <div className="relative z-[9] px-5 md:px-8 lg:px-16 xl:px-24 2xl:px-32 pt-6 pb-12 md:pt-10 md:pb-16">

          {/* Velvet Rope at top */}
          <VelvetRopeBarrier />

          {/* 3D Red Carpet */}
          <RedCarpetFloor3D />

          {/* Grand Header */}
          <motion.div className="text-center py-8 md:py-12"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}>

            {/* Trophy cluster */}
            <motion.div className="flex items-center justify-center gap-4 mb-5"
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ duration: 3, repeat: Infinity }}>
              <motion.img src={oscarStar} alt="" className="w-8 h-8 md:w-10 md:h-10 object-contain"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                style={{ filter: "drop-shadow(0 0 12px rgba(255,215,0,0.6))" }} />
              <motion.img src={oscarTrophy} alt="" className="w-14 h-14 md:w-20 md:h-20 object-contain"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                style={{ filter: "drop-shadow(0 8px 24px rgba(255,215,0,0.5))" }} />
              <motion.img src={oscarStar} alt="" className="w-8 h-8 md:w-10 md:h-10 object-contain"
                animate={{ rotate: [360, 0] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                style={{ filter: "drop-shadow(0 0 12px rgba(255,215,0,0.6))" }} />
            </motion.div>

            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight"
              style={{
                fontFamily: "'Playfair Display', serif",
                backgroundImage: "linear-gradient(135deg, #FFD700 0%, #FFFFFF 30%, #FFD700 50%, #FFF 70%, #DAA520 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                filter: "drop-shadow(0 0 20px rgba(255,215,0,0.4))",
              }}>
              The Red Carpet
            </h2>

            <p className="text-sm md:text-lg mt-2 max-w-md mx-auto"
              style={{ color: "rgba(255,228,181,0.5)", fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}>
              Only the finest, award-worthy experiences
            </p>

            {/* Ornamental divider */}
            <div className="flex items-center justify-center gap-3 mt-5">
              <div className="h-px w-12 md:w-20" style={{ background: "linear-gradient(90deg, transparent, #DC143C)" }} />
              <motion.img src={oscarStar} alt="" className="w-5 h-5 object-contain"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                style={{ filter: "drop-shadow(0 0 8px rgba(255,215,0,0.5))" }} />
              <div className="h-px w-8 md:w-14" style={{ background: "linear-gradient(90deg, #DAA520, #DAA520)" }} />
              <Gem size={14} className="text-red-400" style={{ filter: "drop-shadow(0 0 6px rgba(255,45,85,0.6))" }} />
              <div className="h-px w-8 md:w-14" style={{ background: "linear-gradient(90deg, #DAA520, #DAA520)" }} />
              <motion.img src={oscarStar} alt="" className="w-5 h-5 object-contain"
                animate={{ rotate: [360, 0] }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                style={{ filter: "drop-shadow(0 0 8px rgba(255,215,0,0.5))" }} />
              <div className="h-px w-12 md:w-20" style={{ background: "linear-gradient(90deg, #DC143C, transparent)" }} />
            </div>
          </motion.div>

          {/* Rope divider */}
          <VelvetRopeBarrier />

          {/* Cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 mt-6 max-w-7xl mx-auto">
            {premiumPicks.map((p, i) => (
              <SkeuomorphicCard
                key={p.id}
                property={p}
                onTap={onPropertyTap}
                index={i}
                isWL={wishlist.includes(p.id)}
                onToggleWishlist={onToggleWishlist}
              />
            ))}
          </div>

          {/* Bottom carpet */}
          <div className="mt-12">
            <RedCarpetFloor3D />
          </div>

          {/* Bottom badge */}
          <motion.div className="flex justify-center mt-8"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}>
            <div className="flex items-center gap-3 px-6 py-3 rounded-2xl"
              style={{
                backgroundImage: `url(${oscarWoodTexture})`,
                backgroundSize: "cover",
                border: "2px solid rgba(255,215,0,0.3)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
              }}>
              <img src={oscarCrown} alt="" className="w-5 h-5 object-contain" />
              <span className="text-[10px] md:text-xs font-black tracking-[0.25em] uppercase"
                style={{
                  backgroundImage: "linear-gradient(135deg, #FFD700, #FFF, #FFD700)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>
                Handpicked by Hushh
              </span>
              <img src={oscarCrown} alt="" className="w-5 h-5 object-contain" />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
