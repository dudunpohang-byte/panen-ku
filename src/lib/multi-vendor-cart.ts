// Multi-Vendor Cart — group cart items by farmer
// Memungkinkan checkout dari banyak petani dalam 1 transaksi

import { getProducts, getUsers, getAdminSettings, type CartItem, type ShippingMethod } from "./store";
import { CITIES, distanceKm, getCity } from "./cities";

export interface VendorCartGroup {
  farmerId: string;
  farmerName: string;
  farmerLocation: string;
  farmerCityId?: string;
  farmCityId?: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  adminFee: number;
  total: number;
}

export interface MultiVendorCheckout {
  groups: VendorCartGroup[];
  globalSubtotal: number;
  globalShipping: number;
  globalAdminFee: number;
  globalTotal: number;
}

export function groupCartByFarmer(
  cartItems: CartItem[],
  buyerCityId?: string,
  shippingMethod: ShippingMethod = "antar_sendiri",
): MultiVendorCheckout {
  const products = getProducts();
  const settings = getAdminSettings();

  // Group items by farmerId
  const farmerMap = new Map<string, CartItem[]>();
  const farmerInfo = new Map<string, { farmerName: string; farmerLocation: string; farmCityId?: string }>();

  for (const ci of cartItems) {
    const product = products.find((p) => p.id === ci.productId);
    if (!product) continue;
    const fid = product.farmerId;
    if (!farmerMap.has(fid)) {
      farmerMap.set(fid, []);
      farmerInfo.set(fid, {
        farmerName: product.farmerName,
        farmerLocation: product.farmLocation,
        farmCityId: product.farmCityId,
      });
    }
    farmerMap.get(fid)!.push(ci);
  }

  const groups: VendorCartGroup[] = [];
  let globalSubtotal = 0;
  let globalShipping = 0;
  let globalAdminFee = 0;

  for (const [farmerId, items] of farmerMap.entries()) {
    const info = farmerInfo.get(farmerId)!;
    const subtotal = items.reduce((sum, ci) => {
      const product = products.find((p) => p.id === ci.productId);
      if (!product) return sum;
      const price = ci.priceOverride ?? product.price;
      return sum + price * ci.qty;
    }, 0);

    // Calculate shipping per vendor
    const buyer = getCity(buyerCityId);
    const farmer = getCity(info.farmCityId);
    const dist = buyer && farmer ? distanceKm(buyer, farmer) : 0;
    const baseFee = shippingMethod === "antar_sendiri" ? settings.ownDeliveryBaseFee : settings.thirdPartyBaseFee;
    const perKm = shippingMethod === "antar_sendiri" ? settings.ownDeliveryPerKm : settings.thirdPartyPerKm;
    const shipping = baseFee + dist * perKm;

    const adminFee = Math.round((subtotal * settings.adminFeePercent) / 100);
    const total = subtotal + shipping + adminFee;

    groups.push({
      farmerId,
      farmerName: info.farmerName,
      farmerLocation: info.farmerLocation,
      farmCityId: info.farmCityId,
      items,
      subtotal,
      shipping,
      adminFee,
      total,
    });

    globalSubtotal += subtotal;
    globalShipping += shipping;
    globalAdminFee += adminFee;
  }

  return {
    groups,
    globalSubtotal,
    globalShipping,
    globalAdminFee,
    globalTotal: globalSubtotal + globalShipping + globalAdminFee,
  };
}