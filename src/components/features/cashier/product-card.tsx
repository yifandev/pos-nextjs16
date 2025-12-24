import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/format";
import { Package } from "lucide-react";
import Image from "next/image";
import { ProductWithRelations } from "@/types";

interface ProductCardProps {
  product: ProductWithRelations;
  onAddToCart: () => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <Card
      className={`
        cursor-pointer transition-all duration-200 overflow-hidden h-full p-0
        hover:shadow-md hover:border-primary/50 active:scale-[0.98]
        ${isOutOfStock ? "opacity-60 cursor-not-allowed" : ""}
      `}
      onClick={isOutOfStock ? undefined : onAddToCart}
    >
      <CardContent className="p-0">
        {/* Product Image */}
        <div className="relative aspect-square bg-linear-to-br from-muted/50 to-muted">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-12 w-12 text-muted-foreground/50" />
            </div>
          )}

          {/* Stock Badge */}
          {isLowStock && !isOutOfStock && (
            <div className="absolute top-2 left-2 bg-amber-500 text-white text-xs px-2 py-1 rounded-full">
              Stok: {product.stock}
            </div>
          )}

          {isOutOfStock && (
            <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
              <span className="bg-destructive text-destructive-foreground text-xs px-3 py-1 rounded-full">
                Habis
              </span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-3 space-y-2">
          <h3 className="font-medium text-sm line-clamp-2 min-h-10">
            {product.name}
          </h3>

          <div className="flex items-center justify-between">
            <span className="font-bold text-primary">
              {formatCurrency(product.price)}
            </span>
            {!isLowStock && !isOutOfStock && (
              <span className="text-xs text-muted-foreground">
                Stok: {product.stock}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
