import { motion, useMotionValue, useTransform, animate, PanInfo } from "framer-motion";
import { Heart, Star } from "lucide-react";
import { useState, useCallback } from "react";
import type { Property } from "@/data/properties";

interface PropertyCardSmallProps {
  property: Property;
  index: number;
  onTap: (property: Property) => void;
}

export default function PropertyCardSmall({ property, index, onTap }: PropertyCardSmallProps) {
  const [imgIndex, setImgIndex] = useState(0);
  const [liked, setLiked] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-80, 0, 80], [0.5, 1, 0.5]);

  const handleDragEnd = useCallback((_: any, info: PanInfo) => {
    const threshold = 40;
    if (info.offset.x < -threshold) {
      setImgIndex((i) => (i === property.images.length - 1 ? 0 : i + 1));
    } else if (info.offset.x > threshold) {
      setImgIndex((i) => (i === 0 ? property.images.length - 1 : i - 1));
    }
    animate(x, 0, { type: "spring", stiffness: 300, damping: 30 });
  }, [property.images.length, x]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="shrink-0 w-[260px] cursor-pointer group"
      onClick={() => onTap(property)}
    >
      <div className="relative aspect-square rounded-2xl overflow-hidden">
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
        />
        {/* Heart */}
        <motion.button
          onClick={(e) => { e.stopPropagation(); setLiked(!liked); }}
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
        {/* Guest favourite badge */}
        {property.rating >= 4.8 && (
          <span className="absolute top-2.5 left-2.5 text-[11px] font-semibold glass px-2.5 py-1 rounded-full text-foreground">
            Guest favourite
          </span>
        )}
        {/* Dots - animated pill */}
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1">
          {property.images.map((_, i) => (
            <motion.span
              key={i}
              className="rounded-full bg-foreground/30"
              animate={{
                width: i === imgIndex ? 14 : 5,
                height: 5,
                backgroundColor: i === imgIndex ? "hsl(270 80% 65%)" : "hsla(0 0% 96% / 0.3)",
              }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            />
          ))}
        </div>
      </div>
      <div className="pt-2 px-0.5">
        <h3 className="font-semibold text-sm text-foreground truncate">{property.name}</h3>
        <p className="text-sm text-muted-foreground">
          <span className="text-gradient-warm font-semibold">₹{property.basePrice.toLocaleString()}</span> for 2 hours · <Star size={11} className="inline fill-primary text-primary mb-0.5" /> {property.rating}
        </p>
      </div>
    </motion.div>
  );
}
