// Invoice helper — generate printable HTML invoice and trigger print/share.
// No external library: uses a hidden iframe + window.print() for PDF "Save as PDF".
// Web Share API is used when supported to share a text summary.

import type { Order } from "./store";
import { ORDER_STATUS_LABEL, rupiah, tanggalID, waktuID } from "./format";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildInvoiceHTML(order: Order): string {
  const itemsRows = order.items
    .map(
      (it) => `
      <tr>
        <td>${escapeHtml(it.productName)}<div class="muted">Petani: ${escapeHtml(it.farmerName)}</div>${
          it.preOrder
            ? `<div class="po">🌱 PRE-ORDER · panen ${escapeHtml(it.harvestPlannedDate ? tanggalID(it.harvestPlannedDate) : "menyusul")}</div>`
            : ""
        }</td>
        <td class="num">${it.qty}</td>
        <td class="num">${rupiah(it.price)}</td>
        <td class="num">${rupiah(it.price * it.qty)}</td>
      </tr>`,
    )
    .join("");

  // Cari tanggal panen terjauh untuk estimasi pengiriman
  const preOrderItems = order.items.filter((it) => it.preOrder && it.harvestPlannedDate);
  const latestHarvest = preOrderItems
    .map((it) => it.harvestPlannedDate!)
    .sort()
    .at(-1);
  const preOrderBanner = latestHarvest
    ? `<div class="po-banner">🌱 <strong>Pesanan Pre-Order</strong> — pengiriman dimulai setelah panen <strong>${escapeHtml(tanggalID(latestHarvest))}</strong>.</div>`
    : "";

  const shippingLabel =
    order.shippingMethod === "antar_sendiri"
      ? "Diantar oleh Petani"
      : "Jasa Kirim";

  const paymentLabel =
    order.paymentMethod === "qris"
      ? "QRIS"
      : order.paymentMethod === "transfer"
        ? "Transfer Bank"
        : "Bayar di Tempat (COD)";

  // Payload QR untuk verifikasi kurir: kompak & mudah dibaca scanner.
  const qrPayload = JSON.stringify({
    id: order.id,
    buyer: order.buyerName,
    phone: order.buyerPhone,
    total: order.total,
    items: order.items.length,
    date: order.createdAt,
  });
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=4&data=${encodeURIComponent(qrPayload)}`;

  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8" />
<title>Invoice ${escapeHtml(order.id)}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #111; margin: 0; padding: 24px; background: #fff; }
  .wrap { max-width: 720px; margin: 0 auto; }
  .head { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #16a34a; padding-bottom: 12px; }
  .brand { font-size: 28px; font-weight: 800; color: #16a34a; letter-spacing: -0.5px; }
  .brand small { display: block; font-size: 12px; color: #6b7280; font-weight: 500; letter-spacing: 0; }
  .meta { text-align: right; font-size: 13px; color: #374151; }
  .meta strong { display: block; font-size: 16px; color: #111; }
  h2 { font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; margin: 18px 0 6px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; font-size: 13px; }
  table { width: 100%; border-collapse: collapse; margin-top: 6px; }
  th, td { text-align: left; padding: 10px 8px; border-bottom: 1px solid #e5e7eb; font-size: 13px; vertical-align: top; }
  th { background: #f3f4f6; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; color: #374151; }
  .num { text-align: right; white-space: nowrap; }
  .muted { color: #6b7280; font-size: 11px; margin-top: 2px; }
  .totals { margin-top: 12px; margin-left: auto; width: 280px; font-size: 13px; }
  .totals .row { display: flex; justify-content: space-between; padding: 4px 0; }
  .totals .grand { border-top: 2px solid #111; margin-top: 6px; padding-top: 8px; font-size: 16px; font-weight: 800; color: #16a34a; }
  .badge { display: inline-block; padding: 4px 10px; border-radius: 999px; background: #dcfce7; color: #166534; font-size: 12px; font-weight: 700; }
  .po { display: inline-block; margin-top: 4px; padding: 2px 8px; border-radius: 999px; background: #dcfce7; color: #166534; font-size: 10px; font-weight: 700; letter-spacing: 0.3px; }
  .po-banner { margin-top: 14px; padding: 10px 12px; border: 1.5px dashed #16a34a; background: #f0fdf4; color: #166534; border-radius: 8px; font-size: 13px; }
  .footer { margin-top: 24px; text-align: center; font-size: 11px; color: #6b7280; border-top: 1px dashed #e5e7eb; padding-top: 12px; }
  @media print { body { padding: 0; } .no-print { display: none; } }
</style>
</head>
<body>
  <div class="wrap">
    <div class="head">
      <div>
        <div class="brand">🌱 Panenku<small>Marketplace Petani &amp; Pembeli</small></div>
      </div>
      <div class="meta">
        <strong>INVOICE</strong>
        #${escapeHtml(order.id)}<br/>
        ${escapeHtml(waktuID(order.createdAt))}<br/>
        <span class="badge">${escapeHtml(ORDER_STATUS_LABEL[order.status] ?? order.status)}</span>
      </div>
    </div>

    <div class="grid" style="margin-top:16px; grid-template-columns: 1fr 1fr 200px;">
      <div class="box">
        <h2 style="margin:0 0 6px;">Pembeli</h2>
        <strong>${escapeHtml(order.buyerName)}</strong><br/>
        ${escapeHtml(order.buyerPhone)}<br/>
        ${escapeHtml(order.address)}
      </div>
      <div class="box">
        <h2 style="margin:0 0 6px;">Pengiriman</h2>
        <strong>${escapeHtml(shippingLabel)}</strong><br/>
        <strong>Bayar: ${escapeHtml(paymentLabel)}</strong><br/>
        Jarak: ${order.distanceKm ?? 0} km<br/>
        Tanggal: ${escapeHtml(tanggalID(order.createdAt))}
      </div>
      <div class="box" style="text-align:center; padding:8px;">
        <h2 style="margin:0 0 4px;">Verifikasi Kurir</h2>
        <img src="${qrUrl}" alt="QR ${escapeHtml(order.id)}" width="160" height="160" style="display:block; margin:4px auto; max-width:100%;" />
        <div style="font-family: ui-monospace, Menlo, monospace; font-size:11px; color:#374151; word-break:break-all;">${escapeHtml(order.id)}</div>
      </div>
    </div>

    <h2>Rincian Produk</h2>
    <table>
      <thead>
        <tr><th>Produk</th><th class="num">Qty</th><th class="num">Harga</th><th class="num">Subtotal</th></tr>
      </thead>
      <tbody>${itemsRows}</tbody>
    </table>
    ${preOrderBanner}

    <div class="totals">
      <div class="row"><span>Subtotal</span><span>${rupiah(order.subtotal)}</span></div>
      <div class="row"><span>Ongkir</span><span>${order.shipping === 0 ? "GRATIS" : rupiah(order.shipping)}</span></div>
      <div class="row"><span>Biaya Layanan</span><span>${rupiah(order.adminFee)}</span></div>
      <div class="row grand"><span>TOTAL</span><span>${rupiah(order.total)}</span></div>
    </div>

    <div class="footer">
      Terima kasih telah berbelanja di Panenku — mendukung petani Indonesia 🇮🇩<br/>
      Invoice ini dibuat otomatis dan sah tanpa tanda tangan.
    </div>
  </div>
  <script>
    // Auto trigger print dialog when opened standalone
    window.addEventListener("load", function() {
      setTimeout(function() { try { window.focus(); window.print(); } catch(e){} }, 250);
    });
  </script>
</body>
</html>`;
}

/** Open invoice in a new tab and trigger print (user can "Save as PDF"). */
export function printInvoice(order: Order) {
  const html = buildInvoiceHTML(order);
  const win = window.open("", "_blank", "width=820,height=900");
  if (!win) {
    // Fallback: create blob URL and navigate
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.location.href = url;
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
}

/** Share invoice as text summary using Web Share API; fallback to clipboard. */
export async function shareInvoice(order: Order): Promise<"shared" | "copied" | "unsupported"> {
  const lines = [
    `🧾 Invoice Panenku #${order.id}`,
    `Tanggal: ${waktuID(order.createdAt)}`,
    `Status: ${ORDER_STATUS_LABEL[order.status] ?? order.status}`,
    "",
    "Produk:",
    ...order.items.map((it) => `• ${it.qty} × ${it.productName} — ${rupiah(it.price * it.qty)}`),
    "",
    `Subtotal: ${rupiah(order.subtotal)}`,
    `Ongkir: ${order.shipping === 0 ? "GRATIS" : rupiah(order.shipping)}`,
    `Biaya Layanan: ${rupiah(order.adminFee)}`,
    `TOTAL: ${rupiah(order.total)}`,
    "",
    `Pembeli: ${order.buyerName} (${order.buyerPhone})`,
    `Alamat: ${order.address}`,
  ];
  const text = lines.join("\n");

  try {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      await (navigator as Navigator & { share: (d: ShareData) => Promise<void> }).share({
        title: `Invoice Panenku #${order.id}`,
        text,
      });
      return "shared";
    }
  } catch {
    // user cancelled or failed — fall through to clipboard
  }
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return "copied";
    }
  } catch {
    // ignore
  }
  return "unsupported";
}
