import { motion } from "framer-motion";
import type { ExperiencePackage, Property } from "@/data/properties";

// Map packages to property categories for smart matching
const packagePropertyMap: Record<string, (p: Property) => boolean> = {
  "p1": (p) => p.category.includes("couples") || p.tags.some(t => t.includes("Couple")), // Romantic Date
  "p2": (p) => p.name.toLowerCase().includes("birthday") || p.propertyType === "Party Hall", // Birthday Bash
  "p3": (p) => p.category.includes("party") || p.propertyType === "Open Lawn", // Weekend Party
  "p4": (p) => p.name.toLowerCase().includes("karaoke") || p.propertyType === "Indoor Lounge", // Karaoke Night
  "p5": (p) => p.category.includes("bonfire") || p.propertyType === "Camping", // Camping Trip
  "p6": (p) => p.category.includes("sports") || p.propertyType === "Sports Arena", // Sports Day
};

interface PackageCardProps {
  pkg: ExperiencePackage;
  index: number;
  properties: Property[];
  onPropertyTap: (property: Property) => void;
}

export default function PackageCard({ pkg, index, properties, onPropertyTap }: PackageCardProps) {
  const handleTap = () => {
    const matcher = packagePropertyMap[pkg.id];
    const match = matcher ? properties.find(matcher) : properties[0];
    if (match) onPropertyTap(match);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, filter: "blur(4px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      transition={{ delay: index * 0.06, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      whileTap={{ scale: 0.97 }}
      className="shrink-0 w-[240px] md:w-full rounded-2xl overflow-hidden glass cursor-pointer transition-all md:hover:shadow-elevated md:hover:border-primary/20 md:hover:-translate-y-1"
      onClick={handleTap}
    >
      <div className="p-5 space-y-2">
        <span className="text-3xl">{pkg.emoji}</span>
        <h4 className="font-semibold text-base md:text-lg text-foreground">{pkg.name}</h4>
        <p className="font-bold text-lg text-gradient">₹{pkg.price.toLocaleString()}</p>
        <div className="flex flex-wrap gap-1 pt-1">
          {pkg.includes.map((item) => (
            <span key={item} className="text-[11px] md:text-xs bg-secondary/80 text-muted-foreground px-2 py-0.5 rounded-full">{item}</span>
          ))}
        </div>
        <button className="mt-3 w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold glow-sm active:scale-95 transition-transform md:hover:bg-primary/90 md:cursor-pointer">
          Book Now
        </button>
      </div>
    </motion.div>
  );
}
