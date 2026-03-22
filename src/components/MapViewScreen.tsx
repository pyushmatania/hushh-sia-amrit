import { motion, AnimatePresence } from "framer-motion";
import { X, Star, MapPin, Navigation, Layers } from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import { properties, type Property } from "@/data/properties";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapViewScreenProps {
  onPropertyTap: (property: Property) => void;
  onClose: () => void;
}

const CENTER: [number, number] = [18.855, 82.575];
const INITIAL_ZOOM = 14;

const TILE_LAYERS = {
  dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  light: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
};

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
  const [selectedPin, setSelectedPin] = useState<Property | null>(null);
  const [tileStyle, setTileStyle] = useState<keyof typeof TILE_LAYERS>("dark");
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: CENTER,
      zoom: INITIAL_ZOOM,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer(TILE_LAYERS[tileStyle], {
      maxZoom: 19,
      subdomains: "abcd",
    }).addTo(map);

    mapInstanceRef.current = map;

    // Add markers
    properties.forEach((p) => {
      const icon = createPhotoIcon(p.images[0], false, p.basePrice);
      const marker = L.marker([p.lat, p.lng], { icon }).addTo(map);
      marker.on("click", () => setSelectedPin((prev) => (prev?.id === p.id ? null : p)));
      markersRef.current.set(p.id, marker);
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markersRef.current.clear();
    };
  }, []);

  // Update tile layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) map.removeLayer(layer);
    });
    L.tileLayer(TILE_LAYERS[tileStyle], { maxZoom: 19, subdomains: "abcd" }).addTo(map);
  }, [tileStyle]);

  // Update selected marker style
  useEffect(() => {
    markersRef.current.forEach((marker, id) => {
      const p = properties.find((pr) => pr.id === id);
      if (!p) return;
      const isSelected = selectedPin?.id === id;
      marker.setIcon(createPhotoIcon(p.images[0], isSelected, p.basePrice));
      if (isSelected) marker.setZIndexOffset(1000);
      else marker.setZIndexOffset(0);
    });

    if (selectedPin && mapInstanceRef.current) {
      mapInstanceRef.current.panTo([selectedPin.lat, selectedPin.lng], { animate: true, duration: 0.4 });
    }
  }, [selectedPin]);

  const recenter = () => {
    mapInstanceRef.current?.flyTo(CENTER, INITIAL_ZOOM, { duration: 0.8 });
    setSelectedPin(null);
  };

  const cycleTile = () => {
    const keys = Object.keys(TILE_LAYERS) as (keyof typeof TILE_LAYERS)[];
    const next = keys[(keys.indexOf(tileStyle) + 1) % keys.length];
    setTileStyle(next);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background"
    >
      {/* Leaflet Map */}
      <div ref={mapContainerRef} className="absolute inset-0 z-0" />

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-[1000]">
        <div className="flex items-center justify-between px-4 pt-[max(12px,env(safe-area-inset-top))] pb-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-background/80 backdrop-blur-md border border-border flex items-center justify-center shadow-lg"
          >
            <X size={20} className="text-foreground" />
          </motion.button>

          <div className="bg-background/80 backdrop-blur-md border border-border rounded-full px-4 py-2 flex items-center gap-2 shadow-lg">
            <MapPin size={14} className="text-primary" />
            <span className="text-sm font-bold text-foreground">{properties.length} places</span>
          </div>

          <div className="flex flex-col gap-1.5">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={cycleTile}
              className="w-10 h-10 rounded-full bg-background/80 backdrop-blur-md border border-border flex items-center justify-center shadow-lg"
            >
              <Layers size={16} className="text-foreground" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Recenter Button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={recenter}
        className="absolute bottom-32 right-4 z-[1000] w-12 h-12 rounded-full bg-background/80 backdrop-blur-md border border-border flex items-center justify-center shadow-lg"
      >
        <Navigation size={18} className="text-primary" />
      </motion.button>

      {/* Tile style label */}
      <div className="absolute top-[max(56px,calc(env(safe-area-inset-top)+48px))] right-4 z-[1000]">
        <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground bg-background/60 backdrop-blur-sm px-2 py-0.5 rounded-full">
          {tileStyle}
        </span>
      </div>

      {/* Selected Property Card */}
      <AnimatePresence>
        {selectedPin && (
          <motion.div
            key={selectedPin.id}
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="absolute bottom-6 left-4 right-4 z-[1000]"
          >
            <div
              onClick={() => onPropertyTap(selectedPin)}
              className="bg-background/95 backdrop-blur-xl border border-border rounded-2xl overflow-hidden shadow-2xl cursor-pointer active:scale-[0.98] transition-transform"
            >
              <div className="flex gap-3 p-3">
                <div className="w-28 h-28 rounded-xl overflow-hidden shrink-0 relative">
                  <img src={selectedPin.images[0]} alt={selectedPin.name} className="w-full h-full object-cover" />
                  {selectedPin.verified && (
                    <div className="absolute top-1.5 left-1.5 bg-primary/90 text-primary-foreground text-[8px] font-bold px-1.5 py-0.5 rounded-md">
                      ✓ Verified
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 py-0.5">
                  <h3 className="text-sm font-bold text-foreground truncate">{selectedPin.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{selectedPin.description}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <Star size={12} className="fill-amber-400 text-amber-400" />
                    <span className="text-xs font-bold text-foreground">{selectedPin.rating}</span>
                    <span className="text-xs text-muted-foreground">({selectedPin.reviewCount})</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-base font-extrabold text-foreground">
                      ₹{selectedPin.basePrice.toLocaleString("en-IN")}
                      <span className="text-[10px] font-normal text-muted-foreground"> /slot</span>
                    </p>
                    {selectedPin.slotsLeft > 0 && selectedPin.slotsLeft <= 3 && (
                      <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full animate-pulse">
                        {selectedPin.slotsLeft} left
                      </span>
                    )}
                  </div>
                  {selectedPin.tags.length > 0 && (
                    <div className="flex gap-1 mt-1.5 overflow-hidden">
                      {selectedPin.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="text-[9px] font-semibold text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-md truncate">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
