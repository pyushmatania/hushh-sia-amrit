import { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import SplashScreen from "@/components/SplashScreen";
import BottomNav from "@/components/BottomNav";
import HomeScreen from "@/components/HomeScreen";
import PropertyDetail from "@/components/PropertyDetail";
import ExperienceBuilder from "@/components/ExperienceBuilder";
import CheckoutScreen from "@/components/CheckoutScreen";
import BookingConfirmation from "@/components/BookingConfirmation";
import BookingDetailScreen from "@/components/BookingDetailScreen";
import WishlistScreen from "@/components/WishlistScreen";
import TripsScreen from "@/components/TripsScreen";
import ProfileScreen from "@/components/ProfileScreen";
import MessagesScreen from "@/components/MessagesScreen";
import SearchScreen from "@/components/SearchScreen";
import { properties, type Property } from "@/data/properties";

export interface Booking {
  id: string;
  propertyId: string;
  date: string;
  slot: string;
  guests: number;
  total: number;
  status: "upcoming" | "completed" | "cancelled";
  bookingId: string;
}

type Screen =
  | { type: "home" }
  | { type: "detail"; property: Property }
  | { type: "builder"; property: Property; slotId: string; guests: number; date: Date }
  | { type: "checkout"; property: Property; slotId: string; guests: number; date: Date; selections: Record<string, number>; total: number }
  | { type: "confirmation"; property: Property; slotId: string; guests: number; date: Date; total: number }
  | { type: "bookingDetail"; booking: Booking };

export default function Index() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState("home");
  const [screen, setScreen] = useState<Screen>({ type: "home" });
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const toggleWishlist = useCallback((id: string) => {
    setWishlist((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }, []);

  const handlePropertyTap = useCallback((property: Property) => {
    setShowSearch(false);
    setScreen({ type: "detail", property });
    setActiveTab("home");
  }, []);

  const handleBook = useCallback((property: Property, slotId: string, guests: number, date: Date) => {
    setScreen({ type: "builder", property, slotId, guests, date });
  }, []);

  const handleContinue = useCallback(
    (property: Property, slotId: string, guests: number, date: Date) =>
      (selections: Record<string, number>, total: number) => {
        setScreen({ type: "checkout", property, slotId, guests, date, selections, total });
      },
    []
  );

  const handleCheckoutConfirm = useCallback(
    (property: Property, slotId: string, guests: number, date: Date) =>
      (finalTotal: number) => {
        const newBooking: Booking = {
          id: String(Date.now()),
          propertyId: property.id,
          date: date.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }),
          slot: `${property.slots.find(s => s.id === slotId)?.label} · ${property.slots.find(s => s.id === slotId)?.time}`,
          guests,
          total: finalTotal,
          status: "upcoming",
          bookingId: `HUSHH-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        };
        setBookings(prev => [newBooking, ...prev]);
        setScreen({ type: "confirmation", property, slotId, guests, date, total: finalTotal });
      },
    []
  );

  const handleDone = useCallback(() => {
    setScreen({ type: "home" });
    setActiveTab("bookings");
  }, []);

  const handleViewBookingDetail = useCallback((booking: Booking) => {
    setScreen({ type: "bookingDetail", booking });
  }, []);

  const handleCancelBooking = useCallback((bookingId: string) => {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: "cancelled" as const } : b));
  }, []);

  const handleRebook = useCallback((propertyId: string) => {
    const property = properties.find(p => p.id === propertyId);
    if (property) {
      setScreen({ type: "detail", property });
    }
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
          <TripsScreen
            key="trips"
            bookings={bookings}
            onViewDetail={handleViewBookingDetail}
            onRebook={handleRebook}
          />
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
            date={screen.date}
            onBack={() => setScreen({ type: "detail", property: screen.property })}
            onContinue={handleContinue(screen.property, screen.slotId, screen.guests, screen.date)}
          />
        )}
        {screen.type === "checkout" && (
          <CheckoutScreen
            key="checkout"
            property={screen.property}
            slotId={screen.slotId}
            guests={screen.guests}
            date={screen.date}
            selections={screen.selections}
            total={screen.total}
            onBack={() => setScreen({ type: "builder", property: screen.property, slotId: screen.slotId, guests: screen.guests, date: screen.date })}
            onConfirm={handleCheckoutConfirm(screen.property, screen.slotId, screen.guests, screen.date)}
          />
        )}
        {screen.type === "confirmation" && (
          <BookingConfirmation
            key="confirmation"
            property={screen.property}
            slotId={screen.slotId}
            guests={screen.guests}
            date={screen.date}
            total={screen.total}
            onDone={handleDone}
          />
        )}
        {screen.type === "bookingDetail" && (
          <BookingDetailScreen
            key="bookingDetail"
            booking={screen.booking}
            onBack={() => { setScreen({ type: "home" }); setActiveTab("bookings"); }}
            onCancel={handleCancelBooking}
            onRebook={handleRebook}
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
