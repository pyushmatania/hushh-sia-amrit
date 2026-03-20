import { motion } from "framer-motion";
import { ChefHat, Palette, Car, Music, Star, ArrowRight, Clock } from "lucide-react";
import type { Property } from "@/data/properties";

const serviceIconMap: Record<string, { icon: typeof ChefHat; color: string; gradient: string }> = {
  "Chef Service": { icon: ChefHat, color: "text-amber-400", gradient: "from-amber-600/80 to-orange-900/60" },
  "Decoration": { icon: Palette, color: "text-rose-400", gradient: "from-rose-600/80 to-pink-900/60" },
  "Transport": { icon: Car, color: "text-sky-400", gradient: "from-sky-600/80 to-blue-900/60" },
  "Entertainment": { icon: Music, color: "text-violet-400", gradient: "from-violet-600/80 to-purple-900/60" },
};

const defaultIcon = { icon: Star, color: "text-primary", gradient: "from-primary/80 to-accent/60" };

interface ServiceGridProps {
  services: Property[];
  onServiceTap: (service: Property) => void;
}

export default function ServiceGrid({ services, onServiceTap }: ServiceGridProps) {
  if (services.length === 0) return null;

  const featured = services[0];
  const rest = services.slice(1);

  const getFeaturedConfig = (s: Property) => serviceIconMap[s.propertyType || ""] || defaultIcon;

  return (
    <div className="space-y-4">
      {/* Featured — Cinematic wide card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        onClick={() => onServiceTap(featured)}
        className="mx-4 rounded-3xl overflow-hidden cursor-pointer active:scale-[0.98] transition-transform group relative"
        style={{ height: 220 }}
      >
        <img
          src={featured.images[0]}
          alt={featured.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        {/* Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t ${getFeaturedConfig(featured).gradient} to-transparent opacity-70`} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />

        {/* Icon badge */}
        {(() => {
          const config = getFeaturedConfig(featured);
          const Icon = config.icon;
          return (
            <div className="absolute top-4 left-4 w-10 h-10 rounded-xl bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10">
              <Icon size={20} className={config.color} />
            </div>
          );
        })()}

        {/* Rating badge */}
        <div className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
          <Star size={10} className="fill-amber-400 text-amber-400" />
          <span className="text-[11px] font-bold text-white">{featured.rating}</span>
          <span className="text-[9px] text-white/50">({featured.reviewCount})</span>
        </div>

        {/* Bottom content */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <span className="text-[9px] font-bold tracking-widest text-white/50 uppercase">{featured.propertyType}</span>
          <h3 className="text-xl font-bold text-white mt-0.5 leading-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {featured.name}
          </h3>
          <p className="text-[12px] text-white/60 mt-0.5 line-clamp-1">{featured.description}</p>

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-white/60">
                <Clock size={11} />
                <span className="text-[10px]">{featured.slots.filter(s => s.available).length} slots open</span>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-primary/90 text-primary-foreground px-3.5 py-1.5 rounded-full">
              <span className="text-[12px] font-bold">₹{Math.min(...featured.slots.filter(s => s.available).map(s => s.price)).toLocaleString()}+</span>
              <ArrowRight size={12} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Staggered 2-col masonry-ish cards */}
      <div className="px-4 grid grid-cols-2 gap-3">
        {rest.map((service, i) => {
          const config = serviceIconMap[service.propertyType || ""] || defaultIcon;
          const Icon = config.icon;
          const cheapest = Math.min(...service.slots.filter(s => s.available).map(s => s.price));
          const isOdd = i % 2 === 1;

          return (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (i + 1) * 0.06, duration: 0.35 }}
              onClick={() => onServiceTap(service)}
              className={`rounded-2xl overflow-hidden cursor-pointer active:scale-[0.97] transition-transform group relative ${isOdd ? "mt-4" : ""}`}
              style={{ height: isOdd ? 200 : 220 }}
            >
              <img
                src={service.images[0]}
                alt={service.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${config.gradient} to-transparent opacity-60`} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Floating icon */}
              <div className="absolute top-3 left-3 w-8 h-8 rounded-lg bg-black/30 backdrop-blur-sm flex items-center justify-center border border-white/10">
                <Icon size={16} className={config.color} />
              </div>

              {/* Rating */}
              <div className="absolute top-3 right-3 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-black/30 backdrop-blur-sm">
                <Star size={8} className="fill-amber-400 text-amber-400" />
                <span className="text-[9px] font-bold text-white">{service.rating}</span>
              </div>

              {/* Bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <span className="text-[8px] font-bold tracking-widest text-white/40 uppercase">{service.propertyType}</span>
                <h4 className="text-[13px] font-bold text-white leading-tight mt-0.5">{service.name}</h4>
                <p className="text-[9px] text-white/50 line-clamp-1 mt-0.5">{service.description}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[13px] font-bold text-white">₹{cheapest.toLocaleString()}<span className="text-[9px] font-normal text-white/40">+</span></span>
                  <ArrowRight size={12} className="text-primary" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
