import { motion } from "framer-motion";
import { Heart, Star, MapPin, BadgeCheck } from "lucide-react";
import { properties, type Property } from "@/data/properties";
import { pageSlideUp, cardPress } from "@/lib/animations";

interface WishlistScreenProps {
  wishlist: string[];
  onToggleWishlist: (id: string) => void;
  onPropertyTap: (property: Property) => void;
}

export default function WishlistScreen({ wishlist, onToggleWishlist, onPropertyTap }: WishlistScreenProps) {
  const wishlisted = properties.filter((p) => wishlist.includes(p.id));

  return (
    <motion.div variants={pageSlideUp} initial="initial" animate="animate" exit="exit" className="pb-24 bg-mesh min-h-screen">
      <div className="px-5 pt-6 pb-4">
        <motion.h1
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-foreground"
        >
          Wishlists
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-sm text-muted-foreground mt-1"
        >
          {wishlisted.length > 0 ? `${wishlisted.length} saved place${wishlisted.length > 1 ? "s" : ""}` : "Save places you love"}
        </motion.p>
      </div>

      {wishlisted.length === 0 ? (
        <EmptyState
          icon={Heart}
          emoji="💜"
          title="No saved places yet"
          description="Tap the heart icon on any property to save it here. Your favourite villas, venues, and experiences — all in one place."
        />
      ) : (
        <div className="px-5 space-y-4">
          {wishlisted.map((property, i) => (
            <motion.div
              key={property.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl border border-border overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
              onClick={() => onPropertyTap(property)}
            >
              <div className="relative aspect-[16/9]">
                <img src={property.images[0]} alt={property.name} className="w-full h-full object-cover" />
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleWishlist(property.id); }}
                  className="absolute top-3 right-3 w-9 h-9 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center shadow-md"
                >
                  <Heart size={18} className="fill-primary text-primary" />
                </button>
                {property.slotsLeft > 0 && property.slotsLeft <= 2 && (
                  <span className="absolute bottom-3 left-3 text-[11px] font-semibold bg-destructive/90 text-destructive-foreground px-3 py-1 rounded-full">
                    Only {property.slotsLeft} slot{property.slotsLeft > 1 ? "s" : ""} left
                  </span>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-[15px] text-foreground flex items-center gap-1.5">
                      {property.name}
                      {property.verified && <BadgeCheck size={14} className="text-primary shrink-0" />}
                    </h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin size={12} /> {property.location}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 pt-0.5">
                    <Star size={12} className="fill-foreground text-foreground" />
                    <span className="text-sm font-medium text-foreground">{property.rating}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-sm">
                    <span className="font-semibold text-foreground">₹{property.basePrice.toLocaleString()}</span>
                    <span className="text-muted-foreground"> / 2 hours</span>
                  </p>
                  <div className="flex gap-1">
                    {property.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="text-[10px] bg-secondary px-2 py-0.5 rounded-full text-muted-foreground">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
