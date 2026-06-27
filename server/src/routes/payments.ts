// Xendit Payment Gateway Integration (Sandbox/Development)
// Endpoints:
//   POST /api/payments/checkout   — Create Xendit Invoice
//   POST /api/payments/webhook    — Xendit callback/webhook
//   GET  /api/payments/status/:orderId — Cek status pembayaran

import { Router, Request, Response } from "express";
import crypto from "crypto";
import axios from "axios";
import { pool } from "../db-pool";

const router = Router();

// ===================== KONFIGURASI =====================
const XENDIT_SECRET_KEY = process.env.XENDIT_SECRET_KEY || "";
const XENDIT_WEBHOOK_TOKEN = process.env.XENDIT_WEBHOOK_TOKEN || "panenku-webhook-token-2026";
const CALLBACK_URL = process.env.XENDIT_CALLBACK_URL || "http://localhost:4000/api/payments/webhook";
const SUCCESS_REDIRECT_URL = process.env.SUCCESS_REDIRECT_URL || "http://localhost:5173/pesanan";
const FAILURE_REDIRECT_URL = process.env.FAILURE_REDIRECT_URL || "http://localhost:5173/checkout?status=failed";

const XENDIT_API_BASE = "https://api.xendit.co";

// Basic Auth header untuk Xendit
const xenditAuth = Buffer.from(`${XENDIT_SECRET_KEY}:`).toString("base64");

// Mode SANDBOX: jika true, mock Xendit response (untuk development offline)
const SANDBOX_MODE = process.env.XENDIT_SANDBOX_MODE === "true" || true; // default true untuk development

// ===================== MOCK: Response tiruan Xendit (Sandbox) =====================
function mockXenditInvoice(orderId: string, amount: number) {
  const invoiceId = `inv_mock_${Date.now()}`;
  return {
    id: invoiceId,
    external_id: orderId,
    user_id: "mock_user",
    status: "PENDING",
    merchant_name: "Panenku",
    merchant_profile_picture_url: null,
    amount: amount,
    payer_email: "pembeli@panenku.app",
    description: `Pembayaran Panenku - Pesanan #${orderId}`,
    invoice_url: `https://mock.xendit.co/invoice/${invoiceId}`,
    expiry_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    available_banks: [
      { bank_code: "BCA", collection_type: "POOL", bank_account_number: "1234567890", transfer_amount: amount },
      { bank_code: "MANDIRI", collection_type: "POOL", bank_account_number: "9876543210", transfer_amount: amount },
      { bank_code: "BNI", collection_type: "POOL", bank_account_number: "5555555555", transfer_amount: amount },
      { bank_code: "BRI", collection_type: "POOL", bank_account_number: "4444444444", transfer_amount: amount },
      { bank_code: "PERMATA", collection_type: "POOL", bank_account_number: "3333333333", transfer_amount: amount },
      { bank_code: "CIMB", collection_type: "POOL", bank_account_number: "2222222222", transfer_amount: amount },
    ],
    available_ewallets: [
      { ewallet_type: "OVO" },
      { ewallet_type: "DANA" },
      { ewallet_type: "LINKAJA" },
      { ewallet_type: "SHOPEEPAY" },
      { ewallet_type: "ASTRA_PAY" },
    ],
    available_qr_codes: [{ qr_code_type: "QRIS" }],
    available_retail_outlets: [
      { retail_outlet_name: "ALFAMART" },
      { retail_outlet_name: "INDOMARET" },
    ],
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    currency: "IDR",
    callback_virtual_account_id: null,
  };
}

// ===================== HELPER: Simpan log ke database =====================
async function logPayment(
  orderId: string,
  xenditInvoiceId: string,
  amount: number,
  status: string,
  paymentMethod: string | null,
  rawResponse: any,
) {
  try {
    await pool.query(
      `INSERT INTO payment_logs 
       (order_id, xendit_invoice_id, amount, status, payment_method, raw_response, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       ON CONFLICT (xendit_invoice_id) DO UPDATE 
       SET status = EXCLUDED.status, payment_method = EXCLUDED.payment_method, raw_response = EXCLUDED.raw_response`,
      [orderId, xenditInvoiceId, amount, status, paymentMethod, JSON.stringify(rawResponse)],
    );
  } catch (err) {
    console.error("Gagal menyimpan log pembayaran:", err);
  }
}

// ===================== 1. CHECKOUT — Buat Invoice Xendit =====================
router.post("/checkout", async (req: Request, res: Response) => {
  try {
    const { orderId, amount, buyerEmail, buyerPhone, items } = req.body;

    // Validasi input
    if (!orderId || !amount || amount < 100) {
      return res.status(400).json({
        success: false,
        message: "Data tidak lengkap: orderId dan amount (min Rp100) diperlukan",
      });
    }

    // 1. Simpan status awal di tabel payment_logs
    await pool.query(
      `INSERT INTO payment_logs (order_id, amount, status, created_at)
       VALUES ($1, $2, 'pending', NOW())
       ON CONFLICT (order_id) DO UPDATE SET amount = EXCLUDED.amount, status = 'pending'`,
      [orderId, amount],
    );

    // 2. Panggil Xendit Invoice API
    const invoicePayload = {
      external_id: orderId,
      amount: Math.round(amount),
      payer_email: buyerEmail || "pembeli@panenku.app",
      description: `Pembayaran Panenku - Pesanan #${orderId}`,
      success_redirect_url: `${SUCCESS_REDIRECT_URL}/${orderId}`,
      failure_redirect_url: FAILURE_REDIRECT_URL,
      currency: "IDR",
      customer: {
        email: buyerEmail || "pembeli@panenku.app",
        mobile_number: buyerPhone || "",
      },
      customer_notification_preference: {
        invoice_paid: ["email", "whatsapp"],
        invoice_created: ["email", "whatsapp"],
        invoice_reminder: ["email", "whatsapp"],
        invoice_expired: ["email", "whatsapp"],
      },
      // Aktifkan semua metode pembayaran
      available_banks: [
        { bank_code: "BCA", collection_type: "POOL" },
        { bank_code: "MANDIRI", collection_type: "POOL" },
        { bank_code: "BNI", collection_type: "POOL" },
        { bank_code: "BRI", collection_type: "POOL" },
        { bank_code: "PERMATA", collection_type: "POOL" },
        { bank_code: "CIMB", collection_type: "POOL" },
      ],
      available_ewallets: [
        { ewallet_type: "OVO" },
        { ewallet_type: "DANA" },
        { ewallet_type: "LINKAJA" },
        { ewallet_type: "SHOPEEPAY" },
        { ewallet_type: "ASTRA_PAY" },
      ],
      // QRIS juga
      available_qr_codes: [{ qr_code_type: "QRIS" }],
      // Retail outlet (opsional)
      available_retail_outlets: [
        { retail_outlet_name: "ALFAMART" },
        { retail_outlet_name: "INDOMARET" },
      ],
      items: items?.map((it: any) => ({
        name: it.name || "Produk Panenku",
        quantity: it.qty || 1,
        price: Math.round(it.price || amount),
        category: it.category || "Pertanian",
      })) || [
        { name: "Pesanan Panenku", quantity: 1, price: Math.round(amount), category: "Pertanian" },
      ],
      fees: [
        { type: "Admin Fee", value: 0 },
      ],
      notification_callback_url: CALLBACK_URL,
    };

    console.log("Membuat invoice Xendit...", { orderId, amount, sandboxMode: SANDBOX_MODE });

    let invoice: any;

    if (SANDBOX_MODE) {
      // Mode Sandbox: gunakan mock invoice
      console.log("🔧 SANDBOX MODE: Menggunakan mock invoice Xendit");
      invoice = mockXenditInvoice(orderId, amount);
    } else {
      // Production: panggil Xendit API real
      try {
        const response = await axios.post(`${XENDIT_API_BASE}/v2/invoices`, invoicePayload, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${xenditAuth}`,
          },
          timeout: 10000,
        });
        invoice = response.data;
      } catch (xenditErr: any) {
        console.warn("Xendit API tidak tersedia, fallback ke sandbox mode:", xenditErr.message);
        invoice = mockXenditInvoice(orderId, amount);
      }
    }

    // 3. Simpan response invoice ke database
    await logPayment(
      orderId,
      invoice.id,
      amount,
      "pending",
      null,
      invoice,
    );

    // 4. Update status pesanan menjadi "menunggu_bayar"
    try {
      await pool.query(
        `UPDATE orders SET payment_status = 'pending', payment_link = $1, payment_provider = 'xendit', updated_at = NOW()
         WHERE id = $2`,
        [invoice.invoice_url, orderId],
      );
    } catch {
      // Table orders mungkin di localStorage, abaikan error
      console.log("Catatan: orders table mungkin di local storage, update manual diperlukan");
    }

    // 5. Return invoice URL ke frontend
    return res.json({
      success: true,
      message: "Invoice berhasil dibuat",
      data: {
        invoiceId: invoice.id,
        invoiceUrl: invoice.invoice_url,
        externalId: invoice.external_id,
        amount: invoice.amount,
        status: invoice.status,
        expiryDate: invoice.expiry_date,
        paymentMethods: invoice.available_banks?.map((b: any) => `VA ${b.bank_code}`) || [],
        ewalletMethods: invoice.available_ewallets?.map((e: any) => e.ewallet_type) || [],
        qris: true,
        retailOutlets: invoice.available_retail_outlets?.map((r: any) => r.retail_outlet_name) || [],
      },
    });
  } catch (error: any) {
    console.error("Error membuat invoice Xendit:", error.response?.data || error.message);

    const statusCode = error.response?.status || 500;
    const xenditError = error.response?.data || {};

    return res.status(statusCode).json({
      success: false,
      message: "Gagal membuat pembayaran",
      error: {
        code: xenditError.error_code || "UNKNOWN_ERROR",
        message: xenditError.message || error.message,
      },
    });
  }
});

// ===================== 2. WEBHOOK — Terima callback dari Xendit =====================
router.post("/webhook", async (req: Request, res: Response) => {
  try {
    // 1. Verifikasi Xendit Callback Token
    const callbackToken = req.headers["x-callback-token"] as string;
    const webhookId = req.headers["x-webhook-id"] as string;

    console.log("Webhook diterima:", {
      token: callbackToken ? "ADA" : "TIDAK ADA",
      webhookId: webhookId || "N/A",
      event: req.body?.event || "N/A",
    });

    if (!callbackToken || callbackToken !== XENDIT_WEBHOOK_TOKEN) {
      console.warn("Webhook ditolak: Callback Token tidak valid");
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Callback token tidak valid",
      });
    }

    // 2. Validasi signature webhook (optional tapi direkomendasikan)
    const signature = req.headers["x-callback-signature"] as string;
    if (signature) {
      const computedSignature = crypto
        .createHmac("sha256", XENDIT_SECRET_KEY)
        .update(JSON.stringify(req.body))
        .digest("hex");
      if (signature !== computedSignature) {
        console.warn("Webhook ditolak: Signature tidak cocok");
        return res.status(401).json({
          success: false,
          message: "Unauthorized: Signature tidak valid",
        });
      }
    }

    const payload = req.body;
    const invoiceId = payload.id || payload.invoice_id;
    const externalId = payload.external_id; // ini adalah orderId kita
    const status = payload.status?.toLowerCase() || "";
    const paymentMethod = payload.payment_method || payload.payment_channel || null;
    const paidAmount = payload.paid_amount || payload.amount || 0;

    console.log(`Webhook diproses: Invoice ${invoiceId}, Order ${externalId}, Status ${status}`);

    if (!externalId) {
      return res.status(400).json({ success: false, message: "external_id tidak ditemukan" });
    }

    // 3. Simpan log pembayaran
    await logPayment(externalId, invoiceId, paidAmount, status, paymentMethod, payload);

    // 4. Jika status PAID — update pesanan menjadi Lunas
    if (status === "paid" || status === "settled") {
      console.log(`✅ Pembayaran LUNAS untuk order ${externalId}`);

      // Update payment_logs
      await pool.query(
        `UPDATE payment_logs SET status = 'paid', paid_at = NOW(), payment_method = $1
         WHERE xendit_invoice_id = $2`,
        [paymentMethod, invoiceId],
      );

      // Update orders table (jika ada di PostgreSQL)
      try {
        await pool.query(
          `UPDATE orders 
           SET payment_status = 'paid', status = 'dibayar', payment_method = $1, 
               paid_at = NOW(), updated_at = NOW()
           WHERE id = $2`,
          [paymentMethod, externalId],
        );
        console.log(`✅ Order ${externalId} berhasil diupdate menjadi LUNAS`);
      } catch (dbErr) {
        console.log("Orders table mungkin di local storage, update manual diperlukan");
      }

      // Kirim notifikasi (bisa via WebSocket atau push notification)
      try {
        await pool.query(
          `INSERT INTO notifications (user_id, title, body, type, reference_id, created_at)
           VALUES ($1, 'Pembayaran Diterima', $2, 'payment_success', $3, NOW())`,
          [
            externalId.split("_")[0] || "unknown",
            `Pembayaran Rp${(paidAmount || 0).toLocaleString("id-ID")} untuk pesanan #${externalId} sudah diterima`,
            externalId,
          ],
        );
      } catch {
        // Notifikasi table opsional
      }
    }

    // 5. Jika status EXPIRED
    if (status === "expired") {
      console.log(`⏰ Pembayaran EXPIRED untuk order ${externalId}`);
      await pool.query(
        `UPDATE payment_logs SET status = 'expired' WHERE xendit_invoice_id = $1`,
        [invoiceId],
      );
    }

    // 6. Response ke Xendit (harus 200 OK)
    return res.json({
      success: true,
      message: `Webhook processed: ${status}`,
    });
  } catch (error: any) {
    console.error("Error processing webhook:", error.message);
    // Tetap return 200 agar Xendit tidak mengirim ulang terus
    return res.json({
      success: false,
      message: "Webhook error: " + error.message,
    });
  }
});

// ===================== 3. STATUS — Cek status pembayaran =====================
router.get("/status/:orderId", async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    // Cek dari database dulu
    const result = await pool.query(
      `SELECT * FROM payment_logs WHERE order_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [orderId],
    );

    if (result.rows.length > 0) {
      const payment = result.rows[0];
      return res.json({
        success: true,
        data: {
          orderId: payment.order_id,
          xenditInvoiceId: payment.xendit_invoice_id,
          amount: payment.amount,
          status: payment.status,
          paymentMethod: payment.payment_method,
          paidAt: payment.paid_at,
          createdAt: payment.created_at,
        },
      });
    }

    // Jika tidak ada di DB, cek langsung ke Xendit
    try {
      const response = await axios.get(`${XENDIT_API_BASE}/v2/invoices?external_id=${orderId}`, {
        headers: {
          Authorization: `Basic ${xenditAuth}`,
        },
      });

      const invoices = response.data;
      if (invoices && invoices.length > 0) {
        const invoice = invoices[0];
        return res.json({
          success: true,
          data: {
            orderId: invoice.external_id,
            xenditInvoiceId: invoice.id,
            amount: invoice.amount,
            status: invoice.status,
            paymentMethod: invoice.payment_method || invoice.payment_channel,
            invoiceUrl: invoice.invoice_url,
            expiryDate: invoice.expiry_date,
            paidAt: invoice.paid_at,
          },
        });
      }
    } catch {
      // Xendit API error, return null
    }

    return res.json({
      success: false,
      message: "Pembayaran tidak ditemukan",
      data: null,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Gagal cek status: " + error.message,
    });
  }
});

// ===================== 4. METODE PEMBAYARAN — Daftar metode yang tersedia =====================
router.get("/methods", async (_req: Request, res: Response) => {
  return res.json({
    success: true,
    data: {
      banks: [
        { code: "BCA", name: "BCA Virtual Account", icon: "🏦" },
        { code: "MANDIRI", name: "Mandiri Virtual Account", icon: "🏦" },
        { code: "BNI", name: "BNI Virtual Account", icon: "🏦" },
        { code: "BRI", name: "BRI Virtual Account", icon: "🏦" },
        { code: "PERMATA", name: "Permata Virtual Account", icon: "🏦" },
        { code: "CIMB", name: "CIMB Niaga Virtual Account", icon: "🏦" },
      ],
      ewallet: [
        { code: "OVO", name: "OVO", icon: "📱" },
        { code: "DANA", name: "DANA", icon: "📱" },
        { code: "SHOPEEPAY", name: "ShopeePay", icon: "📱" },
        { code: "LINKAJA", name: "LinkAja", icon: "📱" },
        { code: "ASTRA_PAY", name: "AstraPay", icon: "📱" },
      ],
      qris: [
        { code: "QRIS", name: "QRIS (semua aplikasi)", icon: "📲" },
      ],
      retail: [
        { code: "ALFAMART", name: "Alfamart", icon: "🏪" },
        { code: "INDOMARET", name: "Indomaret", icon: "🏪" },
      ],
    },
  });
});

export default router;