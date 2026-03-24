import { useMemo, useState, useRef } from "react";
import { Star, ArrowRight, Award, Crown, Sparkles, Heart, Gem } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import type { Property } from "@/data/properties";

import oscarTrophy from "@/assets/oscar-trophy-3d.png";
import oscarCrown from "@/assets/oscar-crown-3d.png";
import oscarStar from "@/assets/oscar-star-3d.png";
import oscarWoodTexture from "@/assets/oscar-wood-texture.jpg";
import oscarVelvetRope from "@/assets/oscar-velvet-rope-3d.png";

/* ─── SVG Curtain component ─── */
function CurtainSVG({ side }: { side: "left" | "right" }) {
  const mirror = side === "right";
  return (
    <svg
      viewBox="0 0 120 600"
      className="absolute top-0 h-full pointer-events-none z-[2]"
      style={{
        width: "clamp(60px, 8vw, 120px)",
        [side]: 0,
        transform: mirror ? "scaleX(-1)" : undefined,
      }}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={`curtain-grad-${side}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#5C0A0A" stopOpacity="1" />
          <stop offset="25%" stopColor="#8B0000" stopOpacity="1" />
          <stop offset="50%" stopColor="#DC143C" stopOpacity="0.95" />
          <stop offset="75%" stopColor="#B22222" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#4A0000" stopOpacity="0.6" />
        </linearGradient>
        <filter id={`curtain-shadow-${side}`}>
          <feDropShadow dx="4" dy="0" stdDeviation="10" floodColor="#000" floodOpacity="0.6" />
        </filter>
      </defs>
      <path
        d="M0,0 C30,0 50,20 60,0 C70,25 80,10 90,0 L120,0 L120,600 C100,590 80,600 60,595 C40,600 20,590 0,600 Z"
        fill={`url(#curtain-grad-${side})`}
        filter={`url(#curtain-shadow-${side})`}
      />
      <path d="M20,0 C20,200 30,400 20,600" stroke="#FF6B6B" strokeWidth="0.8" fill="none" opacity="0.2" />
      <path d="M50,0 C50,180 60,350 50,600" stroke="#FF9999" strokeWidth="0.5" fill="none" opacity="0.15" />
      <path d="M80,0 C80,220 90,420 80,600" stroke="#FF6B6B" strokeWidth="0.6" fill="none" opacity="0.1" />
    </svg>
  );
}

/* ─── Gold sparkle ─── */
function GoldSparkle({ delay, x, y }: { delay: number; x: string; y: string }) {
  return (
    <motion.div
      className="absolute pointer-events-none z-[3]"
      style={{ left: x, top: y }}
      animate={{ opacity: [0, 1, 0], scale: [0.5, 1.3, 0.5], rotate: [0, 180, 360] }}
      transition={{ duration: 3, repeat: Infinity, delay, ease: "easeInOut" }}
    >
      <img src={oscarStar} alt="" className="w-4 h-4 object-contain" style={{ filter: "drop-shadow(0 0 6px rgba(255,215,0,0.6))" }} />
    </motion.div>
  );
}

/* ─── Premium Oscar Card ─── */
function OscarCard({ property, onTap, index, isWL, onToggleWishlist }: {
  property: Property; onTap: (p: Property) => void; index: number; isWL: boolean; onToggleWishlist?: (id: string) => void;
}) {
  const cheapest = Math.min(...property.slots.filter(s => s.available).map(s => s.price));
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.7, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="relative cursor-pointer group"
      onClick={() => onTap(property)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Mahogany + gold frame */}
      <div className="relative overflow-hidden rounded-2xl md:rounded-3xl"
        style={{
          backgroundImage: `url(${oscarWoodTexture})`,
          backgroundSize: "cover",
          padding: "6px",
          border: "3px solid #B8860B",
          boxShadow: hovered
            ? "0 0 45px rgba(255,215,0,0.45), 0 20px 60px rgba(0,0,0,0.5)"
            : "0 0 20px rgba(255,215,0,0.15), 0 10px 40px rgba(0,0,0,0.3)",
          transition: "box-shadow 0.5s ease",
        }}
      >
        <div className="relative h-[280px] md:h-[340px] overflow-hidden rounded-xl">
          <img src={property.images[0]} alt={property.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000"
            style={{ transform: hovered ? "scale(1.1)" : "scale(1)" }} />
          <div className="absolute inset-0"
            style={{ background: "linear-gradient(to top, rgba(15,2,2,0.95) 0%, rgba(40,5,5,0.5) 40%, rgba(0,0,0,0.1) 70%, transparent 100%)" }} />

          {/* Trophy badge */}
          <motion.div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-xl"
            style={{ background: "linear-gradient(145deg, #2a1a00, #1a0d00)", border: "2px solid #DAA520", boxShadow: "0 4px 16px rgba(255,215,0,0.4)" }}
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 2, repeat: Infinity }}>
            <img src={oscarTrophy} alt="" className="w-4 h-4 object-contain" />
            <span className="text-[10px] md:text-xs font-black tracking-wider"
              style={{ backgroundImage: "linear-gradient(135deg, #FFD700, #FFF, #FFD700)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              PREMIUM PICK
            </span>
          </motion.div>

          <motion.div className="absolute top-4 right-4 z-10"
            animate={{ y: [0, -4, 0], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}>
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center"
              style={{ background: "radial-gradient(circle, rgba(255,215,0,0.2), rgba(139,0,0,0.3))", backdropFilter: "blur(10px)", border: "1px solid rgba(255,215,0,0.3)" }}>
              <img src={oscarCrown} alt="" className="w-7 h-7 object-contain" />
            </div>
          </motion.div>

          {onToggleWishlist && (
            <button onClick={(e) => { e.stopPropagation(); onToggleWishlist(property.id); }}
              className="absolute bottom-4 right-4 w-10 h-10 rounded-full flex items-center justify-center z-10"
              style={{ background: "rgba(50,0,0,0.7)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,215,0,0.2)" }}>
              <Heart size={18} className={isWL ? "fill-red-500 text-red-500" : "text-white"} />
            </button>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 z-10">
            <div className="flex items-center gap-1.5 mb-2">
              {[...Array(5)].map((_, si) => (
                <Gem key={si} size={12} className={si < Math.round(property.rating) ? "fill-yellow-400 text-yellow-400" : "text-white/20"}
                  style={si < Math.round(property.rating) ? { filter: "drop-shadow(0 0 4px rgba(255,215,0,0.5))" } : {}} />
              ))}
              <span className="text-xs font-bold" style={{ color: "#FFD700" }}>{property.rating}</span>
            </div>

            <h3 className="text-xl md:text-2xl font-black text-white leading-tight"
              style={{ fontFamily: "'Playfair Display', serif", textShadow: "0 2px 10px rgba(0,0,0,0.8)" }}>
              {property.name}
            </h3>
            <p className="text-sm mt-1 line-clamp-2" style={{ color: "rgba(255,228,181,0.5)" }}>{property.description}</p>

            <div className="flex items-center justify-between mt-3">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl md:text-3xl font-black text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  ₹{cheapest.toLocaleString()}
                </span>
                <span className="text-xs text-white/40">onwards</span>
              </div>
              <motion.div className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-black"
                style={{ background: "linear-gradient(145deg, #FFD700, #DAA520, #B8860B)", color: "#1a0d00", border: "1px solid #FFD700", boxShadow: "0 4px 20px rgba(255,215,0,0.4), inset 0 2px 0 rgba(255,255,255,0.3)" }}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                Book Now <ArrowRight size={14} />
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <div className="h-2 mx-4 md:mx-6 rounded-b-full mt-[-2px]"
        style={{ background: "linear-gradient(90deg, transparent, #DC143C, #FF2D2D, #DC143C, transparent)", boxShadow: "0 3px 15px rgba(220,20,60,0.3)" }} />
    </motion.div>
  );
}

/* ─── Main Section ─── */
interface OscarRedCarpetSectionProps {
  properties: Property[];
  onPropertyTap: (p: Property) => void;
  wishlist: string[];
  onToggleWishlist?: (id: string) => void;
}

export default function OscarRedCarpetSection({ properties, onPropertyTap, wishlist, onToggleWishlist }: OscarRedCarpetSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const curtainLeftX = useTransform(scrollYProgress, [0, 0.3], [-60, 0]);
  const curtainRightX = useTransform(scrollYProgress, [0, 0.3], [60, 0]);

  const premiumPicks = useMemo(() => {
    const sorted = [...properties].sort((a, b) => b.rating - a.rating);
    return sorted.slice(0, 6);
  }, [properties]);

  if (premiumPicks.length === 0) return null;

  return (
    <div ref={sectionRef} className="relative overflow-hidden py-12 md:py-20 mt-8 md:mt-16">
      <div className="absolute inset-0 z-0"
        style={{ background: "radial-gradient(ellipse at center top, rgba(139,0,0,0.15) 0%, rgba(0,0,0,0.95) 60%, hsl(var(--background)) 100%)" }} />

      <motion.div style={{ x: curtainLeftX }} className="z-[2]">
        <CurtainSVG side="left" />
      </motion.div>
      <motion.div style={{ x: curtainRightX }} className="z-[2]">
        <CurtainSVG side="right" />
      </motion.div>

      {/* Floating 3D assets */}
      <GoldSparkle delay={0} x="15%" y="20%" />
      <GoldSparkle delay={0.5} x="80%" y="15%" />
      <GoldSparkle delay={1} x="25%" y="70%" />
      <GoldSparkle delay={1.5} x="70%" y="60%" />
      <GoldSparkle delay={2} x="50%" y="30%" />

      {/* Velvet rope */}
      <div className="relative z-[6] flex justify-center pt-12">
        <motion.img src={oscarVelvetRope} alt="" loading="lazy" className="w-[min(70%,400px)] h-auto object-contain opacity-80"
          style={{ filter: "drop-shadow(0 8px 20px rgba(0,0,0,0.4))" }}
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 4, repeat: Infinity }} />
      </div>

      {/* Section header */}
      <div className="relative z-[6] text-center px-5 pt-6 md:pt-8 pb-8 md:pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="h-px w-12 md:w-20" style={{ background: "linear-gradient(90deg, transparent, #FFD700)" }} />
            <motion.img src={oscarTrophy} alt="" className="w-10 h-10 md:w-14 md:h-14 object-contain"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{ filter: "drop-shadow(0 4px 16px rgba(255,215,0,0.5))" }} />
            <div className="h-px w-12 md:w-20" style={{ background: "linear-gradient(90deg, #FFD700, transparent)" }} />
          </div>
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-black text-white tracking-tight"
            style={{
              fontFamily: "'Playfair Display', serif",
              backgroundImage: "linear-gradient(135deg, #FFD700, #FFFFFF, #FFD700)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              filter: "drop-shadow(0 0 20px rgba(255,215,0,0.3))",
            }}>
            The Red Carpet Collection
          </h2>
          <p className="text-sm md:text-base mt-2 max-w-md mx-auto"
            style={{ color: "rgba(255,228,181,0.5)", fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}>
            Our most exclusive, award-worthy experiences
          </p>
        </motion.div>
      </div>

      {/* Cards grid */}
      <div className="relative z-[6] px-5 md:px-8 lg:px-16 xl:px-24 2xl:px-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
          {premiumPicks.map((p, i) => (
            <OscarCard key={p.id} property={p} onTap={onPropertyTap} index={i} isWL={wishlist.includes(p.id)} onToggleWishlist={onToggleWishlist} />
          ))}
        </div>
      </div>

      {/* Bottom decoration */}
      <div className="relative z-[5] flex justify-center mt-8 md:mt-10">
        <div className="flex items-center gap-3">
          <img src={oscarStar} alt="" className="w-4 h-4 object-contain" />
          <div className="h-px w-16 md:w-24" style={{ background: "linear-gradient(90deg, #FFD700, rgba(255,215,0,0.2))" }} />
          <span className="text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase" style={{ color: "rgba(255,215,0,0.6)" }}>Award Winners</span>
          <div className="h-px w-16 md:w-24" style={{ background: "linear-gradient(90deg, rgba(255,215,0,0.2), #FFD700)" }} />
          <img src={oscarStar} alt="" className="w-4 h-4 object-contain" />
        </div>
      </div>
    </div>
  );
}
