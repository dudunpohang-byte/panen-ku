import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ShieldCheck, Lock, Eye, Database, Trash2, Cookie } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";

export const Route = createFileRoute("/privasi")({
  component: PrivasiPage,
  head: () => ({
    meta: [
      { title: "Kebijakan Privasi — Panenku" },
      { name: "description", content: "Kebijakan privasi dan perlindungan data pengguna aplikasi Panenku." },
    ],
  }),
});

function PrivasiPage() {
  return (
    <MobileShell hideNav>
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center gap-2 bg-primary px-2 py-3 text-primary-foreground shadow-soft">
        <Link to="/akun" aria-label="Kembali" className="rounded-full p-2 hover:bg-white/15 active:scale-95 transition-transform">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-xl font-bold">Kebijakan Privasi</h1>
      </header>

      <main className="p-4 space-y-4 page-transition">
        {/* Intro card */}
        <div className="rounded-2xl bg-card p-5 shadow-card text-center reveal is-visible">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-soft text-primary mb-3">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h2 className="text-lg font-bold">Privasi Anda Prioritas Kami</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Terakhir diperbarui: 1 Januari 2025
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Panenku berkomitmen melindungi data pribadi pengguna sesuai regulasi yang berlaku di Indonesia.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-3">
          <PrivacyCard
            icon={Database}
            title="Data yang Kami Kumpulkan"
            content="Kami mengumpulkan nama, nomor telepon, lokasi kebun (untuk petani), foto profil, riwayat transaksi, dan preferensi aplikasi. Data ini digunakan untuk operasional marketplace dan verifikasi identitas."
            delay={1}
          />
          <PrivacyCard
            icon={Eye}
            title="Penggunaan Data"
            content="Data Anda digunakan untuk: memproses pesanan, verifikasi petani, komunikasi antar pengguna, rekomendasi produk, peningkatan layanan, dan keamanan platform. Kami tidak menjual data pribadi kepada pihak ketiga."
            delay={2}
          />
          <PrivacyCard
            icon={Lock}
            title="Keamanan Data"
            content="Kami mengimplementasikan enkripsi, autentikasi aman, dan kontrol akses ketat. Password disimpan dengan hashing modern. Transmisi data dilindungi dengan protokol keamanan standar industri."
            delay={3}
          />
          <PrivacyCard
            icon={Cookie}
            title="Cookies & Tracking"
            content="Panenku menggunakan teknologi penyimpanan lokal untuk mengingat preferensi Anda dan meningkatkan pengalaman pengguna. Anda dapat mengatur preferensi ini melalui pengaturan perangkat."
            delay={4}
          />
          <PrivacyCard
            icon={Trash2}
            title="Penghapusan Data"
            content="Pengguna dapat meminta penghapusan akun dan data pribadi kapan saja melalui layanan bantuan. Penghapusan akan diproses dalam waktu maksimal 30 hari kerja setelah verifikasi identitas."
            delay={5}
          />
        </div>

        {/* Footer note */}
        <div className="rounded-2xl border border-border bg-muted/40 p-4 text-center text-sm text-muted-foreground mt-4">
          Ada pertanyaan soal privasi? Kunjungi{" "}
          <Link to="/bantuan" className="font-semibold text-primary">Bantuan</Link>{" "}
          atau hubungi tim Panenku.
        </div>
      </main>
    </MobileShell>
  );
}

function PrivacyCard({
  icon: Icon,
  title,
  content,
  delay,
}: {
  icon: typeof ShieldCheck;
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
