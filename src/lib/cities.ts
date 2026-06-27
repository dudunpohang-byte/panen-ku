// Indonesian city/regency reference with coordinates for distance-based shipping.
// Approximate lat/lng (degrees). Source: public city data, rounded.
// Pulau Jawa lengkap + custom manual input option.

export interface City {
  id: string;
  name: string;
  province: string;
  lat: number;
  lng: number;
}

export const CITIES: City[] = [
  // ===== DKI JAKARTA =====
  { id: "jakpus", name: "Jakarta Pusat", province: "DKI Jakarta", lat: -6.1864, lng: 106.8343 },
  { id: "jakbar", name: "Jakarta Barat", province: "DKI Jakarta", lat: -6.1683, lng: 106.7583 },
  { id: "jaksel", name: "Jakarta Selatan", province: "DKI Jakarta", lat: -6.2614, lng: 106.8156 },
  { id: "jaktim", name: "Jakarta Timur", province: "DKI Jakarta", lat: -6.2115, lng: 106.8924 },
  { id: "jakut", name: "Jakarta Utara", province: "DKI Jakarta", lat: -6.1423, lng: 106.8950 },
  { id: "kepulauanseribu", name: "Kepulauan Seribu", province: "DKI Jakarta", lat: -5.7064, lng: 106.5791 },

  // ===== JAWA BARAT =====
  { id: "bandung", name: "Bandung", province: "Jawa Barat", lat: -6.9175, lng: 107.6191 },
  { id: "bandungbarat", name: "Bandung Barat", province: "Jawa Barat", lat: -6.8653, lng: 107.5090 },
  { id: "bekasi", name: "Bekasi", province: "Jawa Barat", lat: -6.2349, lng: 106.9896 },
  { id: "bekasikab", name: "Bekasi Kabupaten", province: "Jawa Barat", lat: -6.3497, lng: 107.0500 },
  { id: "bogor", name: "Bogor", province: "Jawa Barat", lat: -6.5950, lng: 106.8166 },
  { id: "bogorkab", name: "Bogor Kabupaten", province: "Jawa Barat", lat: -6.5700, lng: 106.7500 },
  { id: "cianjur", name: "Cianjur", province: "Jawa Barat", lat: -6.8443, lng: 107.1393 },
  { id: "cimahi", name: "Cimahi", province: "Jawa Barat", lat: -6.8721, lng: 107.5424 },
  { id: "cirebon", name: "Cirebon", province: "Jawa Barat", lat: -6.7320, lng: 108.5523 },
  { id: "cirebonkab", name: "Cirebon Kabupaten", province: "Jawa Barat", lat: -6.7400, lng: 108.5600 },
  { id: "depok", name: "Depok", province: "Jawa Barat", lat: -6.4025, lng: 106.7942 },
  { id: "garut", name: "Garut", province: "Jawa Barat", lat: -7.2178, lng: 107.9087 },
  { id: "indramayu", name: "Indramayu", province: "Jawa Barat", lat: -6.3373, lng: 108.3189 },
  { id: "karawang", name: "Karawang", province: "Jawa Barat", lat: -6.3228, lng: 107.3376 },
  { id: "kuningan", name: "Kuningan", province: "Jawa Barat", lat: -6.9812, lng: 108.4862 },
  { id: "majalengka", name: "Majalengka", province: "Jawa Barat", lat: -6.8341, lng: 108.2277 },
  { id: "pangandaran", name: "Pangandaran", province: "Jawa Barat", lat: -7.6820, lng: 108.6610 },
  { id: "purwakarta", name: "Purwakarta", province: "Jawa Barat", lat: -6.5562, lng: 107.4417 },
  { id: "subang", name: "Subang", province: "Jawa Barat", lat: -6.5717, lng: 107.8303 },
  { id: "sukabumi", name: "Sukabumi", province: "Jawa Barat", lat: -6.9220, lng: 106.9375 },
  { id: "sukabumikab", name: "Sukabumi Kabupaten", province: "Jawa Barat", lat: -6.9300, lng: 106.9200 },
  { id: "sumedang", name: "Sumedang", province: "Jawa Barat", lat: -6.8456, lng: 107.9167 },
  { id: "tasikmalaya", name: "Tasikmalaya", province: "Jawa Barat", lat: -7.3506, lng: 108.2172 },
  { id: "tasikmalayakab", name: "Tasikmalaya Kabupaten", province: "Jawa Barat", lat: -7.3700, lng: 108.2200 },
  { id: "banjar", name: "Banjar", province: "Jawa Barat", lat: -7.3667, lng: 108.5333 },

  // ===== JAWA TENGAH =====
  { id: "semarang", name: "Semarang", province: "Jawa Tengah", lat: -6.9667, lng: 110.4167 },
  { id: "semarangkab", name: "Semarang Kabupaten", province: "Jawa Tengah", lat: -7.1500, lng: 110.4500 },
  { id: "magelang", name: "Magelang", province: "Jawa Tengah", lat: -7.4797, lng: 110.2177 },
  { id: "magelangkab", name: "Magelang Kabupaten", province: "Jawa Tengah", lat: -7.5000, lng: 110.2000 },
  { id: "solo", name: "Surakarta (Solo)", province: "Jawa Tengah", lat: -7.5755, lng: 110.8243 },
  { id: "purwokerto", name: "Purwokerto", province: "Jawa Tengah", lat: -7.4249, lng: 109.2310 },
  { id: "tegal", name: "Tegal", province: "Jawa Tengah", lat: -6.8797, lng: 109.1256 },
  { id: "tegal kab", name: "Tegal Kabupaten", province: "Jawa Tengah", lat: -6.8700, lng: 109.1400 },
  { id: "brebes", name: "Brebes", province: "Jawa Tengah", lat: -6.8725, lng: 109.0419 },
  { id: "cilacap", name: "Cilacap", province: "Jawa Tengah", lat: -7.6280, lng: 109.0325 },
  { id: "banyumas", name: "Banyumas", province: "Jawa Tengah", lat: -7.5000, lng: 109.2000 },
  { id: "pekalongan", name: "Pekalongan", province: "Jawa Tengah", lat: -6.8850, lng: 109.6752 },
  { id: "pekalongankab", name: "Pekalongan Kabupaten", province: "Jawa Tengah", lat: -6.8900, lng: 109.6800 },
  { id: "kudus", name: "Kudus", province: "Jawa Tengah", lat: -6.8042, lng: 110.8391 },
  { id: "demak", name: "Demak", province: "Jawa Tengah", lat: -6.8947, lng: 110.6396 },
  { id: "pati", name: "Pati", province: "Jawa Tengah", lat: -6.7485, lng: 111.0404 },
  { id: "jepara", name: "Jepara", province: "Jawa Tengah", lat: -6.5892, lng: 110.6688 },
  { id: "rembang", name: "Rembang", province: "Jawa Tengah", lat: -6.7068, lng: 111.3468 },
  { id: "blora", name: "Blora", province: "Jawa Tengah", lat: -6.9698, lng: 111.4224 },
  { id: "grobogan", name: "Grobogan", province: "Jawa Tengah", lat: -7.0300, lng: 110.9200 },
  { id: "sragen", name: "Sragen", province: "Jawa Tengah", lat: -7.4267, lng: 111.0227 },
  { id: "karanganyar", name: "Karanganyar", province: "Jawa Tengah", lat: -7.5928, lng: 110.9500 },
  { id: "wonogiri", name: "Wonogiri", province: "Jawa Tengah", lat: -7.8266, lng: 110.9199 },
  { id: "sukoharjo", name: "Sukoharjo", province: "Jawa Tengah", lat: -7.5974, lng: 110.8315 },
  { id: "klaten", name: "Klaten", province: "Jawa Tengah", lat: -7.7065, lng: 110.6082 },
  { id: "boyolali", name: "Boyolali", province: "Jawa Tengah", lat: -7.5292, lng: 110.6000 },
  { id: "salatiga", name: "Salatiga", province: "Jawa Tengah", lat: -7.3309, lng: 110.5083 },
  { id: "kendal", name: "Kendal", province: "Jawa Tengah", lat: -6.9728, lng: 110.1405 },
  { id: "batang", name: "Batang", province: "Jawa Tengah", lat: -6.9080, lng: 109.7500 },
  { id: "pemalang", name: "Pemalang", province: "Jawa Tengah", lat: -6.8940, lng: 109.3852 },
  { id: "wonosobo", name: "Wonosobo", province: "Jawa Tengah", lat: -7.3657, lng: 109.8925 },
  { id: "temanggung", name: "Temanggung", province: "Jawa Tengah", lat: -7.3226, lng: 110.1766 },
  { id: "banjarnegara", name: "Banjarnegara", province: "Jawa Tengah", lat: -7.3650, lng: 109.6787 },
  { id: "purbalingga", name: "Purbalingga", province: "Jawa Tengah", lat: -7.3897, lng: 109.3633 },
  { id: "kebumen", name: "Kebumen", province: "Jawa Tengah", lat: -7.6750, lng: 109.6590 },

  // ===== DI YOGYAKARTA =====
  { id: "yogya", name: "Yogyakarta", province: "DI Yogyakarta", lat: -7.7956, lng: 110.3695 },
  { id: "sleman", name: "Sleman", province: "DI Yogyakarta", lat: -7.7142, lng: 110.4040 },
  { id: "bantul", name: "Bantul", province: "DI Yogyakarta", lat: -7.9015, lng: 110.3652 },
  { id: "gunungkidul", name: "Gunungkidul", province: "DI Yogyakarta", lat: -7.9755, lng: 110.5880 },
  { id: "kulonprogo", name: "Kulonprogo", province: "DI Yogyakarta", lat: -7.8291, lng: 110.1625 },

  // ===== JAWA TIMUR =====
  { id: "surabaya", name: "Surabaya", province: "Jawa Timur", lat: -7.2575, lng: 112.7521 },
  { id: "malang", name: "Malang", province: "Jawa Timur", lat: -7.9666, lng: 112.6326 },
  { id: "malangkab", name: "Malang Kabupaten", province: "Jawa Timur", lat: -8.0300, lng: 112.6300 },
  { id: "batu", name: "Batu", province: "Jawa Timur", lat: -7.8706, lng: 112.5240 },
  { id: "kediri", name: "Kediri", province: "Jawa Timur", lat: -7.8167, lng: 112.0167 },
  { id: "kedirikab", name: "Kediri Kabupaten", province: "Jawa Timur", lat: -7.8200, lng: 112.0200 },
  { id: "blitar", name: "Blitar", province: "Jawa Timur", lat: -8.1000, lng: 112.1500 },
  { id: "blitarkab", name: "Blitar Kabupaten", province: "Jawa Timur", lat: -8.1200, lng: 112.1600 },
  { id: "probolinggo", name: "Probolinggo", province: "Jawa Timur", lat: -7.7500, lng: 113.2167 },
  { id: "probolinggokab", name: "Probolinggo Kabupaten", province: "Jawa Timur", lat: -7.7700, lng: 113.2200 },
  { id: "pasuruan", name: "Pasuruan", province: "Jawa Timur", lat: -7.6458, lng: 112.9075 },
  { id: "pasuruankab", name: "Pasuruan Kabupaten", province: "Jawa Timur", lat: -7.6600, lng: 112.9100 },
  { id: "mojokerto", name: "Mojokerto", province: "Jawa Timur", lat: -7.4706, lng: 112.4339 },
  { id: "mojokertokab", name: "Mojokerto Kabupaten", province: "Jawa Timur", lat: -7.4800, lng: 112.4400 },
  { id: "madiun", name: "Madiun", province: "Jawa Timur", lat: -7.6294, lng: 111.5267 },
  { id: "madiunkab", name: "Madiun Kabupaten", province: "Jawa Timur", lat: -7.6400, lng: 111.5300 },
  { id: "nganjuk", name: "Nganjuk", province: "Jawa Timur", lat: -7.6028, lng: 111.9019 },
  { id: "jombang", name: "Jombang", province: "Jawa Timur", lat: -7.5576, lng: 112.2331 },
  { id: "lamongan", name: "Lamongan", province: "Jawa Timur", lat: -7.1167, lng: 112.4167 },
  { id: "gresik", name: "Gresik", province: "Jawa Timur", lat: -7.1565, lng: 112.6562 },
  { id: "sidoarjo", name: "Sidoarjo", province: "Jawa Timur", lat: -7.4490, lng: 112.7185 },
  { id: "tuban", name: "Tuban", province: "Jawa Timur", lat: -6.8944, lng: 112.0146 },
  { id: "bojonegoro", name: "Bojonegoro", province: "Jawa Timur", lat: -7.1534, lng: 111.8866 },
  { id: "ngawi", name: "Ngawi", province: "Jawa Timur", lat: -7.4048, lng: 111.4399 },
  { id: "ponorogo", name: "Ponorogo", province: "Jawa Timur", lat: -7.8745, lng: 111.4806 },
  { id: "trenggalek", name: "Trenggalek", province: "Jawa Timur", lat: -8.0514, lng: 111.7149 },
  { id: "tulungagung", name: "Tulungagung", province: "Jawa Timur", lat: -8.0700, lng: 111.9000 },
  { id: "lumajang", name: "Lumajang", province: "Jawa Timur", lat: -8.1336, lng: 113.2249 },
  { id: "jember", name: "Jember", province: "Jawa Timur", lat: -8.1720, lng: 113.6926 },
  { id: "bondowoso", name: "Bondowoso", province: "Jawa Timur", lat: -7.9151, lng: 113.8272 },
  { id: "situbondo", name: "Situbondo", province: "Jawa Timur", lat: -7.7074, lng: 114.0076 },
  { id: "banyuwangi", name: "Banyuwangi", province: "Jawa Timur", lat: -8.2150, lng: 114.3668 },
  { id: "bangil", name: "Bangil (Pasuruan)", province: "Jawa Timur", lat: -7.6000, lng: 112.8172 },
  { id: "pamekasan", name: "Pamekasan", province: "Jawa Timur (Madura)", lat: -7.1568, lng: 113.4756 },
  { id: "sampang", name: "Sampang", province: "Jawa Timur (Madura)", lat: -7.1838, lng: 113.2445 },
  { id: "bangkalan", name: "Bangkalan", province: "Jawa Timur (Madura)", lat: -7.0224, lng: 112.7372 },
  { id: "sumenep", name: "Sumenep", province: "Jawa Timur (Madura)", lat: -7.0033, lng: 113.8472 },

  // ===== BANTEN =====
  { id: "tangerang", name: "Tangerang", province: "Banten", lat: -6.1781, lng: 106.6300 },
  { id: "tangerangkab", name: "Tangerang Kabupaten", province: "Banten", lat: -6.1900, lng: 106.6100 },
  { id: "tangerangselatan", name: "Tangerang Selatan", province: "Banten", lat: -6.2895, lng: 106.7179 },
  { id: "cilegon", name: "Cilegon", province: "Banten", lat: -6.0030, lng: 106.0068 },
  { id: "serang", name: "Serang", province: "Banten", lat: -6.1170, lng: 106.1502 },
  { id: "serangkab", name: "Serang Kabupaten", province: "Banten", lat: -6.1200, lng: 106.1500 },
  { id: "pandeglang", name: "Pandeglang", province: "Banten", lat: -6.3092, lng: 106.1000 },
  { id: "lebak", name: "Lebak (Rangkasbitung)", province: "Banten", lat: -6.3596, lng: 106.2507 },
  { id: "anyer", name: "Anyer", province: "Banten", lat: -6.0736, lng: 105.8868 },
  { id: "carita", name: "Carita", province: "Banten", lat: -6.2914, lng: 105.8555 },
];

// Custom city untuk input manual
export const CUSTOM_CITY: City = {
  id: "custom",
  name: "Lainnya (Ketik Manual)",
  province: "Lainnya",
  lat: -7.5000,
  lng: 110.0000,
};

export function getCity(id: string | undefined): City | undefined {
  if (!id) return undefined;
  if (id === "custom") return CUSTOM_CITY;
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

// Helper: filter hanya kota di Pulau Jawa
export function getJavaCities(): City[] {
  return CITIES.filter((c) => {
    const jawa = ["DKI Jakarta", "Jawa Barat", "Jawa Tengah", "Jawa Timur", "DI Yogyakarta", "Banten"];
    const madura = c.province.includes("Madura");
    return jawa.includes(c.province) || madura;
  });
}

// Helper: groupBy provinsi
export function groupCitiesByProvince(cities: City[]): Record<string, City[]> {
  const groups: Record<string, City[]> = {};
  for (const c of cities) {
    if (!groups[c.province]) groups[c.province] = [];
    groups[c.province].push(c);
  }
  return groups;
}