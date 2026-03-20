import { motion, AnimatePresence } from "framer-motion";
import {
  Search, X, SlidersHorizontal, MapPin, Users, Calendar as CalendarIcon,
  Star, BadgeCheck, ChevronDown, ArrowUpDown, Minus, Plus, Sparkles
} from "lucide-react";
import { useState, useMemo, useCallback } from "react";
import { format } from "date-fns";
import { type Property } from "@/data/properties";
import { useDbListings } from "@/hooks/use-db-listings";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface SearchScreenProps {
  onPropertyTap: (property: Property) => void;
  onClose: () => void;
}

const amenityFilters = ["Private Pool", "Bonfire Pit", "Sound System", "BBQ Area", "Stargazing Deck", "Movie Screen", "DJ Booth"];

const categoryFilters = [
  { id: "stays", label: "Stays", emoji: "🏡" },
  { id: "experiences", label: "Experiences", emoji: "✨" },
  { id: "party", label: "Party", emoji: "🎉" },
  { id: "bonfire", label: "Bonfire", emoji: "🔥" },
  { id: "pool", label: "Pool", emoji: "🏊" },
  { id: "dining", label: "Dining", emoji: "🍽️" },
  { id: "movie", label: "Movie", emoji: "🎬" },
  { id: "stargazing", label: "Stargazing", emoji: "🌌" },
];

type SortOption = "relevance" | "price-low" | "price-high" | "rating" | "reviews";

const sortLabels: Record<SortOption, string> = {
  relevance: "Relevance",
  "price-low": "Price: Low → High",
  "price-high": "Price: High → Low",
  rating: "Top Rated",
  reviews: "Most Reviewed",
};

export default function SearchScreen({ onPropertyTap, onClose }: SearchScreenProps) {
  const { properties } = useDbListings();
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [guestCount, setGuestCount] = useState(0);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [sortBy, setSortBy] = useState<SortOption>("relevance");
  const [showSort, setShowSort] = useState(false);

  const toggleAmenity = useCallback((a: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
    );
  }, []);

  const toggleCategory = useCallback((c: string) => {
    setSelectedCategories((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  }, []);

  const filtered = useMemo(() => {
    let results = properties.filter((p) => {
      if (query && !p.name.toLowerCase().includes(query.toLowerCase()) && !p.description.toLowerCase().includes(query.toLowerCase()) && !p.location.toLowerCase().includes(query.toLowerCase())) {
        return false;
      }
      if (p.basePrice < priceRange[0] || p.basePrice > priceRange[1]) return false;
      if (minRating > 0 && p.rating < minRating) return false;
      if (guestCount > 0 && p.capacity < guestCount) return false;
      if (selectedAmenities.length > 0 && !selectedAmenities.some((a) => p.amenities.includes(a))) return false;
      if (selectedCategories.length > 0 && !selectedCategories.some((c) => p.category.includes(c))) return false;
      return true;
    });

    // Sort
    switch (sortBy) {
      case "price-low":
        results = [...results].sort((a, b) => a.basePrice - b.basePrice);
        break;
      case "price-high":
        results = [...results].sort((a, b) => b.basePrice - a.basePrice);
        break;
      case "rating":
        results = [...results].sort((a, b) => b.rating - a.rating);
        break;
      case "reviews":
        results = [...results].sort((a, b) => b.reviewCount - a.reviewCount);
        break;
    }

    return results;
  }, [query, priceRange, minRating, guestCount, selectedAmenities, selectedCategories, sortBy]);

  const activeFilterCount =
    (minRating > 0 ? 1 : 0) +
    (selectedAmenities.length > 0 ? 1 : 0) +
    (selectedCategories.length > 0 ? 1 : 0) +
    (guestCount > 0 ? 1 : 0) +
    (selectedDate ? 1 : 0) +
    (priceRange[0] > 0 || priceRange[1] < 10000 ? 1 : 0);

  const clearAll = useCallback(() => {
    setPriceRange([0, 10000]);
    setMinRating(0);
    setSelectedAmenities([]);
    setSelectedCategories([]);
    setGuestCount(0);
    setSelectedDate(undefined);
    setSortBy("relevance");
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="fixed inset-0 z-50 bg-mesh overflow-y-auto pb-24"
    >
      {/* Search Header */}
      <div className="sticky top-0 z-10 glass px-5 pt-4 pb-3">
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

        {/* Filter & Sort Row */}
        <div className="flex items-center gap-2 mt-3 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all shrink-0 ${
              activeFilterCount > 0
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-foreground"
            }`}
          >
            <SlidersHorizontal size={13} />
            Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            <ChevronDown size={12} className={`transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </button>

          {/* Sort button */}
          <button
            onClick={() => setShowSort(!showSort)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all shrink-0 ${
              sortBy !== "relevance"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-foreground"
            }`}
          >
            <ArrowUpDown size={13} />
            {sortLabels[sortBy]}
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
              className="px-3 py-1.5 rounded-full text-xs font-medium border border-border text-muted-foreground hover:border-foreground/30 transition-all whitespace-nowrap shrink-0"
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sort dropdown */}
      <AnimatePresence>
        {showSort && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-border bg-background/80 backdrop-blur-md"
          >
            <div className="px-5 py-3 flex flex-wrap gap-2">
              {(Object.keys(sortLabels) as SortOption[]).map((key) => (
                <button
                  key={key}
                  onClick={() => { setSortBy(key); setShowSort(false); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    sortBy === key
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-foreground"
                  }`}
                >
                  {sortLabels[key]}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
              {/* Category */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-primary" /> Category
                </h4>
                <div className="flex flex-wrap gap-2">
                  {categoryFilters.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => toggleCategory(cat.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        selectedCategories.includes(cat.id)
                          ? "border-foreground bg-foreground text-background"
                          : "border-border text-foreground"
                      }`}
                    >
                      <span>{cat.emoji}</span> {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">Price Range</h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "Any", range: [0, 10000] as [number, number] },
                    { label: "₹0–999", range: [0, 999] as [number, number] },
                    { label: "₹1K–2K", range: [1000, 1999] as [number, number] },
                    { label: "₹2K–5K", range: [2000, 4999] as [number, number] },
                    { label: "₹5K+", range: [5000, 10000] as [number, number] },
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

              {/* Guest Count */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
                  <Users size={14} className="text-primary" /> Guests
                </h4>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setGuestCount(Math.max(0, guestCount - 1))}
                    disabled={guestCount === 0}
                    className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-foreground disabled:opacity-30 transition-all active:scale-90"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="text-sm font-semibold text-foreground w-16 text-center">
                    {guestCount === 0 ? "Any" : `${guestCount}+`}
                  </span>
                  <button
                    onClick={() => setGuestCount(guestCount + 1)}
                    className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-foreground transition-all active:scale-90"
                  >
                    <Plus size={16} />
                  </button>
                  {/* Quick guest presets */}
                  <div className="flex gap-1.5 ml-2">
                    {[5, 10, 20, 50].map((n) => (
                      <button
                        key={n}
                        onClick={() => setGuestCount(n)}
                        className={`px-2 py-1 rounded-md text-[11px] font-medium border transition-all ${
                          guestCount === n
                            ? "border-foreground bg-foreground text-background"
                            : "border-border text-muted-foreground"
                        }`}
                      >
                        {n}+
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Date */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
                  <CalendarIcon size={14} className="text-primary" /> Date
                </h4>
                <div className="flex items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        className={cn(
                          "flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all",
                          selectedDate
                            ? "border-foreground bg-foreground text-background"
                            : "border-border text-foreground"
                        )}
                      >
                        <CalendarIcon size={14} />
                        {selectedDate ? format(selectedDate, "MMM d, yyyy") : "Pick a date"}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-[60]" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                  {selectedDate && (
                    <button
                      onClick={() => setSelectedDate(undefined)}
                      className="text-xs text-muted-foreground underline underline-offset-2"
                    >
                      Clear
                    </button>
                  )}
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

              {/* Clear & Apply row */}
              <div className="flex items-center justify-between pt-1">
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearAll}
                    className="text-sm font-medium text-primary underline underline-offset-2"
                  >
                    Clear all filters
                  </button>
                )}
                <button
                  onClick={() => setShowFilters(false)}
                  className="ml-auto px-5 py-2 rounded-xl bg-foreground text-background text-sm font-semibold transition-all active:scale-95"
                >
                  Show {filtered.length} result{filtered.length !== 1 ? "s" : ""}
                </button>
              </div>
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
                    <span className="text-xs text-muted-foreground">· up to {property.capacity}</span>
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
