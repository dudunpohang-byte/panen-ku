// SMS Gateway (Twilio) — localStorage stub
// Setup: npm install twilio
// Di server/.env: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE

export type SMSMessage = {
  to: string;
  body: string;
};

export async function sendSMS(message: SMSMessage): Promise<{ success: boolean; sid?: string; error?: string }> {
  // Simulasi: simpan ke localStorage untuk development
  if (typeof window !== "undefined") {
    const smsLog = (() => {
      try {
        const raw = localStorage.getItem("panenku.sms_log");
        return raw ? (JSON.parse(raw) as SMSMessage[]) : [];
      } catch {
        return [];
      }
    })();
    smsLog.push(message);
    localStorage.setItem("panenku.sms_log", JSON.stringify(smsLog));
    return { success: true, sid: `sim_${Date.now()}` };
  }
  return { success: false, error: "Server only" };
}

export async function sendOrderNotification(
  buyerPhone: string,
  trackingCode: string,
  farmerName: string,
  total: number,
): Promise<boolean> {
  const body = `Pesanan Anda telah dikonfirmasi!\n\nKode Tracking: ${trackingCode}\nPetani: ${farmerName}\nTotal: Rp${total.toLocaleString("id-ID")}\n\nLihat detail: https://panenku.app/pesanan/${trackingCode}`;
  return (await sendSMS({ to: buyerPhone, body })).success;
}

export const formatPhoneNumber = (phone: string): string => {
  // Format ke format internasional (Indonesia)
  if (phone.startsWith("+62")) return phone;
  if (phone.startsWith("0")) return "+62" + phone.slice(1);
  return phone;
};