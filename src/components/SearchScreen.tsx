import { motion, AnimatePresence } from "framer-motion";
import {
  Search, X, SlidersHorizontal, MapPin, Users, Calendar,
  Star, BadgeCheck, ChevronDown
} from "lucide-react";
import { useState, useMemo } from "react";
import { properties, type Property } from "@/data/properties";

interface SearchScreenProps {
  onPropertyTap: (property: Property) => void;
  onClose: () => void;
}

const amenityFilters = ["Private Pool", "Bonfire Pit", "Sound System", "BBQ Area", "Stargazing Deck", "Movie Screen", "DJ Booth"];

export default function SearchScreen({ onPropertyTap, onClose }: SearchScreenProps) {
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [guestCount, setGuestCount] = useState(0);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);

  const toggleAmenity = (a: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
    );
  };

  const filtered = useMemo(() => {
    return properties.filter((p) => {
      // Text search
      if (query && !p.name.toLowerCase().includes(query.toLowerCase()) && !p.description.toLowerCase().includes(query.toLowerCase()) && !p.location.toLowerCase().includes(query.toLowerCase())) {
        return false;
      }
      // Price
      if (p.basePrice < priceRange[0] || p.basePrice > priceRange[1]) return false;
      // Rating
      if (minRating > 0 && p.rating < minRating) return false;
      // Amenities
      if (selectedAmenities.length > 0 && !selectedAmenities.some((a) => p.amenities.includes(a))) return false;
      return true;
    });
  }, [query, priceRange, minRating, selectedAmenities]);

  const activeFilterCount = (minRating > 0 ? 1 : 0) + (selectedAmenities.length > 0 ? 1 : 0) + (priceRange[0] > 0 || priceRange[1] < 10000 ? 1 : 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="fixed inset-0 z-50 bg-mesh overflow-y-auto pb-24"
    >
      {/* Search Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-5 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center gap-3 rounded-xl bg-secondary px-4 py-3">
            <Search size={18} className="text-muted-foreground shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search villas, venues, experiences..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              autoFocus
            />
            {query && (
              <button onClick={() => setQuery("")}>
                <X size={16} className="text-muted-foreground" />
              </button>
            )}
          </div>
          <button onClick={onClose} className="text-sm font-medium text-primary shrink-0">
            Cancel
          </button>
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              activeFilterCount > 0
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-foreground"
            }`}
          >
            <SlidersHorizontal size={13} />
            Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            <ChevronDown size={12} className={`transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </button>

          {/* Quick filter pills */}
          {[
            { label: "Under ₹1000", action: () => setPriceRange([0, 1000]) },
            { label: "4.5+ rated", action: () => setMinRating(4.5) },
            { label: "Pool", action: () => toggleAmenity("Private Pool") },
          ].map((pill) => (
            <button
              key={pill.label}
              onClick={pill.action}
              className="px-3 py-1.5 rounded-full text-xs font-medium border border-border text-muted-foreground hover:border-foreground/30 transition-all whitespace-nowrap"
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Expandable Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-border"
          >
            <div className="px-5 py-4 space-y-5">
              {/* Price Range */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">Price Range</h4>
                <div className="flex gap-2">
                  {[
                    { label: "Any", range: [0, 10000] as [number, number] },
                    { label: "₹0–999", range: [0, 999] as [number, number] },
                    { label: "₹1000–1999", range: [1000, 1999] as [number, number] },
                    { label: "₹2000+", range: [2000, 10000] as [number, number] },
                  ].map((opt) => (
                    <button
                      key={opt.label}
                      onClick={() => setPriceRange(opt.range)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        priceRange[0] === opt.range[0] && priceRange[1] === opt.range[1]
                          ? "border-foreground bg-foreground text-background"
                          : "border-border text-foreground"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">Minimum Rating</h4>
                <div className="flex gap-2">
                  {[0, 4.0, 4.5, 4.8].map((r) => (
                    <button
                      key={r}
                      onClick={() => setMinRating(r)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        minRating === r
                          ? "border-foreground bg-foreground text-background"
                          : "border-border text-foreground"
                      }`}
                    >
                      {r === 0 ? "Any" : <><Star size={11} className="fill-current" /> {r}+</>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">Amenities</h4>
                <div className="flex flex-wrap gap-2">
                  {amenityFilters.map((a) => (
                    <button
                      key={a}
                      onClick={() => toggleAmenity(a)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        selectedAmenities.includes(a)
                          ? "border-foreground bg-foreground text-background"
                          : "border-border text-foreground"
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear */}
              {activeFilterCount > 0 && (
                <button
                  onClick={() => { setPriceRange([0, 10000]); setMinRating(0); setSelectedAmenities([]); setGuestCount(0); }}
                  className="text-sm font-medium text-primary underline underline-offset-2"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <div className="px-5 pt-4">
        <p className="text-xs text-muted-foreground mb-3">
          {filtered.length} result{filtered.length !== 1 ? "s" : ""} {query && `for "${query}"`}
        </p>

        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center pt-16"
          >
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Search size={28} className="text-muted-foreground" />
            </div>
            <h3 className="text-base font-semibold text-foreground">No results found</h3>
            <p className="text-sm text-muted-foreground mt-1 text-center">Try adjusting your filters or search query</p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {filtered.map((property, i) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex gap-3 rounded-2xl border border-border p-3 cursor-pointer hover:bg-secondary/30 transition-colors"
                onClick={() => onPropertyTap(property)}
              >
                <img src={property.images[0]} alt={property.name} className="w-24 h-24 rounded-xl object-cover shrink-0" />
                <div className="flex-1 min-w-0 py-0.5">
                  <h3 className="font-semibold text-sm text-foreground flex items-center gap-1 truncate">
                    {property.name}
                    {property.verified && <BadgeCheck size={13} className="text-primary shrink-0" />}
                  </h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin size={11} /> {property.location}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="flex items-center gap-0.5 text-xs font-medium text-foreground">
                      <Star size={11} className="fill-foreground" /> {property.rating}
                    </span>
                    <span className="text-xs text-muted-foreground">· {property.reviewCount} reviews</span>
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-sm font-semibold text-foreground">
                      ₹{property.basePrice.toLocaleString()}
                      <span className="text-xs font-normal text-muted-foreground"> / 2 hrs</span>
                    </span>
                    {property.slotsLeft > 0 && property.slotsLeft <= 3 && (
                      <span className="text-[10px] font-medium text-destructive">{property.slotsLeft} left</span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
