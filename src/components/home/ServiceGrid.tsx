import { motion } from "framer-motion";
import { ChefHat, Palette, Car, Music, Star, ArrowRight } from "lucide-react";
import type { Property } from "@/data/properties";

const serviceIconMap: Record<string, { icon: typeof ChefHat; color: string; bg: string }> = {
  "Chef Service": { icon: ChefHat, color: "text-amber-400", bg: "rgba(251,191,36,0.12)" },
  "Decoration": { icon: Palette, color: "text-rose-400", bg: "rgba(251,113,133,0.12)" },
  "Transport": { icon: Car, color: "text-sky-400", bg: "rgba(56,189,248,0.12)" },
  "Entertainment": { icon: Music, color: "text-violet-400", bg: "rgba(167,139,250,0.12)" },
};

const defaultIcon = { icon: Star, color: "text-primary", bg: "rgba(139,92,246,0.12)" };

interface ServiceGridProps {
  services: Property[];
  onServiceTap: (service: Property) => void;
}

export default function ServiceGrid({ services, onServiceTap }: ServiceGridProps) {
  return (
    <div className="px-4 space-y-3">
      {services.map((service, i) => {
        const config = serviceIconMap[service.propertyType || ""] || defaultIcon;
        const Icon = config.icon;
        const cheapest = Math.min(...service.slots.filter(s => s.available).map(s => s.price));
        const availableSlots = service.slots.filter(s => s.available).length;

        return (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.35 }}
            onClick={() => onServiceTap(service)}
            className="flex items-center gap-4 p-4 rounded-2xl cursor-pointer active:scale-[0.98] transition-transform"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {/* Icon circle */}
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: config.bg }}
            >
              <Icon size={24} className={config.color} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-foreground truncate">{service.name}</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{service.description}</p>
              <div className="flex items-center gap-3 mt-1.5">
                <div className="flex items-center gap-1">
                  <Star size={10} className="fill-amber-400 text-amber-400" />
                  <span className="text-[10px] font-medium text-foreground">{service.rating}</span>
                  <span className="text-[10px] text-muted-foreground">({service.reviewCount})</span>
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {availableSlots} option{availableSlots !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            {/* Price + arrow */}
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className="text-sm font-bold text-foreground">₹{cheapest.toLocaleString()}</span>
              <span className="text-[9px] text-muted-foreground">onwards</span>
              <ArrowRight size={14} className="text-primary mt-1" />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
