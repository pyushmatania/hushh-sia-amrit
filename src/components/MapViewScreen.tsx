import { motion, AnimatePresence } from "framer-motion";
import { X, Star, MapPin, Navigation, ChevronUp, ChevronDown, Minus, Plus } from "lucide-react";
import { useState, useMemo, useRef } from "react";
import { properties, type Property } from "@/data/properties";

interface MapViewScreenProps {
  onPropertyTap: (property: Property) => void;
  onClose: () => void;
}

/* Jeypore center */
const CENTER_LAT = 18.855;
const CENTER_LNG = 82.575;
const INITIAL_ZOOM = 13;

/* Convert lat/lng to pixel position on map */
function latLngToPosition(lat: number, lng: number, zoom: number, centerLat: number, centerLng: number, width: number, height: number) {
  const scale = Math.pow(2, zoom);
  const worldX = ((lng + 180) / 360) * 256 * scale;
  const worldY = ((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) * 256 * scale;
  const centerWorldX = ((centerLng + 180) / 360) * 256 * scale;
  const centerWorldY = ((1 - Math.log(Math.tan((centerLat * Math.PI) / 180) + 1 / Math.cos((centerLat * Math.PI) / 180)) / Math.PI) / 2) * 256 * scale;
  return {
    x: width / 2 + (worldX - centerWorldX),
    y: height / 2 + (worldY - centerWorldY),
  };
}

export default function MapViewScreen({ onPropertyTap, onClose }: MapViewScreenProps) {
  const [zoom, setZoom] = useState(INITIAL_ZOOM);
  const [selectedPin, setSelectedPin] = useState<Property | null>(null);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, offsetX: 0, offsetY: 0 });
  const mapRef = useRef<HTMLDivElement>(null);

  const mapWidth = 390;
  const mapHeight = 600;

  const pins = useMemo(() => {
    return properties.map((p) => {
      const pos = latLngToPosition(p.lat, p.lng, zoom, CENTER_LAT, CENTER_LNG, mapWidth, mapHeight);
      return { ...p, px: pos.x + panOffset.x, py: pos.y + panOffset.y };
    });
  }, [zoom, panOffset]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("[data-pin]")) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, offsetX: panOffset.x, offsetY: panOffset.y };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setPanOffset({ x: dragStart.current.offsetX + dx, y: dragStart.current.offsetY + dy });
  };

  const handlePointerUp = () => setIsDragging(false);

  const zoomIn = () => setZoom((z) => Math.min(z + 1, 18));
  const zoomOut = () => setZoom((z) => Math.max(z - 1, 10));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background"
    >
      {/* Map Area */}
      <div
        ref={mapRef}
        className="absolute inset-0 overflow-hidden cursor-grab active:cursor-grabbing"
        style={{ background: "hsl(var(--secondary))" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {/* Grid lines for visual map feel */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.06]">
          {Array.from({ length: 40 }).map((_, i) => (
            <g key={i}>
              <line x1={i * 25 + panOffset.x % 25} y1={0} x2={i * 25 + panOffset.x % 25} y2="100%" stroke="currentColor" className="text-foreground" />
              <line x1={0} y1={i * 25 + panOffset.y % 25} x2="100%" y2={i * 25 + panOffset.y % 25} stroke="currentColor" className="text-foreground" />
            </g>
          ))}
        </svg>

        {/* Road-like patterns */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.08]">
          <line
            x1={mapWidth * 0.1 + panOffset.x} y1={mapHeight * 0.3 + panOffset.y}
            x2={mapWidth * 0.9 + panOffset.x} y2={mapHeight * 0.5 + panOffset.y}
            stroke="currentColor" className="text-foreground" strokeWidth="3" strokeDasharray="8 4"
          />
          <line
            x1={mapWidth * 0.3 + panOffset.x} y1={mapHeight * 0.1 + panOffset.y}
            x2={mapWidth * 0.5 + panOffset.x} y2={mapHeight * 0.9 + panOffset.y}
            stroke="currentColor" className="text-foreground" strokeWidth="3" strokeDasharray="8 4"
          />
          <line
            x1={mapWidth * 0.05 + panOffset.x} y1={mapHeight * 0.6 + panOffset.y}
            x2={mapWidth * 0.95 + panOffset.x} y2={mapHeight * 0.7 + panOffset.y}
            stroke="currentColor" className="text-foreground" strokeWidth="2" strokeDasharray="6 6"
          />
        </svg>

        {/* Location label */}
        <div
          className="absolute text-[10px] font-semibold text-muted-foreground/40 uppercase tracking-widest"
          style={{ left: mapWidth / 2 + panOffset.x - 40, top: mapHeight / 2 + panOffset.y - 10 }}
        >
          Jeypore
        </div>

        {/* Property Pins */}
        {pins.map((p) => {
          const isSelected = selectedPin?.id === p.id;
          return (
            <motion.button
              key={p.id}
              data-pin
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: Number(p.id) * 0.03, type: "spring", stiffness: 300 }}
              onClick={() => setSelectedPin(isSelected ? null : p)}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
              style={{ left: p.px, top: p.py }}
            >
              <motion.div
                animate={isSelected ? { scale: 1.15, y: -4 } : { scale: 1, y: 0 }}
                className={`px-2.5 py-1.5 rounded-full font-bold text-xs whitespace-nowrap shadow-lg transition-colors ${
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-foreground border border-border"
                }`}
              >
                ₹{p.basePrice.toLocaleString("en-IN")}
              </motion.div>
              {/* Pin tail */}
              <div className={`w-2 h-2 rotate-45 mx-auto -mt-1 ${
                isSelected ? "bg-primary" : "bg-background border-r border-b border-border"
              }`} />
            </motion.button>
          );
        })}
      </div>

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-20">
        <div className="flex items-center justify-between px-4 pt-[max(12px,env(safe-area-inset-top))] pb-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-background/90 backdrop-blur-sm border border-border flex items-center justify-center shadow-lg"
          >
            <X size={20} className="text-foreground" />
          </motion.button>

          <div className="bg-background/90 backdrop-blur-sm border border-border rounded-full px-4 py-2 flex items-center gap-2 shadow-lg">
            <MapPin size={14} className="text-primary" />
            <span className="text-sm font-semibold text-foreground">{properties.length} places</span>
          </div>

          <div className="flex flex-col gap-1">
            <button
              onClick={zoomIn}
              className="w-10 h-10 rounded-full bg-background/90 backdrop-blur-sm border border-border flex items-center justify-center shadow-lg"
            >
              <Plus size={16} className="text-foreground" />
            </button>
            <button
              onClick={zoomOut}
              className="w-10 h-10 rounded-full bg-background/90 backdrop-blur-sm border border-border flex items-center justify-center shadow-lg"
            >
              <Minus size={16} className="text-foreground" />
            </button>
          </div>
        </div>
      </div>

      {/* My Location */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setPanOffset({ x: 0, y: 0 })}
        className="absolute bottom-32 right-4 z-20 w-12 h-12 rounded-full bg-background/90 backdrop-blur-sm border border-border flex items-center justify-center shadow-lg"
      >
        <Navigation size={18} className="text-primary" />
      </motion.button>

      {/* Selected Property Card */}
      <AnimatePresence>
        {selectedPin && (
          <motion.div
            key={selectedPin.id}
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="absolute bottom-6 left-4 right-4 z-20"
          >
            <div
              onClick={() => onPropertyTap(selectedPin)}
              className="bg-background/95 backdrop-blur-md border border-border rounded-2xl overflow-hidden shadow-xl cursor-pointer active:scale-[0.98] transition-transform"
            >
              <div className="flex gap-3 p-3">
                <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0">
                  <img src={selectedPin.images[0]} alt={selectedPin.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0 py-0.5">
                  <h3 className="text-sm font-bold text-foreground truncate">{selectedPin.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{selectedPin.description}</p>
                  <div className="flex items-center gap-1 mt-1.5">
                    <Star size={12} className="fill-primary text-primary" />
                    <span className="text-xs font-semibold text-foreground">{selectedPin.rating}</span>
                    <span className="text-xs text-muted-foreground">({selectedPin.reviewCount})</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-sm font-bold text-foreground">
                      ₹{selectedPin.basePrice.toLocaleString("en-IN")}
                      <span className="text-xs font-normal text-muted-foreground"> / slot</span>
                    </p>
                    {selectedPin.slotsLeft > 0 && selectedPin.slotsLeft <= 3 && (
                      <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        {selectedPin.slotsLeft} left
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
