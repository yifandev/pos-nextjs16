import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils/format";
import { Minus, Package, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { ProductWithRelations } from "@/types";

interface CartItemProps {
  item: {
    product: ProductWithRelations;
    quantity: number;
  };
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemove: (productId: string) => void;
}

export function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const totalPrice = item.product.price * item.quantity;

  return (
    <div className="flex items-center gap-3 p-3 bg-card border rounded-lg hover:bg-accent/50 transition-colors">
      {/* Product Image */}
      <div className="relative w-14 h-14 rounded-md bg-muted shrink-0 overflow-hidden">
        {item.product.image ? (
          <Image
            src={item.product.image}
            alt={item.product.name}
            fill
            className="object-cover"
            sizes="56px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0 space-y-1">
        <h4 className="font-medium text-sm truncate">{item.product.name}</h4>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {formatCurrency(item.product.price)} × {item.quantity}
          </span>
          <span className="font-semibold text-primary">
            {formatCurrency(totalPrice)}
          </span>
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-muted rounded-md p-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onUpdateQuantity(item.product.id, -1)}
              className="h-7 w-7 p-0 hover:bg-background"
            >
              <Minus className="h-3 w-3" />
            </Button>

            <span className="w-8 text-center text-sm font-medium">
              {item.quantity}
            </span>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => onUpdateQuantity(item.product.id, 1)}
              className="h-7 w-7 p-0 hover:bg-background"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => onRemove(item.product.id)}
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
