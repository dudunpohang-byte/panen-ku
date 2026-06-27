// Map Integration — Leaflet/OSM for farmer location
// Usage: <FarmMap cityId="magelang" farmName="Kebun Sumber Rejeki" />

import { useEffect, useRef, useState } from "react";
import { CITIES, getCity } from "@/lib/cities";
import { MapPin, Navigation } from "lucide-react";

interface FarmMapProps {
  cityId?: string;
  farmName?: string;
  farmLocation?: string;
  className?: string;
}

// City coordinates for Indonesia
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  magelang: { lat: -7.4797, lng: 110.2177 },
  semarang: { lat: -6.9667, lng: 110.4167 },
  bandung: { lat: -6.9147, lng: 107.6098 },
  jakarta: { lat: -6.2088, lng: 106.8456 },
  yogya: { lat: -7.7956, lng: 110.3695 },
  solo: { lat: -7.5667, lng: 110.8333 },
  malang: { lat: -7.9797, lng: 112.6304 },
  surabaya: { lat: -7.2504, lng: 112.7688 },
  bogor: { lat: -6.5971, lng: 106.8060 },
  bekasi: { lat: -6.2349, lng: 106.9896 },
  depok: { lat: -6.4025, lng: 106.7942 },
  tangerang: { lat: -6.1781, lng: 106.6300 },
  garut: { lat: -7.2106, lng: 107.8965 },
  lampung: { lat: -5.4298, lng: 105.2628 },
  medan: { lat: 3.5952, lng: 98.6722 },
  denpasar: { lat: -8.6500, lng: 115.2167 },
  kediri: { lat: -7.8169, lng: 112.0115 },
  cirebon: { lat: -6.7150, lng: 108.5570 },
  purwokerto: { lat: -7.4277, lng: 109.2430 },
  sukamara: { lat: -2.5800, lng: 111.4000 },
};

export function FarmMap({ cityId, farmName, farmLocation, className = "" }: FarmMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  const coords = cityId ? CITY_COORDS[cityId] : null;
  const city = cityId ? getCity(cityId) : null;

  // Static fallback: show info without actual map
  if (!coords) {
    return (
      <div className={`flex items-center gap-3 rounded-xl bg-muted p-4 ${className}`}>
        <MapPin className="h-8 w-8 shrink-0 text-primary" />
        <div>
          <p className="font-semibold">{farmName || "Lokasi Petani"}</p>
          <p className="text-sm text-muted-foreground">{farmLocation || city || "Indonesia"}</p>
        </div>
      </div>
    );
  }

  const googleMapsUrl = `https://www.google.com/maps?q=${coords.lat},${coords.lng}`;
  const openStreetMapUrl = `https://www.openstreetmap.org/?mlat=${coords.lat}&mlon=${coords.lng}#map=12/${coords.lat}/${coords.lng}`;

  return (
    <div className={`rounded-xl overflow-hidden border border-border ${className}`}>
      {/* Map placeholder */}
      <div
        ref={mapRef}
        className="h-48 w-full bg-gradient-to-br from-green-100 to-green-50 flex flex-col items-center justify-center relative"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMxNWEzNGEiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        
        <MapPin className="h-12 w-12 text-primary mb-2 relative z-10" />
        <p className="font-bold text-lg relative z-10">{farmName || "Lokasi Petani"}</p>
        <p className="text-sm text-muted-foreground relative z-10">{farmLocation || city}</p>
        
        <div className="mt-3 flex gap-2 relative z-10">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
          >
            <Navigation className="h-3 w-3" />
            Buka Google Maps
          </a>
          <a
            href={openStreetMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 rounded-lg bg-card px-3 py-2 text-xs font-semibold border"
          >
            <MapPin className="h-3 w-3" />
            OpenStreetMap
          </a>
        </div>
      </div>

      {/* Coordinates badge */}
      <div className="flex items-center justify-between bg-card px-4 py-2 text-xs text-muted-foreground">
        <span>{coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}</span>
        <span className="font-mono">{city || cityId}</span>
      </div>
    </div>
  );
}

export function calculateDistance(
  fromCityId?: string,
  toCityId?: string,
): number | null {
  const from = fromCityId ? CITY_COORDS[fromCityId] : null;
  const to = toCityId ? CITY_COORDS[toCityId] : null;
  if (!from || !to) return null;

  // Haversine formula
  const R = 6371; // km
  const dLat = ((to.lat - from.lat) * Math.PI) / 180;
  const dLng = ((to.lng - from.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((from.lat * Math.PI) / 180) *
      Math.cos((to.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}