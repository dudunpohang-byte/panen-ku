import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, FileText, Shield, Scale, Users, AlertTriangle } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";

export const Route = createFileRoute("/syarat")({
  component: SyaratPage,
  head: () => ({
    meta: [
      { title: "Syarat & Ketentuan — Panenku" },
      { name: "description", content: "Syarat dan ketentuan penggunaan aplikasi marketplace hasil pertanian Panenku." },
    ],
  }),
});

function SyaratPage() {
  return (
    <MobileShell hideNav>
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center gap-2 bg-primary px-2 py-3 text-primary-foreground shadow-soft">
        <Link to="/akun" aria-label="Kembali" className="rounded-full p-2 hover:bg-white/15 active:scale-95 transition-transform">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-xl font-bold">Syarat & Ketentuan</h1>
      </header>

      <main className="p-4 space-y-4 page-transition">
        {/* Intro card */}
        <div className="rounded-2xl bg-card p-5 shadow-card text-center reveal is-visible">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-soft text-primary mb-3">
            <Scale className="h-8 w-8" />
          </div>
          <h2 className="text-lg font-bold">Ketentuan Penggunaan Panenku</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Terakhir diperbarui: 1 Januari 2025
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Dengan menggunakan Panenku, Anda menyetujui seluruh syarat dan ketentuan di bawah ini. Mohon dibaca dengan saksama.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-3">
          <TermCard
            icon={Users}
            title="1. Pendaftaran Akun"
            content="Pengguna wajib mendaftar dengan data yang valid dan akurat. Petani yang ingin menjual produk harus melalui proses verifikasi oleh admin Panenku sebelum produk dapat ditampilkan ke pembeli."
            delay={1}
          />
          <TermCard
            icon={FileText}
            title="2. Produk & Transaksi"
            content="Petani bertanggung jawab penuh atas kualitas, ketersediaan, dan harga produk yang dijual. Pembeli wajib membayar sesuai total yang tertera sebelum pesanan diproses. Panenku hanya menjadi perantara pembayaran."
            delay={2}
          />
          <TermCard
            icon={Shield}
            title="3. Biaya Layanan"
            content="Panenku menetapkan biaya layanan yang jelas untuk setiap transaksi. Petani dapat menarik dana setelah pesanan selesai, dengan pengurangan biaya layanan yang telah disepakati."
            delay={3}
          />
          <TermCard
            icon={AlertTriangle}
            title="4. Larangan"
            content="Dilarang menjual produk ilegal, palsu, atau berbahaya. Dilarang memanipulasi ulasan, membuat akun ganda untuk tujuan kecurangan, atau menggunakan aplikasi untuk aktivitas melawan hukum."
            delay={4}
          />
          <TermCard
            icon={Scale}
            title="5. Sengketa & Pengembalian"
            content="Jika terjadi sengketa, pengguna dapat menghubungi layanan bantuan Panenku. Panenku berhak mengambil keputusan akhir berdasarkan bukti yang tersedia demi kepentingan bersama."
            delay={5}
          />
        </div>

        {/* Footer note */}
        <div className="rounded-2xl border border-border bg-muted/40 p-4 text-center text-sm text-muted-foreground mt-4">
          Jika ada pertanyaan, hubungi kami di halaman{" "}
          <Link to="/bantuan" className="font-semibold text-primary">Bantuan</Link>.
        </div>
      </main>
    </MobileShell>
  );
}

function TermCard({
  icon: Icon,
  title,
  content,
  delay,
}: {
  icon: typeof FileText;
  title: string;
  content: string;
  delay: number;
}) {
  return (
    <div
      className="reveal is-visible rounded-2xl bg-card p-4 shadow-card"
      style={{ animationDelay: `${delay * 80}ms` }}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="text-base font-bold">{title}</h3>
      </div>
      <p className="text-[15px] leading-relaxed text-muted-foreground pl-[52px]">
        {content}
      </p>
    </div>
  );
}
