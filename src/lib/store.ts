// Local-only data store for Panenku MVP.
// Semua data disimpan di localStorage. Backend opsional untuk shipments/diskon.

import { CITIES, distanceKm, getCity } from "./cities";
import { API_BASE_URL } from "./api";

export type Role = "buyer" | "farmer" | "admin";

export type FarmerStatus = "pending" | "approved" | "rejected";

export interface User {
  id: string;
  phone: string;
  pin: string;
  name: string;
  role: Role;
  avatar?: string;
  farmName?: string;
  farmLocation?: string;
  farmCityId?: string;
  fullAddress?: string;
  farmDescription?: string;
  farmEstablished?: string;
  certifications?: string[];
  status?: FarmerStatus;
  balance?: number;
  pendingBalance?: number;
  certificateImage?: string;
  shippingPackagingMethod?: string;
}

export type ShippingOption = "diantar_petani" | "pihak_ketiga";

export interface Product {
  id: string;
  farmerId: string;
  farmerName: string;
  farmLocation: string;
  farmCityId?: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  stock: number;
  description: string;
  image?: string;
  images?: string[];
  rating: number;
  sold: number;
  harvestDate?: string;
  bestBeforeDays?: number;
  pickupAvailable?: boolean;
  cultivationMethod?: string;
  certifications?: string[];
  origin?: string;
  packaging?: string;
  weightPerUnit?: string;
  storageInfo?: string;
  preOrder?: boolean;
  harvestPlannedDate?: string;
  // === NEW FIELDS ===
  shippingOption?: ShippingOption;     // pilihan: "diantar_petani" | "pihak_ketiga"
  shippingProofPhoto?: boolean;        // petani wajib foto saat barang dikirim
  estimatedDelivery?: string;          // perkiraan sampai (misal: "1-2 jam", "H+1")
  courierName?: string;                // nama pengirim (jika diantar petani)
  deliveryChecklist?: boolean;         // checklist "benar-benar akan sampai"
}

export interface CartItem {
  productId: string;
  qty: number;
  priceOverride?: number;
  offerMsgId?: string;
}

export type OrderStatus =
  | "menunggu_bayar"
  | "dibayar"
  | "disiapkan"
  | "dikirim"
  | "selesai"
  | "dibatalkan";

export type ShippingMethod = "antar_sendiri" | "jasa_kirim";

export type PaymentProvider = "xendit_qris" | "xendit_transfer" | "cod";

export type PaymentStatus = "pending" | "paid" | "failed" | "expired";

export interface OrderItem {
  productId: string;
  productName: string;
  image?: string;
  farmerId: string;
  farmerName: string;
  price: number;
  qty: number;
  preOrder?: boolean;
  harvestPlannedDate?: string;
}

export interface Order {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  address: string;
  buyerCityId?: string;
  distanceKm?: number;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  adminFee: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  shippingMethod: ShippingMethod;
  paymentProvider: PaymentProvider;
  paymentStatus: PaymentStatus;
  paymentMethod?: string; // kompatibilitas lama: qris | transfer | cod
  paymentAmount?: number;
  paymentLink?: string;
  qrString?: string;
  trackingCode?: string;
  courier?: string;
  courierService?: string;
  courierTrackingId?: string;
}

export type AdminFeeType = "percentage" | "flat_per_5kg" | "hybrid";

export interface AdminSettings {
  adminFeePercent: number;
  feeType: AdminFeeType;
  feeBasePerOrder: number;   // untuk hybrid: Rp1.500 per transaksi
  feePerKg: number;          // untuk hybrid: Rp250 per kg
  feeMin: number;            // minimal fee
  feeMax: number;            // cap maksimal fee
  ownDeliveryBaseFee: number;
  ownDeliveryPerKm: number;
  thirdPartyBaseFee: number;
  thirdPartyPerKm: number;
  freeShippingMinSubtotal: number;
  security_level?: string;
  require_2fa?: boolean;
  session_timeout_minutes?: number;
  max_login_attempts?: number;
}

export const DEFAULT_ADMIN_SETTINGS: AdminSettings = {
  adminFeePercent: 5,
  feeType: "hybrid",
  feeBasePerOrder: 1500,
  feePerKg: 250,
  feeMin: 1500,
  feeMax: 10000,
  ownDeliveryBaseFee: 7000,
  ownDeliveryPerKm: 0,
  thirdPartyBaseFee: 5000,
  thirdPartyPerKm: 0,
  freeShippingMinSubtotal: 100000,
};

export const MIN_ORDER_QTY = 5;

const KEYS = {
  users: "panenku.users",
  session: "panenku.session",
  products: "panenku.products",
  cart: "panenku.cart",
  orders: "panenku.orders",
  prefs: "panenku.prefs",
  settings: "panenku.adminSettings",
  adminLogs: "panenku.adminLogs",
};

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("panenku:change", { detail: { key } }));
}

// ========== USERS / AUTH ==========
export function getUsers(): User[] {
  return read<User[]>(KEYS.users, []);
}
export function setUsers(users: User[]) {
  write(KEYS.users, users);
}
export function getSession(): User | null {
  return read<User | null>(KEYS.session, null);
}
export function setSession(user: User | null) {
  write(KEYS.session, user);
}
export function logout() {
  setSession(null);
}
export function registerUser(input: Omit<User, "id" | "balance" | "pendingBalance" | "status">): User {
  const users = getUsers();
  if (users.find((u) => u.phone === input.phone)) {
    throw new Error("Nomor HP ini sudah terdaftar");
  }
  const user: User = {
    ...input,
    id: `u_${Date.now()}`,
    balance: input.role === "farmer" ? 0 : undefined,
    pendingBalance: input.role === "farmer" ? 0 : undefined,
    status: input.role === "farmer" ? "pending" : undefined,
  };
  setUsers([...users, user]);
  setSession(user);
  return user;
}
export function loginUser(phone: string, pin: string): User {
  const user = getUsers().find((u) => u.phone === phone);
  if (!user) throw new Error("Nomor HP belum terdaftar");
  if (user.pin !== pin) throw new Error("PIN salah");
  setSession(user);
  return user;
}
export function updateUser(updated: User) {
  const users = getUsers().map((u) => (u.id === updated.id ? updated : u));
  setUsers(users);
  const session = getSession();
  if (session?.id === updated.id) setSession(updated);
}

const ADMIN_PASSWORD = "panenKUgaRUT7575";
export function adminLogin(username: string, password: string): User {
  if (password !== ADMIN_PASSWORD) throw new Error("Password admin salah");
  const name = username.trim() || "Admin";
  const adminUser: User = {
    id: `admin_${Date.now()}`,
    phone: "-",
    pin: "",
    name,
    role: "admin",
  };
  setSession(adminUser);
  return adminUser;
}
export function verifyAdminPassword(password: string): boolean {
  return password === ADMIN_PASSWORD;
}

export interface AdminLog {
  id: string;
  timestampUtc: string;
  adminId: string;
  adminName: string;
  action: string;
  target: string;
  status: "success" | "failed" | "cancelled";
  detail?: string;
}

export function getAdminLogs(): AdminLog[] {
  return read<AdminLog[]>(KEYS.adminLogs, []);
}
export function appendAdminLog(entry: Omit<AdminLog, "id" | "timestampUtc">): AdminLog {
  const log: AdminLog = {
    ...entry,
    id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    timestampUtc: new Date().toISOString(),
  };
  const all = getAdminLogs();
  setAdminLogs([log, ...all].slice(0, 500));
  return log;
}
export function setAdminLogs(logs: AdminLog[]) {
  write(KEYS.adminLogs, logs);
}

export function setFarmerStatus(farmerId: string, status: FarmerStatus) {
  const users = getUsers().map((u) =>
    u.id === farmerId && u.role === "farmer" ? { ...u, status } : u,
  );
  setUsers(users);
}

// ========== PRODUCTS ==========
export function getProducts(): Product[] {
  return read<Product[]>(KEYS.products, []);
}
export function setProducts(products: Product[]) {
  write(KEYS.products, products);
}
export function getVisibleProducts(): Product[] {
  const users = getUsers();
  const approvedFarmerIds = new Set(
    users.filter((u) => u.role === "farmer" && u.status === "approved").map((u) => u.id),
  );
  return getProducts().filter((p) => approvedFarmerIds.has(p.farmerId));
}
export function addProduct(p: Omit<Product, "id" | "rating" | "sold">): Product {
  const product: Product = { ...p, id: `p_${Date.now()}`, rating: 5, sold: 0 };
  setProducts([...getProducts(), product]);
  return product;
}
export function updateProduct(p: Product) {
  setProducts(getProducts().map((x) => (x.id === p.id ? p : x)));
}
export function deleteProduct(id: string) {
  setProducts(getProducts().filter((x) => x.id !== id));
}

// ========== CART ==========
type CartMap = Record<string, CartItem[]>;
export function getCart(buyerId: string): CartItem[] {
  const all = read<CartMap>(KEYS.cart, {});
  return all[buyerId] ?? [];
}
export function setCart(buyerId: string, items: CartItem[]) {
  const all = read<CartMap>(KEYS.cart, {});
  all[buyerId] = items;
  write(KEYS.cart, all);
}
export function addToCart(buyerId: string, productId: string, qty: number) {
  const cart = getCart(buyerId);
  const existing = cart.find((c) => c.productId === productId);
  if (existing) existing.qty += qty;
  else cart.push({ productId, qty });
  setCart(buyerId, cart);
}
export function addNegotiatedToCart(
  buyerId: string,
  productId: string,
  qty: number,
  priceOverride: number,
  offerMsgId?: string,
) {
  const cart = getCart(buyerId).filter((c) => c.productId !== productId);
  cart.push({ productId, qty, priceOverride, offerMsgId });
  setCart(buyerId, cart);
}
export function clearCart(buyerId: string) {
  setCart(buyerId, []);
}

// ========== ORDERS ==========
export function getOrders(): Order[] {
  return read<Order[]>(KEYS.orders, []);
}
export function setOrders(orders: Order[]) {
  write(KEYS.orders, orders);
}
export function createOrder(order: Omit<Order, "id" | "createdAt">): Order {
  const o: Order = {
    ...order,
    id: `o_${Date.now()}`,
    createdAt: new Date().toISOString(),
    trackingCode: order.trackingCode || `PNK-${Date.now().toString(36).toUpperCase()}`,
    qrString: JSON.stringify({
      id: `o_${Date.now()}`,
      t: order.trackingCode || `PNK-${Date.now().toString(36).toUpperCase()}`,
    }),
  };
  setOrders([o, ...getOrders()]);

  const settings = getAdminSettings();
  const products = getProducts();
  const users = getUsers();
  o.items.forEach((it) => {
    const prod = products.find((p) => p.id === it.productId);
    if (prod) {
      prod.stock = Math.max(0, prod.stock - it.qty);
      prod.sold += it.qty;
    }
    const farmer = users.find((u) => u.id === it.farmerId);
    if (farmer && farmer.role === "farmer") {
      const gross = it.price * it.qty;
      const fee = (gross * settings.adminFeePercent) / 100;
      farmer.pendingBalance = (farmer.pendingBalance ?? 0) + (gross - fee);
    }
  });
  setProducts(products);
  setUsers(users);
  return o;
}
export function updateOrderStatus(orderId: string, status: OrderStatus) {
  const orders = getOrders();
  const o = orders.find((x) => x.id === orderId);
  if (!o) return;
  o.status = status;
  if (status === "selesai") {
    const settings = getAdminSettings();
    const users = getUsers();
    o.items.forEach((it) => {
      const farmer = users.find((u) => u.id === it.farmerId);
      if (farmer && farmer.role === "farmer") {
        const gross = it.price * it.qty;
        const fee = (gross * settings.adminFeePercent) / 100;
        const net = gross - fee;
        farmer.pendingBalance = Math.max(0, (farmer.pendingBalance ?? 0) - net);
        farmer.balance = (farmer.balance ?? 0) + net;
      }
    });
    setUsers(users);
  }
  setOrders(orders);
}

// ========== PREFS ==========
export interface Prefs {
  largeFont: boolean;
  voiceOver: boolean;
}
export function getPrefs(): Prefs {
  return read<Prefs>(KEYS.prefs, { largeFont: false, voiceOver: false });
}
export function setPrefs(p: Prefs) {
  write(KEYS.prefs, p);
}

// ========== ADMIN SETTINGS ==========
export function getAdminSettings(): AdminSettings {
  const stored = read<Partial<AdminSettings> & { __v?: number }>(KEYS.settings, {});
  // Migrasi dari v2 ke v3: tambah field hybrid fee
  if (typeof window !== "undefined" && (!stored.__v || stored.__v < 3)) {
    const migrated: AdminSettings = {
      ...DEFAULT_ADMIN_SETTINGS,
      adminFeePercent: stored.adminFeePercent ?? DEFAULT_ADMIN_SETTINGS.adminFeePercent,
      ownDeliveryBaseFee: stored.ownDeliveryBaseFee ?? DEFAULT_ADMIN_SETTINGS.ownDeliveryBaseFee,
      ownDeliveryPerKm: stored.ownDeliveryPerKm ?? DEFAULT_ADMIN_SETTINGS.ownDeliveryPerKm,
      thirdPartyBaseFee: stored.thirdPartyBaseFee ?? DEFAULT_ADMIN_SETTINGS.thirdPartyBaseFee,
      thirdPartyPerKm: stored.thirdPartyPerKm ?? DEFAULT_ADMIN_SETTINGS.thirdPartyPerKm,
      freeShippingMinSubtotal: stored.freeShippingMinSubtotal ?? DEFAULT_ADMIN_SETTINGS.freeShippingMinSubtotal,
      feeType: stored.feeType ?? DEFAULT_ADMIN_SETTINGS.feeType,
      feeBasePerOrder: stored.feeBasePerOrder ?? DEFAULT_ADMIN_SETTINGS.feeBasePerOrder,
      feePerKg: stored.feePerKg ?? DEFAULT_ADMIN_SETTINGS.feePerKg,
      feeMin: stored.feeMin ?? DEFAULT_ADMIN_SETTINGS.feeMin,
      feeMax: stored.feeMax ?? DEFAULT_ADMIN_SETTINGS.feeMax,
      security_level: stored.security_level,
      require_2fa: stored.require_2fa,
      session_timeout_minutes: stored.session_timeout_minutes,
      max_login_attempts: stored.max_login_attempts,
    };
    write(KEYS.settings, { ...migrated, __v: 3 });
    return migrated;
  }
  const s = { ...DEFAULT_ADMIN_SETTINGS, ...stored };
  // Remove __v from stored if present (internal version field)
  return s;
}
export function setAdminSettings(s: AdminSettings) {
  write(KEYS.settings, { ...s, __v: 3 });
}

/**
 * Hitung admin fee berdasarkan pengaturan admin (support hybrid/percentage/flat)
 */
export function calculateAdminFee(subtotal: number, totalKg: number = 0): number {
  const s = getAdminSettings();
  
  switch (s.feeType) {
    case "hybrid":
      // Base per order + per kg, dengan minimal dan maksimal
      const fee = (s.feeBasePerOrder ?? 1500) + (s.feePerKg ?? 250) * Math.ceil(totalKg);
      return Math.max(s.feeMin ?? 1500, Math.min(fee, s.feeMax ?? 10000));
      
    case "flat_per_5kg":
      // Rp2.500 per 5kg, pro-rata
      const per5kg = Math.ceil(totalKg / 5);
      const flatFee = per5kg * 2500;
      return Math.min(flatFee, s.feeMax ?? 10000);
      
    case "percentage":
    default:
      // Default: persentase dari subtotal
      const perc = Math.round((subtotal * s.adminFeePercent) / 100);
      return perc;
  }
}

// ========== SHIPPING QUOTE ==========
export interface ShippingQuote {
  method: ShippingMethod;
  label: string;
  desc: string;
  fee: number;
  distanceKm: number;
  free: boolean;
}

export function calculateShippingOptions(
  buyerCityId: string | undefined,
  farmerCityId: string | undefined,
  subtotal: number,
): ShippingQuote[] {
  const settings = getAdminSettings();
  const buyer = getCity(buyerCityId);
  const farmer = getCity(farmerCityId);
  const dist = buyer && farmer ? distanceKm(buyer, farmer) : 0;
  const eligibleFreeShip = subtotal >= settings.freeShippingMinSubtotal;
  const own = settings.ownDeliveryBaseFee + dist * settings.ownDeliveryPerKm;
  const tp = settings.thirdPartyBaseFee + dist * settings.thirdPartyPerKm;
  return [
    {
      method: "antar_sendiri",
      label: "Antar oleh Petani",
      desc: `Diantar langsung kebun · ${dist} km`,
      fee: eligibleFreeShip ? 0 : own,
      distanceKm: dist,
      free: eligibleFreeShip,
    },
    {
      method: "jasa_kirim",
      label: "Jasa Kirim (Gojek/Lalamove)",
      desc: `Kurir pihak ketiga · ${dist} km`,
      fee: eligibleFreeShip ? 0 : tp,
      distanceKm: dist,
      free: eligibleFreeShip,
    },
  ];
}

// Re-export cities
export { CITIES };

// ========== CHAT ==========
export type ChatMessageType = "text" | "image" | "offer" | "call";

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  type: ChatMessageType;
  text: string;
  image?: string;
  offerPrice?: number;
  offerQty?: number;
  offerStatus?: "pending" | "accepted" | "rejected" | "added";
  createdAt: string;
}

export interface ChatRoom {
  id: string;
  buyerId: string;
  farmerId: string;
  productId?: string;
  productName?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadBuyer: number;
  unreadFarmer: number;
}

const CHAT_KEYS = {
  rooms: "panenku.chat.rooms",
  messages: "panenku.chat.messages",
};

export function getChatRooms(): ChatRoom[] {
  return read<ChatRoom[]>(CHAT_KEYS.rooms, []);
}
export function setChatRooms(rooms: ChatRoom[]) {
  write(CHAT_KEYS.rooms, rooms);
}
export function getChatMessages(): ChatMessage[] {
  return read<ChatMessage[]>(CHAT_KEYS.messages, []);
}
export function setChatMessages(msgs: ChatMessage[]) {
  write(CHAT_KEYS.messages, msgs);
}

export function createChatRoom(
  buyerId: string,
  farmerId: string,
  productId?: string,
  productName?: string,
): ChatRoom {
  const rooms = getChatRooms();
  const existing = rooms.find(
    (r) => r.buyerId === buyerId && r.farmerId === farmerId && r.productId === productId,
  );
  if (existing) return existing;
  const room: ChatRoom = {
    id: `room_${Date.now()}`,
    buyerId,
    farmerId,
    productId,
    productName,
    unreadBuyer: 0,
    unreadFarmer: 0,
  };
  setChatRooms([room, ...rooms]);
  return room;
}

export function sendChatMessage(
  roomId: string,
  senderId: string,
  text: string,
  opts?: {
    type?: ChatMessageType;
    image?: string;
    offerPrice?: number;
    offerQty?: number;
  },
): ChatMessage {
  const msg: ChatMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    roomId,
    senderId,
    type: opts?.type ?? "text",
    text,
    image: opts?.image,
    offerPrice: opts?.offerPrice,
    offerQty: opts?.offerQty,
    offerStatus: opts?.type === "offer" ? "pending" : undefined,
    createdAt: new Date().toISOString(),
  };
  const all = getChatMessages();
  setChatMessages([...all, msg]);
  const rooms = getChatRooms();
  const room = rooms.find((r) => r.id === roomId);
  if (room) {
    room.lastMessage = opts?.type === "image" ? "📷 Foto" : opts?.type === "offer" ? "💰 Tawaran harga" : text;
    room.lastMessageAt = msg.createdAt;
    const senderIsBuyer = room.buyerId === senderId;
    if (senderIsBuyer) room.unreadFarmer += 1;
    else room.unreadBuyer += 1;
    setChatRooms([...rooms]);
  }
  return msg;
}

export function respondToOffer(msgId: string, status: "accepted" | "rejected" | "added") {
  const all = getChatMessages();
  const msg = all.find((m) => m.id === msgId);
  if (msg) {
    msg.offerStatus = status;
    setChatMessages([...all]);
  }
}

export function markRoomAsRead(roomId: string, role: "buyer" | "farmer") {
  const rooms = getChatRooms();
  const room = rooms.find((r) => r.id === roomId);
  if (room) {
    if (role === "buyer") room.unreadBuyer = 0;
    else room.unreadFarmer = 0;
    setChatRooms([...rooms]);
  }
}

export function getRoomMessages(roomId: string): ChatMessage[] {
  return getChatMessages()
    .filter((m) => m.roomId === roomId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

// ========== SHIPMENT TYPES ==========
export interface ShipmentEvent {
  id: string;
  shipment_id: string;
  event_type: string;
  location?: string;
  notes?: string;
  timestamp: string;
  created_at?: string;
}

export interface Shipment {
  id: string;
  order_id: string;
  farmer_id: string;
  buyer_id: string;
  courier_name: string;
  tracking_number?: string;
  shipping_service?: string;
  cost: number;
  status: string;
  location?: string;
  notes?: string;
  proof_of_delivery?: string;
  estimated_delivery?: string;
  actual_delivery?: string;
  events?: ShipmentEvent[];
  created_at: string;
  buyer_name?: string;
  shipping_address?: string;
}

export async function getShipmentByOrder(orderId: string): Promise<Shipment | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/shipments/order/${orderId}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function createShipment(data: {
  order_id: string;
  farmer_id: string;
  courier_name?: string;
  tracking_number?: string;
  shipping_service?: string;
  notes?: string;
}): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/shipments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) return null;
    const result = await res.json();
    return result.id;
  } catch {
    return null;
  }
}

export async function updateShipmentStatus(shipmentId: string, data: {
  status: string;
  location?: string;
  notes?: string;
  proof_of_delivery?: string;
}): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/shipments/${shipmentId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function getRoomsForUser(userId: string, role: "buyer" | "farmer"): ChatRoom[] {
  const rooms = getChatRooms();
  const filtered =
    role === "buyer"
      ? rooms.filter((r) => r.buyerId === userId)
      : rooms.filter((r) => r.farmerId === userId);
  return filtered.sort((a, b) => {
    const ta = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
    const tb = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
    return tb - ta;
  });
}

export function getUnreadCount(userId: string, role: "buyer" | "farmer"): number {
  return getRoomsForUser(userId, role).reduce((sum, r) => sum + (role === "buyer" ? r.unreadBuyer : r.unreadFarmer), 0);
}

// ========== DEMO SEED ==========
function makeCertificateImage(title: string, holder: string, code: string, color = "#16a34a"): string {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 560" width="800" height="560">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f0fdf4"/>
      <stop offset="1" stop-color="#dcfce7"/>
    </linearGradient>
    <pattern id="p" width="40" height="40" patternUnits="userSpaceOnUse">
      <circle cx="20" cy="20" r="1.2" fill="${color}" opacity="0.18"/>
    </pattern>
  </defs>
  <rect width="800" height="560" fill="url(#bg)"/>
  <rect width="800" height="560" fill="url(#p)"/>
  <rect x="20" y="20" width="760" height="520" fill="none" stroke="${color}" stroke-width="6" rx="14"/>
  <rect x="36" y="36" width="728" height="488" fill="none" stroke="${color}" stroke-width="2" rx="10" opacity="0.5"/>
  <text x="400" y="120" text-anchor="middle" font-family="Georgia,serif" font-size="34" font-weight="700" fill="${color}">SERTIFIKAT</text>
  <text x="400" y="170" text-anchor="middle" font-family="Georgia,serif" font-size="22" fill="#166534">${title}</text>
  <text x="400" y="240" text-anchor="middle" font-family="Arial,sans-serif" font-size="16" fill="#374151">Diberikan kepada</text>
  <text x="400" y="290" text-anchor="middle" font-family="Georgia,serif" font-size="30" font-weight="700" fill="#111827">${holder}</text>
  <text x="400" y="350" text-anchor="middle" font-family="Arial,sans-serif" font-size="14" fill="#4b5563">Atas pemenuhan standar mutu hasil pertanian</text>
  <text x="400" y="372" text-anchor="middle" font-family="Arial,sans-serif" font-size="14" fill="#4b5563">sesuai pedoman Kementerian Pertanian RI</text>
  <circle cx="640" cy="450" r="56" fill="none" stroke="${color}" stroke-width="3"/>
  <text x="640" y="446" text-anchor="middle" font-family="Arial,sans-serif" font-size="11" font-weight="700" fill="${color}">PANENKU</text>
  <text x="640" y="462" text-anchor="middle" font-family="Arial,sans-serif" font-size="10" fill="${color}">VERIFIED</text>
  <text x="120" y="470" font-family="Arial,sans-serif" font-size="13" fill="#374151">No. ${code}</text>
  <text x="120" y="490" font-family="Arial,sans-serif" font-size="13" fill="#374151">Berlaku 3 tahun sejak terbit</text>
  <line x1="120" y1="430" x2="320" y2="430" stroke="#111827" stroke-width="2"/>
  <text x="120" y="448" font-family="Georgia,serif" font-size="12" fill="#111827">Pejabat Berwenang</text>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function seedIfEmpty() {
  if (typeof window === "undefined") return;
  const users = getUsers();
  let farmer = users.find((u) => u.phone === "081200000001");
  if (!farmer) {
    farmer = {
      id: "u_demo_farmer",
      phone: "081200000001",
      pin: "111111",
      name: "Pak Budi",
      role: "farmer",
      farmName: "Kebun Sumber Rejeki",
      farmLocation: "Magelang, Jawa Tengah",
      farmCityId: "magelang",
      fullAddress: "Jl. Raya Borobudur No. 45, RT 03/RW 02, Desa Wanurejo, Kec. Borobudur, Kab. Magelang, Jawa Tengah 56553",
      farmDescription:
        "Kebun keluarga sejak 1998 di lereng Bukit Menoreh. Kami fokus pada sayuran segar tanpa pestisida sintetis dan dipanen langsung sebelum dikirim. Sudah melayani lebih dari 1.200 keluarga di Jawa Tengah.",
      farmEstablished: "1998",
      certifications: ["Prima 3", "Organik Indonesia", "GAP Sayuran"],
      status: "approved",
      balance: 250000,
      pendingBalance: 0,
      shippingPackagingMethod:
        "Sayur dicuci air mengalir, ditiriskan, lalu dikemas plastik food-grade berlubang. Untuk pengiriman luar kota, dimasukkan kardus dobel dengan bantalan koran kering & es gel reusable. Dikirim pagi hari setelah panen.",
      certificateImage: makeCertificateImage("Prima 3", "Kebun Sumber Rejeki", "PNK-BUDI-2024", "#15803d"),
    };
    setUsers([...users, farmer]);
  } else {
    let changed = false;
    if (farmer.status !== "approved") { farmer.status = "approved"; changed = true; }
    if (!farmer.farmCityId) { farmer.farmCityId = "magelang"; changed = true; }
    if (!farmer.fullAddress) {
      farmer.fullAddress = "Jl. Raya Borobudur No. 45, RT 03/RW 02, Desa Wanurejo, Kec. Borobudur, Kab. Magelang, Jawa Tengah 56553";
      changed = true;
    }
    if (!farmer.farmDescription) {
      farmer.farmDescription = "Kebun keluarga sejak 1998 di lereng Bukit Menoreh. Kami fokus pada sayuran segar tanpa pestisida sintetis dan dipanen langsung sebelum dikirim. Sudah melayani lebih dari 1.200 keluarga di Jawa Tengah.";
      changed = true;
    }
    if (!farmer.farmEstablished) { farmer.farmEstablished = "1998"; changed = true; }
    if (!farmer.certifications?.length) {
      farmer.certifications = ["Prima 3", "Organik Indonesia", "GAP Sayuran"];
      changed = true;
    }
    if (!farmer.shippingPackagingMethod) {
      farmer.shippingPackagingMethod =
        "Sayur dicuci air mengalir, ditiriskan, lalu dikemas plastik food-grade berlubang. Untuk pengiriman luar kota, dimasukkan kardus dobel dengan bantalan koran kering & es gel reusable. Dikirim pagi hari setelah panen.";
      changed = true;
    }
    if (!farmer.certificateImage) {
      farmer.certificateImage = makeCertificateImage("Prima 3", farmer.farmName ?? "Kebun Sumber Rejeki", "PNK-BUDI-2024", "#15803d");
      changed = true;
    }
    if (changed) setUsers(getUsers().map((u) => (u.id === farmer!.id ? farmer! : u)));
  }

  if (!getUsers().find((u) => u.phone === "081200000002")) {
    setUsers([
      ...getUsers(),
      {
        id: "u_demo_farmer_2",
        phone: "081200000002",
        pin: "222222",
        name: "Bu Siti",
        role: "farmer",
        farmName: "Kebun Hijau Lestari",
        farmLocation: "Bandung, Jawa Barat",
        farmCityId: "bandung",
        fullAddress: "Jl. Lembang Raya No. 12, Desa Cikahuripan, Kec. Lembang, Kab. Bandung Barat, Jawa Barat 40391",
        farmDescription: "Kebun hidroponik di dataran tinggi Lembang. Mengkhususkan diri pada sayuran daun premium.",
        farmEstablished: "2015",
        certifications: ["Hidroponik"],
        status: "pending",
        balance: 0,
        pendingBalance: 0,
      },
    ]);
  }

  const existing = getProducts();
  const seedExisting = existing.filter((p) => p.id.startsWith("p_seed_"));
  const seedHasNewFields = seedExisting.length >= 55 && seedExisting.every((p) => !!p.weightPerUnit);
  if (seedExisting.length >= 55 && seedHasNewFields) {
    ensureExtraFarmers();
    return;
  }
  const userProducts = existing.filter((p) => !p.id.startsWith("p_seed_"));
  setProducts(userProducts);
  const farmerId = farmer!.id;
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400_000).toISOString().slice(0, 10);
  const baseFarmerInfo = {
    farmerId,
    farmerName: "Pak Budi",
    farmLocation: "Magelang, Jawa Tengah",
    farmCityId: "magelang",
  };
  const seedProducts: Omit<Product, "id" | "rating" | "sold">[] = [
    {
      ...baseFarmerInfo,
      name: "Tomat Merah Segar",
      category: "sayur",
      price: 12000,
      unit: "kg",
      stock: 50,
      description:
        "Tomat merah varietas Servo, dipanen pagi ini saat matang pohon sehingga rasa lebih manis dan kaya likopen. Cocok untuk sambal, salad, atau jus segar.",
      image: "asset:tomat",
      harvestDate: today,
      bestBeforeDays: 7,
      pickupAvailable: true,
      cultivationMethod: "Konvensional ramah lingkungan (pestisida nabati)",
      certifications: ["Prima 3"],
      origin: "Lereng Bukit Menoreh, Magelang",
      packaging: "Kardus food-grade dengan bantalan kertas",
      weightPerUnit: "1 kg per pack",
      storageInfo: "Simpan di suhu ruang max 3 hari atau kulkas hingga 7 hari.",
    },
    {
      ...baseFarmerInfo,
      name: "Cabai Merah Keriting",
      category: "cabai",
      price: 45000,
      unit: "kg",
      stock: 20,
      description:
        "Cabai merah keriting pedas (~25.000 SHU), bertekstur padat dan tahan lama. Ideal untuk sambal, bumbu rendang, dan masakan padang.",
      image: "asset:cabai",
      harvestDate: today,
      bestBeforeDays: 10,
      pickupAvailable: true,
      cultivationMethod: "Konvensional ramah lingkungan",
      certifications: ["Prima 3"],
      origin: "Magelang, Jawa Tengah",
      packaging: "Plastik food-grade berlubang udara",
      weightPerUnit: "500 g per pack",
      storageInfo: "Simpan di kulkas, bisa bertahan 2 minggu.",
    },
    {
      ...baseFarmerInfo,
      name: "Bawang Merah Brebes",
      category: "bawang",
      price: 32000,
      unit: "kg",
      stock: 30,
      description:
        "Bawang merah asli petani Brebes ukuran sedang, kering jemur sempurna sehingga awet hingga 1 bulan. Aroma kuat dan rasa khas.",
      image: "asset:bawang",
      harvestDate: yesterday,
      bestBeforeDays: 30,
      pickupAvailable: false,
      cultivationMethod: "Konvensional",
      origin: "Brebes, Jawa Tengah",
      packaging: "Karung jaring 5 kg / pack 1 kg",
      weightPerUnit: "1 kg per pack",
      storageInfo: "Simpan di tempat kering & berventilasi.",
    },
    {
      ...baseFarmerInfo,
      name: "Bayam Hijau Organik",
      category: "organik",
      price: 8000,
      unit: "ikat",
      stock: 40,
      description:
        "Bayam hijau organik tanpa pestisida sintetis, ditanam dengan pupuk kandang dan kompos. Daun lebar, segar, dan kaya zat besi.",
      image: "asset:bayam",
      harvestDate: today,
      bestBeforeDays: 3,
      pickupAvailable: true,
      cultivationMethod: "Organik 100% (pupuk kompos)",
      certifications: ["Organik Indonesia"],
      origin: "Magelang, Jawa Tengah",
      packaging: "Diikat tali rafia alami, dibungkus daun pisang",
      weightPerUnit: "±250 g per ikat",
      storageInfo: "Konsumsi dalam 2-3 hari, simpan di kulkas terbungkus tisu.",
    },
    {
      ...baseFarmerInfo,
      name: "Wortel Manis",
      category: "sayur",
      price: 15000,
      unit: "kg",
      stock: 25,
      description:
        "Wortel varietas Nantes dari dataran tinggi 1.200 mdpl. Renyah, manis alami, dan cocok untuk jus, sup, atau cemilan anak.",
      image: "asset:wortel",
      harvestDate: today,
      bestBeforeDays: 14,
      pickupAvailable: true,
      cultivationMethod: "Konvensional ramah lingkungan",
      certifications: ["Prima 3"],
      origin: "Dataran Tinggi Dieng (titip kerjasama)",
      packaging: "Plastik food-grade 1 kg",
      weightPerUnit: "1 kg per pack",
      storageInfo: "Simpan di kulkas, bertahan 2 minggu.",
    },
    {
      ...baseFarmerInfo,
      name: "Beras Pandan Wangi",
      category: "beras",
      price: 14000,
      unit: "kg",
      stock: 100,
      description:
        "Beras pandan wangi premium hasil panen padi sawah tadah hujan. Pulen, harum alami, dan tidak mudah basi.",
      image: "asset:beras",
      bestBeforeDays: 180,
      pickupAvailable: false,
      cultivationMethod: "Konvensional",
      origin: "Magelang, Jawa Tengah",
      packaging: "Karung plastik 5 kg / 10 kg",
      weightPerUnit: "5 kg per karung",
      storageInfo: "Simpan di wadah tertutup, jauh dari lembap.",
    },
    {
      ...baseFarmerInfo,
      name: "Jeruk Manis Pontianak",
      category: "buah",
      price: 18000,
      unit: "kg",
      stock: 35,
      description:
        "Jeruk manis Pontianak ukuran besar, kulit tipis, daging tebal, dan segar. Kandungan air tinggi cocok untuk jus.",
      image: "asset:jeruk",
      harvestDate: yesterday,
      bestBeforeDays: 14,
      pickupAvailable: true,
      cultivationMethod: "Konvensional",
      origin: "Pontianak (mitra petani)",
      packaging: "Kardus berlubang, lapisan kertas",
      weightPerUnit: "1 kg per pack",
      storageInfo: "Tahan 1 minggu di suhu ruang, 3 minggu di kulkas.",
    },
  ];
  const newSeeds = seedProducts.map((p, i) => ({ ...p, id: `p_seed_${i}`, rating: 4.7 + (i % 3) * 0.1, sold: 20 + i * 5 }));

  // ===== Petani dummy tambahan + 50 produk =====
  ensureExtraFarmers();
  const extraProducts = buildExtraSeedProducts();
  setProducts([...userProducts, ...newSeeds, ...extraProducts]);

  // Seed demo chat data
  const existingRooms = getChatRooms();
  if (existingRooms.length === 0) {
    let buyer = getUsers().find((u) => u.phone === "081300000001");
    if (!buyer) {
      buyer = {
        id: "u_demo_buyer",
        phone: "081300000001",
        pin: "333333",
        name: "Ibu Rina",
        role: "buyer",
      };
      setUsers([...getUsers(), buyer]);
    }
    const room: ChatRoom = {
      id: "room_demo_1",
      buyerId: buyer.id,
      farmerId: farmer!.id,
      productId: "p_seed_0",
      productName: "Tomat Merah Segar",
      lastMessage: "📷 Foto",
      lastMessageAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      unreadBuyer: 0,
      unreadFarmer: 1,
    };
    setChatRooms([room]);
    const now = Date.now();
    const msgs: ChatMessage[] = [
      {
        id: "msg_1",
        roomId: room.id,
        senderId: buyer.id,
        type: "text",
        text: "Selamat pagi Pak Budi, stok tomat merah masih ada?",
        createdAt: new Date(now - 1000 * 60 * 60 * 2).toISOString(),
      },
      {
        id: "msg_2",
        roomId: room.id,
        senderId: farmer!.id,
        type: "text",
        text: "Pagi Bu Rina, masih ada 50 kg segar dipanen pagi ini. Mau berapa?",
        createdAt: new Date(now - 1000 * 60 * 60 * 1.5).toISOString(),
      },
      {
        id: "msg_3",
        roomId: room.id,
        senderId: buyer.id,
        type: "offer",
        text: "Tawaran: 10 unit @ Rp10.000",
        offerPrice: 10000,
        offerQty: 10,
        offerStatus: "pending",
        createdAt: new Date(now - 1000 * 60 * 60).toISOString(),
      },
      {
        id: "msg_4",
        roomId: room.id,
        senderId: farmer!.id,
        type: "image",
        text: "Mengirim foto",
        image: "asset:tomat",
        createdAt: new Date(now - 1000 * 60 * 30).toISOString(),
      },
    ];
    setChatMessages(msgs);
  }
}

// ===================== Extra dummy data =====================
interface ExtraFarmerSpec {
  id: string;
  phone: string;
  pin: string;
  name: string;
  farmName: string;
  cityId: string;
  cityLabel: string;
  address: string;
  established: string;
  desc: string;
  certs: string[];
  packaging: string;
  status?: FarmerStatus;
  certColor?: string;
}

const EXTRA_FARMERS: ExtraFarmerSpec[] = [
  {
    id: "u_seed_farmer_3", phone: "081200000003", pin: "333111", name: "Pak Joko",
    farmName: "Tani Makmur Garut", cityId: "garut",
    cityLabel: "Garut, Jawa Barat",
    address: "Kp. Cisurupan RT 02/RW 04, Desa Cisurupan, Kec. Cisurupan, Garut 44163",
    established: "2005",
    desc: "Kebun dataran tinggi 1.300 mdpl, fokus pada sayuran daun & umbi. Dipanen segar tiap pagi.",
    certs: ["Prima 3", "GAP Sayuran"], packaging: "Dikemas dalam plastik food-grade berlubang, lalu kardus karton tebal dengan bantalan koran. Pengiriman pagi maks. H+1 panen.",
    certColor: "#15803d",
  },
  {
    id: "u_seed_farmer_4", phone: "081200000004", pin: "444111", name: "Bu Yanti",
    farmName: "Hidroponik Sehat Bandung", cityId: "bandung",
    cityLabel: "Bandung, Jawa Barat",
    address: "Jl. Setiabudi No. 220, Ledeng, Cidadap, Kota Bandung 40143",
    established: "2018",
    desc: "Sayur hidroponik premium tanpa pestisida. Cocok untuk salad & juicing keluarga.",
    certs: ["Hidroponik Premium", "Organik Indonesia"],
    packaging: "Sayur dicuci air ozon, dibungkus plastik PE food-grade, dilapisi sterofoam dengan ice gel agar tetap segar 24 jam.",
    certColor: "#0d9488",
  },
  {
    id: "u_seed_farmer_5", phone: "081200000005", pin: "555111", name: "Pak Suparman",
    farmName: "Kebun Buah Malang", cityId: "malang",
    cityLabel: "Malang, Jawa Timur",
    address: "Jl. Raya Selecta No. 88, Batu, Malang 65336",
    established: "2001",
    desc: "Kebun apel & jeruk keluarga turun-temurun di lereng Gunung Arjuno.",
    certs: ["GAP Buah", "Prima 3"],
    packaging: "Buah disortir manual, dibungkus jaring foam tiap butir, lalu kardus berlubang udara dengan bantalan kertas.",
    certColor: "#b45309",
  },
  {
    id: "u_seed_farmer_6", phone: "081200000006", pin: "666111", name: "Pak Asep",
    farmName: "Beras Pandan Cianjur", cityId: "bogor",
    cityLabel: "Bogor, Jawa Barat",
    address: "Kp. Sukamulya, Desa Sukamulya, Cianjur (gudang Bogor) 16730",
    established: "1995",
    desc: "Beras pandan wangi & merah organik langsung dari penggilingan keluarga.",
    certs: ["Beras SNI", "Organik Indonesia"],
    packaging: "Karung plastik food-grade vakum 5 kg, dimasukkan karton dobel untuk pengiriman antar pulau.",
    certColor: "#7c3aed",
  },
  {
    id: "u_seed_farmer_7", phone: "081200000007", pin: "777111", name: "Pak Anwar",
    farmName: "Kopi Lampung Robusta", cityId: "lampung",
    cityLabel: "Bandar Lampung, Lampung",
    address: "Jl. Way Ngarip, Tanggamus, Lampung 35385",
    established: "2010",
    desc: "Kopi robusta dataran tinggi Tanggamus, diolah natural & full-wash.",
    certs: ["Indikasi Geografis Lampung"],
    packaging: "Biji kopi disimpan dalam grain-pro liner + karung goni. Untuk retail dipack vakum 250 g/1 kg.",
    certColor: "#92400e",
  },
  {
    id: "u_seed_farmer_8", phone: "081200000008", pin: "888111", name: "Ibu Lestari",
    farmName: "Aneka Bumbu Yogya", cityId: "yogya",
    cityLabel: "Yogyakarta, DIY",
    address: "Jl. Godean KM 5, Sidoarum, Godean, Sleman 55564",
    established: "2012",
    desc: "Rempah & bumbu dapur segar: jahe, kunyit, lengkuas, sereh, dari petani binaan.",
    certs: ["Prima 3"],
    packaging: "Rempah dicuci kering, dibungkus plastik PE berlubang 250 g, dikemas dalam karton mini.",
    certColor: "#a16207",
  },
  {
    id: "u_seed_farmer_9", phone: "081200000009", pin: "999111", name: "Pak Hendra",
    farmName: "Sayur Lembang Premium", cityId: "bandung",
    cityLabel: "Lembang, Jawa Barat",
    address: "Jl. Tangkuban Perahu KM 4, Cikole, Lembang 40391",
    established: "2014",
    desc: "Sayur dataran tinggi Lembang: brokoli, kembang kol, kentang baby, edamame.",
    certs: ["GAP Sayuran", "Prima 3"],
    packaging: "Pre-cooling 4°C sebelum dikemas plastik berlubang, lalu styrofoam dengan ice gel reusable.",
    certColor: "#166534",
  },
  {
    id: "u_seed_farmer_10", phone: "081200000010", pin: "101010", name: "Pak Rahmat",
    farmName: "Hortikultura Brebes", cityId: "semarang",
    cityLabel: "Brebes, Jawa Tengah",
    address: "Jl. Pantura KM 12, Wanasari, Brebes 52252",
    established: "1990",
    desc: "Sentra bawang merah & cabai dataran rendah. Stok besar sepanjang tahun.",
    certs: ["Prima 3"],
    packaging: "Bawang dijemur 7-10 hari, dikemas karung jaring 5 kg, untuk retail dipack 1 kg vakum.",
    certColor: "#b91c1c",
  },
  {
    id: "u_seed_farmer_11", phone: "081200000011", pin: "111222", name: "Pak Wayan",
    farmName: "Bali Organic Estate", cityId: "denpasar",
    cityLabel: "Tabanan, Bali",
    address: "Jl. Jatiluwih, Penebel, Tabanan, Bali 82152",
    established: "2016",
    desc: "Beras merah & sayur organik sertifikat dari kebun terasering Jatiluwih.",
    certs: ["Organik Indonesia", "USDA Organic"],
    packaging: "Beras vakum 2 kg & 5 kg dalam karung kraft daur ulang.",
    certColor: "#15803d",
  },
  {
    id: "u_seed_farmer_12", phone: "081200000012", pin: "121212", name: "Bu Mariana",
    farmName: "Kebun Sumatra Utara", cityId: "medan",
    cityLabel: "Berastagi, Sumatera Utara",
    address: "Jl. Mariam Ginting, Berastagi, Karo 22152",
    established: "2008",
    desc: "Buah-buah dataran tinggi Karo: markisa, jeruk medan, stroberi.",
    certs: ["Prima 3", "GAP Buah"],
    packaging: "Tiap buah dibalut jaring foam, kardus berlubang dengan bantalan koran kering.",
    certColor: "#be123c",
  },
  {
    id: "u_seed_farmer_13", phone: "081200000013", pin: "131313", name: "Pak Hadi",
    farmName: "Tani Maju Kediri", cityId: "kediri",
    cityLabel: "Kediri, Jawa Timur",
    address: "Jl. Pamenang, Kec. Pagu, Kediri 64183",
    established: "2020",
    desc: "Kebun cabai & terong rumah tangga, sedang ekspansi.",
    certs: [],
    packaging: "Plastik HDPE biasa, dikemas karton tipis.",
    status: "pending",
  },
];

export function ensureExtraFarmers() {
  const users = getUsers();
  const existingIds = new Set(users.map((u) => u.id));
  const toAdd: User[] = [];
  for (const f of EXTRA_FARMERS) {
    if (existingIds.has(f.id)) continue;
    toAdd.push({
      id: f.id,
      phone: f.phone,
      pin: f.pin,
      name: f.name,
      role: "farmer",
      farmName: f.farmName,
      farmLocation: f.cityLabel,
      farmCityId: f.cityId,
      fullAddress: f.address,
      farmDescription: f.desc,
      farmEstablished: f.established,
      certifications: f.certs,
      status: f.status ?? "approved",
      balance: 0,
      pendingBalance: 0,
      shippingPackagingMethod: f.packaging,
      certificateImage: f.certs.length > 0
        ? makeCertificateImage(f.certs[0], f.farmName, `PNK-${f.id.slice(-4).toUpperCase()}-2024`, f.certColor ?? "#16a34a")
        : undefined,
    });
  }
  if (toAdd.length) setUsers([...users, ...toAdd]);
}

function buildExtraSeedProducts(): Product[] {
  const approvedFarmers = EXTRA_FARMERS.filter((f) => (f.status ?? "approved") === "approved");
  const today = new Date().toISOString().slice(0, 10);
  const yest = new Date(Date.now() - 86400_000).toISOString().slice(0, 10);
  const dayAfter = (d: number) => new Date(Date.now() + d * 86400_000).toISOString().slice(0, 10);

  type Tpl = {
    name: string; category: string; price: number; unit: string; stock: number;
    description: string; image: string;
    bestBeforeDays?: number; cultivationMethod?: string; certifications?: string[];
    packaging: string; weightPerUnit: string; storageInfo: string;
    preOrder?: boolean;
  };

  const templates: Tpl[] = [
    { name: "Brokoli Lembang Premium", category: "sayur", price: 22000, unit: "kg", stock: 30, description: "Brokoli hijau pekat, krop padat, dipanen pagi dari dataran tinggi Lembang 1.200 mdpl.", image: "asset:bayam", bestBeforeDays: 7, cultivationMethod: "Konvensional ramah lingkungan", certifications: ["Prima 3"], packaging: "Plastik food-grade berlubang 500 g", weightPerUnit: "500 g per pack", storageInfo: "Simpan kulkas, gunakan dalam 5 hari." },
    { name: "Kembang Kol Putih", category: "sayur", price: 20000, unit: "kg", stock: 25, description: "Kembang kol putih bersih, krop padat, manis dan renyah.", image: "asset:bayam", bestBeforeDays: 6, packaging: "Plastik food-grade 500 g", weightPerUnit: "500 g per pack", storageInfo: "Simpan di kulkas." },
    { name: "Selada Romaine Hidroponik", category: "organik", price: 28000, unit: "pack", stock: 40, description: "Selada romaine hidroponik, daun renyah, cocok untuk salad caesar & burger.", image: "asset:bayam", bestBeforeDays: 7, cultivationMethod: "Hidroponik tanpa pestisida", certifications: ["Hidroponik Premium"], packaging: "Pack plastik tebal anti-bocor 200 g", weightPerUnit: "±200 g per pack", storageInfo: "Simpan kulkas suhu 4-8°C." },
    { name: "Kale Hidroponik", category: "organik", price: 32000, unit: "pack", stock: 25, description: "Daun kale curly kaya nutrisi, cocok untuk smoothie & keripik sehat.", image: "asset:bayam", bestBeforeDays: 5, cultivationMethod: "Hidroponik", certifications: ["Hidroponik Premium", "Organik Indonesia"], packaging: "Pack plastik 150 g", weightPerUnit: "150 g per pack", storageInfo: "Kulkas, terbungkus tisu kering." },
    { name: "Pakcoy Baby", category: "sayur", price: 14000, unit: "ikat", stock: 50, description: "Pakcoy baby daun pendek, manis, cocok tumis dan sup.", image: "asset:bayam", bestBeforeDays: 5, certifications: ["Prima 3"], packaging: "Ikat tali rafia, plastik berlubang", weightPerUnit: "±300 g per ikat", storageInfo: "Kulkas 4-6°C." },
    { name: "Sawi Hijau", category: "sayur", price: 9000, unit: "ikat", stock: 60, description: "Sawi hijau segar, batang renyah, untuk sup, mie, atau tumisan.", image: "asset:bayam", bestBeforeDays: 4, packaging: "Ikat, plastik berlubang", weightPerUnit: "±300 g", storageInfo: "Kulkas, konsumsi 3 hari." },
    { name: "Kangkung Cabut", category: "sayur", price: 6000, unit: "ikat", stock: 80, description: "Kangkung cabut segar, daun lebar tidak getir.", image: "asset:bayam", bestBeforeDays: 3, packaging: "Diikat tali rafia", weightPerUnit: "±250 g", storageInfo: "Konsumsi dalam 2 hari, simpan dengan akar dalam air." },
    { name: "Daun Bawang", category: "sayur", price: 12000, unit: "kg", stock: 25, description: "Daun bawang segar, batang putih panjang, aroma khas.", image: "asset:bayam", bestBeforeDays: 7, packaging: "Plastik berlubang 250 g", weightPerUnit: "250 g per pack", storageInfo: "Kulkas, terbungkus tisu." },
    { name: "Seledri", category: "sayur", price: 18000, unit: "kg", stock: 20, description: "Seledri kebun, aroma tajam, ideal sup & jus diet.", image: "asset:bayam", bestBeforeDays: 7, packaging: "Plastik 200 g", weightPerUnit: "200 g", storageInfo: "Kulkas." },
    { name: "Cabai Rawit Merah", category: "cabai", price: 65000, unit: "kg", stock: 18, description: "Cabai rawit merah super pedas (~80.000 SHU). Cocok sambal & saus.", image: "asset:cabai", bestBeforeDays: 14, certifications: ["Prima 3"], packaging: "Plastik berlubang 250 g", weightPerUnit: "250 g per pack", storageInfo: "Kulkas, bisa 3 minggu." },
    { name: "Cabai Hijau Besar", category: "cabai", price: 30000, unit: "kg", stock: 22, description: "Cabai hijau besar, sedikit pedas, untuk balado & sambal hijau.", image: "asset:cabai", bestBeforeDays: 10, packaging: "Plastik berlubang", weightPerUnit: "500 g", storageInfo: "Kulkas." },
    { name: "Bawang Putih Kating", category: "bawang", price: 38000, unit: "kg", stock: 40, description: "Bawang putih kating siung besar, kering sempurna.", image: "asset:bawang", bestBeforeDays: 60, packaging: "Karung jaring 1 kg / pack 500 g", weightPerUnit: "1 kg", storageInfo: "Tempat kering & berventilasi." },
    { name: "Bawang Bombay", category: "bawang", price: 28000, unit: "kg", stock: 30, description: "Bawang bombay manis import lokal, cocok untuk semua masakan.", image: "asset:bawang", bestBeforeDays: 45, packaging: "Jaring 1 kg", weightPerUnit: "1 kg", storageInfo: "Tempat kering." },
    { name: "Wortel Baby", category: "sayur", price: 22000, unit: "kg", stock: 25, description: "Wortel baby manis renyah, langsung dimakan atau jus.", image: "asset:wortel", bestBeforeDays: 14, certifications: ["Prima 3"], packaging: "Plastik food-grade 500 g", weightPerUnit: "500 g", storageInfo: "Kulkas, tahan 2 minggu." },
    { name: "Lobak Putih", category: "sayur", price: 14000, unit: "kg", stock: 18, description: "Lobak putih renyah, cocok sup, acar, dan masakan Asia.", image: "asset:wortel", bestBeforeDays: 14, packaging: "Plastik 1 kg", weightPerUnit: "1 kg", storageInfo: "Kulkas." },
    { name: "Kentang Dieng", category: "sayur", price: 17000, unit: "kg", stock: 60, description: "Kentang granola Dieng kualitas A, daging kuning padat.", image: "asset:kentang", bestBeforeDays: 21, certifications: ["Prima 3"], packaging: "Karung jaring 5 kg / 1 kg", weightPerUnit: "1 kg per pack", storageInfo: "Tempat sejuk gelap." },
    { name: "Ubi Cilembu", category: "sayur", price: 18000, unit: "kg", stock: 30, description: "Ubi Cilembu manis legit, cocok dipanggang/oven.", image: "asset:kentang", bestBeforeDays: 21, packaging: "Karung jaring 2 kg", weightPerUnit: "1 kg", storageInfo: "Tempat sejuk." },
    { name: "Singkong Mentega", category: "sayur", price: 8000, unit: "kg", stock: 50, description: "Singkong mentega lokal, empuk untuk direbus / digoreng.", image: "asset:kentang", bestBeforeDays: 7, packaging: "Karung 5 kg", weightPerUnit: "1 kg", storageInfo: "Tempat kering, segera olah dalam 1 minggu." },
    { name: "Talas Bogor", category: "sayur", price: 15000, unit: "kg", stock: 22, description: "Talas Bogor pulen, cocok kolak & keripik.", image: "asset:kentang", bestBeforeDays: 14, packaging: "Plastik 1 kg", weightPerUnit: "1 kg", storageInfo: "Tempat sejuk." },
    { name: "Buncis Muda", category: "sayur", price: 13000, unit: "kg", stock: 28, description: "Buncis muda renyah, biji belum terbentuk, manis alami.", image: "asset:bayam", bestBeforeDays: 7, certifications: ["Prima 3"], packaging: "Plastik 500 g", weightPerUnit: "500 g", storageInfo: "Kulkas." },
    { name: "Kacang Panjang", category: "sayur", price: 10000, unit: "ikat", stock: 35, description: "Kacang panjang segar 60-70 cm, untuk urap & sayur asem.", image: "asset:bayam", bestBeforeDays: 5, packaging: "Diikat rafia", weightPerUnit: "±300 g", storageInfo: "Kulkas." },
    { name: "Edamame Beku", category: "sayur", price: 32000, unit: "pack", stock: 25, description: "Edamame Jepang lokal, dipetik muda, langsung dibekukan.", image: "asset:bayam", bestBeforeDays: 180, certifications: ["GAP Sayuran"], packaging: "Pouch vakum 500 g, suhu beku -18°C", weightPerUnit: "500 g per pack", storageInfo: "Simpan di freezer." },
    { name: "Jagung Manis", category: "sayur", price: 9000, unit: "buah", stock: 60, description: "Jagung manis hibrida, biji penuh dan manis.", image: "asset:bayam", bestBeforeDays: 5, packaging: "Per buah dibungkus klobotnya sendiri", weightPerUnit: "±400 g per buah", storageInfo: "Kulkas, konsumsi 3 hari." },
    { name: "Tomat Cherry", category: "sayur", price: 28000, unit: "pack", stock: 20, description: "Tomat cherry merah-kuning campur, manis untuk salad.", image: "asset:tomat", bestBeforeDays: 10, certifications: ["Hidroponik Premium"], packaging: "Tray plastik food-grade 250 g", weightPerUnit: "250 g", storageInfo: "Suhu ruang sejuk." },
    { name: "Timun Jepang", category: "sayur", price: 18000, unit: "kg", stock: 22, description: "Timun jepang kulit halus, biji sedikit, renyah.", image: "asset:bayam", bestBeforeDays: 10, packaging: "Plastik 500 g", weightPerUnit: "500 g", storageInfo: "Kulkas." },
    { name: "Mentimun Lokal", category: "sayur", price: 8000, unit: "kg", stock: 40, description: "Mentimun lokal renyah, untuk lalapan & rujak.", image: "asset:bayam", bestBeforeDays: 7, packaging: "Karung jaring 1 kg", weightPerUnit: "1 kg", storageInfo: "Kulkas." },
  ];
  const sliced = templates.slice(0, 50);
  return sliced.map((t, i) => {
    const farmer = approvedFarmers[i % approvedFarmers.length];
    const harvestPlanned = t.preOrder ? dayAfter(3 + (i % 4)) : undefined;
    const harvestDate = t.preOrder ? undefined : i % 2 === 0 ? today : yest;
    return {
      id: `p_seed_extra_${i}`,
      farmerId: farmer.id,
      farmerName: farmer.name,
      farmLocation: farmer.cityLabel,
      farmCityId: farmer.cityId,
      name: t.name,
      category: t.category,
      price: t.price,
      unit: t.unit,
      stock: t.stock,
      description: t.description,
      image: t.image,
      rating: 4.5 + ((i * 7) % 5) * 0.1,
      sold: 10 + (i * 13) % 200,
      harvestDate,
      bestBeforeDays: t.bestBeforeDays,
      cultivationMethod: t.cultivationMethod ?? "Konvensional ramah lingkungan",
      certifications: t.certifications,
      origin: farmer.cityLabel,
      packaging: t.packaging,
      weightPerUnit: t.weightPerUnit,
      storageInfo: t.storageInfo,
      preOrder: t.preOrder,
      harvestPlannedDate: harvestPlanned,
    } satisfies Product;
  });
}