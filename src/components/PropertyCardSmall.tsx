import { motion } from "framer-motion";
import { Heart, Star } from "lucide-react";
import { useState } from "react";
import type { Property } from "@/data/properties";
import OptimizedImage from "@/components/shared/OptimizedImage";

interface PropertyCardSmallProps {
  property: Property;
  index: number;
  onTap: (property: Property) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (id: string) => void;
}

export default function PropertyCardSmall({ property, index, onTap, isWishlisted = false, onToggleWishlist }: PropertyCardSmallProps) {
  const liked = isWishlisted;
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="shrink-0 w-[260px] cursor-pointer group"
      onClick={() => onTap(property)}
    >
      <div className="relative aspect-square rounded-2xl overflow-hidden">
        {!imgLoaded && (
          <div className="absolute inset-0 bg-secondary animate-pulse rounded-2xl">
            <div className="absolute inset-0 shimmer-bg" />
          </div>
        )}
        <OptimizedImage
          src={property.images[0]}
          alt={property.name}
          fill
          className="object-cover"
          sizes="260px"
          onImageLoad={() => setImgLoaded(true)}
          showSkeleton={false}
        />

        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist?.(property.id);
          }}
          className="absolute top-2.5 right-2.5"
          whileTap={{ scale: 1.3 }}
          transition={{ type: "spring", stiffness: 500 }}
        >
          <Heart
            size={22}
            className={`transition-colors duration-200 ${liked ? "fill-primary text-primary" : "fill-foreground/20 text-background"}`}
            strokeWidth={2}
          />
        </motion.button>

        {property.rating >= 4.8 && (
          <span className="absolute top-2.5 left-2.5 text-[11px] font-semibold glass px-2.5 py-1 rounded-full text-foreground">
            Guest favourite
          </span>
        )}
      </div>

      <div className="pt-2 px-0.5">
        <h3 className="font-semibold text-sm text-foreground truncate">{property.name}</h3>
        <p className="text-sm text-muted-foreground">
          <span className="text-gradient-warm font-semibold">₹{property.basePrice.toLocaleString()}</span> for 2 hours ·{" "}
          <Star size={11} className="inline fill-primary text-primary mb-0.5" /> {property.rating}
        </p>
      </div>
    </motion.div>
  );
}
