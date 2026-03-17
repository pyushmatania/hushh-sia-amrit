import { motion } from "framer-motion";
import { Search, ArrowRight, Sparkles } from "lucide-react";
import CategoryBar from "./CategoryBar";
import PropertyCard from "./PropertyCard";
import PropertyCardSmall from "./PropertyCardSmall";
import PackageCard from "./PackageCard";
import { properties, packages, type Property } from "@/data/properties";
import { useState } from "react";
import property1 from "@/assets/property-1.jpg";
import profileAvatar from "@/assets/profile-avatar.png";

interface HomeScreenProps {
  onPropertyTap: (property: Property) => void;
  onSearchTap?: () => void;
}

export default function HomeScreen({ onPropertyTap, onSearchTap }: HomeScreenProps) {
  const [activeCategory, setActiveCategory] = useState("stays");

  return (
    <div className="pb-24 bg-mesh min-h-screen">
      {/* Greeting + Avatar */}
      <div className="px-5 pt-4 pb-2 flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <p className="text-sm text-muted-foreground">Hey, Akash! 👋</p>
          <h1 className="text-xl font-bold text-foreground mt-0.5">Discover Jeypore</h1>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/30 glow-sm"
        >
          <img src={profileAvatar} alt="Profile" className="w-full h-full object-cover" />
        </motion.div>
      </div>

      {/* Search bar */}
      <div className="px-5 pb-3">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="flex items-center gap-3 rounded-2xl glass px-5 py-3.5 cursor-pointer"
          onClick={onSearchTap}
        >
          <Search size={18} className="text-primary shrink-0" />
          <span className="text-sm font-medium text-muted-foreground">Search villas, experiences...</span>
        </motion.div>
      </div>

      {/* Category Bar */}
      <div className="sticky top-0 z-20">
        <CategoryBar active={activeCategory} onChange={setActiveCategory} />
      </div>

      {/* Continue searching card */}
      <div className="px-5 pt-5">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-4 glass rounded-2xl p-4 cursor-pointer"
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

      {/* Guest favourites */}
      <div className="mt-7">
        <div className="flex items-center justify-between px-5 mb-3">
          <h2 className="text-xl font-bold text-foreground">Guests also loved</h2>
          <button className="w-8 h-8 rounded-full glass flex items-center justify-center">
            <ArrowRight size={16} className="text-foreground" />
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto hide-scrollbar px-5">
          {properties.map((p, i) => (
            <PropertyCardSmall key={p.id} property={p} index={i} onTap={onPropertyTap} />
          ))}
        </div>
      </div>

      {/* Full-width cards */}
      <div className="mt-7">
        <div className="flex items-center justify-between px-5 mb-3">
          <h2 className="text-xl font-bold text-foreground">Available today</h2>
          <button className="w-8 h-8 rounded-full glass flex items-center justify-center">
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
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Sparkles size={18} className="text-primary" /> One-tap packages
          </h2>
        </div>
        <div className="flex gap-3 overflow-x-auto hide-scrollbar px-5">
          {packages.map((pkg, i) => (
            <PackageCard key={pkg.id} pkg={pkg} index={i} />
          ))}
        </div>
      </div>

      {/* Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mx-5 mt-8 mb-4 flex items-center justify-center gap-2 glass rounded-2xl px-4 py-3"
      >
        <span className="text-lg">🏷️</span>
        <span className="text-sm font-medium text-foreground">Prices include all fees</span>
      </motion.div>
    </div>
  );
}
