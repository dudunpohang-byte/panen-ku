// Review & Rating — localStorage only

const KEY = "panenku.reviews";

export type Review = {
  id: string;
  orderId: string;
  buyerId: string;
  buyerName: string;
  farmerId: string;
  productId: string;
  productName: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
};

export function getReviews(): Review[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Review[]) : [];
  } catch {
    return [];
  }
}

export function addReview(review: Omit<Review, "id" | "createdAt">): Review {
  const all = getReviews();
  const newReview: Review = {
    ...review,
    id: `rev_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    createdAt: new Date().toISOString(),
  };
  all.push(newReview);
  localStorage.setItem(KEY, JSON.stringify(all));
  return newReview;
}

export function getReviewsByFarmer(farmerId: string): Review[] {
  return getReviews().filter((r) => r.farmerId === farmerId);
}

export function getReviewsByProduct(productId: string): Review[] {
  return getReviews().filter((r) => r.productId === productId);
}

export function getAverageRating(farmerId: string): { avg: number; count: number } {
  const reviews = getReviewsByFarmer(farmerId);
  if (reviews.length === 0) return { avg: 0, count: 0 };
  const sum = reviews.reduce((a, r) => a + r.rating, 0);
  return { avg: Math.round((sum / reviews.length) * 10) / 10, count: reviews.length };
}