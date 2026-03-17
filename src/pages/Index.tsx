import { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import SplashScreen from "@/components/SplashScreen";
import BottomNav from "@/components/BottomNav";
import HomeScreen from "@/components/HomeScreen";
import PropertyDetail from "@/components/PropertyDetail";
import ExperienceBuilder from "@/components/ExperienceBuilder";
import CheckoutScreen from "@/components/CheckoutScreen";
import BookingConfirmation from "@/components/BookingConfirmation";
import WishlistScreen from "@/components/WishlistScreen";
import TripsScreen from "@/components/TripsScreen";
import ProfileScreen from "@/components/ProfileScreen";
import MessagesScreen from "@/components/MessagesScreen";
import SearchScreen from "@/components/SearchScreen";
import type { Property } from "@/data/properties";

type Screen =
  | { type: "home" }
  | { type: "detail"; property: Property }
  | { type: "builder"; property: Property; slotId: string; guests: number }
  | { type: "checkout"; property: Property; slotId: string; guests: number; selections: Record<string, number>; total: number }
  | { type: "confirmation"; property: Property; slotId: string; guests: number; total: number };

export default function Index() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState("home");
  const [screen, setScreen] = useState<Screen>({ type: "home" });
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [showSearch, setShowSearch] = useState(false);

  const toggleWishlist = useCallback((id: string) => {
    setWishlist((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }, []);

  const handlePropertyTap = useCallback((property: Property) => {
    setShowSearch(false);
    setScreen({ type: "detail", property });
    setActiveTab("home");
  }, []);

  const handleBook = useCallback((property: Property, slotId: string, guests: number) => {
    setScreen({ type: "builder", property, slotId, guests });
  }, []);

  const handleContinue = useCallback(
    (property: Property, slotId: string, guests: number) =>
      (selections: Record<string, number>, total: number) => {
        setScreen({ type: "checkout", property, slotId, guests, selections, total });
      },
    []
  );

  const handleCheckoutConfirm = useCallback(
    (property: Property, slotId: string, guests: number) =>
      (finalTotal: number) => {
        setScreen({ type: "confirmation", property, slotId, guests, total: finalTotal });
      },
    []
  );

  const handleDone = useCallback(() => {
    setScreen({ type: "home" });
    setActiveTab("bookings");
  }, []);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  const showBottomNav = screen.type === "home";

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence mode="wait">
        {screen.type === "home" && activeTab === "home" && (
          <HomeScreen key="home" onPropertyTap={handlePropertyTap} onSearchTap={() => setShowSearch(true)} />
        )}
        {screen.type === "home" && activeTab === "wishlists" && (
          <WishlistScreen
            key="wishlists"
            wishlist={wishlist}
            onToggleWishlist={toggleWishlist}
            onPropertyTap={handlePropertyTap}
          />
        )}
        {screen.type === "home" && activeTab === "bookings" && (
          <TripsScreen key="trips" />
        )}
        {screen.type === "home" && activeTab === "messages" && (
          <MessagesScreen key="messages" />
        )}
        {screen.type === "home" && activeTab === "profile" && (
          <ProfileScreen key="profile" />
        )}
        {screen.type === "detail" && (
          <PropertyDetail
            key="detail"
            property={screen.property}
            onBack={() => setScreen({ type: "home" })}
            onBook={handleBook}
          />
        )}
        {screen.type === "builder" && (
          <ExperienceBuilder
            key="builder"
            property={screen.property}
            slotId={screen.slotId}
            guests={screen.guests}
            onBack={() => setScreen({ type: "detail", property: screen.property })}
            onContinue={handleContinue(screen.property, screen.slotId, screen.guests)}
          />
        )}
        {screen.type === "checkout" && (
          <CheckoutScreen
            key="checkout"
            property={screen.property}
            slotId={screen.slotId}
            guests={screen.guests}
            selections={screen.selections}
            total={screen.total}
            onBack={() => setScreen({ type: "builder", property: screen.property, slotId: screen.slotId, guests: screen.guests })}
            onConfirm={handleCheckoutConfirm(screen.property, screen.slotId, screen.guests)}
          />
        )}
        {screen.type === "confirmation" && (
          <BookingConfirmation
            key="confirmation"
            property={screen.property}
            slotId={screen.slotId}
            guests={screen.guests}
            total={screen.total}
            onDone={handleDone}
          />
        )}
      </AnimatePresence>

      {/* Search overlay */}
      <AnimatePresence>
        {showSearch && (
          <SearchScreen
            key="search"
            onPropertyTap={handlePropertyTap}
            onClose={() => setShowSearch(false)}
          />
        )}
      </AnimatePresence>

      {showBottomNav && (
        <BottomNav active={activeTab} onChange={setActiveTab} />
      )}
    </div>
  );
}
