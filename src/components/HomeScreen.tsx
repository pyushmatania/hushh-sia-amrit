import { motion, AnimatePresence } from "framer-motion";
import { Bell, MapPin, ArrowRight } from "lucide-react";
import PullToRefresh from "./PullToRefresh";
import CategoryBar from "./CategoryBar";
import PropertyCard from "./PropertyCard";
import PropertyCardSmall from "./PropertyCardSmall";
import PackageCard from "./PackageCard";
import { properties, packages, curatedCombos, type Property } from "@/data/properties";
import { useState, useMemo, useCallback } from "react";
import { useNotifications } from "@/hooks/use-notifications";
import profileAvatar from "@/assets/profile-avatar.png";

import RotatingSearchBar from "./home/RotatingSearchBar";
import SectionDivider from "./home/SectionDivider";
import SpotlightCarousel from "./home/SpotlightCarousel";
import SportsCards from "./home/SportsCards";
import FoodieCarousel from "./home/FoodieCarousel";
import CoupleSpecials from "./home/CoupleSpecials";
import UpcomingEvents from "./home/UpcomingEvents";
import WhatsHotGrid from "./home/WhatsHotGrid";
import BlockbusterBanner from "./home/BlockbusterBanner";
import BackToTopButton from "./home/BackToTopButton";
import CuratedComboCard from "./home/CuratedComboCard";

interface HomeScreenProps {
  onPropertyTap: (property: Property) => void;
  onSearchTap?: () => void;
  onMapTap?: () => void;
  onNotificationTap?: () => void;
}

export default function HomeScreen({ onPropertyTap, onSearchTap, onMapTap, onNotificationTap }: HomeScreenProps) {
  const { unreadCount: notifCount } = useNotifications();
  const [refreshKey, setRefreshKey] = useState(0);
  const handleRefresh = useCallback(async () => {
    await new Promise((r) => setTimeout(r, 800));
    setRefreshKey((k) => k + 1);
  }, []);
  const [activeCategory, setActiveCategory] = useState("home");

  // Filter by primaryCategory
  const filteredProperties = useMemo(() => {
    if (activeCategory === "home") return properties;
    return properties.filter(p => p.primaryCategory === activeCategory);
  }, [activeCategory]);

  const stayProperties = useMemo(() => properties.filter(p => p.primaryCategory === "stay"), []);
  const experienceProperties = useMemo(() => properties.filter(p => p.primaryCategory === "experience"), []);
  const serviceProperties = useMemo(() => properties.filter(p => p.primaryCategory === "service"), []);

  const topRated = useMemo(() => [...filteredProperties].sort((a, b) => b.rating - a.rating).slice(0, 6), [filteredProperties]);
  const trendingNow = useMemo(() => filteredProperties.filter(p => p.slotsLeft > 0 && p.slotsLeft <= 3), [filteredProperties]);
  const budgetPicks = useMemo(() => [...filteredProperties].sort((a, b) => a.basePrice - b.basePrice).slice(0, 4), [filteredProperties]);

  return (
    <PullToRefresh onRefresh={handleRefresh}>
    <div key={refreshKey} className="pb-24 min-h-screen" style={{ background: "linear-gradient(180deg, #0C0B1D 0%, #111028 100%)" }}>

      {/* Header */}
      <div className="px-5 pt-5 pb-2 flex items-center justify-between">
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/40 glow-sm">
            <img src={profileAvatar} alt="Profile" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Hey, Akash!</p>
            <p className="text-sm font-semibold text-foreground flex items-center gap-1"><MapPin size={12} /> Jeypore, Odisha</p>
          </div>
        </motion.div>
        <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} onClick={onNotificationTap} className="w-10 h-10 rounded-full glass flex items-center justify-center relative">
          <Bell size={18} className="text-foreground" />
          {notifCount > 0 && (
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-1.5 right-1.5 min-w-[16px] h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center px-1">
              {notifCount > 9 ? "9+" : notifCount}
            </motion.span>
          )}
        </motion.button>
      </div>

      {/* Search + Categories */}
      <div className="mx-0 pb-1 pt-2" style={{
        background: "linear-gradient(135deg, rgba(120,80,220,0.15) 0%, rgba(60,40,140,0.08) 50%, rgba(180,100,255,0.12) 100%)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}>
        <RotatingSearchBar onSearchTap={onSearchTap} onMapTap={onMapTap} />
        <CategoryBar active={activeCategory} onChange={setActiveCategory} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >

          {/* ═══════ HOME TAB — Full Discovery Feed ═══════ */}
          {activeCategory === "home" && (
            <>
              <SectionDivider title="🔥 TONIGHT'S VIBE" />
              <SpotlightCarousel properties={properties} onPropertyTap={onPropertyTap} category="home" />

              <SectionDivider title="BOOK YOUR EXPERIENCE" />
              <div className="flex gap-3 overflow-x-auto hide-scrollbar px-4">
                {packages.map((pkg, i) => (
                  <PackageCard key={pkg.id} pkg={pkg} index={i} />
                ))}
              </div>

              <SectionDivider title="PLAY YOUR GAME" />
              <SportsCards properties={properties} onPropertyTap={onPropertyTap} />

              <SectionDivider title="FOODIE FRONT ROW" />
              <FoodieCarousel properties={properties} onPropertyTap={onPropertyTap} />

              <SectionDivider title="COUPLE SPECIALS 💑" />
              <CoupleSpecials properties={properties} onPropertyTap={onPropertyTap} />

              <SectionDivider title="UPCOMING EVENTS" />
              <UpcomingEvents />

              <SectionDivider title="WHAT'S HOT ON HUSHH" />
              <WhatsHotGrid properties={properties} onPropertyTap={onPropertyTap} />

              <SectionDivider title="BLOCKBUSTER RELEASE" />
              <BlockbusterBanner />
            </>
          )}

          {/* ═══════ STAYS TAB ═══════ */}
          {activeCategory === "stay" && (
            <>
              {/* Spotlight Video Cards for Stays */}
              <SectionDivider title="🏡 FEATURED STAYS" />
              <SpotlightCarousel properties={stayProperties} onPropertyTap={onPropertyTap} category="stay" />

              {/* Property Type Tags */}
              <div className="px-4 pt-4 pb-2 flex gap-2 overflow-x-auto hide-scrollbar">
                {["All", "Private Villa", "Pool Villa", "Farmhouse", "Rooftop Space", "Work Pod", "Couple Room", "Open Lawn"].map(type => (
                  <span key={type} className="text-[11px] px-3 py-1.5 rounded-full bg-foreground/5 text-foreground/80 border border-foreground/10 whitespace-nowrap shrink-0">
                    {type}
                  </span>
                ))}
              </div>

              {trendingNow.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between px-5 mb-3">
                    <h2 className="text-lg font-bold text-foreground">🔥 Trending Stays</h2>
                    <button className="text-xs text-primary font-medium flex items-center gap-1">View all <ArrowRight size={12} /></button>
                  </div>
                  <div className="flex gap-3 overflow-x-auto hide-scrollbar px-5">
                    {trendingNow.map((p, i) => (
                      <PropertyCardSmall key={p.id} property={p} index={i} onTap={onPropertyTap} />
                    ))}
                  </div>
                </div>
              )}

              {budgetPicks.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center justify-between px-5 mb-3">
                    <h2 className="text-lg font-bold text-foreground">💸 Budget Friendly</h2>
                    <button className="text-xs text-primary font-medium flex items-center gap-1">View all <ArrowRight size={12} /></button>
                  </div>
                  <div className="flex gap-3 overflow-x-auto hide-scrollbar px-5">
                    {budgetPicks.map((p, i) => (
                      <PropertyCardSmall key={p.id} property={p} index={i} onTap={onPropertyTap} />
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6">
                <div className="flex items-center justify-between px-5 mb-3">
                  <h2 className="text-lg font-bold text-foreground">⭐ Top Rated Stays</h2>
                  <span className="text-xs text-muted-foreground">{stayProperties.length} stays</span>
                </div>
                <div className="flex gap-3 overflow-x-auto hide-scrollbar px-5">
                  {topRated.map((p, i) => (
                    <PropertyCardSmall key={p.id} property={p} index={i} onTap={onPropertyTap} />
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ═══════ EXPERIENCES TAB ═══════ */}
          {activeCategory === "experience" && (
            <>
              {/* Spotlight Video Cards for Experiences */}
              <SectionDivider title="🎉 TOP EXPERIENCES" />
              <SpotlightCarousel properties={experienceProperties} onPropertyTap={onPropertyTap} category="experience" />

              {/* Sub-categories */}
              <div className="px-4 pt-4 pb-2 flex gap-2 overflow-x-auto hide-scrollbar">
                {["💑 Romantic", "🎂 Celebration", "🎉 Party", "🔥 Chill", "💻 Work", "👩‍💼 Social", "🏕️ Adventure", "🎨 Cultural"].map(tag => (
                  <span key={tag} className="text-[11px] px-3 py-1.5 rounded-full bg-foreground/5 text-foreground/80 border border-foreground/10 whitespace-nowrap shrink-0">
                    {tag}
                  </span>
                ))}
              </div>

              {trendingNow.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between px-5 mb-3">
                    <h2 className="text-lg font-bold text-foreground">⚡ Slots Filling Up</h2>
                  </div>
                  <div className="flex gap-3 overflow-x-auto hide-scrollbar px-5">
                    {trendingNow.map((p, i) => (
                      <PropertyCardSmall key={p.id} property={p} index={i} onTap={onPropertyTap} />
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6">
                <div className="flex items-center justify-between px-5 mb-3">
                  <h2 className="text-lg font-bold text-foreground">🔥 Most Popular</h2>
                  <span className="text-xs text-muted-foreground">{experienceProperties.length} experiences</span>
                </div>
                <div className="flex gap-3 overflow-x-auto hide-scrollbar px-5">
                  {topRated.map((p, i) => (
                    <PropertyCardSmall key={p.id} property={p} index={i} onTap={onPropertyTap} />
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ═══════ SERVICES TAB ═══════ */}
          {activeCategory === "service" && (
            <>
              {/* Spotlight Video Cards for Services */}
              <SectionDivider title="🛎️ PREMIUM SERVICES" />
              <SpotlightCarousel properties={serviceProperties} onPropertyTap={onPropertyTap} />

              <div className="px-4 pt-4 pb-2 flex gap-2 overflow-x-auto hide-scrollbar">
                {["👨‍🍳 Food", "🎈 Decoration", "🚗 Transport", "🎧 Entertainment", "📸 Photography", "🧹 Staff"].map(tag => (
                  <span key={tag} className="text-[11px] px-3 py-1.5 rounded-full bg-foreground/5 text-foreground/80 border border-foreground/10 whitespace-nowrap shrink-0">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-4 px-5">
                <p className="text-sm text-muted-foreground mb-4">
                  Add these services to any Stay or Experience booking, or book them standalone.
                </p>
              </div>
            </>
          )}

          {/* ═══════ CURATIONS TAB ═══════ */}
          {activeCategory === "curation" && (
            <>
              {/* Spotlight Video Cards for Curations — uses top-rated properties */}
              <SectionDivider title="✨ CURATED FOR YOU" />
              <SpotlightCarousel properties={topRated.slice(0, 4)} onPropertyTap={onPropertyTap} />

              <div className="px-5 pt-4 pb-2">
                <h2 className="text-lg font-bold text-foreground mb-1">✨ Ready-Made Experiences</h2>
                <p className="text-xs text-muted-foreground">Pre-built combos for instant booking. One tap, full experience!</p>
              </div>

              {/* Popular Combos */}
              <div className="mt-2">
                <div className="flex items-center justify-between px-5 mb-3">
                  <h2 className="text-base font-bold text-foreground">🔥 Most Popular</h2>
                </div>
                <div className="flex gap-3 overflow-x-auto hide-scrollbar px-4">
                  {curatedCombos.filter(c => c.popular).map((combo, i) => (
                    <CuratedComboCard key={combo.id} combo={combo} index={i} />
                  ))}
                </div>
              </div>

              {/* All Combos */}
              <div className="mt-6">
                <div className="flex items-center justify-between px-5 mb-3">
                  <h2 className="text-base font-bold text-foreground">🎯 All Curated Combos</h2>
                  <span className="text-xs text-muted-foreground">{curatedCombos.length} combos</span>
                </div>
                <div className="flex gap-3 overflow-x-auto hide-scrollbar px-4">
                  {curatedCombos.map((combo, i) => (
                    <CuratedComboCard key={combo.id} combo={combo} index={i} />
                  ))}
                </div>
              </div>

              {/* Budget Combos Highlight */}
              <div className="mx-5 mt-6 p-4 rounded-2xl border border-foreground/10" style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(6,95,70,0.15) 100%)" }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">💸</span>
                  <h3 className="text-sm font-bold text-foreground">Budget Combos from ₹299</h3>
                </div>
                <p className="text-xs text-muted-foreground">Work & Chill Pass, Day Escape, Game Night — perfect for weekdays!</p>
              </div>
            </>
          )}

          {/* ═══════ ALL LISTINGS for current tab ═══════ */}
          <div className="mt-7">
            <div className="flex items-center justify-between px-5 mb-3">
              <h2 className="text-lg font-bold text-foreground">
                {activeCategory === "home" ? "All Listings" :
                 activeCategory === "curation" ? "" :
                 `All ${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}s`}
              </h2>
              {activeCategory !== "curation" && (
                <span className="text-xs text-muted-foreground">{filteredProperties.length} found</span>
              )}
            </div>
            {activeCategory !== "curation" && filteredProperties.length > 0 ? (
              <div className="space-y-5">
                {filteredProperties.map((p, i) => (
                  <PropertyCard key={p.id} property={p} index={i} onTap={onPropertyTap} />
                ))}
              </div>
            ) : activeCategory !== "curation" ? (
              <div className="px-5 py-12 text-center">
                <p className="text-4xl mb-3">🔍</p>
                <p className="text-foreground font-semibold">No listings in this category yet</p>
                <p className="text-sm text-muted-foreground mt-1">Check back soon!</p>
              </div>
            ) : null}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mx-5 mt-8 mb-4 flex items-center justify-center gap-2 glass rounded-2xl px-4 py-3"
      >
        <span className="text-lg">🏷️</span>
        <span className="text-sm font-medium text-foreground">Prices include all fees · No hidden charges</span>
      </motion.div>

      <div className="h-20" />
      <BackToTopButton />
    </div>
    </PullToRefresh>
  );
}
