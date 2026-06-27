// Indonesian city/regency reference with coordinates for distance-based shipping.
// Approximate lat/lng (degrees). Source: public city data, rounded.

export interface City {
  id: string;
  name: string;
  province: string;
  lat: number;
  lng: number;
}

export const CITIES: City[] = [
  { id: "jakarta", name: "Jakarta Pusat", province: "DKI Jakarta", lat: -6.1864, lng: 106.8343 },
  { id: "depok", name: "Depok", province: "Jawa Barat", lat: -6.4025, lng: 106.7942 },
  { id: "bekasi", name: "Bekasi", province: "Jawa Barat", lat: -6.2349, lng: 106.9896 },
  { id: "tangerang", name: "Tangerang", province: "Banten", lat: -6.1781, lng: 106.6300 },
  { id: "bogor", name: "Bogor", province: "Jawa Barat", lat: -6.5950, lng: 106.8166 },
  { id: "bandung", name: "Bandung", province: "Jawa Barat", lat: -6.9175, lng: 107.6191 },
  { id: "cimahi", name: "Cimahi", province: "Jawa Barat", lat: -6.8721, lng: 107.5424 },
  { id: "garut", name: "Garut", province: "Jawa Barat", lat: -7.2178, lng: 107.9087 },
  { id: "tasikmalaya", name: "Tasikmalaya", province: "Jawa Barat", lat: -7.3506, lng: 108.2172 },
  { id: "cirebon", name: "Cirebon", province: "Jawa Barat", lat: -6.7320, lng: 108.5523 },
  { id: "semarang", name: "Semarang", province: "Jawa Tengah", lat: -6.9667, lng: 110.4167 },
  { id: "magelang", name: "Magelang", province: "Jawa Tengah", lat: -7.4797, lng: 110.2177 },
  { id: "yogya", name: "Yogyakarta", province: "DI Yogyakarta", lat: -7.7956, lng: 110.3695 },
  { id: "solo", name: "Surakarta (Solo)", province: "Jawa Tengah", lat: -7.5755, lng: 110.8243 },
  { id: "purwokerto", name: "Purwokerto", province: "Jawa Tengah", lat: -7.4249, lng: 109.2310 },
  { id: "surabaya", name: "Surabaya", province: "Jawa Timur", lat: -7.2575, lng: 112.7521 },
  { id: "malang", name: "Malang", province: "Jawa Timur", lat: -7.9666, lng: 112.6326 },
  { id: "kediri", name: "Kediri", province: "Jawa Timur", lat: -7.8167, lng: 112.0167 },
  { id: "denpasar", name: "Denpasar", province: "Bali", lat: -8.6705, lng: 115.2126 },
  { id: "medan", name: "Medan", province: "Sumatera Utara", lat: 3.5952, lng: 98.6722 },
  { id: "padang", name: "Padang", province: "Sumatera Barat", lat: -0.9492, lng: 100.3543 },
  { id: "palembang", name: "Palembang", province: "Sumatera Selatan", lat: -2.9909, lng: 104.7565 },
  { id: "lampung", name: "Bandar Lampung", province: "Lampung", lat: -5.4296, lng: 105.2610 },
  { id: "pontianak", name: "Pontianak", province: "Kalimantan Barat", lat: -0.0263, lng: 109.3425 },
  { id: "balikpapan", name: "Balikpapan", province: "Kalimantan Timur", lat: -1.2654, lng: 116.8312 },
  { id: "samarinda", name: "Samarinda", province: "Kalimantan Timur", lat: -0.5022, lng: 117.1536 },
  { id: "makassar", name: "Makassar", province: "Sulawesi Selatan", lat: -5.1477, lng: 119.4327 },
  { id: "manado", name: "Manado", province: "Sulawesi Utara", lat: 1.4748, lng: 124.8421 },
];

export function getCity(id: string | undefined): City | undefined {
  if (!id) return undefined;
  return CITIES.find((c) => c.id === id);
}

// Haversine distance between two coords in km.
export function distanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)));
}
