import { motion } from "framer-motion";
import { Search, ArrowRight, Sparkles, Bell, Clock, TrendingUp, Zap } from "lucide-react";
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
import splashEvening from "@/assets/splash-jeypore-evening.jpg";

function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good Morning";
  if (hour >= 12 && hour < 17) return "Good Afternoon";
  if (hour >= 17 && hour < 21) return "Good Evening";
  return "Good Night";
}

interface HomeScreenProps {
  onPropertyTap: (property: Property) => void;
  onSearchTap?: () => void;
}

export default function HomeScreen({ onPropertyTap, onSearchTap }: HomeScreenProps) {
  const [activeCategory, setActiveCategory] = useState("stays");

  return (
    <div className="pb-24 bg-mesh min-h-screen">
      {/* Scenic Header with overlay */}
      <div className="relative h-[280px] overflow-hidden">
        <motion.img
          src={splashEvening}
          alt="Jeypore"
          className="w-full h-full object-cover"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-background" />

        {/* Floating fireflies on header */}
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 3,
              height: 3,
              background: "hsla(55, 90%, 70%, 0.7)",
              left: `${15 + Math.random() * 70}%`,
              top: `${20 + Math.random() * 50}%`,
            }}
            animate={{
              y: [0, -(10 + Math.random() * 20), 0],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
          />
        ))}

        {/* Header content */}
        <div className="absolute top-0 left-0 right-0 px-5 pt-5 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-white/30 shadow-lg">
              <img src={profileAvatar} alt="Profile" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-xs text-white/70 font-medium">{getTimeGreeting()} 👋</p>
              <p className="text-base font-bold text-white">Akash</p>
            </div>
          </motion.div>
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-10 h-10 rounded-full flex items-center justify-center relative"
            style={{
              background: "hsla(0, 0%, 100%, 0.15)",
              backdropFilter: "blur(10px)",
            }}
          >
            <Bell size={18} className="text-white" />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-primary rounded-full glow-sm" />
          </motion.button>
        </div>

        {/* Bottom overlay text */}
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-5">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-3xl font-bold text-white leading-tight tracking-tight">
              Discover<br />
              <span style={{ color: "hsl(var(--primary))" }}>Jeypore</span>
              <span className="text-white/60"> ✨</span>
            </h1>
          </motion.div>
        </div>
      </div>

      {/* Search bar */}
      <div className="px-5 -mt-4 relative z-10 pb-3">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex items-center gap-3 rounded-2xl glass px-5 py-3.5 cursor-pointer shadow-lg"
          onClick={onSearchTap}
        >
          <Search size={18} className="text-primary shrink-0" />
          <span className="text-sm font-medium text-muted-foreground">Search villas, experiences...</span>
        </motion.div>
      </div>

      {/* Quick Stats Row */}
      <div className="px-5 py-3">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          {[
            { icon: Zap, label: "3 slots left", color: "text-primary" },
            { icon: TrendingUp, label: "Trending now", color: "text-success" },
            { icon: Clock, label: "Book for tonight", color: "text-gold" },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              className="shrink-0 flex items-center gap-2 glass rounded-full px-4 py-2"
            >
              <item.icon size={14} className={item.color} />
              <span className="text-xs font-medium text-foreground whitespace-nowrap">{item.label}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Feature Cards Grid — Jupiter AI style */}
      <div className="px-5 pb-4">
        <div className="grid grid-cols-2 gap-3">
          {[
            { emoji: "🏊", title: "Pool Villas", subtitle: "3 available", img: property1 },
            { emoji: "🔥", title: "Bonfire Night", subtitle: "Book tonight", img: property2 },
            { emoji: "🎬", title: "Movie Under Stars", subtitle: "New experience", img: property3 },
            { emoji: "💑", title: "Date Night", subtitle: "Curated setups", img: property1 },
          ].map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.25 + i * 0.06 }}
              className="relative rounded-2xl overflow-hidden cursor-pointer group h-[140px]"
              onClick={onSearchTap}
            >
              <img src={card.img} alt={card.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-xl">{card.emoji}</span>
                  <ArrowRight size={12} className="text-white/50 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                </div>
                <p className="text-sm font-bold text-white">{card.title}</p>
                <p className="text-[10px] text-white/60 mt-0.5">{card.subtitle}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Category Bar */}
      <div className="sticky top-0 z-20">
        <CategoryBar active={activeCategory} onChange={setActiveCategory} />
      </div>

      {/* Live Activity Banner */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
        className="mx-5 mt-5 mb-4"
      >
        <div className="glass rounded-2xl p-4 flex items-center gap-4 overflow-hidden relative">
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-primary/10 blur-xl" />
          <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-border/30">
            <img src={property2} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-[10px] font-semibold text-success uppercase tracking-wider">Live now</span>
            </div>
            <p className="text-sm font-semibold text-foreground truncate">Bonfire session at Firefly Villa</p>
            <p className="text-xs text-muted-foreground">4 guests enjoying right now</p>
          </div>
        </div>
      </motion.div>

      {/* Guest favourites */}
      <div className="mt-4">
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

      {/* Local tips section */}
      <div className="mt-7 px-5">
        <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
          🗺️ Local Tips
        </h2>
        <div className="space-y-3">
          {[
            { emoji: "🌿", title: "Best time to visit", desc: "October to March — cool evenings, perfect for bonfires" },
            { emoji: "🍛", title: "Must try food", desc: "Tribal Thali & Koraput Coffee — authentic local flavors" },
            { emoji: "🌌", title: "Hidden gem", desc: "Deomali Peak stargazing — highest point in Odisha" },
          ].map((tip, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 + i * 0.05 }}
              className="glass rounded-2xl p-4 flex items-start gap-3"
            >
              <span className="text-2xl mt-0.5">{tip.emoji}</span>
              <div>
                <p className="text-sm font-semibold text-foreground">{tip.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{tip.desc}</p>
              </div>
            </motion.div>
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
              transition={{ delay: 0.4 + i * 0.05 }}
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
