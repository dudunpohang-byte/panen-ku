import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, HelpCircle, MessageCircle, ShoppingBag, Sprout, CreditCard, Truck, ShieldCheck, ChevronDown } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/bantuan")({
  component: BantuanPage,
  head: () => ({
    meta: [
      { title: "Bantuan & FAQ — Panenku" },
      { name: "description", content: "Pusat bantuan dan pertanyaan umum aplikasi marketplace hasil pertanian Panenku." },
    ],
  }),
});

const FAQS = [
  {
    category: "Pembeli",
    icon: ShoppingBag,
    items: [
      {
        q: "Bagaimana cara memesan produk?",
        a: "Cari produk yang Anda inginkan, tambahkan ke keranjang, lalu lanjut ke checkout. Isi alamat pengiriman, pilih metode pembayaran, dan konfirmasi pesanan.",
      },
      {
        q: "Apakah pembayaran di Panenku aman?",
        a: "Ya. Pembayaran melalui Panenku menggunakan sistem rekber (rekening bersama). Dana Anda aman sampai pesanan diterima dan Anda konfirmasi selesai.",
      },
      {
        q: "Berapa lama pengiriman produk?",
        a: "Waktu pengiriman bervariasi tergantung lokasi petani dan tujuan. Biasanya 1–3 hari untuk wilayah yang sama. Anda bisa melacak status pengiriman di halaman Pesanan.",
      },
      {
        q: "Apa yang terjadi jika produk tidak sesuai?",
        a: "Anda bisa mengajukan komplain dalam waktu 24 jam setelah produk diterima. Tim Panenku akan meninjau dan membantu menyelesaikan sengketa.",
      },
    ],
  },
  {
    category: "Petani",
    icon: Sprout,
    items: [
      {
        q: "Bagaimana cara mulai berjualan?",
        a: "Daftar akun sebagai petani, isi data kebun dan lokasi, lalu unggah produk. Akun Anda akan diverifikasi oleh admin sebelum produk tampil ke pembeli.",
      },
      {
        q: "Bagaimana cara menarik dana penjualan?",
        a: "Masuk ke Dashboard Petani, pilih Tarik Dana, masukkan jumlah dan nomor rekening tujuan. Dana akan ditransfer dalam 1–3 hari kerja setelah pengajuan disetujui.",
      },
      {
        q: "Berapa biaya layanan untuk petani?",
        a: "Biaya layanan akan ditampilkan transparan di Dashboard Petani. Anda bisa melihat rincian biaya setiap transaksi sebelum menarik dana.",
      },
      {
        q: "Bolehkah menjual produk non-pertanian?",
        a: "Panenku khusus untuk hasil pertanian: sayur, buah, beras, rempah, dan produk olahan pertanian. Produk di luar kategori ini tidak diperbolehkan.",
      },
    ],
  },
  {
    category: "Pembayaran",
    icon: CreditCard,
    items: [
      {
        q: "Metode pembayaran apa saja yang tersedia?",
        a: "Saat ini Panenku mendukung transfer bank, e-wallet (GoPay, OVO, DANA), dan pembayaran tunai saat pengiriman untuk wilayah tertentu.",
      },
      {
        q: "Apakah ada biaya tambahan saat pembayaran?",
        a: "Biaya layanan sudah termasuk dalam harga produk. Tidak ada biaya tambahan tersembunyi untuk pembeli.",
      },
    ],
  },
  {
    category: "Pengiriman",
    icon: Truck,
    items: [
      {
        q: "Siapa yang mengirimkan pesanan?",
        a: "Pengiriman dilakukan oleh kurir yang bekerja sama dengan Panenku atau kurir independen yang terdaftar di platform kami.",
      },
      {
        q: "Apakah ada gratis ongkir?",
        a: "Ya, untuk pembelian minimal Rp 50.000 dalam radius tertentu. Informasi lengkap akan muncul saat checkout.",
      },
    ],
  },
  {
    category: "Akun & Keamanan",
    icon: ShieldCheck,
    items: [
      {
        q: "Saya lupa PIN, apa yang harus dilakukan?",
        a: "Saat ini Anda dapat menghubungi layanan bantuan Panenku untuk reset PIN. Fitur reset mandiri akan segera hadir.",
      },
      {
        q: "Bagaimana cara mengubah nomor telepon?",
        a: "Hubungi layanan bantuan Panenku untuk perubahan nomor telepon. Kami akan memverifikasi identitas Anda sebelum mengganti data.",
      },
      {
        q: "Apakah data saya aman?",
        a: "Ya. Kami menggunakan enkripsi modern dan tidak menjual data pengguna ke pihak manapun. Baca Kebijakan Privasi lengkap kami untuk detail lebih lanjut.",
      },
    ],
  },
];

function BantuanPage() {
  return (
    <MobileShell hideNav>
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center gap-2 bg-primary px-2 py-3 text-primary-foreground shadow-soft">
        <Link to="/akun" aria-label="Kembali" className="rounded-full p-2 hover:bg-white/15 active:scale-95 transition-transform">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-xl font-bold">Bantuan</h1>
      </header>

      <main className="p-4 space-y-4 page-transition">
        {/* Intro card */}
        <div className="rounded-2xl bg-card p-5 shadow-card text-center reveal is-visible">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-soft text-primary mb-3">
            <HelpCircle className="h-8 w-8" />
          </div>
          <h2 className="text-lg font-bold">Ada yang Bisa Kami Bantu?</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Temukan jawaban untuk pertanyaan umum seputar pembelian, penjualan, pembayaran, dan akun Anda di Panenku.
          </p>
        </div>

        {/* Quick contact */}
        <div className="reveal is-visible rounded-2xl gradient-primary p-4 text-white shadow-card">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20">
              <MessageCircle className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="font-bold">Butuh bantuan lebih lanjut?</p>
              <p className="text-sm opacity-90">Hubungi tim Panenku kapan saja</p>
            </div>
          <div className="flex gap-2">
            <a
              href="tel:+6281318182643"
              className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-primary shadow active:scale-95 transition-transform"
            >
              Telepon
            </a>
            <span className="rounded-xl bg-white/20 px-4 py-2 text-sm font-bold text-white shadow">
              +62 813-1818-2643
            </span>
          </div>
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {FAQS.map((section, sIdx) => (
            <div key={section.category} className="reveal is-visible" style={{ animationDelay: `${sIdx * 100}ms` }}>
              <div className="mb-2 flex items-center gap-2 px-1">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-soft text-primary">
                  <section.icon className="h-4 w-4" />
                </div>
                <h3 className="text-base font-bold">{section.category}</h3>
              </div>
              <Accordion type="multiple" className="space-y-2">
                {section.items.map((item, iIdx) => (
                  <AccordionItem
                    key={iIdx}
                    value={`${sIdx}-${iIdx}`}
                    className="rounded-2xl border bg-card shadow-card px-4 data-[state=open]:shadow-soft overflow-hidden"
                  >
                    <AccordionTrigger className="py-4 text-left text-[15px] font-semibold hover:no-underline [&>svg]:shrink-0">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="pb-4 text-[15px] leading-relaxed text-muted-foreground">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>

        {/* Legal links */}
        <div className="reveal is-visible flex items-center justify-center gap-4 py-4 text-sm text-muted-foreground">
          <Link to="/syarat" className="font-medium text-primary hover:underline">Syarat & Ketentuan</Link>
          <span>·</span>
          <Link to="/privasi" className="font-medium text-primary hover:underline">Kebijakan Privasi</Link>
        </div>
      </main>
    </MobileShell>
  );
}
