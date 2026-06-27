// Analytics Dashboard — Sales statistics for farmers

import { getOrders, getProducts, getUsers, type Order, type Product } from "./store";

export interface FarmerSalesStats {
  totalOrders: number;
  totalRevenue: number;
  totalItemsSold: number;
  pendingBalance: number;
  currentBalance: number;
  averageOrderValue: number;
  totalProducts: number;
  totalStock: number;
  topProducts: { name: string; sold: number; revenue: number }[];
  monthlySales: { month: string; revenue: number; orders: number }[];
  dailySales: { date: string; revenue: number; orders: number }[];
  popularCategory: string;
  conversionRate: number; // displayed / sold ratio
}

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

export function getFarmerAnalytics(farmerId: string): FarmerSalesStats {
  const orders = getOrders().filter((o) => o.items.some((it) => it.farmerId === farmerId));
  const products = getProducts().filter((p) => p.farmerId === farmerId);
  const user = getUsers().find((u) => u.id === farmerId);

  const completedOrders = orders.filter((o) => o.status === "selesai" || o.status === "dikirim");
  const totalRevenue = completedOrders.reduce((sum, o) => {
    return sum + o.items
      .filter((it) => it.farmerId === farmerId)
      .reduce((s, it) => s + it.price * it.qty, 0);
  }, 0);

  const totalItemsSold = completedOrders.reduce((sum, o) => {
    return sum + o.items
      .filter((it) => it.farmerId === farmerId)
      .reduce((s, it) => s + it.qty, 0);
  }, 0);

  // Top products
  const productSales = new Map<string, { sold: number; revenue: number }>();
  for (const o of completedOrders) {
    for (const it of o.items) {
      if (it.farmerId !== farmerId) continue;
      const existing = productSales.get(it.productId) ?? { sold: 0, revenue: 0 };
      existing.sold += it.qty;
      existing.revenue += it.price * it.qty;
      productSales.set(it.productId, existing);
    }
  }

  const topProducts = products
    .map((p) => ({
      name: p.name,
      sold: productSales.get(p.id)?.sold ?? 0,
      revenue: productSales.get(p.id)?.revenue ?? 0,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  // Monthly sales
  const monthlyMap = new Map<string, { revenue: number; orders: number }>();
  for (const o of completedOrders) {
    const d = new Date(o.createdAt);
    const key = `${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
    const existing = monthlyMap.get(key) ?? { revenue: 0, orders: 0 };
    existing.revenue += o.items
      .filter((it) => it.farmerId === farmerId)
      .reduce((s, it) => s + it.price * it.qty, 0);
    existing.orders += 1;
    monthlyMap.set(key, existing);
  }

  const monthlySales = Array.from(monthlyMap.entries())
    .map(([month, data]) => ({ month, ...data }))
    .sort((a, b) => {
      const ma = MONTHS_SHORT.indexOf(a.month.split(" ")[0]);
      const mb = MONTHS_SHORT.indexOf(b.month.split(" ")[0]);
      const ya = parseInt(a.month.split(" ")[1]);
      const yb = parseInt(b.month.split(" ")[1]);
      return ya !== yb ? ya - yb : ma - mb;
    });

  // Daily sales (last 14 days)
  const dailyMap = new Map<string, { revenue: number; orders: number }>();
  const now = new Date();
  for (let i = 0; i < 14; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    dailyMap.set(key, { revenue: 0, orders: 0 });
  }
  for (const o of completedOrders) {
    const key = o.createdAt.slice(0, 10);
    if (dailyMap.has(key)) {
      const existing = dailyMap.get(key)!;
      existing.revenue += o.items
        .filter((it) => it.farmerId === farmerId)
        .reduce((s, it) => s + it.price * it.qty, 0);
      existing.orders += 1;
    }
  }

  const dailySales = Array.from(dailyMap.entries())
    .map(([date, data]) => ({ date: date.slice(5), ...data }))
    .reverse();

  // Popular category
  const catCount = new Map<string, number>();
  for (const o of completedOrders) {
    for (const it of o.items) {
      if (it.farmerId !== farmerId) continue;
      const product = products.find((p) => p.id === it.productId);
      if (product) {
        catCount.set(product.category, (catCount.get(product.category) ?? 0) + it.qty);
      }
    }
  }
  const popularCategory = Array.from(catCount.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([cat]) => cat)[0] ?? "N/A";

  const totalDisplayed = products.reduce((s, p) => s + p.sold, 0);
  const conversionRate = totalDisplayed > 0
    ? Math.round((totalItemsSold / totalDisplayed) * 100)
    : 0;

  return {
    totalOrders: orders.length,
    totalRevenue,
    totalItemsSold,
    pendingBalance: user?.pendingBalance ?? 0,
    currentBalance: user?.balance ?? 0,
    averageOrderValue: completedOrders.length > 0 ? Math.round(totalRevenue / completedOrders.length) : 0,
    totalProducts: products.length,
    totalStock: products.reduce((s, p) => s + p.stock, 0),
    topProducts,
    monthlySales,
    dailySales,
    popularCategory,
    conversionRate,
  };
}