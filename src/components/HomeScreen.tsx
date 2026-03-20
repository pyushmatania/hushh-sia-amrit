import { motion, AnimatePresence } from "framer-motion";
import { Bell, MapPin, ArrowRight } from "lucide-react";
import { hapticSelection } from "@/lib/haptics";
import PullToRefresh from "./PullToRefresh";
import CategoryBar from "./CategoryBar";
import PropertyCard from "./PropertyCard";
import PropertyCardSmall from "./PropertyCardSmall";
import PackageCard from "./PackageCard";
import { properties, packages, curatedCombos, type Property } from "@/data/properties";
import MoodSelector, { type Mood } from "./home/MoodSelector";
import CuratedPackCard, { experiencePacks, tonightTags, type ExperiencePack } from "./home/CuratedPackCard";
import { useState, useMemo, useCallback, useRef } from "react";
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
import ExperienceCard from "./home/ExperienceCard";
import { CurationHeroCard, CurationMiniCard } from "./home/CurationHeroCard";
import ServiceGrid from "./home/ServiceGrid";
import CurationGrid from "./home/CurationGrid";

interface HomeScreenProps {
  onPropertyTap: (property: Property) => void;
  onSearchTap?: () => void;
  onMapTap?: () => void;
  onNotificationTap?: () => void;
  wishlist?: string[];
  onToggleWishlist?: (id: string) => void;
}

export default function HomeScreen({ onPropertyTap, onSearchTap, onMapTap, onNotificationTap, wishlist = [], onToggleWishlist }: HomeScreenProps) {
  const { unreadCount: notifCount } = useNotifications();
  const [refreshKey, setRefreshKey] = useState(0);
  const handleRefresh = useCallback(async () => {
    await new Promise((r) => setTimeout(r, 800));
    setRefreshKey((k) => k + 1);
  }, []);
  const [activeCategory, setActiveCategory] = useState("home");
  const [subFilter, setSubFilter] = useState("All");
  const [activeMood, setActiveMood] = useState<Mood>(null);
  const [activePackFilter, setActivePackFilter] = useState("tonight");
  const contentRef = useRef<HTMLDivElement>(null);

  const scrollToTop = useCallback(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Reset sub-filter when switching categories
  const handleCategoryChange = useCallback((id: string) => {
    setActiveCategory(id);
    setSubFilter("All");
    scrollToTop();
  }, [scrollToTop]);

  const handleSubFilter = useCallback((filter: string) => {
    setSubFilter(filter);
    // Scroll just below the category bar area
    setTimeout(() => {
      contentRef.current?.scrollTo({ top: 280, behavior: "smooth" });
    }, 50);
  }, []);

  // Sub-filter definitions mapped to propertyType or tag keywords
  const stayFilters = ["All", "Private Villa", "Pool Villa", "Farmhouse", "Rooftop Space", "Work Pod", "Couple Room", "Open Lawn", "Camping"];
  const experienceFilters = ["All", "Romantic", "Celebration", "Party", "Adventure", "Cultural", "Sports", "Workshop", "Walking Tour"];
  const serviceFilters = ["All", "Chef Service", "Decoration", "Transport", "Entertainment"];

  const experienceFilterMap: Record<string, (p: Property) => boolean> = {
    "All": () => true,
    "Romantic": (p) => p.category.includes("couples") || p.tags.some(t => t.toLowerCase().includes("romantic")),
    "Celebration": (p) => ["Party Hall", "Garden Space", "Open Lawn"].includes(p.propertyType || "") && (p.tags.some(t => t.toLowerCase().includes("birthday") || t.toLowerCase().includes("anniversary") || t.toLowerCase().includes("wedding") || t.toLowerCase().includes("celebration"))),
    "Party": (p) => p.category.includes("party"),
    "Adventure": (p) => p.propertyType === "Adventure" || p.tags.some(t => t.toLowerCase().includes("adventure")),
    "Cultural": (p) => p.propertyType === "Cultural" || p.propertyType === "Workshop" || p.tags.some(t => t.toLowerCase().includes("cultural") || t.toLowerCase().includes("heritage")),
    "Sports": (p) => p.propertyType === "Sports Arena" || p.category.includes("sports"),
    "Workshop": (p) => p.propertyType === "Workshop" || p.propertyType === "Plantation Tour",
    "Walking Tour": (p) => p.propertyType === "Walking Tour" || p.propertyType === "Observatory",
  };

  const curationFilters = ["All", "🔥 Popular", "💑 Romantic", "🎉 Party", "🍗 Foodie", "💻 Work", "🎬 Entertainment", "💸 Budget"];

  const curationFilterMap: Record<string, (c: typeof curatedCombos[0]) => boolean> = {
    "All": () => true,
    "🔥 Popular": (c) => !!c.popular,
    "💑 Romantic": (c) => c.tags.some(t => t.includes("Couple")),
    "🎉 Party": (c) => c.tags.some(t => t.includes("Party") || t.includes("Birthday") || t.includes("Celebration") || t.includes("Fun")),
    "🍗 Foodie": (c) => c.tags.some(t => t.includes("Foodie") || t.includes("Hot")),
    "💻 Work": (c) => c.tags.some(t => t.includes("Work")),
    "🎬 Entertainment": (c) => c.tags.some(t => t.includes("Movie") || t.includes("Gaming")),
    "💸 Budget": (c) => c.priceRange[0] <= 999,
  };

  const filteredCombos = useMemo(() => {
    if (activeCategory !== "curation" || subFilter === "All") return curatedCombos;
    const filterFn = curationFilterMap[subFilter];
    return filterFn ? curatedCombos.filter(filterFn) : curatedCombos;
  }, [activeCategory, subFilter]);

  // Map a combo to the best matching property for navigation
  const comboToProperty = useCallback((combo: typeof curatedCombos[0]): Property => {
    // Try matching by image (combo images are property images)
    const byImage = properties.find(p => p.images.some(img => img === combo.image));
    if (byImage) return byImage;
    // Try matching by tags
    if (combo.tags.some(t => t.includes("Couple"))) return properties.find(p => p.category.includes("couples")) || properties[0];
    if (combo.tags.some(t => t.includes("Party") || t.includes("Birthday"))) return properties.find(p => p.category.includes("party")) || properties[0];
    if (combo.tags.some(t => t.includes("Work"))) return properties.find(p => p.propertyType === "Work Pod") || properties[0];
    if (combo.tags.some(t => t.includes("Movie"))) return properties.find(p => p.name.toLowerCase().includes("movie") || p.name.toLowerCase().includes("amphitheater")) || properties[0];
    if (combo.tags.some(t => t.includes("Pool"))) return properties.find(p => p.category.includes("pool")) || properties[0];
    return properties[0];
  }, []);

  // Filter by primaryCategory
  const filteredProperties = useMemo(() => {
    let list = activeCategory === "home" ? properties : properties.filter(p => p.primaryCategory === activeCategory);

    if (subFilter !== "All") {
      if (activeCategory === "stay" || activeCategory === "service") {
        list = list.filter(p => p.propertyType === subFilter);
      } else if (activeCategory === "experience") {
        const filterFn = experienceFilterMap[subFilter];
        if (filterFn) list = list.filter(filterFn);
      }
    }

    return list;
  }, [activeCategory, subFilter]);

  const stayProperties = useMemo(() => properties.filter(p => p.primaryCategory === "stay"), []);
  const experienceProperties = useMemo(() => properties.filter(p => p.primaryCategory === "experience"), []);
  const serviceProperties = useMemo(() => properties.filter(p => p.primaryCategory === "service"), []);

  const topRated = useMemo(() => [...filteredProperties].sort((a, b) => b.rating - a.rating).slice(0, 6), [filteredProperties]);
  const trendingNow = useMemo(() => filteredProperties.filter(p => p.slotsLeft > 0 && p.slotsLeft <= 3), [filteredProperties]);
  const budgetPicks = useMemo(() => [...filteredProperties].sort((a, b) => a.basePrice - b.basePrice).slice(0, 4), [filteredProperties]);

  // Filter experience packs by mood and tonight tags
  const filteredPacks = useMemo(() => {
    let packs = experiencePacks;
    if (activeMood) {
      packs = packs.filter(p => p.mood.includes(activeMood));
    }
    const tagFilter = tonightTags.find(t => t.id === activePackFilter);
    if (tagFilter) {
      packs = packs.filter(tagFilter.filter);
    }
    return packs;
  }, [activeMood, activePackFilter]);

  // Handle mood change — also affects main property filtering
  const handleMoodChange = useCallback((mood: Mood) => {
    setActiveMood(mood);
    hapticSelection();
  }, []);

  const handlePackTap = useCallback((pack: ExperiencePack) => {
    const property = properties.find(p => p.id === pack.propertyId);
    if (property) onPropertyTap(property);
  }, [onPropertyTap]);

  // Filter properties by mood
  const moodFilteredProperties = useMemo(() => {
    if (!activeMood) return filteredProperties;
    const moodMap: Record<string, (p: Property) => boolean> = {
      romantic: (p) => p.category.includes("couples") || p.tags.some(t => t.toLowerCase().includes("couple")),
      party: (p) => p.category.includes("party") || p.tags.some(t => t.toLowerCase().includes("party")),
      chill: (p) => p.category.includes("bonfire") || p.category.includes("pool") || p.tags.some(t => t.toLowerCase().includes("chill")),
      work: (p) => p.propertyType === "Work Pod" || p.category.includes("work") || p.tags.some(t => t.toLowerCase().includes("work")),
    };
    return filteredProperties.filter(moodMap[activeMood] || (() => true));
  }, [filteredProperties, activeMood]);

  return (
    <PullToRefresh onRefresh={handleRefresh}>
    <div ref={contentRef} key={refreshKey} className="pb-24 min-h-screen overflow-y-auto" style={{ background: "linear-gradient(180deg, #0C0B1D 0%, #111028 100%)" }}>

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
        <CategoryBar active={activeCategory} onChange={handleCategoryChange} />
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
              {/* Mood Selector */}
              <MoodSelector activeMood={activeMood} onMoodChange={handleMoodChange} />

              {/* Curated Experience Packs — Primary Discovery */}
              <div className="mt-1">
                <div className="flex items-center justify-between px-5 mb-2">
                  <h2 className="text-base font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    ✨ Curated Packs
                  </h2>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: "hsl(var(--primary) / 0.15)", color: "hsl(var(--primary))" }}>
                    1-TAP BOOK
                  </span>
                </div>
                {/* Tonight tags */}
                <div className="flex gap-2 overflow-x-auto hide-scrollbar px-4 mb-3">
                  {tonightTags.map(tag => (
                    <button
                      key={tag.id}
                      onClick={() => { hapticSelection(); setActivePackFilter(tag.id); }}
                      className={`text-[10px] px-3 py-1.5 rounded-full whitespace-nowrap shrink-0 transition-all duration-200 flex items-center gap-1 ${
                        activePackFilter === tag.id
                          ? "bg-primary text-primary-foreground font-semibold shadow-md"
                          : "bg-foreground/5 text-foreground/80 border border-foreground/10"
                      }`}
                    >
                      <span>{tag.emoji}</span> {tag.label}
                    </button>
                  ))}
                </div>
                {/* Pack cards */}
                <div className="flex gap-3 overflow-x-auto hide-scrollbar px-4 pb-2">
                  {filteredPacks.map((pack, i) => (
                    <CuratedPackCard key={pack.id} pack={pack} index={i} onTap={handlePackTap} />
                  ))}
                  {filteredPacks.length === 0 && (
                    <div className="w-full py-8 text-center">
                      <p className="text-2xl mb-1">🔍</p>
                      <p className="text-xs text-muted-foreground">No packs match this vibe</p>
                    </div>
                  )}
                </div>
              </div>

              <SectionDivider title="🔥 TONIGHT'S VIBE" />
              <SpotlightCarousel properties={activeMood ? moodFilteredProperties : properties} onPropertyTap={onPropertyTap} category="home" wishlist={wishlist} onToggleWishlist={onToggleWishlist} />

              <SectionDivider title="BOOK YOUR EXPERIENCE" />
              <div className="flex gap-3 overflow-x-auto hide-scrollbar px-4">
                {packages.map((pkg, i) => (
                  <PackageCard key={pkg.id} pkg={pkg} index={i} properties={properties} onPropertyTap={onPropertyTap} />
                ))}
              </div>

              <SectionDivider title="PLAY YOUR GAME" />
              <SportsCards properties={properties} onPropertyTap={onPropertyTap} />

              <SectionDivider title="FOODIE FRONT ROW" />
              <FoodieCarousel properties={properties} onPropertyTap={onPropertyTap} />

              <SectionDivider title="COUPLE SPECIALS 💑" />
              <CoupleSpecials properties={properties} onPropertyTap={onPropertyTap} />

              <SectionDivider title="UPCOMING EVENTS" />
              <UpcomingEvents properties={properties} onPropertyTap={onPropertyTap} />

              <SectionDivider title="WHAT'S HOT ON HUSHH" />
              <WhatsHotGrid properties={properties} onPropertyTap={onPropertyTap} />

              <SectionDivider title="BLOCKBUSTER RELEASE" />
              <BlockbusterBanner properties={properties} onPropertyTap={onPropertyTap} />
            </>
          )}

          {/* ═══════ STAYS TAB ═══════ */}
          {activeCategory === "stay" && (
            <>
              {/* Spotlight Video Cards for Stays */}
              <SectionDivider title="🏡 FEATURED STAYS" />
              <SpotlightCarousel properties={stayProperties} onPropertyTap={onPropertyTap} category="stay" wishlist={wishlist} onToggleWishlist={onToggleWishlist} />

              {/* Property Type Tags */}
              <div className="px-4 pt-4 pb-2 flex gap-2 overflow-x-auto hide-scrollbar">
                {stayFilters.map(type => (
                  <button
                    key={type}
                    onClick={() => handleSubFilter(type)}
                    className={`text-[11px] px-3 py-1.5 rounded-full whitespace-nowrap shrink-0 transition-all duration-200 ${
                      subFilter === type
                        ? "bg-primary text-primary-foreground font-semibold shadow-md"
                        : "bg-foreground/5 text-foreground/80 border border-foreground/10"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {trendingNow.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between px-5 mb-3">
                    <h2 className="text-lg font-bold text-foreground">🔥 Trending Stays</h2>
                    <button onClick={() => handleSubFilter("All")} className="text-xs text-primary font-medium flex items-center gap-1">View all <ArrowRight size={12} /></button>
                  </div>
                  <div className="flex gap-3 overflow-x-auto hide-scrollbar px-5">
                    {trendingNow.map((p, i) => (
                      <PropertyCardSmall key={p.id} property={p} index={i} onTap={onPropertyTap} isWishlisted={wishlist.includes(p.id)} onToggleWishlist={onToggleWishlist} />
                    ))}
                  </div>
                </div>
              )}

              {budgetPicks.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center justify-between px-5 mb-3">
                    <h2 className="text-lg font-bold text-foreground">💸 Budget Friendly</h2>
                    <button onClick={() => handleSubFilter("All")} className="text-xs text-primary font-medium flex items-center gap-1">View all <ArrowRight size={12} /></button>
                  </div>
                  <div className="flex gap-3 overflow-x-auto hide-scrollbar px-5">
                    {budgetPicks.map((p, i) => (
                      <PropertyCardSmall key={p.id} property={p} index={i} onTap={onPropertyTap} isWishlisted={wishlist.includes(p.id)} onToggleWishlist={onToggleWishlist} />
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
                    <PropertyCardSmall key={p.id} property={p} index={i} onTap={onPropertyTap} isWishlisted={wishlist.includes(p.id)} onToggleWishlist={onToggleWishlist} />
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ═══════ EXPERIENCES TAB ═══════ */}
          {activeCategory === "experience" && (
            <>
              <SectionDivider title="🎉 TOP EXPERIENCES" />
              <SpotlightCarousel properties={experienceProperties} onPropertyTap={onPropertyTap} category="experience" wishlist={wishlist} onToggleWishlist={onToggleWishlist} />

              {/* Sub-categories */}
              <div className="px-4 pt-4 pb-2 flex gap-2 overflow-x-auto hide-scrollbar">
                {experienceFilters.map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleSubFilter(tag)}
                    className={`text-[11px] px-3 py-1.5 rounded-full whitespace-nowrap shrink-0 transition-all duration-200 ${
                      subFilter === tag
                        ? "bg-primary text-primary-foreground font-semibold shadow-md"
                        : "bg-foreground/5 text-foreground/80 border border-foreground/10"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* Slots filling up — horizontal scroll with stacked cards */}
              {trendingNow.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between px-5 mb-3">
                    <h2 className="text-lg font-bold text-foreground">⚡ Slots Filling Up</h2>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-semibold animate-pulse">LIVE</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 px-5">
                    {trendingNow.slice(0, 4).map((p, i) => (
                      <ExperienceCard key={p.id} property={p} index={i} onTap={onPropertyTap} variant="stacked" />
                    ))}
                  </div>
                </div>
              )}

              {/* All experiences — wide list cards */}
              <div className="mt-6">
                <div className="flex items-center justify-between px-5 mb-3">
                  <h2 className="text-lg font-bold text-foreground">🔥 All Experiences</h2>
                  <span className="text-xs text-muted-foreground">{filteredProperties.length} found</span>
                </div>
                {filteredProperties.map((p, i) => (
                  <ExperienceCard key={p.id} property={p} index={i} onTap={onPropertyTap} variant="wide" />
                ))}
                {filteredProperties.length === 0 && (
                  <div className="px-5 py-12 text-center">
                    <p className="text-3xl mb-2">🔍</p>
                    <p className="text-foreground font-semibold">No experiences match this filter</p>
                    <button onClick={() => handleSubFilter("All")} className="text-xs text-primary mt-2 font-medium">Show all experiences</button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ═══════ SERVICES TAB — Minimal Icon Grid ═══════ */}
          {activeCategory === "service" && (
            <>
              <div className="px-5 pt-6 pb-1">
                <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Services 🛎️
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Add to any booking, or book standalone
                </p>
              </div>

              <div className="px-4 pt-3 pb-3 flex gap-2 overflow-x-auto hide-scrollbar">
                {serviceFilters.map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleSubFilter(tag)}
                    className={`text-[11px] px-3 py-1.5 rounded-full whitespace-nowrap shrink-0 transition-all duration-200 ${
                      subFilter === tag
                        ? "bg-primary text-primary-foreground font-semibold shadow-md"
                        : "bg-foreground/5 text-foreground/80 border border-foreground/10"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              <ServiceGrid services={filteredProperties} onServiceTap={onPropertyTap} />

              {filteredProperties.length === 0 && (
                <div className="px-5 py-12 text-center">
                  <p className="text-3xl mb-2">🔍</p>
                  <p className="text-foreground font-semibold">No services match this filter</p>
                  <button onClick={() => handleSubFilter("All")} className="text-xs text-primary mt-2 font-medium">Show all services</button>
                </div>
              )}
            </>
          )}

          {/* ═══════ CURATIONS TAB — Minimal Emoji-Forward Grid ═══════ */}
          {activeCategory === "curation" && (
            <>
              <div className="px-5 pt-6 pb-2">
                <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Curated for You ✨
                </h1>
                <p className="text-sm text-muted-foreground mt-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                  One-tap bundles, crafted by locals
                </p>
              </div>

              {/* Filter pills */}
              <div className="px-4 pt-2 pb-3 flex gap-2 overflow-x-auto hide-scrollbar">
                {curationFilters.map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleSubFilter(tag)}
                    className={`text-[11px] px-3 py-1.5 rounded-full whitespace-nowrap shrink-0 transition-all duration-200 ${
                      subFilter === tag
                        ? "bg-primary text-primary-foreground font-semibold shadow-md"
                        : "bg-foreground/5 text-foreground/80 border border-foreground/10"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              <CurationGrid combos={filteredCombos} onComboTap={(c) => onPropertyTap(comboToProperty(c))} />

              {filteredCombos.length === 0 && (
                <div className="px-5 py-12 text-center">
                  <p className="text-3xl mb-2">🔍</p>
                  <p className="text-foreground font-semibold">No combos match this filter</p>
                  <button onClick={() => handleSubFilter("All")} className="text-xs text-primary mt-2 font-medium">Show all combos</button>
                </div>
              )}

              {/* Budget highlight */}
              <div className="mx-4 mt-6 p-4 rounded-2xl border border-foreground/10" style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(6,95,70,0.15) 100%)" }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">💸</span>
                  <h3 className="text-sm font-bold text-foreground">Budget Combos from ₹299</h3>
                </div>
                <p className="text-xs text-muted-foreground">Work & Chill, Day Escape, Game Night — perfect for weekdays!</p>
              </div>
            </>
          )}

          {/* ═══════ ALL LISTINGS for current tab (skip experience & curation — they have their own layouts) ═══════ */}
          {activeCategory !== "experience" && activeCategory !== "curation" && activeCategory !== "service" && (
            <div className="mt-7">
              <div className="flex items-center justify-between px-5 mb-3">
                <h2 className="text-lg font-bold text-foreground">
                  {activeCategory === "home" ? "All Listings" : `All ${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}s`}
                </h2>
                <span className="text-xs text-muted-foreground">{filteredProperties.length} found</span>
              </div>
              {filteredProperties.length > 0 ? (
                <div className="space-y-5">
                  {filteredProperties.map((p, i) => (
                    <PropertyCard key={p.id} property={p} index={i} onTap={onPropertyTap} isWishlisted={wishlist.includes(p.id)} onToggleWishlist={onToggleWishlist} />
                  ))}
                </div>
              ) : (
                <div className="px-5 py-12 text-center">
                  <p className="text-4xl mb-3">🔍</p>
                  <p className="text-foreground font-semibold">No listings in this category yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Check back soon!</p>
                </div>
              )}
            </div>
          )}
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
