import { useState, useCallback, useEffect, lazy, Suspense, startTransition } from "react";
import { AnimatePresence } from "framer-motion";
import { useAppConfig } from "@/hooks/use-app-config";
import SplashScreen from "@/components/SplashScreen";

import BottomNav from "@/components/BottomNav";
import DesktopTopNav from "@/components/DesktopTopNav";
import HomeScreen from "@/components/HomeScreen";
import NotificationToastProvider from "@/components/NotificationToastProvider";
import NotificationPermissionBanner from "@/components/NotificationPermissionBanner";
import ScreenSkeleton from "@/components/shared/ScreenSkeleton";

// Lazy-loaded screens (not needed on initial render)
const PropertyDetail = lazy(() => import("@/components/PropertyDetail"));
const ExperienceBuilder = lazy(() => import("@/components/ExperienceBuilder"));
const ExperienceDetailScreen = lazy(() => import("@/components/ExperienceDetailScreen"));
const CheckoutScreen = lazy(() => import("@/components/CheckoutScreen"));
const BookingConfirmation = lazy(() => import("@/components/BookingConfirmation"));
const BookingDetailScreen = lazy(() => import("@/components/BookingDetailScreen"));
const WishlistScreen = lazy(() => import("@/components/WishlistScreen"));
const TripsScreen = lazy(() => import("@/components/TripsScreen"));
const ProfileScreen = lazy(() => import("@/components/ProfileScreen"));
const MessagesScreen = lazy(() => import("@/components/MessagesScreen"));
const SearchScreen = lazy(() => import("@/components/SearchScreen"));
const MapViewScreen = lazy(() => import("@/components/MapViewScreen"));
const HostDashboard = lazy(() => import("@/components/HostDashboard"));
const HostAnalyticsScreen = lazy(() => import("@/components/HostAnalyticsScreen"));
const CreateListingScreen = lazy(() => import("@/components/CreateListingScreen"));
const NotificationCenter = lazy(() => import("@/components/NotificationCenter"));
import { useAuth } from "@/hooks/use-auth";
import { useWishlists } from "@/hooks/use-wishlists";
import { useBookings } from "@/hooks/use-bookings";
import { useHostListings } from "@/hooks/use-host-listings";
import { useUnreadCount } from "@/hooks/use-unread-count";
import { useNotifications } from "@/hooks/use-notifications";
import { useLoyalty } from "@/hooks/use-loyalty";
import { useToast } from "@/hooks/use-toast";
import { type Property } from "@/data/properties";
import type { ExperiencePack } from "@/components/home/CuratedPackCard";
import { usePropertiesData } from "@/contexts/PropertiesContext";

export interface Booking {
  id: string;
  propertyId: string;
  date: string;
  slot: string;
  guests: number;
  total: number;
  status: "active" | "upcoming" | "completed" | "cancelled";
  bookingId: string;
  roomsCount?: number | null;
  extraMattresses?: number | null;
}

type Screen =
  | { type: "home" }
  | { type: "detail"; property: Property }
  | { type: "experienceDetail"; pack: ExperiencePack; property: Property }
  | { type: "builder"; property: Property; slotId: string; guests: number; date: Date; extras?: Property[]; roomsCount?: number; extraMattresses?: number }
  | { type: "checkout"; property: Property; slotId: string; guests: number; date: Date; selections: Record<string, number>; total: number; extras?: Property[]; roomsCount?: number; extraMattresses?: number }
  | { type: "confirmation"; property: Property; slotId: string; guests: number; date: Date; total: number }
  | { type: "bookingDetail"; booking: Booking }
  | { type: "hostDashboard" }
  | { type: "hostAnalytics" }
  | { type: "createListing"; editListing?: import("@/hooks/use-host-listings").HostListing };

export default function Index() {
  const appConfig = useAppConfig();
  const bookingPrefix = (appConfig.app_name || "HUSHH").toUpperCase();
  const { user, loading } = useAuth();
  const { properties: liveProperties } = usePropertiesData();

  // Dynamic page title from admin config
  useEffect(() => {
    if (appConfig.app_name) {
      document.title = `${appConfig.app_name} — ${appConfig.app_tagline || "Premium Experiences"}`;
    }
  }, [appConfig.app_name, appConfig.app_tagline]);
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState("home");
  const [screen, setScreen] = useState<Screen>({ type: "home" });
  const [showSearch, setShowSearch] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { unreadCount: notifUnreadCount } = useNotifications();
  const { wishlist, toggleWishlist } = useWishlists();
  const { bookings, createBooking, cancelBooking } = useBookings();
  const { listings: hostListings, createListing, updateListing, deleteListing } = useHostListings();
  const unreadCount = useUnreadCount();
  const { toast } = useToast();
  const { awardPoints } = useLoyalty();

  const handlePropertyTap = useCallback((property: Property) => {
    setShowSearch(false);
    setScreen({ type: "detail", property });
    setActiveTab("home");
  }, []);

  const handleExperienceTap = useCallback((pack: ExperiencePack) => {
    const property = properties.find(p => p.id === pack.propertyId);
    if (property) {
      setScreen({ type: "experienceDetail", pack, property });
      setActiveTab("home");
    } else {
      // Fallback: open experience detail with a synthetic property from pack data
      const syntheticProperty: Property = {
        id: pack.propertyId || pack.id,
        name: pack.name,
        description: pack.tagline || pack.name,
        fullDescription: pack.tagline || "",
        location: "Jeypore, Odisha",
        lat: 18.856,
        lng: 82.571,
        images: [""],
        basePrice: pack.price,
        rating: 4.8,
        reviewCount: 0,
        amenities: pack.includes || [],
        amenityIcons: (pack.includes || []).map(() => "✨"),
        capacity: 20,
        tags: pack.tags || [],
        category: ["experience"],
        primaryCategory: "experience",
        slotsLeft: 5,
        verified: true,
        slots: pack.slot ? [{ id: "default", label: pack.slot, time: pack.slot, price: pack.price, available: true }] : [],
        entryInstructions: "",
        hostName: "Hushh",
        hostSince: "2024",
        responseRate: "100%",
        rules: [],
        reviews: [],
        highlights: pack.includes?.slice(0, 3) || [],
      };
      setScreen({ type: "experienceDetail", pack, property: syntheticProperty });
      setActiveTab("home");
    }
  }, [properties]);

  const handleBook = useCallback((property: Property, slotId: string, guests: number, date: Date, extras?: Property[], roomsCount?: number, extraMattresses?: number) => {
    setScreen({ type: "builder", property, slotId, guests, date, extras, roomsCount, extraMattresses });
  }, []);

  const handleContinue = useCallback(
    (property: Property, slotId: string, guests: number, date: Date, extras?: Property[], roomsCount?: number, extraMattresses?: number) =>
      (selections: Record<string, number>, total: number) => {
        setScreen({ type: "checkout", property, slotId, guests, date, selections, total, extras, roomsCount, extraMattresses });
      },
    []
  );

  const handleCheckoutConfirm = useCallback(
    (property: Property, slotId: string, guests: number, date: Date) =>
      async (finalTotal: number, roomsCount?: number, extraMattresses?: number) => {
        const bookingData = {
          propertyId: property.id,
          date: date.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }),
          slot: `${property.slots.find(s => s.id === slotId)?.label} · ${property.slots.find(s => s.id === slotId)?.time}`,
          guests,
          total: finalTotal,
          status: "upcoming" as const,
          bookingId: `${bookingPrefix}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          roomsCount: roomsCount ?? null,
          extraMattresses: extraMattresses ?? null,
        };
        await createBooking(bookingData);
        const earnedPts = Math.floor(finalTotal / 100) * 5;
        if (earnedPts > 0) {
          await awardPoints(earnedPts, `Booking: ${property.name}`, "🏨");
        }
        toast({
          title: "🎉 Booking Confirmed!",
          description: `${property.name} on ${bookingData.date} · +${earnedPts} pts`,
        });
        setScreen({ type: "confirmation", property, slotId, guests, date, total: finalTotal });
      },
    [createBooking, awardPoints, toast]
  );

  const handleDone = useCallback(() => {
    setScreen({ type: "home" });
    setActiveTab("bookings");
  }, []);

  const handleViewBookingDetail = useCallback((booking: Booking) => {
    setScreen({ type: "bookingDetail", booking });
  }, []);

  const handleCancelBooking = useCallback((bookingId: string) => {
    cancelBooking(bookingId);
  }, [cancelBooking]);

  const handleRebook = useCallback((propertyId: string) => {
    const property = properties.find(p => p.id === propertyId);
    if (property) {
      setScreen({ type: "detail", property });
    }
  }, []);

  const handleOpenHostDashboard = useCallback(() => {
    setScreen({ type: "hostDashboard" });
  }, []);

  const handleCreateListingSubmit = useCallback(
    async (listing: Omit<import("@/hooks/use-host-listings").HostListing, "id" | "createdAt">) => {
      if (screen.type === "createListing" && screen.editListing) {
        await updateListing(screen.editListing.id, listing);
      } else {
        await createListing(listing);
      }
      setScreen({ type: "hostDashboard" });
    },
    [screen, createListing, updateListing]
  );

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  if (loading) {
    return <div className="min-h-screen bg-background" />;
  }

  const showBottomNav = screen.type === "home";

  const lazyFallback = <ScreenSkeleton />;

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <DesktopTopNav
        active={activeTab}
        onChange={(tab) => {
          if (tab === "hostDashboard") {
            handleOpenHostDashboard();
          } else {
            setActiveTab(tab);
            setScreen({ type: "home" });
          }
        }}
        messageBadge={unreadCount}
        onNotificationTap={() => setShowNotifications(true)}
      />
      <div className="md:pt-16">
      <Suspense fallback={lazyFallback}>
      <AnimatePresence mode="wait">
        {screen.type === "home" && activeTab === "home" && (
          <HomeScreen key="home" onPropertyTap={handlePropertyTap} onExperienceTap={handleExperienceTap} onSearchTap={() => setShowSearch(true)} onMapTap={() => startTransition(() => setShowMap(true))} onNotificationTap={() => setShowNotifications(true)} wishlist={wishlist} onToggleWishlist={toggleWishlist} />
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
            onCancel={handleCancelBooking}
          />
        )}
        {screen.type === "home" && activeTab === "messages" && (
          <MessagesScreen key="messages" />
        )}
        {screen.type === "home" && activeTab === "profile" && (
          <ProfileScreen key="profile" onHostTap={handleOpenHostDashboard} bookings={bookings} onViewBookingDetail={handleViewBookingDetail} onRebook={handleRebook} />
        )}
        {screen.type === "detail" && (
          <PropertyDetail
            key="detail"
            property={screen.property}
            onBack={() => setScreen({ type: "home" })}
            onBook={handleBook}
            onPropertyTap={handlePropertyTap}
            isWishlisted={wishlist.includes(screen.property.id)}
            onToggleWishlist={toggleWishlist}
            onHostChat={(hostName) => {
              setScreen({ type: "home" });
              setActiveTab("messages");
            }}
          />
        )}
        {screen.type === "experienceDetail" && (
          <ExperienceDetailScreen
            key="experienceDetail"
            pack={screen.pack}
            property={screen.property}
            onBack={() => setScreen({ type: "home" })}
            onBook={() => setScreen({ type: "detail", property: screen.property })}
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
            onContinue={handleContinue(screen.property, screen.slotId, screen.guests, screen.date, screen.extras, screen.roomsCount, screen.extraMattresses)}
            extras={screen.extras}
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
            onBack={() => setScreen({ type: "builder", property: screen.property, slotId: screen.slotId, guests: screen.guests, date: screen.date, extras: screen.extras, roomsCount: screen.roomsCount, extraMattresses: screen.extraMattresses })}
            extras={screen.extras}
            onConfirm={handleCheckoutConfirm(screen.property, screen.slotId, screen.guests, screen.date)}
            isWishlisted={wishlist.includes(screen.property.id)}
            onToggleWishlist={toggleWishlist}
            roomsCount={screen.roomsCount}
            extraMattresses={screen.extraMattresses}
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
        {screen.type === "hostDashboard" && (
          <HostDashboard
            key="hostDashboard"
            listings={hostListings}
            onCreateListing={() => setScreen({ type: "createListing" })}
            onEditListing={(listing) => setScreen({ type: "createListing", editListing: listing })}
            onDeleteListing={deleteListing}
            onToggleStatus={(id, status) => updateListing(id, { status })}
            onAnalytics={() => setScreen({ type: "hostAnalytics" })}
            onBack={() => { setScreen({ type: "home" }); setActiveTab("profile"); }}
          />
        )}
        {screen.type === "hostAnalytics" && (
          <HostAnalyticsScreen
            key="hostAnalytics"
            onBack={() => setScreen({ type: "hostDashboard" })}
          />
        )}
        {screen.type === "createListing" && (
          <CreateListingScreen
            key="createListing"
            initialData={screen.editListing ?? null}
            onBack={() => setScreen({ type: "hostDashboard" })}
            onSubmit={handleCreateListingSubmit}
          />
        )}
      </AnimatePresence>
      </Suspense>
      </div>

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

      {/* Map overlay */}
      <Suspense fallback={<ScreenSkeleton />}>
        <AnimatePresence>
          {showMap && (
            <MapViewScreen
              key="map"
              onPropertyTap={(p) => { setShowMap(false); handlePropertyTap(p); }}
              onClose={() => setShowMap(false)}
            />
          )}
        </AnimatePresence>
      </Suspense>

      {/* Notification Center overlay */}
      <AnimatePresence>
        {showNotifications && (
          <NotificationCenter
            key="notifications"
            onBack={() => setShowNotifications(false)}
          />
        )}
      </AnimatePresence>

      {showBottomNav && (
        <BottomNav active={activeTab} onChange={setActiveTab} messageBadge={unreadCount} />
      )}

      <NotificationToastProvider />
      <NotificationPermissionBanner />
    </div>
  );
}
