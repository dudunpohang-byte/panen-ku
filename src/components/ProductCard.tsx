import { Link } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { ProductImage } from "./ProductImage";
import { rupiah } from "@/lib/format";
import type { Product } from "@/lib/store";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      to="/produk/$id"
      params={{ id: product.id }}
      className="block overflow-hidden rounded-xl bg-card shadow-card hover-lift press reveal"
    >
      <div className="relative aspect-square w-full overflow-hidden">
        <div className="h-full w-full transition-transform duration-500 ease-smooth group-hover:scale-105">
          <ProductImage src={product.image} alt={product.name} />
        </div>
        {product.preOrder && (
          <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-foreground shadow">
            🌱 Pre-Order
          </span>
        )}
      </div>
      <div className="p-3">
        <h3 className="line-clamp-2 min-h-[2.6em] text-[15px] font-semibold leading-tight">
          {product.name}
        </h3>
        <p className="mt-1 text-lg font-extrabold text-primary">
          {rupiah(product.price)}
          <span className="text-sm font-medium text-muted-foreground"> /{product.unit}</span>
        </p>
        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="h-3.5 w-3.5 fill-promo text-promo" />
          <span className="font-semibold text-foreground">{product.rating.toFixed(1)}</span>
          <span>· Terjual {product.sold}</span>
        </div>
      </div>
    </Link>
  );
}
