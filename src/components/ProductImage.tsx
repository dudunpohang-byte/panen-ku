import tomat from "@/assets/produk-tomat.jpg";
import bawang from "@/assets/produk-bawang.jpg";
import cabai from "@/assets/produk-cabai.jpg";
import bayam from "@/assets/produk-bayam.jpg";
import wortel from "@/assets/produk-wortel.jpg";
import beras from "@/assets/produk-beras.jpg";
import jeruk from "@/assets/produk-jeruk.jpg";
import pisang from "@/assets/produk-pisang.jpg";
import jahe from "@/assets/produk-jahe.jpg";
import kentang from "@/assets/produk-kentang.jpg";

const ASSET_MAP: Record<string, string> = {
  tomat,
  bawang,
  cabai,
  bayam,
  wortel,
  beras,
  jeruk,
  pisang,
  jahe,
  kentang,
};

export function ProductImage({
  src,
  alt,
  className = "",
}: {
  src?: string;
  alt: string;
  className?: string;
}) {
  if (src?.startsWith("asset:")) {
    const key = src.slice(6);
    const url = ASSET_MAP[key];
    if (url) {
      return (
        <img
          src={url}
          alt={alt}
          loading="lazy"
          className={`h-full w-full object-cover ${className}`}
        />
      );
    }
  }
  if (src?.startsWith("emoji:")) {
    const emoji = src.slice(6);
    return (
      <div
        className={`flex h-full w-full items-center justify-center bg-primary-soft ${className}`}
      >
        <span className="text-6xl" aria-label={alt}>
          {emoji}
        </span>
      </div>
    );
  }
  if (src?.startsWith("data:") || src?.startsWith("http")) {
    return (
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className={`h-full w-full object-cover ${className}`}
      />
    );
  }
  return (
    <div
      className={`flex h-full w-full items-center justify-center bg-primary-soft ${className}`}
    >
      <span className="text-5xl">🌾</span>
    </div>
  );
}
