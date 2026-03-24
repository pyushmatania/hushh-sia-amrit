import { useMemo, useState, useRef, useEffect } from "react";
import { Star, ArrowRight, Award, Crown, Sparkles, Heart } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import type { Property } from "@/data/properties";

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
          <stop offset="0%" stopColor="#8B0000" stopOpacity="1" />
          <stop offset="40%" stopColor="#DC143C" stopOpacity="0.95" />
          <stop offset="70%" stopColor="#B22222" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#4A0000" stopOpacity="0.7" />
        </linearGradient>
        <filter id={`curtain-shadow-${side}`}>
          <feDropShadow dx="4" dy="0" stdDeviation="8" floodColor="#000" floodOpacity="0.5" />
        </filter>
      </defs>
      {/* Main curtain drape folds */}
      <path
        d="M0,0 C30,0 50,20 60,0 C70,25 80,10 90,0 L120,0 L120,600 C100,590 80,600 60,595 C40,600 20,590 0,600 Z"
        fill={`url(#curtain-grad-${side})`}
        filter={`url(#curtain-shadow-${side})`}
      />
      {/* Fabric fold highlights */}
      <path d="M25,0 C25,200 35,400 25,600" stroke="#FF6B6B" strokeWidth="0.8" fill="none" opacity="0.3" />
      <path d="M55,0 C55,180 65,350 55,600" stroke="#FF9999" strokeWidth="0.5" fill="none" opacity="0.2" />
      <path d="M85,0 C85,220 95,420 85,600" stroke="#FF6B6B" strokeWidth="0.6" fill="none" opacity="0.15" />
    </svg>
  );
}

/* ─── Gold rope / ribbon ─── */
function GoldRope() {
  return (
    <div className="absolute top-0 left-1/2 -translate-x-1/2 z-[5] w-full flex justify-center">
      <svg viewBox="0 0 600 80" className="w-[min(90%,700px)]" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="gold-rope" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="30%" stopColor="#FFC107" />
            <stop offset="60%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#DAA520" />
          </linearGradient>
          <filter id="rope-glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        {/* Swag rope curve */}
        <path
          d="M40,15 C40,15 150,70 300,70 C450,70 560,15 560,15"
          stroke="url(#gold-rope)" strokeWidth="5" fill="none"
          filter="url(#rope-glow)"
          strokeLinecap="round"
        />
        {/* Tassels at ends */}
        <circle cx="40" cy="15" r="8" fill="#FFD700" />
        <circle cx="560" cy="15" r="8" fill="#FFD700" />
        {/* Small tassel lines */}
        <line x1="40" y1="23" x2="40" y2="45" stroke="#DAA520" strokeWidth="2" />
        <line x1="36" y1="23" x2="33" y2="42" stroke="#DAA520" strokeWidth="1.5" />
        <line x1="44" y1="23" x2="47" y2="42" stroke="#DAA520" strokeWidth="1.5" />
        <line x1="560" y1="23" x2="560" y2="45" stroke="#DAA520" strokeWidth="2" />
        <line x1="556" y1="23" x2="553" y2="42" stroke="#DAA520" strokeWidth="1.5" />
        <line x1="564" y1="23" x2="567" y2="42" stroke="#DAA520" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

/* ─── Floating gold sparkles ─── */
function GoldSparkle({ delay, x, y }: { delay: number; x: string; y: string }) {
  return (
    <motion.div
      className="absolute pointer-events-none z-[3]"
      style={{ left: x, top: y }}
      animate={{
        opacity: [0, 1, 0],
        scale: [0.5, 1.2, 0.5],
        rotate: [0, 180, 360],
      }}
      transition={{ duration: 3, repeat: Infinity, delay, ease: "easeInOut" }}
    >
      <Sparkles size={14} className="text-yellow-400" />
    </motion.div>
  );
}

/* ─── Red Carpet runner ─── */
function RedCarpetRunner() {
  return (
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[85%] md:w-[70%] h-3 z-[1] rounded-full"
      style={{
        background: "linear-gradient(90deg, transparent 0%, #8B0000 10%, #DC143C 30%, #FF2D2D 50%, #DC143C 70%, #8B0000 90%, transparent 100%)",
        boxShadow: "0 0 20px rgba(220,20,60,0.4), 0 0 60px rgba(220,20,60,0.15)",
      }}
    />
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
      {/* Gold frame border */}
      <div
        className="relative overflow-hidden rounded-2xl md:rounded-3xl"
        style={{
          border: "3px solid transparent",
          backgroundImage: "linear-gradient(hsl(var(--background)), hsl(var(--background))), linear-gradient(135deg, #FFD700, #DAA520, #FFD700, #B8860B, #FFD700)",
          backgroundOrigin: "border-box",
          backgroundClip: "padding-box, border-box",
          boxShadow: hovered
            ? "0 0 40px rgba(255,215,0,0.4), 0 20px 60px rgba(0,0,0,0.5), inset 0 0 20px rgba(255,215,0,0.1)"
            : "0 0 20px rgba(255,215,0,0.15), 0 10px 40px rgba(0,0,0,0.3)",
          transition: "box-shadow 0.5s ease",
        }}
      >
        {/* Image */}
        <div className="relative h-[280px] md:h-[340px] overflow-hidden">
          <img
            src={property.images[0]}
            alt={property.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000"
            style={{ transform: hovered ? "scale(1.1)" : "scale(1)" }}
          />
          <div className="absolute inset-0"
            style={{
              background: "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0.1) 70%, transparent 100%)",
            }}
          />

          {/* Oscar trophy badge */}
          <motion.div
            className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{
              background: "linear-gradient(135deg, #FFD700, #DAA520)",
              boxShadow: "0 4px 16px rgba(255,215,0,0.5)",
            }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Award size={14} className="text-black" />
            <span className="text-[10px] md:text-xs font-black text-black tracking-wider">PREMIUM PICK</span>
          </motion.div>

          {/* Crown icon */}
          <motion.div
            className="absolute top-4 right-4 z-10"
            animate={{ y: [0, -4, 0], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, rgba(255,215,0,0.3), rgba(218,165,32,0.2))",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,215,0,0.4)",
              }}
            >
              <Crown size={18} className="text-yellow-400" />
            </div>
          </motion.div>

          {onToggleWishlist && (
            <button
              onClick={(e) => { e.stopPropagation(); onToggleWishlist(property.id); }}
              className="absolute bottom-4 right-4 w-10 h-10 rounded-full flex items-center justify-center z-10"
              style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(10px)" }}
            >
              <Heart size={18} className={isWL ? "fill-red-500 text-red-500" : "text-white"} />
            </button>
          )}

          {/* Content overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, si) => (
                  <Star key={si} size={12} className={si < Math.round(property.rating) ? "fill-yellow-400 text-yellow-400" : "text-white/20"} />
                ))}
              </div>
              <span className="text-xs font-bold text-yellow-400">{property.rating}</span>
            </div>

            <h3 className="text-xl md:text-2xl font-black text-white leading-tight"
              style={{ fontFamily: "'Playfair Display', serif", textShadow: "0 2px 10px rgba(0,0,0,0.8)" }}
            >
              {property.name}
            </h3>
            <p className="text-sm text-white/60 mt-1 line-clamp-2">{property.description}</p>

            <div className="flex items-center justify-between mt-3">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl md:text-3xl font-black text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  ₹{cheapest.toLocaleString()}
                </span>
                <span className="text-xs text-white/40">onwards</span>
              </div>
              <motion.div
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-bold"
                style={{
                  background: "linear-gradient(135deg, #FFD700, #DAA520)",
                  color: "#000",
                  boxShadow: "0 4px 20px rgba(255,215,0,0.4)",
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Book Now <ArrowRight size={14} />
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Red carpet strip under each card */}
      <div className="h-1.5 mx-4 md:mx-6 rounded-b-full mt-[-2px]"
        style={{
          background: "linear-gradient(90deg, transparent, #DC143C, #FF2D2D, #DC143C, transparent)",
          boxShadow: "0 2px 12px rgba(220,20,60,0.3)",
        }}
      />
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
    return sorted.slice(0, 3);
  }, [properties]);

  if (premiumPicks.length === 0) return null;

  return (
    <div ref={sectionRef} className="relative overflow-hidden py-12 md:py-20 mt-8 md:mt-16">
      {/* Dark dramatic background */}
      <div className="absolute inset-0 z-0"
        style={{
          background: "radial-gradient(ellipse at center top, rgba(139,0,0,0.15) 0%, rgba(0,0,0,0.95) 60%, hsl(var(--background)) 100%)",
        }}
      />

      {/* Animated curtains */}
      <motion.div style={{ x: curtainLeftX }} className="z-[2]">
        <CurtainSVG side="left" />
      </motion.div>
      <motion.div style={{ x: curtainRightX }} className="z-[2]">
        <CurtainSVG side="right" />
      </motion.div>

      {/* Gold rope at top */}
      <GoldRope />

      {/* Floating sparkles */}
      <GoldSparkle delay={0} x="15%" y="20%" />
      <GoldSparkle delay={0.5} x="80%" y="15%" />
      <GoldSparkle delay={1} x="25%" y="70%" />
      <GoldSparkle delay={1.5} x="70%" y="60%" />
      <GoldSparkle delay={2} x="50%" y="30%" />
      <GoldSparkle delay={0.8} x="90%" y="45%" />
      <GoldSparkle delay={1.2} x="10%" y="55%" />

      {/* Section header */}
      <div className="relative z-[6] text-center px-5 pt-16 md:pt-20 pb-8 md:pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="h-px w-12 md:w-20" style={{ background: "linear-gradient(90deg, transparent, #FFD700)" }} />
            <Award size={28} className="text-yellow-400" />
            <div className="h-px w-12 md:w-20" style={{ background: "linear-gradient(90deg, #FFD700, transparent)" }} />
          </div>
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-black text-white tracking-tight"
            style={{
              fontFamily: "'Playfair Display', serif",
              textShadow: "0 0 30px rgba(255,215,0,0.3), 0 4px 20px rgba(0,0,0,0.8)",
              backgroundImage: "linear-gradient(135deg, #FFD700, #FFFFFF, #FFD700)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            The Red Carpet Collection
          </h2>
          <p className="text-sm md:text-base text-white/50 mt-2 max-w-md mx-auto"
            style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}
          >
            Our most exclusive, award-worthy experiences
          </p>
        </motion.div>
      </div>

      {/* Cards grid */}
      <div className="relative z-[6] px-5 md:px-8 lg:px-16 xl:px-24 2xl:px-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
          {premiumPicks.map((p, i) => (
            <OscarCard
              key={p.id}
              property={p}
              onTap={onPropertyTap}
              index={i}
              isWL={wishlist.includes(p.id)}
              onToggleWishlist={onToggleWishlist}
            />
          ))}
        </div>
      </div>

      {/* Red carpet runner at bottom */}
      <div className="relative z-[4] mt-10 md:mt-14">
        <RedCarpetRunner />
      </div>

      {/* Velvet rope bottom decoration */}
      <div className="relative z-[5] flex justify-center mt-6 md:mt-8">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full" style={{ background: "#FFD700", boxShadow: "0 0 10px rgba(255,215,0,0.5)" }} />
          <div className="h-px w-16 md:w-24" style={{ background: "linear-gradient(90deg, #FFD700, rgba(255,215,0,0.2))" }} />
          <span className="text-[10px] md:text-xs font-bold tracking-[0.3em] text-yellow-400/60 uppercase">Award Winners</span>
          <div className="h-px w-16 md:w-24" style={{ background: "linear-gradient(90deg, rgba(255,215,0,0.2), #FFD700)" }} />
          <div className="w-3 h-3 rounded-full" style={{ background: "#FFD700", boxShadow: "0 0 10px rgba(255,215,0,0.5)" }} />
        </div>
      </div>
    </div>
  );
}
