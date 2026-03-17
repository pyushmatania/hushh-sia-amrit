import { motion } from "framer-motion";
import { Search, ArrowRight, Sparkles, Bell } from "lucide-react";
import CategoryBar from "./CategoryBar";
import PropertyCard from "./PropertyCard";
import PropertyCardSmall from "./PropertyCardSmall";
import PackageCard from "./PackageCard";
import { properties, packages, type Property } from "@/data/properties";
import { useState } from "react";
import property1 from "@/assets/property-1.jpg";
import property2 from "@/assets/property-2.jpg";
import property3 from "@/assets/property-3.jpg";
import profileAvatar from "@/assets/profile-avatar.png";

interface HomeScreenProps {
  onPropertyTap: (property: Property) => void;
  onSearchTap?: () => void;
}

export default function HomeScreen({ onPropertyTap, onSearchTap }: HomeScreenProps) {
  const [activeCategory, setActiveCategory] = useState("stays");

  return (
    <div className="pb-24 bg-mesh min-h-screen">
      {/* Header */}
      <div className="px-5 pt-5 pb-2 flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/40 glow-sm">
            <img src={profileAvatar} alt="Profile" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Hey, Akash!</p>
            <p className="text-sm font-semibold text-foreground">Jeypore, Odisha</p>
          </div>
        </motion.div>
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-10 h-10 rounded-full glass flex items-center justify-center relative"
        >
          <Bell size={18} className="text-foreground" />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-primary rounded-full glow-sm" />
        </motion.button>
      </div>

      {/* Hero Typography — Jupiter AI style */}
      <div className="px-5 pt-4 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="space-y-1"
        >
          <h1 className="text-[2.8rem] leading-[1.05] font-bold tracking-tight text-foreground">
            Explore
          </h1>
          <div className="flex items-center gap-3">
            <h1 className="text-[2.8rem] leading-[1.05] font-bold tracking-tight text-gradient">
              Private
            </h1>
            <motion.div
              className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-primary/30 shrink-0"
              animate={{ rotate: [0, 3, -3, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <img src={property1} alt="" className="w-full h-full object-cover" />
            </motion.div>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-[2.8rem] leading-[1.05] font-bold tracking-tight text-foreground">
              experiences
            </h1>
            <motion.div
              className="w-12 h-12 rounded-full overflow-hidden border-2 border-gold/40 shrink-0"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <img src={property2} alt="" className="w-full h-full object-cover" />
            </motion.div>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-[2.8rem] leading-[1.05] font-bold tracking-tight text-muted-foreground">
              in
            </h1>
            <motion.div
              className="w-11 h-11 rounded-xl overflow-hidden border-2 border-accent/30 shrink-0"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <img src={property3} alt="" className="w-full h-full object-cover" />
            </motion.div>
          </div>
          <h1 className="text-[2.8rem] leading-[1.05] font-bold tracking-tight text-foreground">
            Jeypore<span className="text-gradient-warm">.</span>
          </h1>
        </motion.div>
      </div>

      {/* Search bar */}
      <div className="px-5 pb-4">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex items-center gap-3 rounded-2xl glass px-5 py-3.5 cursor-pointer"
          onClick={onSearchTap}
        >
          <Search size={18} className="text-primary shrink-0" />
          <span className="text-sm font-medium text-muted-foreground">Search villas, experiences...</span>
        </motion.div>
      </div>

      {/* Feature Cards Grid — Jupiter AI style */}
      <div className="px-5 pb-4">
        <div className="grid grid-cols-2 gap-3">
          {[
            { emoji: "🏊", title: "Pool Villas", subtitle: "3 available", gradient: "from-[hsl(270,60%,30%)] to-[hsl(320,50%,25%)]" },
            { emoji: "🔥", title: "Bonfire Night", subtitle: "Book tonight", gradient: "from-[hsl(20,80%,25%)] to-[hsl(350,60%,25%)]" },
            { emoji: "🎬", title: "Movie Under Stars", subtitle: "New experience", gradient: "from-[hsl(220,60%,25%)] to-[hsl(260,50%,20%)]" },
            { emoji: "💑", title: "Date Night", subtitle: "Curated setups", gradient: "from-[hsl(340,60%,28%)] to-[hsl(280,50%,22%)]" },
          ].map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.06 }}
              className={`relative rounded-2xl p-4 bg-gradient-to-br ${card.gradient} border border-border/30 cursor-pointer overflow-hidden group`}
              onClick={onSearchTap}
            >
              <div className="absolute -top-4 -right-4 text-5xl opacity-30 group-hover:opacity-50 transition-opacity">
                {card.emoji}
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{card.emoji}</span>
                <ArrowRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
              </div>
              <p className="text-sm font-bold text-foreground">{card.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{card.subtitle}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Category Bar */}
      <div className="sticky top-0 z-20">
        <CategoryBar active={activeCategory} onChange={setActiveCategory} />
      </div>

      {/* Guest favourites */}
      <div className="mt-6">
        <div className="flex items-center justify-between px-5 mb-3">
          <h2 className="text-lg font-bold text-foreground">Guests also loved</h2>
          <button className="text-xs text-primary font-medium flex items-center gap-1">
            View all <ArrowRight size={12} />
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
          <h2 className="text-lg font-bold text-foreground">Available today</h2>
          <button className="text-xs text-primary font-medium flex items-center gap-1">
            View all <ArrowRight size={12} />
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
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Sparkles size={16} className="text-primary" /> One-tap packages
          </h2>
        </div>
        <div className="flex gap-3 overflow-x-auto hide-scrollbar px-5">
          {packages.map((pkg, i) => (
            <PackageCard key={pkg.id} pkg={pkg} index={i} />
          ))}
        </div>
      </div>

      {/* Recent Searches */}
      <div className="mt-7 px-5">
        <h2 className="text-lg font-bold text-foreground mb-3">Recent Searches</h2>
        <div className="space-y-2">
          {[
            { icon: "🏊", text: "Pool villas for 2 guests..." },
            { icon: "🔥", text: "Bonfire night this weekend..." },
            { icon: "🎂", text: "Birthday party venues for 15..." },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              className="flex items-center gap-3 glass rounded-xl px-4 py-3 cursor-pointer"
              onClick={onSearchTap}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm text-muted-foreground flex-1">{item.text}</span>
              <ArrowRight size={14} className="text-muted-foreground" />
            </motion.div>
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
