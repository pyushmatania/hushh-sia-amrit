import { motion } from "framer-motion";
import { Search, Bell } from "lucide-react";
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
      <div className="px-4 pt-6 pb-2">
        <div className="flex items-center justify-between">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-2xl font-extrabold text-foreground"
          >
            Hey there 👋
          </motion.h1>
          <div className="flex gap-2">
            <button className="w-10 h-10 rounded-full bg-card flex items-center justify-center border border-border">
              <Bell size={18} className="text-foreground" />
            </button>
          </div>
        </div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-4 glass-card flex items-center gap-3 px-4 py-3 cursor-pointer"
        >
          <Search size={18} className="text-muted-foreground" />
          <span className="text-sm text-muted-foreground">What are you in the mood for?</span>
        </motion.div>
      </div>

      {/* Categories */}
      <CategoryPills active={activeCategory} onChange={setActiveCategory} />

      {/* Properties */}
      <div className="mt-4">
        <div className="flex items-center justify-between px-4 mb-3">
          <h2 className="font-display text-lg font-bold text-foreground">Places near you</h2>
          <button className="text-xs text-primary font-medium">See all</button>
        </div>
        <div className="space-y-4">
          {properties.map((property, i) => (
            <PropertyCard key={property.id} property={property} index={i} onTap={onPropertyTap} />
          ))}
        </div>
      </div>

      {/* Packages */}
      <div className="mt-8">
        <div className="flex items-center justify-between px-4 mb-3">
          <h2 className="font-display text-lg font-bold text-foreground">One-tap packages 🎁</h2>
        </div>
        <div className="flex gap-3 overflow-x-auto hide-scrollbar px-4">
          {packages.map((pkg, i) => (
            <PackageCard key={pkg.id} pkg={pkg} index={i} />
          ))}
        </div>
      </div>

      {/* Tagline */}
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
