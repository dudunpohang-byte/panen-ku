// Gamification — Points, Badges, Levels for Farmers

const KEY = "panenku.gamification";

export interface FarmerGamification {
  farmerId: string;
  points: number;
  level: number;
  totalOrders: number;
  totalRevenue: number;
  totalProductsSold: number;
  badges: Badge[];
  recentActivity: Activity[];
}

export type BadgeType =
  | "first_sale"
  | "ten_sales"
  | "fifty_sales"
  | "hundred_sales"
  | "top_product"
  | "fast_shipping"
  | "high_rating"
  | "longevity"
  | "variety";

export interface Badge {
  type: BadgeType;
  name: string;
  icon: string;
  unlockedAt: string;
  description: string;
}

export interface Activity {
  date: string;
  description: string;
  points: number;
}

const BADGE_DEFINITIONS: Record<BadgeType, { name: string; icon: string; description: string; points: number }> = {
  first_sale: { name: "Pertama Terjual", icon: "🌱", description: "Berhasil menjual produk pertama", points: 100 },
  ten_sales: { name: "Pelari Cepat", icon: "🏃", description: "Berhasil 10 penjualan", points: 500 },
  fifty_sales: { name: "Petani Handal", icon: "🌾", description: "Berhasil 50 penjualan", points: 2000 },
  hundred_sales: { name: "Panen Raya", icon: "🎉", description: "Berhasil 100 penjualan", points: 5000 },
  top_product: { name: "Produk Unggulan", icon: "🏆", description: "Salah satu produk masuk 10 terlaris", points: 1000 },
  fast_shipping: { name: "Super Cepat", icon: "⚡", description: "Rata-rata pengiriman < 1 jam", points: 300 },
  high_rating: { name: "Terpercaya", icon: "⭐", description: "Rating rata-rata ≥ 4.5", points: 1500 },
  longevity: { name: "Veteran", icon: "⏳", description: "Aktif lebih dari 6 bulan", points: 2000 },
  variety: { name: "Kolektor", icon: "📦", description: "Punya 5+ kategori produk berbeda", points: 1000 },
};

const LEVEL_THRESHOLDS = [
  { level: 1, points: 0, title: "Petani Pemula" },
  { level: 2, points: 1000, title: "Petani Aktif" },
  { level: 3, points: 3000, title: "Petani Berbakat" },
  { level: 4, points: 6000, title: "Petani Andal" },
  { level: 5, points: 10000, title: "Petani Ahli" },
  { level: 6, points: 15000, title: "Petani Master" },
  { level: 7, points: 25000, title: "Petani Legenda" },
  { level: 8, points: 40000, title: "Petani Sejati" },
  { level: 9, points: 60000, title: "Petani Agung" },
  { level: 10, points: 100000, title: "Petani Panenku" },
];

export function getLevelTitle(level: number): string {
  const threshold = LEVEL_THRESHOLDS.find((t) => t.level === level);
  return threshold?.title ?? `Level ${level}`;
}

export function getNextLevelPoints(level: number): number {
  const next = LEVEL_THRESHOLDS.find((t) => t.level === level + 1);
  return next?.points ?? Infinity;
}

export function getLevelFromPoints(points: number): number {
  let level = 1;
  for (const t of LEVEL_THRESHOLDS) {
    if (points >= t.points) level = t.level;
  }
  return level;
}

function readGamification(farmerId: string): FarmerGamification {
  if (typeof window === "undefined") {
    return { farmerId, points: 0, level: 1, totalOrders: 0, totalRevenue: 0, totalProductsSold: 0, badges: [], recentActivity: [] };
  }
  try {
    const raw = localStorage.getItem(KEY);
    const all = raw ? (JSON.parse(raw) as Record<string, FarmerGamification>) : {};
    return all[farmerId] ?? { farmerId, points: 0, level: 1, totalOrders: 0, totalRevenue: 0, totalProductsSold: 0, badges: [], recentActivity: [] };
  } catch {
    return { farmerId, points: 0, level: 1, totalOrders: 0, totalRevenue: 0, totalProductsSold: 0, badges: [], recentActivity: [] };
  }
}

function writeGamification(farmerId: string, data: FarmerGamification) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(KEY);
    const all = raw ? (JSON.parse(raw) as Record<string, FarmerGamification>) : {};
    all[farmerId] = data;
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {}
}

export function getFarmerGamification(farmerId: string): FarmerGamification {
  return readGamification(farmerId);
}

export function addPoints(farmerId: string, points: number, description: string): FarmerGamification {
  const data = readGamification(farmerId);
  data.points += points;
  data.level = getLevelFromPoints(data.points);
  data.recentActivity.unshift({
    date: new Date().toISOString(),
    description,
    points,
  });
  // Keep only last 50 activities
  if (data.recentActivity.length > 50) {
    data.recentActivity = data.recentActivity.slice(0, 50);
  }
  writeGamification(farmerId, data);
  return data;
}

export function awardBadge(farmerId: string, badgeType: BadgeType): Badge | null {
  const data = readGamification(farmerId);
  if (data.badges.some((b) => b.type === badgeType)) return null; // Already has badge

  const def = BADGE_DEFINITIONS[badgeType];
  const badge: Badge = {
    type: badgeType,
    name: def.name,
    icon: def.icon,
    unlockedAt: new Date().toISOString(),
    description: def.description,
  };

  data.badges.push(badge);
  data.points += def.points;
  data.level = getLevelFromPoints(data.points);

  data.recentActivity.unshift({
    date: new Date().toISOString(),
    description: `🏅 Badge: ${def.icon} ${def.name} (${def.points} poin)`,
    points: def.points,
  });

  writeGamification(farmerId, data);
  return badge;
}

export function checkForNewBadges(farmerId: string, stats: {
  totalOrders: number;
  totalProductsSold: number;
  totalProducts: number;
  productCategories: string[];
  averageRating: number;
  averageShippingTime: number;
  accountAgeMonths: number;
}): Badge[] {
  const data = readGamification(farmerId);
  const newBadges: Badge[] = [];

  // First sale
  if (stats.totalOrders >= 1 && !data.badges.some((b) => b.type === "first_sale")) {
    const b = awardBadge(farmerId, "first_sale");
    if (b) newBadges.push(b);
  }

  // Ten sales
  if (stats.totalOrders >= 10 && !data.badges.some((b) => b.type === "ten_sales")) {
    const b = awardBadge(farmerId, "ten_sales");
    if (b) newBadges.push(b);
  }

  // Fifty sales
  if (stats.totalOrders >= 50 && !data.badges.some((b) => b.type === "fifty_sales")) {
    const b = awardBadge(farmerId, "fifty_sales");
    if (b) newBadges.push(b);
  }

  // Hundred sales
  if (stats.totalOrders >= 100 && !data.badges.some((b) => b.type === "hundred_sales")) {
    const b = awardBadge(farmerId, "hundred_sales");
    if (b) newBadges.push(b);
  }

  // Top product (5+ categories)
  if (stats.productCategories.length >= 5 && !data.badges.some((b) => b.type === "variety")) {
    const b = awardBadge(farmerId, "variety");
    if (b) newBadges.push(b);
  }

  // High rating
  if (stats.averageRating >= 4.5 && !data.badges.some((b) => b.type === "high_rating")) {
    const b = awardBadge(farmerId, "high_rating");
    if (b) newBadges.push(b);
  }

  // Fast shipping
  if (stats.averageShippingTime < 60 && !data.badges.some((b) => b.type === "fast_shipping")) {
    const b = awardBadge(farmerId, "fast_shipping");
    if (b) newBadges.push(b);
  }

  // Longevity
  if (stats.accountAgeMonths >= 6 && !data.badges.some((b) => b.type === "longevity")) {
    const b = awardBadge(farmerId, "longevity");
    if (b) newBadges.push(b);
  }

  return newBadges;
}

export function getAllBadges(): { type: BadgeType; name: string; icon: string; description: string; points: number }[] {
  return Object.entries(BADGE_DEFINITIONS).map(([type, def]) => ({
    type: type as BadgeType,
    ...def,
  }));
}

// Activity helpers
export function logActivity(farmerId: string, description: string, points: number = 0) {
  if (points > 0) {
    addPoints(farmerId, points, description);
  } else {
    const data = readGamification(farmerId);
    data.recentActivity.unshift({
      date: new Date().toISOString(),
      description,
      points: 0,
    });
    if (data.recentActivity.length > 50) {
      data.recentActivity = data.recentActivity.slice(0, 50);
    }
    writeGamification(farmerId, data);
  }
}