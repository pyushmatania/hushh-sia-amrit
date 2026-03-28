import { motion, AnimatePresence } from "framer-motion";
import { X, Star, MapPin, Navigation, Layers, Search, SlidersHorizontal, List, Map as MapIcon, ArrowUpDown, Plus, Minus, Share2, LocateFixed, Loader2, ChevronLeft, ChevronRight, Sun, Moon } from "lucide-react";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { properties, type Property } from "@/data/properties";
import { useTheme } from "@/hooks/use-theme";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Ensure L is globally available BEFORE markercluster plugin loads
if (typeof window !== "undefined") {
  (window as any).L = L;
}
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

interface MapViewScreenProps {
  onPropertyTap: (property: Property) => void;
  onClose: () => void;
}

const CENTER: [number, number] = [18.855, 82.575];
const INITIAL_ZOOM = 14;

// Theme-aware tile layers
const TILE_LAYERS = {
  light: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
  dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
};

const TILE_OPTIONS: Record<string, any> = {
  light: { subdomains: "abcd", maxZoom: 20, attribution: '&copy; CartoDB', className: "map-tiles-light" },
  dark: { subdomains: "abcd", maxZoom: 20, attribution: '&copy; CartoDB', className: "map-tiles-evening" },
  satellite: { maxZoom: 20, attribution: '&copy; Esri' },
};

const CATEGORIES = [
  { key: "all", label: "All", emoji: "🗺️" },
  { key: "stay", label: "Stays", emoji: "🏡" },
  { key: "experience", label: "Experiences", emoji: "🎭" },
  { key: "service", label: "Services", emoji: "🛎️" },
  { key: "curation", label: "Curations", emoji: "✨" },
];

const PRICE_RANGES = [
  { key: "all", label: "Any price" },
  { key: "budget", label: "Under ₹1K", max: 1000 },
  { key: "mid", label: "₹1K–3K", min: 1000, max: 3000 },
  { key: "premium", label: "₹3K+", min: 3000 },
];

function createPhotoIcon(imageUrl: string, isSelected: boolean, price: number) {
  const size = isSelected ? 64 : 48;
  const border = isSelected ? "3px solid hsl(var(--primary))" : "2px solid rgba(255,255,255,0.9)";
  const shadow = isSelected
    ? "0 0 0 4px hsl(var(--primary)/0.3), 0 4px 20px rgba(0,0,0,0.5)"
    : "0 2px 12px rgba(0,0,0,0.4)";
  const priceTag = `<div style="
    position:absolute; bottom:-10px; left:50%; transform:translateX(-50%);
    background:hsl(var(--primary)); color:#fff; font-size:10px; font-weight:700;
    padding:2px 8px; border-radius:10px; white-space:nowrap;
    box-shadow:0 2px 6px rgba(0,0,0,0.3);
  ">₹${price.toLocaleString("en-IN")}</div>`;

  return L.divIcon({
    className: "custom-photo-marker",
    html: `<div style="position:relative;width:${size}px;height:${size}px;">
      <div style="
        width:${size}px;height:${size}px;border-radius:${isSelected ? "18px" : "14px"};
        overflow:hidden;border:${border};box-shadow:${shadow};
        transition:all 0.3s ease;
      ">
        <img src="${imageUrl}" style="width:100%;height:100%;object-fit:cover;" />
      </div>
      ${priceTag}
      <div style="
        position:absolute;bottom:-16px;left:50%;transform:translateX(-50%);
        width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;
        border-top:6px solid ${isSelected ? "hsl(var(--primary))" : "rgba(255,255,255,0.9)"};
      "></div>
    </div>`,
    iconSize: [size, size + 20],
    iconAnchor: [size / 2, size + 16],
    popupAnchor: [0, -(size + 16)],
  });
}

export default function MapViewScreen({ onPropertyTap, onClose }: MapViewScreenProps) {
  const { resolvedTheme } = useTheme();
  const [selectedPin, setSelectedPin] = useState<Property | null>(null);
  const [tileStyle, setTileStyle] = useState<keyof typeof TILE_LAYERS>(resolvedTheme === "dark" ? "dark" : "light");
  const [activeCategory, setActiveCategory] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [listView, setListView] = useState(false);
  const [sortBy, setSortBy] = useState<"default" | "price_asc" | "price_desc" | "rating" | "distance">("default");
  const [routeLoading, setRouteLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const clusterGroupRef = useRef<any>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      if (activeCategory !== "all" && p.primaryCategory !== activeCategory) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!p.name.toLowerCase().includes(q) && !p.description.toLowerCase().includes(q) && !p.tags.some((t) => t.toLowerCase().includes(q))) return false;
      }
      if (priceRange !== "all") {
        const range = PRICE_RANGES.find((r) => r.key === priceRange);
        if (range) {
          if ("min" in range && p.basePrice < range.min!) return false;
          if ("max" in range && p.basePrice >= range.max!) return false;
        }
      }
      if (verifiedOnly && !p.verified) return false;
      return true;
    });
  }, [activeCategory, searchQuery, priceRange, verifiedOnly]);

  const distFromCenter = (p: Property) =>
    Math.sqrt(Math.pow(p.lat - CENTER[0], 2) + Math.pow(p.lng - CENTER[1], 2));

  const sortedProperties = useMemo(() => {
    const list = [...filteredProperties];
    switch (sortBy) {
      case "price_asc": return list.sort((a, b) => a.basePrice - b.basePrice);
      case "price_desc": return list.sort((a, b) => b.basePrice - a.basePrice);
      case "rating": return list.sort((a, b) => b.rating - a.rating);
      case "distance": return list.sort((a, b) => distFromCenter(a) - distFromCenter(b));
      default: return list;
    }
  }, [filteredProperties, sortBy]);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: CENTER,
      zoom: INITIAL_ZOOM,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer(TILE_LAYERS[tileStyle], TILE_OPTIONS[tileStyle]).addTo(map);
    mapInstanceRef.current = map;

    clusterGroupRef.current = (L as any).markerClusterGroup({
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      iconCreateFunction: (cluster: any) => {
        const count = cluster.getChildCount();
        const size = count > 10 ? 52 : count > 5 ? 44 : 38;
        return L.divIcon({
          html: `<div style="
            width:${size}px;height:${size}px;border-radius:50%;
            background:hsl(var(--primary));color:#fff;
            display:flex;align-items:center;justify-content:center;
            font-weight:800;font-size:${size > 44 ? 16 : 13}px;
            box-shadow:0 0 0 4px hsl(var(--primary)/0.25),0 4px 16px rgba(0,0,0,0.4);
            font-family:inherit;
          ">${count}</div>`,
          className: "custom-cluster-icon",
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        });
      },
    });
    map.addLayer(clusterGroupRef.current);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markersRef.current.clear();
      clusterGroupRef.current = null;
    };
  }, []);

  // Sync markers with filtered properties
  useEffect(() => {
    const cluster = clusterGroupRef.current;
    if (!cluster) return;

    // Remove old markers
    cluster.clearLayers();
    markersRef.current.clear();

    // Add filtered
    filteredProperties.forEach((p) => {
      const icon = createPhotoIcon(p.images[0], selectedPin?.id === p.id, p.basePrice);
      const marker = L.marker([p.lat, p.lng], { icon });
      marker.on("click", () => setSelectedPin((prev) => (prev?.id === p.id ? null : p)));
      markersRef.current.set(p.id, marker);
      cluster.addLayer(marker);
    });

    // If selected pin is no longer in filtered, deselect
    if (selectedPin && !filteredProperties.find((p) => p.id === selectedPin.id)) {
      setSelectedPin(null);
    }
  }, [filteredProperties]);

  // Update tile layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) map.removeLayer(layer);
    });
    L.tileLayer(TILE_LAYERS[tileStyle], TILE_OPTIONS[tileStyle]).addTo(map);
  }, [tileStyle]);

  // Update selected marker style
  useEffect(() => {
    markersRef.current.forEach((marker, id) => {
      const p = properties.find((pr) => pr.id === id);
      if (!p) return;
      const isSelected = selectedPin?.id === id;
      marker.setIcon(createPhotoIcon(p.images[0], isSelected, p.basePrice));
      marker.setZIndexOffset(isSelected ? 1000 : 0);
    });

    if (selectedPin && mapInstanceRef.current) {
      mapInstanceRef.current.panTo([selectedPin.lat, selectedPin.lng], { animate: true, duration: 0.4 });
    }
  }, [selectedPin]);

  const recenter = () => {
    mapInstanceRef.current?.flyTo(CENTER, INITIAL_ZOOM, { duration: 0.8 });
    setSelectedPin(null);
    clearRoute();
  };

  const clearRoute = () => {
    if (routeLayerRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }
    if (userMarkerRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(userMarkerRef.current);
      userMarkerRef.current = null;
    }
  };

  const showRouteToPin = async (property: Property) => {
    const map = mapInstanceRef.current;
    if (!map) return;
    setRouteLoading(true);
    clearRoute();

    try {
      // Get user location
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 8000 })
      );
      const userPos: [number, number] = [pos.coords.latitude, pos.coords.longitude];
      setUserLocation(userPos);

      // Add user marker
      const userIcon = L.divIcon({
        className: "custom-photo-marker",
        html: `<div style="width:32px;height:32px;border-radius:50%;background:hsl(270,80%,65%);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round"><circle cx="12" cy="12" r="4"/></svg>
        </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });
      userMarkerRef.current = L.marker(userPos, { icon: userIcon }).addTo(map);

      // Fetch route from OSRM
      const url = `https://router.project-osrm.org/route/v1/driving/${userPos[1]},${userPos[0]};${property.lng},${property.lat}?overview=full&geometries=geojson`;
      const resp = await fetch(url);
      const data = await resp.json();

      if (data.routes && data.routes.length > 0) {
        const coords = data.routes[0].geometry.coordinates.map((c: number[]) => [c[1], c[0]] as [number, number]);
        routeLayerRef.current = L.polyline(coords, {
          color: "hsl(270, 80%, 65%)",
          weight: 5,
          opacity: 0.85,
          smoothFactor: 1,
          dashArray: "10, 6",
        }).addTo(map);
        map.fitBounds(routeLayerRef.current.getBounds(), { padding: [60, 60], maxZoom: 15, animate: true });

        const dist = data.routes[0].distance;
        const duration = data.routes[0].duration;
        const km = (dist / 1000).toFixed(1);
        const mins = Math.ceil(duration / 60);
        import("sonner").then(({ toast }) => toast.success(`${km} km · ~${mins} min drive`));
      } else {
        // Fallback: straight line
        routeLayerRef.current = L.polyline([userPos, [property.lat, property.lng]], {
          color: "hsl(270, 80%, 65%)", weight: 4, opacity: 0.7, dashArray: "8, 8",
        }).addTo(map);
        map.fitBounds(routeLayerRef.current.getBounds(), { padding: [60, 60], animate: true });
        import("sonner").then(({ toast }) => toast.info("Showing approximate route"));
      }
    } catch (err) {
      import("sonner").then(({ toast }) => toast.error("Could not get your location. Please enable location access."));
    } finally {
      setRouteLoading(false);
    }
  };

  const cycleTile = () => {
    const keys = Object.keys(TILE_LAYERS) as (keyof typeof TILE_LAYERS)[];
    setTileStyle(keys[(keys.indexOf(tileStyle) + 1) % keys.length]);
  };

  const activeFilterCount = [activeCategory !== "all", priceRange !== "all", verifiedOnly].filter(Boolean).length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-background">
      <div ref={mapContainerRef} className="absolute inset-0 z-0" />

      {/* Top Controls */}
      <div className="absolute top-0 left-0 right-0 z-[1000]">
        <div className="px-4 pt-[max(12px,env(safe-area-inset-top))] pb-2">
          {/* Row 1: Close + Search + Actions */}
          <div className="flex items-center gap-2">
            <motion.button whileTap={{ scale: 0.9 }} onClick={onClose} className="w-10 h-10 rounded-full bg-background/80 backdrop-blur-md border border-border flex items-center justify-center shadow-lg shrink-0">
              <X size={20} className="text-foreground" />
            </motion.button>

            <div className="flex-1 flex items-center gap-2 bg-background/80 backdrop-blur-md border border-border rounded-full px-3 py-2 shadow-lg">
              <Search size={16} className="text-muted-foreground shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search places..."
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="text-muted-foreground">
                  <X size={14} />
                </button>
              )}
            </div>

            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowFilters(!showFilters)} className="relative w-10 h-10 rounded-full bg-background/80 backdrop-blur-md border border-border flex items-center justify-center shadow-lg shrink-0">
              <SlidersHorizontal size={16} className="text-foreground" />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </motion.button>

            <motion.button whileTap={{ scale: 0.9 }} onClick={cycleTile} className="w-10 h-10 rounded-full bg-background/80 backdrop-blur-md border border-border flex items-center justify-center shadow-lg shrink-0" title={tileStyle === "light" ? "Light" : tileStyle === "dark" ? "Evening" : "Satellite"}>
              {tileStyle === "light" ? <Sun size={16} className="text-amber-500" /> : tileStyle === "dark" ? <Moon size={16} className="text-blue-400" /> : <Layers size={16} className="text-foreground" />}
            </motion.button>
          </div>

          {/* Row 2: Category pills */}
          <div className="flex gap-1.5 mt-2 overflow-x-auto no-scrollbar">
            {CATEGORIES.map((cat) => (
              <motion.button
                key={cat.key}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveCategory(cat.key)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border shadow-sm transition-colors ${
                  activeCategory === cat.key
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background/80 backdrop-blur-md text-foreground border-border"
                }`}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
              </motion.button>
            ))}
          </div>

          {/* Row 3: Filter panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-2 bg-background/90 backdrop-blur-xl border border-border rounded-2xl p-3 shadow-xl space-y-3">
                  {/* Price */}
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Price Range</p>
                    <div className="flex gap-1.5 flex-wrap">
                      {PRICE_RANGES.map((r) => (
                        <button
                          key={r.key}
                          onClick={() => setPriceRange(r.key)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors ${
                            priceRange === r.key
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-secondary text-foreground border-border"
                          }`}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Verified */}
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Verified only</p>
                    <button
                      onClick={() => setVerifiedOnly(!verifiedOnly)}
                      className={`w-10 h-5 rounded-full relative transition-colors ${verifiedOnly ? "bg-primary" : "bg-secondary"}`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-foreground absolute top-0.5 transition-all ${verifiedOnly ? "left-5.5 right-0.5" : "left-0.5"}`}
                        style={{ left: verifiedOnly ? "22px" : "2px" }}
                      />
                    </button>
                  </div>

                  {/* Reset */}
                  {activeFilterCount > 0 && (
                    <button
                      onClick={() => { setActiveCategory("all"); setPriceRange("all"); setVerifiedOnly(false); }}
                      className="w-full py-1.5 rounded-xl text-xs font-bold text-primary border border-primary/30 bg-primary/5"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Results count badge */}
      <div className="absolute top-[max(110px,calc(env(safe-area-inset-top)+100px))] left-1/2 -translate-x-1/2 z-[1000]">
        {(activeCategory !== "all" || searchQuery || priceRange !== "all" || verifiedOnly) && (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-background/80 backdrop-blur-md border border-border rounded-full px-3 py-1 shadow-lg">
            <span className="text-xs font-bold text-foreground">{filteredProperties.length} of {properties.length} places</span>
          </motion.div>
        )}
      </div>

      {/* Tile style label */}
      <div className="absolute top-[max(56px,calc(env(safe-area-inset-top)+48px))] right-4 z-[999]">
        <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground bg-background/60 backdrop-blur-sm px-2 py-0.5 rounded-full">
          {tileStyle}
        </span>
      </div>

      {/* Recenter + List toggle */}
      <div className="absolute bottom-32 right-4 z-[1000] flex flex-col gap-2">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setListView(!listView)} className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
          {listView ? <MapIcon size={18} /> : <List size={18} />}
        </motion.button>
        {!listView && (
          <>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => mapInstanceRef.current?.zoomIn()} className="w-10 h-10 rounded-full bg-background/80 backdrop-blur-md border border-border flex items-center justify-center shadow-lg">
              <Plus size={16} className="text-foreground" />
            </motion.button>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => mapInstanceRef.current?.zoomOut()} className="w-10 h-10 rounded-full bg-background/80 backdrop-blur-md border border-border flex items-center justify-center shadow-lg">
              <Minus size={16} className="text-foreground" />
            </motion.button>
            <motion.button whileTap={{ scale: 0.9 }} onClick={recenter} className="w-12 h-12 rounded-full bg-background/80 backdrop-blur-md border border-border flex items-center justify-center shadow-lg">
              <Navigation size={18} className="text-primary" />
            </motion.button>
          </>
        )}
      </div>

      {/* List View */}
      <AnimatePresence>
        {listView && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="absolute inset-0 top-[max(100px,calc(env(safe-area-inset-top)+90px))] z-[999] bg-background/95 backdrop-blur-xl rounded-t-3xl border-t border-border overflow-hidden"
          >
            <div className="px-4 pt-3 pb-2 space-y-2 md:px-8">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-foreground md:text-base">{filteredProperties.length} Results</h2>
                <button onClick={() => setListView(false)} className="text-xs font-semibold text-primary">Show Map</button>
              </div>
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                {([
                  { key: "default", label: "Relevant" },
                  { key: "price_asc", label: "Price ↑" },
                  { key: "price_desc", label: "Price ↓" },
                  { key: "rating", label: "Top Rated" },
                  { key: "distance", label: "Nearest" },
                ] as const).map((s) => (
                  <button
                    key={s.key}
                    onClick={() => setSortBy(s.key)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap border transition-colors ${
                      sortBy === s.key
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-secondary text-foreground border-border"
                    }`}
                  >
                    {sortBy === s.key && <ArrowUpDown size={10} />}
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="overflow-y-auto px-4 pb-36 md:px-8" style={{ maxHeight: "calc(100% - 80px)" }}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {sortedProperties.map((p) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => { onPropertyTap(p); }}
                    className="bg-card border border-border rounded-2xl overflow-hidden shadow-md cursor-pointer active:scale-[0.98] transition-transform"
                  >
                    <div className="flex gap-3 p-3">
                      <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 relative">
                        <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                        {p.verified && (
                          <div className="absolute top-1 left-1 bg-primary/90 text-primary-foreground text-[7px] font-bold px-1.5 py-0.5 rounded-md">✓</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 py-0.5">
                        <h3 className="text-sm font-bold text-foreground truncate">{p.name}</h3>
                        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{p.description}</p>
                        <div className="flex items-center gap-1 mt-1.5">
                          <Star size={11} className="fill-primary text-primary" />
                          <span className="text-[11px] font-bold text-foreground">{p.rating}</span>
                          <span className="text-[11px] text-muted-foreground">({p.reviewCount})</span>
                          <span className="text-[9px] text-muted-foreground ml-1 capitalize">{p.primaryCategory}</span>
                        </div>
                        <div className="flex items-center justify-between mt-1.5">
                          <p className="text-sm font-extrabold text-foreground">
                            ₹{p.basePrice.toLocaleString("en-IN")}
                            <span className="text-[9px] font-normal text-muted-foreground"> /slot</span>
                          </p>
                          {p.slotsLeft > 0 && p.slotsLeft <= 3 && (
                            <span className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">{p.slotsLeft} left</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {filteredProperties.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-3xl mb-2">🔍</p>
                    <p className="text-sm font-semibold text-muted-foreground">No places match your filters</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected Property Card (map view only) */}
      <AnimatePresence>
        {selectedPin && !listView && (() => {
          const currentIdx = filteredProperties.findIndex(p => p.id === selectedPin.id);
          const canPrev = currentIdx > 0;
          const canNext = currentIdx < filteredProperties.length - 1;
          const goTo = (dir: -1 | 1) => {
            const next = filteredProperties[currentIdx + dir];
            if (next) {
              setSelectedPin(next);
              clearRoute();
              mapInstanceRef.current?.panTo([next.lat, next.lng], { animate: true });
            }
          };
          return (
          <motion.div
            key={selectedPin.id}
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.3}
            onDragEnd={(_, info) => {
              if (info.offset.x < -50 && canNext) goTo(1);
              else if (info.offset.x > 50 && canPrev) goTo(-1);
            }}
            className="absolute bottom-6 left-4 right-4 z-[1000] touch-pan-y md:left-auto md:right-6 md:w-[420px]"
          >
            {/* Arrow buttons */}
            {canPrev && (
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={(e) => { e.stopPropagation(); goTo(-1); }}
                className="absolute -left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-background/90 border border-border shadow-elevated flex items-center justify-center"
              >
                <ChevronLeft size={16} className="text-foreground" />
              </motion.button>
            )}
            {canNext && (
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={(e) => { e.stopPropagation(); goTo(1); }}
                className="absolute -right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-background/90 border border-border shadow-elevated flex items-center justify-center"
              >
                <ChevronRight size={16} className="text-foreground" />
              </motion.button>
            )}
            <div className="relative">
              {/* Drag handle */}
              <div className="flex justify-center pt-2 pb-1">
                <div className="w-9 h-1 rounded-full bg-muted-foreground/30" />
              </div>
              {/* Close button */}
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={(e) => { e.stopPropagation(); setSelectedPin(null); clearRoute(); }}
                className="absolute -top-2 -right-2 z-10 w-7 h-7 rounded-full bg-foreground/80 text-background flex items-center justify-center shadow-lg"
              >
                <X size={14} />
              </motion.button>
            <div onClick={() => onPropertyTap(selectedPin)} className="bg-background/95 backdrop-blur-xl border border-border rounded-2xl overflow-hidden shadow-2xl cursor-pointer active:scale-[0.98] transition-transform">
              <div className="flex gap-3 p-3">
                <div className="w-28 h-28 rounded-xl overflow-hidden shrink-0 relative">
                  <img src={selectedPin.images[0]} alt={selectedPin.name} className="w-full h-full object-cover" />
                  {selectedPin.verified && (
                    <div className="absolute top-1.5 left-1.5 bg-primary/90 text-primary-foreground text-[8px] font-bold px-1.5 py-0.5 rounded-md">✓ Verified</div>
                  )}
                </div>
                <div className="flex-1 min-w-0 py-0.5">
                  <h3 className="text-sm font-bold text-foreground truncate">{selectedPin.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{selectedPin.description}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <Star size={12} className="fill-primary text-primary" />
                    <span className="text-xs font-bold text-foreground">{selectedPin.rating}</span>
                    <span className="text-xs text-muted-foreground">({selectedPin.reviewCount})</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-base font-extrabold text-foreground">
                      ₹{selectedPin.basePrice.toLocaleString("en-IN")}
                      <span className="text-[10px] font-normal text-muted-foreground"> /slot</span>
                    </p>
                    {selectedPin.slotsLeft > 0 && selectedPin.slotsLeft <= 3 && (
                      <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full animate-pulse">{selectedPin.slotsLeft} left</span>
                    )}
                  </div>
                  {selectedPin.tags.length > 0 && (
                    <div className="flex gap-1 mt-1.5 overflow-hidden">
                      {selectedPin.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="text-[9px] font-semibold text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-md truncate">{tag}</span>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2 mt-2">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        showRouteToPin(selectedPin);
                      }}
                      disabled={routeLoading}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-primary text-primary-foreground text-[12px] font-bold active:scale-[0.97] transition-transform disabled:opacity-60"
                      style={{ boxShadow: "0 2px 10px hsl(var(--primary) / 0.3)" }}
                    >
                      {routeLoading ? <Loader2 size={13} className="animate-spin" /> : <LocateFixed size={13} />} Navigate
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedPin.lat},${selectedPin.lng}`, "_blank");
                      }}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-secondary text-foreground text-[12px] font-bold active:scale-[0.97] transition-transform"
                    >
                      <Navigation size={13} />
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        const url = `https://www.google.com/maps?q=${selectedPin.lat},${selectedPin.lng}`;
                        navigator.clipboard.writeText(url);
                        import("sonner").then(({ toast }) => toast.success("Location link copied!"));
                      }}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-secondary text-foreground text-[12px] font-bold active:scale-[0.97] transition-transform"
                    >
                      <Share2 size={13} />
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
            </div>
            {/* Property index indicator */}
            {filteredProperties.length > 1 && (
              <div className="flex justify-center mt-2">
                <span className="text-[10px] font-medium text-muted-foreground bg-secondary/80 backdrop-blur-sm px-2.5 py-0.5 rounded-full">
                  {currentIdx + 1} / {filteredProperties.length}
                </span>
              </div>
            )}
          </motion.div>
          );
        })()}
      </AnimatePresence>
    </motion.div>
  );
}
