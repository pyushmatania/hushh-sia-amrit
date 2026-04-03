import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Star } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import type { Property } from "@/data/properties";

export default function PropertyLocationMap({ property }: { property: Property }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const routeRef = useRef<L.Polyline | null>(null);
  const [routeInfo, setRouteInfo] = useState<{ km: string; mins: number } | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);

  const propLat = property.lat ?? 18.856;
  const propLng = property.lng ?? 82.572;

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [propLat, propLng],
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
      dragging: true,
      scrollWheelZoom: false,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 20,
      subdomains: "abcd",
      attribution: '&copy; <a href="https://carto.com/">CartoDB</a>',
    }).addTo(map);

    const photoHtml = `
      <div style="position:relative;">
        <div style="width:48px;height:48px;border-radius:50%;border:3px solid hsl(270,80%,65%);overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.3);">
          <img src="${property.images[0] || ""}" style="width:100%;height:100%;object-fit:cover;" />
        </div>
        <div style="position:absolute;bottom:-6px;left:50%;transform:translateX(-50%) rotate(45deg);width:12px;height:12px;background:hsl(270,80%,65%);border-radius:2px;"></div>
        <div style="position:absolute;top:-8px;left:50%;transform:translateX(-50%);background:hsl(270,80%,65%);color:#fff;font-size:10px;font-weight:700;padding:2px 8px;border-radius:12px;white-space:nowrap;">
          ₹${property.basePrice.toLocaleString()}
        </div>
      </div>
    `;

    const icon = L.divIcon({
      html: photoHtml,
      className: "custom-photo-marker",
      iconSize: [48, 60],
      iconAnchor: [24, 60],
    });

    L.marker([propLat, propLng], { icon }).addTo(map);
    mapInstanceRef.current = map;
    fetchRoute(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRoute = async (map: L.Map) => {
    setRouteLoading(true);
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000 })
      );
      const userLat = pos.coords.latitude;
      const userLng = pos.coords.longitude;

      const userIcon = L.divIcon({
        html: `<div style="width:14px;height:14px;background:hsl(270,80%,65%);border:3px solid white;border-radius:50%;box-shadow:0 0 10px hsl(270,80%,65%,0.5);"></div>`,
        className: "custom-photo-marker",
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });
      L.marker([userLat, userLng], { icon: userIcon }).addTo(map);

      const url = `https://router.project-osrm.org/route/v1/driving/${userLng},${userLat};${propLng},${propLat}?overview=full&geometries=geojson`;
      const resp = await fetch(url);
      const data = await resp.json();

      if (data.routes?.[0]) {
        const coords = data.routes[0].geometry.coordinates.map((c: number[]) => [c[1], c[0]] as [number, number]);
        routeRef.current = L.polyline(coords, {
          color: "hsl(270, 80%, 65%)",
          weight: 5,
          opacity: 0.85,
          lineCap: "round",
          lineJoin: "round",
          dashArray: "10, 6",
        }).addTo(map);

        map.fitBounds(routeRef.current.getBounds(), { padding: [40, 40], maxZoom: 14, animate: true });

        const km = (data.routes[0].distance / 1000).toFixed(1);
        const mins = Math.ceil(data.routes[0].duration / 60);
        setRouteInfo({ km, mins });
      }
    } catch {
      // Location denied
    } finally {
      setRouteLoading(false);
    }
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border-2 border-primary/20 glow-border-radiate mb-3">
      <div ref={mapRef} className="w-full aspect-[16/9] z-0" />

      <div className="absolute inset-0 pointer-events-none z-[400]" style={{
        background: "linear-gradient(180deg, hsl(var(--background) / 0.08) 0%, transparent 20%, transparent 70%, hsl(var(--background) / 0.25) 100%)",
      }} />
      <div className="absolute inset-0 pointer-events-none z-[400]" style={{
        boxShadow: "inset 0 0 30px hsl(var(--background) / 0.2)",
      }} />

      {routeInfo && (
        <div className="absolute top-3 right-3 z-[500] glass rounded-full px-3 py-1.5 flex items-center gap-2 pointer-events-none">
          <span className="text-[10px] font-bold text-primary">{routeInfo.km} km</span>
          <span className="text-[9px] text-muted-foreground">·</span>
          <span className="text-[10px] font-medium text-foreground">{routeInfo.mins} min</span>
        </div>
      )}

      {routeLoading && (
        <div className="absolute top-3 right-3 z-[500] glass rounded-full px-3 py-1.5 pointer-events-none">
          <span className="text-[10px] text-muted-foreground animate-pulse">Finding route...</span>
        </div>
      )}

      <div className="relative z-[500] bg-card/90 backdrop-blur-sm px-4 py-3 flex items-center gap-3 border-t border-border">
        <div className="w-10 h-10 rounded-xl overflow-hidden border border-border shrink-0">
          <img src={property.images[0]} alt={property.name} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{property.name}</p>
          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
            <MapPin size={10} /> {property.location}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Star size={12} className="text-gold fill-gold" />
          <span className="text-xs font-semibold text-foreground">{property.rating}</span>
        </div>
      </div>
    </div>
  );
}
