import { motion } from "framer-motion";
import { Star, Clock, Users, Zap } from "lucide-react";
import { useState } from "react";
import type { Property } from "@/data/properties";

const categoryColors: Record<string, { bg: string; border: string; text: string }> = {
  "Sports Arena": { bg: "rgba(34,197,94,0.15)", border: "rgba(34,197,94,0.3)", text: "text-green-400" },
  "Indoor Lounge": { bg: "rgba(168,85,247,0.15)", border: "rgba(168,85,247,0.3)", text: "text-purple-400" },
  "Garden Space": { bg: "rgba(244,63,94,0.15)", border: "rgba(244,63,94,0.3)", text: "text-rose-400" },
  "Party Hall": { bg: "rgba(251,191,36,0.15)", border: "rgba(251,191,36,0.3)", text: "text-amber-400" },
  "Open Lawn": { bg: "rgba(251,146,60,0.15)", border: "rgba(251,146,60,0.3)", text: "text-orange-400" },
  "Walking Tour": { bg: "rgba(56,189,248,0.15)", border: "rgba(56,189,248,0.3)", text: "text-sky-400" },
  "Workshop": { bg: "rgba(232,121,249,0.15)", border: "rgba(232,121,249,0.3)", text: "text-fuchsia-400" },
  "Plantation Tour": { bg: "rgba(16,185,129,0.15)", border: "rgba(16,185,129,0.3)", text: "text-emerald-400" },
  "Observatory": { bg: "rgba(99,102,241,0.15)", border: "rgba(99,102,241,0.3)", text: "text-indigo-400" },
  "Adventure": { bg: "rgba(239,68,68,0.15)", border: "rgba(239,68,68,0.3)", text: "text-red-400" },
  "Cultural": { bg: "rgba(245,158,11,0.15)", border: "rgba(245,158,11,0.3)", text: "text-yellow-400" },
};

const defaultColor = { bg: "rgba(139,92,246,0.15)", border: "rgba(139,92,246,0.3)", text: "text-violet-400" };

interface ExperienceCardProps {
  property: Property;
  index: number;
  onTap: (property: Property) => void;
  variant?: "wide" | "stacked";
}

export default function ExperienceCard({ property, index, onTap, variant = "wide" }: ExperienceCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const colors = categoryColors[property.propertyType || ""] || defaultColor;
  const availableSlots = property.slots.filter(s => s.available);
  const cheapestSlot = availableSlots.length > 0 ? Math.min(...availableSlots.map(s => s.price)) : property.basePrice;

  if (variant === "stacked") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.06, duration: 0.4 }}
        onClick={() => onTap(property)}
        className="cursor-pointer group"
      >
        <div
          className="relative rounded-2xl overflow-hidden"
          style={{ aspectRatio: "3/4", border: `1px solid ${colors.border}` }}
        >
          {!imgLoaded && <div className="absolute inset-0 bg-secondary animate-pulse" />}
          <img
            src={property.images[0]}
            alt={property.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onLoad={() => setImgLoaded(true)}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Top badge */}
          <div className="absolute top-3 left-3 flex gap-1.5">
            <span
              className="text-[9px] font-bold px-2 py-0.5 rounded-full text-white backdrop-blur-sm"
              style={{ background: colors.border }}
            >
              {property.propertyType}
            </span>
            {property.slotsLeft > 0 && property.slotsLeft <= 3 && (
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-red-500/80 text-white backdrop-blur-sm flex items-center gap-0.5">
                <Zap size={8} /> {property.slotsLeft} left
              </span>
            )}
          </div>

          {/* Bottom content */}
          <div className="absolute bottom-0 left-0 right-0 p-3.5">
            <div className="flex items-center gap-1 mb-1">
              <Star size={11} className="fill-amber-400 text-amber-400" />
              <span className="text-[11px] font-semibold text-white">{property.rating}</span>
              <span className="text-[10px] text-white/50">({property.reviewCount})</span>
            </div>
            <h3 className="text-sm font-bold text-white leading-tight line-clamp-2">{property.name}</h3>
            <p className="text-[11px] text-white/60 mt-0.5">{property.location}</p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm font-bold text-white">₹{cheapestSlot.toLocaleString()}</span>
              <span className="text-[10px] text-white/50">onwards</span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Wide horizontal card
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      onClick={() => onTap(property)}
      className="flex gap-3 mx-5 mb-4 cursor-pointer group rounded-2xl overflow-hidden"
      style={{
        background: colors.bg,
        border: `1px solid ${colors.border}`,
      }}
    >
      {/* Image */}
      <div className="relative w-[120px] shrink-0">
        {!imgLoaded && <div className="absolute inset-0 bg-secondary animate-pulse" />}
        <img
          src={property.images[0]}
          alt={property.name}
          className="w-full h-full object-cover min-h-[140px]"
          onLoad={() => setImgLoaded(true)}
          loading="lazy"
        />
        {property.slotsLeft > 0 && property.slotsLeft <= 3 && (
          <div className="absolute top-2 left-2 text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-red-500/90 text-white flex items-center gap-0.5">
            <Zap size={7} /> {property.slotsLeft} left
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 py-3 pr-3 flex flex-col justify-between">
        <div>
          <span
            className={`text-[9px] font-bold uppercase tracking-wider ${colors.text}`}
          >
            {property.propertyType}
          </span>
          <h3 className="text-sm font-bold text-foreground leading-tight mt-0.5 line-clamp-2">{property.name}</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">{property.description}</p>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              <Star size={11} className="fill-amber-400 text-amber-400" />
              <span className="text-[11px] font-semibold text-foreground">{property.rating}</span>
            </div>
            <div className="flex items-center gap-0.5 text-muted-foreground">
              <Users size={10} />
              <span className="text-[10px]">{property.capacity}</span>
            </div>
            <div className="flex items-center gap-0.5 text-muted-foreground">
              <Clock size={10} />
              <span className="text-[10px]">{availableSlots.length} slots</span>
            </div>
          </div>
          <span className="text-sm font-bold text-foreground">₹{cheapestSlot.toLocaleString()}</span>
        </div>
      </div>
    </motion.div>
  );
}
