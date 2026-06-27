// Favorites / Wishlist — localStorage only, per buyer

const KEY = "panenku.favorites";

export type FavoriteItem = {
  productId: string;
  addedAt: string;
};

export function getFavorites(buyerId: string): FavoriteItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const all: Record<string, FavoriteItem[]> = JSON.parse(raw);
    return all[buyerId] ?? [];
  } catch {
    return [];
  }
}

export function addFavorite(buyerId: string, productId: string) {
  const all = (() => {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as Record<string, FavoriteItem[]>) : {};
    } catch {
      return {};
    }
  })();
  const list = all[buyerId] ?? [];
  if (!list.find((f) => f.productId === productId)) {
    list.push({ productId, addedAt: new Date().toISOString() });
  }
  all[buyerId] = list;
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function removeFavorite(buyerId: string, productId: string) {
  const all = (() => {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as Record<string, FavoriteItem[]>) : {};
    } catch {
      return {};
    }
  })();
  const list = (all[buyerId] ?? []).filter((f) => f.productId !== productId);
  all[buyerId] = list;
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function isFavorite(buyerId: string, productId: string): boolean {
  const favs = getFavorites(buyerId);
  return favs.some((f) => f.productId === productId);
}