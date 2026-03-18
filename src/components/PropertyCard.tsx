import { motion, useMotionValue, useTransform, animate, PanInfo } from "framer-motion";
import { Heart, Star, BadgeCheck } from "lucide-react";
import { useState, useCallback } from "react";
import { heartPop, cardPress } from "@/lib/animations";
import type { Property } from "@/data/properties";

interface PropertyCardProps {
  property: Property;
  index: number;
  onTap: (property: Property) => void;
}

export default function PropertyCard({ property, index, onTap }: PropertyCardProps) {
  const [imgIndex, setImgIndex] = useState(0);
  const [liked, setLiked] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-100, 0, 100], [0.5, 1, 0.5]);

  const handleDragEnd = useCallback((_: any, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.x < -threshold) {
      setImgIndex((i) => (i === property.images.length - 1 ? 0 : i + 1));
    } else if (info.offset.x > threshold) {
      setImgIndex((i) => (i === 0 ? property.images.length - 1 : i - 1));
    }
    animate(x, 0, { type: "spring", stiffness: 300, damping: 30 });
  }, [property.images.length, x]);

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
        {/* Skeleton */}
        {!imgLoaded && (
          <div className="absolute inset-0 bg-secondary animate-pulse rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-muted/50 to-transparent animate-[shimmer_1.5s_infinite]" />
          </div>
        )}
        <motion.img
          key={imgIndex}
          src={property.images[imgIndex]}
          alt={property.name}
          className="w-full h-full object-cover touch-pan-y"
          style={{ x, opacity }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          onLoad={() => setImgLoaded(true)}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        />
        {/* Heart */}
        <motion.button
          onClick={(e) => { e.stopPropagation(); setLiked(!liked); }}
          className="absolute top-3 right-3"
          whileTap={{ scale: 1.3 }}
          transition={{ type: "spring", stiffness: 500 }}
        >
          <Heart
            size={24}
            className={`transition-colors duration-200 ${liked ? "fill-primary text-primary" : "fill-foreground/20 text-background"}`}
            strokeWidth={2}
          />
        </motion.button>
        {/* Badge */}
        {property.rating >= 4.8 && (
          <span className="absolute top-3 left-3 text-[11px] font-semibold glass px-3 py-1.5 rounded-full text-foreground">
            Guest favourite
          </span>
        )}
        {/* Dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {property.images.map((_, i) => (
            <motion.span
              key={i}
              className="rounded-full bg-foreground/30"
              animate={{
                width: i === imgIndex ? 16 : 6,
                height: 6,
                backgroundColor: i === imgIndex ? "hsl(270 80% 65%)" : "hsla(0 0% 96% / 0.3)",
              }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            />
          ))}
        </div>
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
            <Star size={12} className="fill-primary text-primary" />
            <span className="text-sm font-medium text-foreground">{property.rating}</span>
          </div>
        </div>
        <p className="text-sm mt-0.5">
          <span className="font-semibold text-gradient-warm">₹{property.basePrice.toLocaleString()}</span>
          <span className="text-muted-foreground"> / 2 hours</span>
        </p>
      </div>
    </motion.div>
  );
}
