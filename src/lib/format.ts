export const rupiah = (n: number) =>
  "Rp " + Math.round(n).toLocaleString("id-ID");

// Format Rupiah untuk Voice Over (dibaca dengan benar)
export function rupiahSpoken(n: number): string {
  if (n === 0) return "nol rupiah";
  const angka = [
    "", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan"
  ];
  const levels = ["", "ribu", "juta", "miliar", "triliun"];
  
  function sebut(bil: number): string {
    if (bil === 0) return "";
    if (bil < 10) return angka[bil] + " ";
    if (bil < 20) {
      if (bil === 10) return "sepuluh ";
      if (bil === 11) return "sebelas ";
      return angka[bil % 10] + " belas ";
    }
    if (bil < 100) {
      return angka[Math.floor(bil / 10)] + " puluh " + sebut(bil % 10);
    }
    if (bil < 1000) {
      let s = bil < 200 ? "seratus " : angka[Math.floor(bil / 100)] + " ratus ";
      return s + sebut(bil % 100);
    }
    return "";
  }
  
  let sisa = n;
  let hasil = "";
  for (let i = levels.length - 1; i >= 0; i--) {
    const pangkat = Math.pow(1000, i);
    if (sisa >= pangkat) {
      const bagian = Math.floor(sisa / pangkat);
      if (bagian === 1 && i === 1) hasil += "seribu ";
      else hasil += sebut(bagian) + levels[i] + " ";
      sisa %= pangkat;
    }
  }
  
  return hasil.trim() + " rupiah";
}

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

// Ubah satuan ke bahasa Indonesia lisan untuk voice over
export function unitSpoken(unit: string): string {
  const map: Record<string, string> = {
    kg: "kilogram",
    gram: "gram",
    ons: "ons",
    liter: "liter",
    ml: "mililiter",
    ikat: "ikat",
    pack: "pak",
    bungkus: "bungkus",
    biji: "biji",
    butir: "butir",
    buah: "buah",
    karung: "karung",
    pohon: "pohon",
    tangkai: "tangkai",
    sisir: "sisir",
    kotak: "kotak",
    sak: "sak",
  };
  return map[unit.toLowerCase()] || unit;
}
