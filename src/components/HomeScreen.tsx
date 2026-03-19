import { motion } from "framer-motion";
import { Bell, MapPin, Sparkles, ArrowRight } from "lucide-react";
import PullToRefresh from "./PullToRefresh";
import CategoryBar from "./CategoryBar";
import PropertyCard from "./PropertyCard";
import PropertyCardSmall from "./PropertyCardSmall";
import PackageCard from "./PackageCard";
import { properties, packages, type Property } from "@/data/properties";
import { useState, useMemo, useCallback } from "react";
import { useNotifications } from "@/hooks/use-notifications";
import profileAvatar from "@/assets/profile-avatar.png";

// District-style homepage sections
import RotatingSearchBar from "./home/RotatingSearchBar";
import StickyTabBar from "./home/StickyTabBar";
import SectionDivider from "./home/SectionDivider";
import SpotlightCarousel from "./home/SpotlightCarousel";
import SportsCards from "./home/SportsCards";
import FoodieCarousel from "./home/FoodieCarousel";
import CoupleSpecials from "./home/CoupleSpecials";
import UpcomingEvents from "./home/UpcomingEvents";
import WhatsHotGrid from "./home/WhatsHotGrid";
import BlockbusterBanner from "./home/BlockbusterBanner";
import BackToTopButton from "./home/BackToTopButton";

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
  const [activeCategory, setActiveCategory] = useState("stays");
  const [activeDistrictTab, setActiveDistrictTab] = useState("home");

  const filteredProperties = useMemo(() => {
    return properties.filter(p => p.category.includes(activeCategory));
  }, [activeCategory]);

  const topRated = useMemo(() => [...properties].sort((a, b) => b.rating - a.rating).slice(0, 4), []);
  const trendingNow = useMemo(() => properties.filter(p => p.slotsLeft > 0 && p.slotsLeft <= 3), []);

  const curatedSections = useMemo(() => {
    const catProps = properties.filter(p => p.category.includes(activeCategory));
    const topInCategory = [...catProps].sort((a, b) => b.rating - a.rating).slice(0, 4);
    const availableNow = catProps.filter(p => p.slotsLeft > 0).slice(0, 4);

    const sectionMap: Record<string, { title: string; emoji: string; items: Property[]; subtitle?: string }[]> = {
      experiences: [
        { title: "Popular Experiences", emoji: "🔥", items: topInCategory, subtitle: "Most loved by guests" },
        { title: "Available This Week", emoji: "📅", items: availableNow, subtitle: "Book before slots fill up" },
      ],
      party: [
        { title: "Weekend Party Picks", emoji: "🎉", items: topInCategory, subtitle: "Top celebration venues" },
        { title: "Slots Open Now", emoji: "⚡", items: availableNow, subtitle: "Grab before they're gone" },
      ],
      bonfire: [
        { title: "Best Bonfire Nights", emoji: "🔥", items: topInCategory, subtitle: "Under the stars" },
        { title: "Tonight's Picks", emoji: "🌙", items: availableNow, subtitle: "Available for tonight" },
      ],
      pool: [
        { title: "Top Pool Venues", emoji: "🏊", items: topInCategory, subtitle: "Dive right in" },
        { title: "Open Slots", emoji: "💧", items: availableNow, subtitle: "Ready to splash" },
      ],
      movie: [
        { title: "Best Movie Setups", emoji: "🎬", items: topInCategory, subtitle: "Cinema under the sky" },
        { title: "Screen Tonight", emoji: "🍿", items: availableNow, subtitle: "Available for a movie night" },
      ],
      dining: [
        { title: "Top Dining Spots", emoji: "🍽️", items: topInCategory, subtitle: "Fine dining experiences" },
        { title: "Tables Available", emoji: "🪑", items: availableNow, subtitle: "Reserve your table" },
      ],
      stargazing: [
        { title: "Best Stargazing Decks", emoji: "🔭", items: topInCategory, subtitle: "Clear skies await" },
        { title: "Tonight's Sky", emoji: "✨", items: availableNow, subtitle: "Perfect viewing conditions" },
      ],
      services: [
        { title: "Top Rated Services", emoji: "⭐", items: topInCategory, subtitle: "Highest rated by guests" },
        { title: "Available Now", emoji: "🟢", items: availableNow, subtitle: "Ready to book" },
      ],
    };

    return sectionMap[activeCategory] || [];
  }, [activeCategory]);

  return (
    <PullToRefresh onRefresh={handleRefresh}>
    <div key={refreshKey} className="pb-24 min-h-screen" style={{ background: "linear-gradient(180deg, #0C0B1D 0%, #111028 100%)" }}>

      {/* Header with avatar + bell */}
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
            <p className="text-sm font-semibold text-foreground flex items-center gap-1"><MapPin size={12} /> Jeypore, Odisha</p>
          </div>
        </motion.div>
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={onNotificationTap}
          className="w-10 h-10 rounded-full glass flex items-center justify-center relative"
        >
          <Bell size={18} className="text-foreground" />
          {notifCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-1.5 right-1.5 min-w-[16px] h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center px-1"
            >
              {notifCount > 9 ? "9+" : notifCount}
            </motion.span>
          )}
        </motion.button>
      </div>

      {/* Rotating Search Bar */}
      <RotatingSearchBar onSearchTap={onSearchTap} onMapTap={onMapTap} />

      {/* 3D Icon Category Bar */}
      <CategoryBar active={activeCategory} onChange={setActiveCategory} />

      {/* ═══════ SECTION 1: TONIGHT'S VIBE (Spotlight Video Cards) ═══════ */}
      <SectionDivider title="🔥 TONIGHT'S VIBE" />
      <SpotlightCarousel properties={properties} onPropertyTap={onPropertyTap} />

      {/* ═══════ SECTION 2: BOOK YOUR EXPERIENCE (Quick Packages) ═══════ */}
      <SectionDivider title="BOOK YOUR EXPERIENCE" />
      <div className="flex gap-3 overflow-x-auto hide-scrollbar px-4">
        {packages.map((pkg, i) => (
          <PackageCard key={pkg.id} pkg={pkg} index={i} />
        ))}
      </div>

      {/* ═══════ SECTION 3: PLAY YOUR GAME (Sports Cards) ═══════ */}
      <SectionDivider title="PLAY YOUR GAME" />
      <SportsCards properties={properties} onPropertyTap={onPropertyTap} />

      {/* ═══════ SECTION 4: FOODIE FRONT ROW ═══════ */}
      <SectionDivider title="FOODIE FRONT ROW" />
      <FoodieCarousel properties={properties} onPropertyTap={onPropertyTap} />

      {/* ═══════ SECTION 5: COUPLE SPECIALS ═══════ */}
      <SectionDivider title="COUPLE SPECIALS 💑" />
      <CoupleSpecials properties={properties} onPropertyTap={onPropertyTap} />

      {/* ═══════ SECTION 6: UPCOMING EVENTS ═══════ */}
      <SectionDivider title="UPCOMING EVENTS" />
      <UpcomingEvents />

      {/* ═══════ SECTION 7: WHAT'S HOT ON HUSHH ═══════ */}
      <SectionDivider title="WHAT'S HOT ON HUSHH" />
      <WhatsHotGrid properties={properties} onPropertyTap={onPropertyTap} />

      {/* ═══════ SECTION 8: BLOCKBUSTER RELEASE ═══════ */}
      <SectionDivider title="BLOCKBUSTER RELEASE" />
      <BlockbusterBanner />

      {/* ═══════ EXISTING SECTIONS (Trending, Top Rated, Category) ═══════ */}
      {activeCategory === "stays" && trendingNow.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between px-5 mb-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              🔥 Trending now
            </h2>
            <button className="text-xs text-primary font-medium flex items-center gap-1">
              View all <ArrowRight size={12} />
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto hide-scrollbar px-5">
            {trendingNow.map((p, i) => (
              <PropertyCardSmall key={p.id} property={p} index={i} onTap={onPropertyTap} />
            ))}
          </div>
        </div>
      )}

      {activeCategory === "stays" && (
        <div className="mt-6">
          <div className="flex items-center justify-between px-5 mb-3">
            <h2 className="text-lg font-bold text-foreground">⭐ Top Rated</h2>
            <button className="text-xs text-primary font-medium flex items-center gap-1">
              View all <ArrowRight size={12} />
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto hide-scrollbar px-5">
            {topRated.map((p, i) => (
              <PropertyCardSmall key={p.id} property={p} index={i} onTap={onPropertyTap} />
            ))}
          </div>
        </div>
      )}

      {activeCategory !== "stays" && curatedSections.map((section, si) => (
        section.items.length > 0 && (
          <div key={si} className="mt-6">
            <div className="flex items-center justify-between px-5 mb-3">
              <div>
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <span>{section.emoji}</span> {section.title}
                </h2>
                {section.subtitle && (
                  <p className="text-xs text-muted-foreground mt-0.5">{section.subtitle}</p>
                )}
              </div>
              <button className="text-xs text-primary font-medium flex items-center gap-1">
                View all <ArrowRight size={12} />
              </button>
            </div>
            <div className="flex gap-3 overflow-x-auto hide-scrollbar px-5">
              {section.items.map((p, i) => (
                <PropertyCardSmall key={p.id} property={p} index={i} onTap={onPropertyTap} />
              ))}
            </div>
          </div>
        )
      ))}

      {/* Filtered cards */}
      <div className="mt-7">
        <div className="flex items-center justify-between px-5 mb-3">
          <h2 className="text-lg font-bold text-foreground">
            {activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}
          </h2>
          <span className="text-xs text-muted-foreground">{filteredProperties.length} found</span>
        </div>
        {filteredProperties.length > 0 ? (
          <div className="space-y-5">
            {filteredProperties.map((p, i) => (
              <PropertyCard key={p.id} property={p} index={i} onTap={onPropertyTap} />
            ))}
          </div>
        ) : (
          <div className="px-5 py-12 text-center">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-foreground font-semibold">No venues in this category yet</p>
            <p className="text-sm text-muted-foreground mt-1">Try another category or check back soon!</p>
          </div>
        )}
      </div>

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

      {/* Footer spacer */}
      <div className="h-20" />

      {/* Back to top button */}
      <BackToTopButton />
    </div>
    </PullToRefresh>
  );
}
