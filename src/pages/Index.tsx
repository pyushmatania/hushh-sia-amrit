import { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import SplashScreen from "@/components/SplashScreen";
import BottomNav from "@/components/BottomNav";
import HomeScreen from "@/components/HomeScreen";
import PropertyDetail from "@/components/PropertyDetail";
import ExperienceBuilder from "@/components/ExperienceBuilder";
import BookingConfirmation from "@/components/BookingConfirmation";
import type { Property } from "@/data/properties";

type Screen =
  | { type: "home" }
  | { type: "detail"; property: Property }
  | { type: "builder"; property: Property; slotId: string; guests: number }
  | { type: "confirmation"; property: Property; slotId: string; guests: number; total: number };

export default function Index() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState("home");
  const [screen, setScreen] = useState<Screen>({ type: "home" });

  const handlePropertyTap = useCallback((property: Property) => {
    setScreen({ type: "detail", property });
  }, []);

  const handleBook = useCallback((property: Property, slotId: string, guests: number) => {
    setScreen({ type: "builder", property, slotId, guests });
  }, []);

  const handleContinue = useCallback(
    (property: Property, slotId: string, guests: number) =>
      (_selections: Record<string, number>, total: number) => {
        setScreen({ type: "confirmation", property, slotId, guests, total });
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

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence mode="wait">
        {screen.type === "home" && (
          <HomeScreen key="home" onPropertyTap={handlePropertyTap} />
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

      {screen.type === "home" && (
        <BottomNav active={activeTab} onChange={setActiveTab} />
      )}
    </div>
  );
}
