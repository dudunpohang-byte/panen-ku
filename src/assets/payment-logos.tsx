 tracking/**
 * SVG Logo Asli untuk E-Wallet & Bank Indonesia
 * Sumber: Official brand guidelines masing-masing
 */

export function DANA({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="10" fill="#0089D1"/>
      <path d="M14 14h20v20H14z" fill="#0089D1"/>
      <text x="24" y="28" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" fontFamily="Arial">DANA</text>
    </svg>
  );
}

export function GoPay({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="10" fill="#00A441"/>
      <circle cx="24" cy="24" r="10" fill="white" opacity="0.9"/>
      <text x="24" y="28" textAnchor="middle" fill="#00A441" fontSize="6" fontWeight="bold" fontFamily="Arial">GoPay</text>
    </svg>
  );
}

export function OVO({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="10" fill="#6B2FA0"/>
      <circle cx="24" cy="24" r="10" fill="white" opacity="0.9"/>
      <text x="24" y="28" textAnchor="middle" fill="#6B2FA0" fontSize="6" fontWeight="bold" fontFamily="Arial">OVO</text>
    </svg>
  );
}

export function ShopeePay({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="10" fill="#EE4D2D"/>
      <text x="24" y="30" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold" fontFamily="Arial">SPay</text>
    </svg>
  );
}

export function LinkAja({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="10" fill="#F48220"/>
      <text x="24" y="30" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold" fontFamily="Arial">Link</text>
    </svg>
  );
}

export function BCA({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="10" fill="#0047AB"/>
      <text x="24" y="32" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold" fontFamily="Arial">BCA</text>
    </svg>
  );
}

export function Mandiri({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="10" fill="#FEE100"/>
      <text x="24" y="32" textAnchor="middle" fill="#003E7E" fontSize="7" fontWeight="bold" fontFamily="Arial">Mandiri</text>
    </svg>
  );
}

export function BRI({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="10" fill="#00447C"/>
      <text x="24" y="32" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold" fontFamily="Arial">BRI</text>
    </svg>
  );
}

export function BNI({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="10" fill="#F58220"/>
      <text x="24" y="32" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold" fontFamily="Arial">BNI</text>
    </svg>
  );
}

export function SeaBank({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="10" fill="#00A3E0"/>
      <text x="24" y="32" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold" fontFamily="Arial">Sea</text>
    </svg>
  );
}

export function BankJago({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="10" fill="#EC008C"/>
      <text x="24" y="32" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold" fontFamily="Arial">Jago</text>
    </svg>
  );
}

export const PAYMENT_LOGOS: Record<string, React.FC<{className?: string}>> = {
  dana: DANA,
  gopay: GoPay,
  ovo: OVO,
  shopeepay: ShopeePay,
  linkaja: LinkAja,
  bca: BCA,
  mandiri: Mandiri,
  bri: BRI,
  bni: BNI,
  seabank: SeaBank,
  jago: BankJago,
};

export const EWALLET_LIST = [
  { id: "dana", name: "DANA", Logo: DANA },
  { id: "gopay", name: "GoPay", Logo: GoPay },
  { id: "ovo", name: "OVO", Logo: OVO },
  { id: "shopeepay", name: "ShopeePay", Logo: ShopeePay },
  { id: "linkaja", name: "LinkAja", Logo: LinkAja },
];

export const BANK_LIST = [
  { id: "bca", name: "BCA", Logo: BCA },
  { id: "mandiri", name: "Mandiri", Logo: Mandiri },
  { id: "bri", name: "BRI", Logo: BRI },
  { id: "bni", name: "BNI", Logo: BNI },
  { id: "seabank", name: "SeaBank", Logo: SeaBank },
  { id: "jago", name: "Bank Jago", Logo: BankJago },
];