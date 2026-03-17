import { motion } from "framer-motion";
import { Heart, Star, BadgeCheck } from "lucide-react";
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
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, type: "spring", stiffness: 260, damping: 20 }}
      whileTap={{ scale: 0.98 }}
      className="glass-card overflow-hidden cursor-pointer mx-4"
      onClick={() => onTap(property)}
    >
      {/* Image carousel */}
      <div className="relative aspect-[4/5] overflow-hidden">
        <img
          src={property.images[imgIndex]}
          alt={property.name}
          className="w-full h-full object-cover"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />

        {/* Heart */}
        <motion.button
          whileTap={{ scale: 1.3 }}
          onClick={(e) => { e.stopPropagation(); setLiked(!liked); }}
          className="absolute top-3 right-3 w-9 h-9 rounded-full glass-surface flex items-center justify-center"
        >
          <Heart size={18} className={liked ? "fill-primary text-primary" : "text-foreground"} />
        </motion.button>

        {/* Tags */}
        <div className="absolute bottom-3 left-3 flex gap-1.5">
          {property.tags.map((tag) => (
            <span key={tag} className="glass-surface text-[11px] font-medium px-2.5 py-1 rounded-full text-foreground">
              {tag}
            </span>
          ))}
        </div>

        {/* Dots */}
        <div className="absolute bottom-3 right-3 flex gap-1">
          {property.images.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setImgIndex(i); }}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${i === imgIndex ? "bg-foreground" : "bg-foreground/30"}`}
            />
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="p-4 space-y-2">
        <div className="flex items-center gap-2">
          <h3 className="font-display text-lg font-bold text-foreground">{property.name}</h3>
          {property.verified && <BadgeCheck size={16} className="text-primary" />}
        </div>
        <p className="text-sm text-muted-foreground flex items-center gap-1">
          {property.description} · <Star size={12} className="text-accent fill-accent" /> {property.rating} ({property.reviewCount})
        </p>
        <div className="flex items-center justify-between">
          <span className={`text-xs font-medium ${property.slotsLeft > 0 ? "text-success" : "text-destructive"}`}>
            {property.slotsLeft > 0 ? `${property.slotsLeft} slots left today` : "Fully booked"}
          </span>
          <span className="text-sm">
            From <span className="font-bold text-accent">₹{property.basePrice}</span> <span className="text-muted-foreground">/ 2 hours</span>
          </span>
        </div>

        {/* Amenity pills */}
        <div className="flex gap-1.5 pt-1">
          {property.amenityIcons.slice(0, 4).map((icon, i) => (
            <span key={i} className="text-xs bg-secondary px-2 py-1 rounded-md">
              {icon} {property.amenities[i]}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
