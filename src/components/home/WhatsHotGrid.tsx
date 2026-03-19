import { motion } from "framer-motion";
import { type Property } from "@/data/properties";

interface WhatsHotGridProps {
  properties: Property[];
  onPropertyTap: (property: Property) => void;
}

const hotItems = [
  { title: "New! Archery Range", desc: "Try our new outdoor range", accent: "hsl(270, 60%, 25%)" },
  { title: "Tribal Dance Night", desc: "Every Saturday at 8 PM", accent: "hsl(220, 50%, 20%)" },
  { title: "Pottery Workshop", desc: "Hands-on ceramic art", accent: "hsl(30, 40%, 20%)" },
  { title: "Heritage Walk", desc: "Explore Koraput trails", accent: "hsl(160, 40%, 18%)" },
];

export default function WhatsHotGrid({ properties, onPropertyTap }: WhatsHotGridProps) {
  const propSlice = properties.slice(0, 4);

  return (
    <div className="px-4 grid grid-cols-2 gap-3">
      {propSlice.map((p, i) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.08 }}
          whileTap={{ scale: 0.97 }}
          className="rounded-[16px] overflow-hidden cursor-pointer"
          style={{
            background: hotItems[i]?.accent || "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
          onClick={() => onPropertyTap(p)}
        >
          <img src={p.images[0]} alt={p.name} className="w-full h-28 object-cover" />
          <div className="p-3">
            <p className="text-sm font-bold text-foreground line-clamp-1">
              {hotItems[i]?.title || p.name}
            </p>
            <p className="text-xs text-foreground/50 mt-0.5 line-clamp-1">
              {hotItems[i]?.desc || p.description}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
