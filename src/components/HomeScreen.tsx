import { motion } from "framer-motion";
import { Search, ArrowRight } from "lucide-react";
import CategoryBar from "./CategoryBar";
import PropertyCard from "./PropertyCard";
import PropertyCardSmall from "./PropertyCardSmall";
import PackageCard from "./PackageCard";
import { properties, packages, type Property } from "@/data/properties";
import { useState } from "react";
import property1 from "@/assets/property-1.jpg";

interface HomeScreenProps {
  onPropertyTap: (property: Property) => void;
  onSearchTap?: () => void;
}

export default function HomeScreen({ onPropertyTap, onSearchTap }: HomeScreenProps) {
  const [activeCategory, setActiveCategory] = useState("stays");

  return (
    <div className="pb-24">
      {/* Search bar */}
      <div className="px-5 pt-4 pb-3">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 rounded-full border border-border bg-background px-5 py-3 shadow-[0_3px_12px_rgba(0,0,0,0.08)] cursor-pointer"
          onClick={onSearchTap}
        >
          <Search size={18} className="text-foreground shrink-0" />
          <span className="text-sm font-medium text-foreground">Start your search</span>
        </motion.div>
      </div>

      {/* Category Bar with 3D icons */}
      <div className="sticky top-0 z-20 bg-background">
        <CategoryBar active={activeCategory} onChange={setActiveCategory} />
      </div>

      {/* Continue searching card */}
      <div className="px-5 pt-5">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-4 bg-secondary rounded-2xl p-4 cursor-pointer"
        >
          <div className="flex-1">
            <p className="font-semibold text-base text-foreground leading-snug">
              Continue searching for experiences in Jeypore
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Today · 2 guests <ArrowRight size={14} className="inline ml-0.5 mb-0.5" />
            </p>
          </div>
          <img
            src={property1}
            alt="Continue search"
            className="w-20 h-20 rounded-xl object-cover shrink-0"
          />
        </motion.div>
      </div>

      {/* Horizontal section: Guest favourites */}
      <div className="mt-7">
        <div className="flex items-center justify-between px-5 mb-3">
          <h2 className="text-xl font-semibold text-foreground">Guests also loved</h2>
          <button className="w-8 h-8 rounded-full border border-border flex items-center justify-center">
            <ArrowRight size={16} className="text-foreground" />
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto hide-scrollbar px-5">
          {properties.map((p, i) => (
            <PropertyCardSmall key={p.id} property={p} index={i} onTap={onPropertyTap} />
          ))}
        </div>
      </div>

      {/* Full-width property cards */}
      <div className="mt-7">
        <div className="flex items-center justify-between px-5 mb-3">
          <h2 className="text-xl font-semibold text-foreground">Available today</h2>
          <button className="w-8 h-8 rounded-full border border-border flex items-center justify-center">
            <ArrowRight size={16} className="text-foreground" />
          </button>
        </div>
        <div className="space-y-5">
          {properties.map((p, i) => (
            <PropertyCard key={p.id} property={p} index={i} onTap={onPropertyTap} />
          ))}
        </div>
      </div>

      {/* Packages */}
      <div className="mt-7">
        <div className="flex items-center justify-between px-5 mb-3">
          <h2 className="text-xl font-semibold text-foreground">One-tap packages</h2>
        </div>
        <div className="flex gap-3 overflow-x-auto hide-scrollbar px-5">
          {packages.map((pkg, i) => (
            <PackageCard key={pkg.id} pkg={pkg} index={i} />
          ))}
        </div>
      </div>

      {/* Prices include all fees banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mx-5 mt-8 mb-4 flex items-center justify-center gap-2 bg-background border border-border rounded-full px-4 py-2.5 shadow-sm"
      >
        <span className="text-lg">🏷️</span>
        <span className="text-sm font-medium text-foreground">Prices include all fees</span>
      </motion.div>
    </div>
  );
}
