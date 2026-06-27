export const rupiah = (n: number) =>
  "Rp " + Math.round(n).toLocaleString("id-ID");

export const tanggalID = (iso: string) => {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return iso;
  }
};

export const waktuID = (iso: string) => {
  try {
    const d = new Date(iso);
    return d.toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
};

export const CATEGORIES: { id: string; name: string; emoji: string }[] = [
  { id: "sayur", name: "Sayur", emoji: "🥬" },
  { id: "buah", name: "Buah", emoji: "🍎" },
  { id: "cabai", name: "Cabai", emoji: "🌶️" },
  { id: "bawang", name: "Bawang", emoji: "🧅" },
  { id: "beras", name: "Beras", emoji: "🍚" },
  { id: "rempah", name: "Rempah", emoji: "🫚" },
  { id: "organik", name: "Organik", emoji: "🌱" },
  { id: "lainnya", name: "Lainnya", emoji: "🧺" },
];

export const ORDER_STATUS_LABEL: Record<string, string> = {
  menunggu_bayar: "Menunggu Bayar",
  dibayar: "Dibayar",
  disiapkan: "Disiapkan",
  dikirim: "Dikirim",
  selesai: "Selesai",
};
