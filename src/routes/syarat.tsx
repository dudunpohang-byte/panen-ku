import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/syarat")({
  component: TermsOfService,
});

function TermsOfService() {
  return (
    <MobileShell hideNav>
      <Header title="Syarat & Ketentuan" />
      <div className="p-4 space-y-4 text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-bold mb-2">1. Penerimaan Ketentuan</h2>
          <p>Dengan menggunakan aplikasi Panenku, Anda menyetujui syarat dan ketentuan berikut. Jika Anda tidak setuju, jangan gunakan aplikasi ini.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">2. Definisi</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Panenku</strong> — Platform marketplace untuk hasil pertanian</li>
            <li><strong>Pembeli</strong> — Pengguna yang membeli produk</li>
            <li><strong>Petani</strong> — Pengguna yang menjual produk</li>
            <li><strong>Admin</strong> — Pengelola platform Panenku</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">3. Kewajiban Pengguna</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Memberikan data yang benar dan akurat</li>
            <li>Menjaga kerahasiaan akun dan PIN</li>
            <li>Tidak melakukan penipuan atau penyalahgunaan</li>
            <li>Mematuhi hukum yang berlaku</li>
            <li>Bertanggung jawab atas setiap transaksi</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">4. Transaksi & Pembayaran</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Pembayaran dilakukan melalui metode yang tersedia (QRIS, Transfer, COD)</li>
            <li>Biaya admin dikenakan sesuai kebijakan yang berlaku</li>
            <li>Pesanan dapat dibatalkan sebelum diproses</li>
            <li>Pengembalian dana sesuai kebijakan retur</li>
            <li>Petani wajib menyediakan produk sesuai deskripsi</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">5. Biaya & Komisi</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Admin fee: Hybrid (Rp1.500 + Rp250/kg) atau sesuai pengaturan</li>
            <li>Diskon admin menjadi beban admin</li>
            <li>Diskon petani menjadi beban petani</li>
            <li>Biaya pengiriman ditanggung pembeli</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">6. Hak Kekayaan Intelektual</h2>
          <p>Seluruh konten dalam aplikasi Panenku dilindungi hak cipta. Pengguna tidak diperbolehkan menyalin, mendistribusikan, atau memodifikasi konten tanpa izin.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">7. Batasan Tanggung Jawab</h2>
          <p>Panenku tidak bertanggung jawab atas:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Kualitas produk yang tidak sesuai deskripsi (tanggung jawab petani)</li>
            <li>Keterlambatan pengiriman (tanggung jawab kurir/petani)</li>
            <li>Kerugian akibat force majeure</li>
            <li>Data yang hilang karena tindakan pengguna</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">8. Penghentian Layanan</h2>
          <p>Panenku berhak menghentikan atau menangguhkan akses pengguna yang melanggar ketentuan ini tanpa pemberitahuan terlebih dahulu.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">9. Perubahan Ketentuan</h2>
          <p>Ketentuan ini dapat berubah sewaktu-waktu. Pengguna akan diberitahu melalui aplikasi. Penggunaan lanjutan setelah perubahan dianggap menyetujui ketentuan baru.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">10. Hukum yang Berlaku</h2>
          <p>Ketentuan ini diatur oleh hukum Indonesia. Segala sengketa akan diselesaikan melalui musyawarah atau pengadilan yang berwenang.</p>
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