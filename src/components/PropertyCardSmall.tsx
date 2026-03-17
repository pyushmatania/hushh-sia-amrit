import { motion } from "framer-motion";
import { Heart, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import type { Property } from "@/data/properties";

interface PropertyCardSmallProps {
  property: Property;
  index: number;
  onTap: (property: Property) => void;
}

export default function PropertyCardSmall({ property, index, onTap }: PropertyCardSmallProps) {
  const [imgIndex, setImgIndex] = useState(0);
  const [liked, setLiked] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="shrink-0 w-[260px] cursor-pointer group"
      onClick={() => onTap(property)}
    >
      <div className="relative aspect-square rounded-2xl overflow-hidden">
        <img
          src={property.images[imgIndex]}
          alt={property.name}
          className="w-full h-full object-cover"
        />
        {/* Heart */}
        <button
          onClick={(e) => { e.stopPropagation(); setLiked(!liked); }}
          className="absolute top-2.5 right-2.5"
        >
          <Heart
            size={22}
            className={liked ? "fill-primary text-primary" : "fill-foreground/20 text-background"}
            strokeWidth={2}
          />
        </button>
        {/* Guest favourite badge */}
        {property.rating >= 4.8 && (
          <span className="absolute top-2.5 left-2.5 text-[11px] font-semibold bg-background/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-foreground shadow-sm">
            Guest favourite
          </span>
        )}
        {/* Dots */}
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1">
          {property.images.map((_, i) => (
            <span key={i} className={`w-[5px] h-[5px] rounded-full ${i === imgIndex ? "bg-background" : "bg-background/50"}`} />
          ))}
        </div>
        {/* Arrows */}
        <button
          onClick={(e) => { e.stopPropagation(); setImgIndex((i) => (i === 0 ? property.images.length - 1 : i - 1)); }}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-background/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
        >
          <ChevronLeft size={14} className="text-foreground" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); setImgIndex((i) => (i === property.images.length - 1 ? 0 : i + 1)); }}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-background/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
        >
          <ChevronRight size={14} className="text-foreground" />
        </button>
      </div>
      <div className="pt-2 px-0.5">
        <h3 className="font-semibold text-sm text-foreground truncate">{property.name}</h3>
        <p className="text-sm text-muted-foreground">
          ₹{property.basePrice.toLocaleString()} for 2 hours · <Star size={11} className="inline fill-foreground text-foreground mb-0.5" /> {property.rating}
        </p>
      </div>
    </motion.div>
  );
}
