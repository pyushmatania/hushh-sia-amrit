import { motion } from "framer-motion";
import { Search, SlidersHorizontal, Bell } from "lucide-react";
import CategoryPills from "./CategoryPills";
import PropertyCard from "./PropertyCard";
import PackageCard from "./PackageCard";
import { properties, packages, type Property } from "@/data/properties";
import { useState } from "react";

interface HomeScreenProps {
  onPropertyTap: (property: Property) => void;
}

export default function HomeScreen({ onPropertyTap }: HomeScreenProps) {
  const [activeCategory, setActiveCategory] = useState("all");

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="px-4 pt-5 pb-3">
        {/* Search bar — Airbnb pill style */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="flex-1 flex items-center gap-3 rounded-full border border-border bg-card px-4 py-2.5 shadow-sm cursor-pointer hover:shadow-md transition-shadow">
            <Search size={18} className="text-foreground shrink-0" />
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-foreground leading-tight">Where to?</span>
              <span className="text-[11px] text-muted-foreground leading-tight">Any time · Add guests</span>
            </div>
          </div>
          <button className="w-10 h-10 rounded-full border border-border flex items-center justify-center shrink-0 bg-card">
            <SlidersHorizontal size={16} className="text-foreground" />
          </button>
        </motion.div>
      </div>

      {/* Categories — Airbnb-style icon bar */}
      <div className="sticky top-0 z-20 bg-background">
        <CategoryPills active={activeCategory} onChange={setActiveCategory} />
      </div>

      {/* Properties */}
      <div className="mt-4 space-y-6">
        {properties.map((property, i) => (
          <PropertyCard key={property.id} property={property} index={i} onTap={onPropertyTap} />
        ))}
      </div>

      {/* Packages */}
      <div className="mt-8">
        <div className="flex items-center justify-between px-4 mb-3">
          <h2 className="font-semibold text-lg text-foreground">One-tap packages 🎁</h2>
        </div>
        <div className="flex gap-3 overflow-x-auto hide-scrollbar px-4">
          {packages.map((pkg, i) => (
            <PackageCard key={pkg.id} pkg={pkg} index={i} />
          ))}
        </div>
      </div>

      {/* Footer tagline */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-center text-xs text-muted-foreground mt-10 mb-4"
      >
        Your private sanctuary, whispered into reality. 🤫
      </motion.p>
    </div>
  );
}
