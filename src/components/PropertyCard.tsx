import { motion } from "framer-motion";
import { Heart, Star, ChevronLeft, ChevronRight, BadgeCheck } from "lucide-react";
import { useState } from "react";
import type { Property } from "@/data/properties";

interface PropertyCardProps {
  property: Property;
  index: number;
  onTap: (property: Property) => void;
}

export default function PropertyCard({ property, index, onTap }: PropertyCardProps) {
  const [imgIndex, setImgIndex] = useState(0);
  const [liked, setLiked] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="cursor-pointer px-5 group"
      onClick={() => onTap(property)}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
        <img
          src={property.images[imgIndex]}
          alt={property.name}
          className="w-full h-full object-cover"
        />
        {/* Heart */}
        <button
          onClick={(e) => { e.stopPropagation(); setLiked(!liked); }}
          className="absolute top-3 right-3"
        >
          <Heart
            size={24}
            className={liked ? "fill-primary text-primary" : "fill-foreground/20 text-background"}
            strokeWidth={2}
          />
        </button>
        {/* Badge */}
        {property.rating >= 4.8 && (
          <span className="absolute top-3 left-3 text-[11px] font-semibold bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-foreground shadow-sm">
            Guest favourite
          </span>
        )}
        {/* Dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
          {property.images.map((_, i) => (
            <span key={i} className={`w-[6px] h-[6px] rounded-full transition-all ${i === imgIndex ? "bg-background w-[6px]" : "bg-background/50"}`} />
          ))}
        </div>
        {/* Arrows */}
        <button
          onClick={(e) => { e.stopPropagation(); setImgIndex((i) => (i === 0 ? property.images.length - 1 : i - 1)); }}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
        >
          <ChevronLeft size={16} className="text-foreground" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); setImgIndex((i) => (i === property.images.length - 1 ? 0 : i + 1)); }}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
        >
          <ChevronRight size={16} className="text-foreground" />
        </button>
      </div>

      {/* Info */}
      <div className="pt-2.5 pb-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-[15px] text-foreground flex items-center gap-1">
              {property.name}
              {property.verified && <BadgeCheck size={14} className="text-primary shrink-0" />}
            </h3>
            <p className="text-sm text-muted-foreground">{property.description}</p>
            <p className="text-sm text-muted-foreground">
              {property.slotsLeft > 0 ? `${property.slotsLeft} slots left today` : "Fully booked"}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0 pt-0.5">
            <Star size={12} className="fill-foreground text-foreground" />
            <span className="text-sm font-medium text-foreground">{property.rating}</span>
          </div>
        </div>
        <p className="text-sm mt-0.5">
          <span className="font-semibold text-foreground">₹{property.basePrice.toLocaleString()}</span>
          <span className="text-muted-foreground"> / 2 hours</span>
        </p>
      </div>
    </motion.div>
  );
}
