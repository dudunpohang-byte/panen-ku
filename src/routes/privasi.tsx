import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/privasi")({
  component: PrivacyPolicy,
});

function PrivacyPolicy() {
  return (
    <MobileShell hideNav>
      <Header title="Kebijakan Privasi" />
      <div className="p-4 space-y-4 text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-bold mb-2">1. Informasi yang Kami Kumpulkan</h2>
          <p>Panenku mengumpulkan informasi berikut saat Anda menggunakan aplikasi:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Nama lengkap dan nomor telepon</li>
            <li>Alamat pengiriman</li>
            <li>Data lokasi (kota/kabupaten) untuk kalkulasi ongkir</li>
            <li>Riwayat pesanan dan preferensi belanja</li>
            <li>Informasi perangkat dan browser</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">2. Penggunaan Informasi</h2>
          <p>Informasi Anda digunakan untuk:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Memproses dan mengirimkan pesanan</li>
            <li>Menghitung biaya pengiriman</li>
            <li>Memberikan notifikasi status pesanan</li>
            <li>Meningkatkan kualitas layanan</li>
            <li>Customer support</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">3. Keamanan Data</h2>
          <p>Kami melindungi data Anda dengan:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Enkripsi data dalam penyimpanan lokal</li>
            <li>Koneksi HTTPS untuk semua komunikasi</li>
            <li>Akses terbatas berdasarkan peran (buyer/farmer/admin)</li>
            <li>Tidak membagikan data pribadi ke pihak ketiga tanpa izin</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">4. Penyimpanan Lokal</h2>
          <p>Aplikasi Panenku menyimpan data di localStorage browser Anda untuk pengalaman offline. Data ini meliputi: profil pengguna, keranjang belanja, dan riwayat pesanan. Anda dapat menghapus data ini kapan saja melalui pengaturan browser.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">5. Cookie & Tracking</h2>
          <p>Kami tidak menggunakan cookie tracking pihak ketiga. Data sesi disimpan untuk pengalaman login yang lebih baik.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">6. Hak Anda</h2>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Mengakses data pribadi Anda</li>
            <li>Memperbaiki data yang tidak akurat</li>
            <li>Menghapus akun dan data Anda</li>
            <li>Menolak pengumpulan data tertentu</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">7. Kontak</h2>
          <p>Jika ada pertanyaan tentang kebijakan privasi, hubungi kami di:</p>
          <p className="mt-1 font-semibold">Email: support@panenku.app</p>
          <p className="font-semibold">WhatsApp: +62 812-0000-0001</p>
        </section>

        <p className="mt-6 text-xs text-muted-foreground">Terakhir diperbarui: 22 Juni 2026</p>
      </div>
    </MobileShell>
  );
}

function Header({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-30 flex items-center gap-2 bg-primary px-2 py-3 text-primary-foreground">
      <Link to="/" aria-label="Beranda" className="rounded-full p-2 hover:bg-white/15">
        <ArrowLeft className="h-6 w-6" />
      </Link>
      <h1 className="text-xl font-bold">{title}</h1>
    </header>
  );
}