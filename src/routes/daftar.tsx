import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, User, MapPin, Lock } from "lucide-react";
import { useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { ImagePicker } from "@/components/ImagePicker";
import { CITIES, registerUser } from "@/lib/store";
import logo from "@/assets/logo-panenku.png";
import { toast } from "sonner";

type DaftarSearch = { role?: "buyer" | "farmer" };

export const Route = createFileRoute("/daftar")({
  validateSearch: (search): DaftarSearch => ({
    role: search.role === "farmer" ? "farmer" : search.role === "buyer" ? "buyer" : undefined,
  }),
  component: Daftar,
});

function Daftar() {
  const sp = Route.useSearch();
  const [role, setRole] = useState<"buyer" | "farmer">(sp.role ?? "buyer");
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [pin2, setPin2] = useState("");
  const [farmName, setFarmName] = useState("");
  const [farmCityId, setFarmCityId] = useState("magelang");
  const [certificateImage, setCertificateImage] = useState<string | undefined>(undefined);
  const [shippingPackagingMethod, setShippingPackagingMethod] = useState("");

  const submit = () => {
    if (pin !== pin2) {
      toast.error("PIN tidak sama");
      return;
    }
    try {
      const city = CITIES.find((c) => c.id === farmCityId);
      const user = registerUser({
        name,
        phone,
        pin,
        role,
        farmName: role === "farmer" ? farmName : undefined,
        farmLocation: role === "farmer" && city ? `${city.name}, ${city.province}` : undefined,
        farmCityId: role === "farmer" ? farmCityId : undefined,
        certificateImage: role === "farmer" ? certificateImage : undefined,
        shippingPackagingMethod: role === "farmer" ? shippingPackagingMethod.trim() : undefined,
      });
      if (role === "farmer") {
        toast.success(`Pendaftaran berhasil, ${user.name}!`, {
          description: "Akun Anda sedang ditinjau admin (1-2 hari).",
          duration: 7000,
        });
      } else {
        toast.success(`Selamat bergabung, ${user.name}!`);
      }
      window.location.href = role === "farmer" ? "/petani" : "/";
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal daftar");
    }
  };

  const step1Valid = name.length >= 2 && phone.length >= 9;
  const step2Valid =
    role === "buyer" ||
    (farmName.length >= 2 &&
      farmCityId.length >= 2 &&
      shippingPackagingMethod.trim().length >= 10);
  const step3Valid = pin.length === 6 && pin2.length === 6;
  const buyerValid = step1Valid && step3Valid;

  return (
    <MobileShell hideNav>
      <header className="sticky top-0 z-30 flex items-center gap-2 bg-card px-2 py-3">
        <button
          type="button"
          onClick={() => (role === "farmer" && step > 1 ? setStep(step - 1) : (window.location.href = "/akun"))}
          aria-label="Kembali"
          className="rounded-full p-2 hover:bg-muted"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold">Daftar Baru</h1>
      </header>

      <div className="p-6">
        <div className="flex flex-col items-center">
          <span className="logo-anim inline-block overflow-hidden">
            <img src={logo} alt="Panenku" className="h-14 w-auto" width={160} height={56} />
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            onClick={() => { setRole("buyer"); setStep(1); }}
            className={`flex h-20 flex-col items-center justify-center gap-1 rounded-xl border-2 ${
              role === "buyer" ? "border-primary bg-primary-soft" : "border-border bg-card"
            }`}
          >
            <span className="text-2xl">🛍️</span>
            <span className="font-bold">Pembeli</span>
          </button>
          <button
            onClick={() => { setRole("farmer"); setStep(1); }}
            className={`flex h-20 flex-col items-center justify-center gap-1 rounded-xl border-2 ${
              role === "farmer" ? "border-primary bg-primary-soft" : "border-border bg-card"
            }`}
          >
            <span className="text-2xl">👨‍🌾</span>
            <span className="font-bold">Petani</span>
          </button>
        </div>

        {role === "buyer" ? (
          <form
            onSubmit={(e) => { e.preventDefault(); submit(); }}
            className="mt-5 space-y-3"
          >
            <Field label="Nama Lengkap" value={name} onChange={setName} placeholder="Nama Anda" />
            <Field
              label="Nomor HP"
              value={phone}
              onChange={(v) => setPhone(v.replace(/\D/g, ""))}
              placeholder="08xxxxxxxxxx"
              type="tel"
            />
            <PinField label="PIN (6 digit)" value={pin} onChange={setPin} />
            <PinField label="Ulangi PIN" value={pin2} onChange={setPin2} />
            <button
              type="submit"
              disabled={!buyerValid}
              className="h-14 w-full rounded-xl bg-primary text-lg font-bold text-primary-foreground disabled:opacity-50"
            >
              Daftar
            </button>
          </form>
        ) : (
          <FarmerWizard
            step={step}
            setStep={setStep}
            name={name} setName={setName}
            phone={phone} setPhone={setPhone}
            farmName={farmName} setFarmName={setFarmName}
            farmCityId={farmCityId} setFarmCityId={setFarmCityId}
            certificateImage={certificateImage} setCertificateImage={setCertificateImage}
            shippingPackagingMethod={shippingPackagingMethod} setShippingPackagingMethod={setShippingPackagingMethod}
            pin={pin} setPin={setPin}
            pin2={pin2} setPin2={setPin2}
            step1Valid={step1Valid}
            step2Valid={step2Valid}
            step3Valid={step3Valid}
            onSubmit={submit}
          />
        )}

        <div className="mt-5 text-center">
          <p className="text-sm text-muted-foreground">Sudah punya akun?</p>
          <Link to="/masuk" className="mt-1 inline-block text-base font-bold text-primary">Masuk</Link>
        </div>
      </div>
    </MobileShell>
  );
}

function FarmerWizard(props: {
  step: number; setStep: (n: number) => void;
  name: string; setName: (v: string) => void;
  phone: string; setPhone: (v: string) => void;
  farmName: string; setFarmName: (v: string) => void;
  farmCityId: string; setFarmCityId: (v: string) => void;
  certificateImage: string | undefined; setCertificateImage: (v: string | undefined) => void;
  shippingPackagingMethod: string; setShippingPackagingMethod: (v: string) => void;
  pin: string; setPin: (v: string) => void;
  pin2: string; setPin2: (v: string) => void;
  step1Valid: boolean; step2Valid: boolean; step3Valid: boolean;
  onSubmit: () => void;
}) {
  const { step, setStep } = props;
  const steps = [
    { n: 1, label: "Data Diri", icon: User },
    { n: 2, label: "Kebun", icon: MapPin },
    { n: 3, label: "Keamanan", icon: Lock },
  ];

  return (
    <div className="mt-5">
      {/* Stepper */}
      <div className="mb-5 flex items-center justify-between">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          const done = step > s.n;
          const active = step === s.n;
          return (
            <div key={s.n} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                    done ? "border-success bg-success text-white"
                    : active ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground"
                  }`}
                >
                  {done ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                </div>
                <span className={`text-[11px] font-bold ${active || done ? "text-foreground" : "text-muted-foreground"}`}>
                  {s.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`mx-1 mb-5 h-1 flex-1 rounded ${step > s.n ? "bg-success" : "bg-border"}`} />
              )}
            </div>
          );
        })}
      </div>

      <p className="mb-3 text-center text-sm text-muted-foreground">
        Langkah {step} dari 3
      </p>

      {step === 1 && (
        <div className="space-y-3">
          <div className="rounded-xl bg-primary-soft p-3 text-sm">
            👤 <b>Kenalan dulu yuk!</b> Isi nama & nomor HP aktif untuk notifikasi pesanan.
          </div>
          <Field label="Nama Lengkap" value={props.name} onChange={props.setName} placeholder="Nama Anda" />
          <Field
            label="Nomor HP"
            value={props.phone}
            onChange={(v) => props.setPhone(v.replace(/\D/g, ""))}
            placeholder="08xxxxxxxxxx"
            type="tel"
          />
          <button
            onClick={() => setStep(2)}
            disabled={!props.step1Valid}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-primary text-lg font-bold text-primary-foreground disabled:opacity-50"
          >
            Lanjut <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <div className="rounded-xl bg-primary-soft p-3 text-sm">
            🌾 <b>Tentang kebun Anda.</b> Lokasi dipakai untuk menghitung ongkir ke pembeli.
          </div>
          <Field label="Nama Kebun" value={props.farmName} onChange={props.setFarmName} placeholder="Contoh: Kebun Sumber Rejeki" />
          <div>
            <label className="mb-1 block text-sm font-bold">Kota Kebun</label>
            <select
              value={props.farmCityId}
              onChange={(e) => props.setFarmCityId(e.target.value)}
              className="h-14 w-full rounded-xl border-2 border-border bg-background px-3 text-base outline-none focus:border-primary"
            >
              {CITIES.map((c) => (
                <option key={c.id} value={c.id}>{c.name} — {c.province}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-bold">
              Cara Mengemas & Mengirim Paket <span className="text-danger">*</span>
            </label>
            <textarea
              value={props.shippingPackagingMethod}
              onChange={(e) => props.setShippingPackagingMethod(e.target.value)}
              placeholder="Contoh: Dibungkus daun pisang lalu kardus, diantar pakai motor sendiri ke alamat pembeli. Untuk luar kota dikemas styrofoam + es batu lalu titip jasa kirim."
              rows={4}
              required
              className="w-full resize-none rounded-xl border-2 border-border bg-background p-3 text-base outline-none focus:border-primary"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Wajib diisi (min. 10 karakter). Pembeli akan melihat info ini sebelum memesan.
            </p>
          </div>
          <div>
            <ImagePicker
              value={props.certificateImage}
              onChange={props.setCertificateImage}
              label="Sertifikat Kebun (opsional)"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Foto sertifikat organik / Prima 3 / GAP jika ada. Membantu mempercepat verifikasi.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setStep(1)}
              className="h-14 flex-1 rounded-xl border-2 border-border text-lg font-bold"
            >
              Kembali
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!props.step2Valid}
              className="flex h-14 flex-[2] items-center justify-center gap-2 rounded-xl bg-primary text-lg font-bold text-primary-foreground disabled:opacity-50"
            >
              Lanjut <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-3">
          <div className="rounded-xl bg-primary-soft p-3 text-sm">
            🔒 <b>Amankan akun.</b> PIN 6 digit dipakai setiap kali masuk & tarik dana.
          </div>
          <PinField label="PIN (6 digit)" value={props.pin} onChange={props.setPin} />
          <PinField label="Ulangi PIN" value={props.pin2} onChange={props.setPin2} />
          <div className="rounded-xl bg-promo/10 p-3 text-sm text-promo">
            ℹ️ Akun petani ditinjau admin (1-2 hari) sebelum produk tampil.
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setStep(2)}
              className="h-14 flex-1 rounded-xl border-2 border-border text-lg font-bold"
            >
              Kembali
            </button>
            <button
              onClick={props.onSubmit}
              disabled={!props.step3Valid}
              className="h-14 flex-[2] rounded-xl bg-primary text-lg font-bold text-primary-foreground disabled:opacity-50"
            >
              Selesai & Daftar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-bold">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required
        className="h-14 w-full rounded-xl border-2 border-border bg-background px-4 text-base outline-none focus:border-primary"
      />
    </div>
  );
}

function PinField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-bold">{label}</label>
      <input
        type="password"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
        placeholder="••••••"
        required
        maxLength={6}
        className="h-14 w-full rounded-xl border-2 border-border bg-background px-4 text-center text-2xl tracking-[0.5em] outline-none focus:border-primary"
      />
    </div>
  );
}
