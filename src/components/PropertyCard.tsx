import { motion } from "framer-motion";
import { Heart, Star, BadgeCheck, ChevronLeft, ChevronRight } from "lucide-react";
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

  const prevImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImgIndex((i) => (i === 0 ? property.images.length - 1 : i - 1));
  };
  const nextImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImgIndex((i) => (i === property.images.length - 1 ? 0 : i + 1));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, type: "spring", stiffness: 300, damping: 25 }}
      className="cursor-pointer mx-4 group"
      onClick={() => onTap(property)}
    >
      {/* Image */}
      <div className="relative aspect-square rounded-xl overflow-hidden">
        <img
          src={property.images[imgIndex]}
          alt={property.name}
          className="w-full h-full object-cover transition-transform duration-300"
        />

        {/* Nav arrows on hover */}
        <button
          onClick={prevImg}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 border border-border/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
        >
          <ChevronLeft size={16} className="text-foreground" />
        </button>
        <button
          onClick={nextImg}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 border border-border/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
        >
          <ChevronRight size={16} className="text-foreground" />
        </button>

        {/* Heart */}
        <motion.button
          whileTap={{ scale: 1.3 }}
          onClick={(e) => { e.stopPropagation(); setLiked(!liked); }}
          className="absolute top-3 right-3"
        >
          <Heart
            size={24}
            className={liked ? "fill-primary text-primary" : "text-foreground/90"}
            strokeWidth={liked ? 0 : 2}
            style={{ filter: liked ? "none" : "drop-shadow(0 1px 3px rgba(0,0,0,0.5))" }}
          />
        </motion.button>

        {/* Tag */}
        {property.tags[0] && (
          <span className="absolute top-3 left-3 text-[11px] font-semibold bg-background/90 px-2.5 py-1 rounded-full text-foreground shadow-sm">
            {property.tags[0]}
          </span>
        )}

        {/* Dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
          {property.images.map((_, i) => (
            <span
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                i === imgIndex ? "bg-foreground w-[6px]" : "bg-foreground/40"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Info — Airbnb style */}
      <div className="pt-3 pb-2 space-y-0.5">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-[15px] text-foreground flex items-center gap-1.5">
            {property.name}
            {property.verified && <BadgeCheck size={14} className="text-primary" />}
          </h3>
          <span className="flex items-center gap-1 text-sm text-foreground">
            <Star size={12} className="fill-foreground" />
            {property.rating}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{property.description}</p>
        <p className={`text-xs ${property.slotsLeft > 0 ? "text-muted-foreground" : "text-destructive"}`}>
          {property.slotsLeft > 0 ? `${property.slotsLeft} slots left today` : "Fully booked"}
        </p>
        <p className="text-sm pt-0.5">
          <span className="font-semibold text-foreground">₹{property.basePrice.toLocaleString()}</span>
          <span className="text-muted-foreground"> / 2 hours</span>
        </p>
      </div>
    </motion.div>
  );
}
