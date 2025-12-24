import { formatCurrency } from "@/lib/utils/format";

interface SummaryCardProps {
  subtotal: number;
  tax: number;
  total: number;
}

export function SummaryCard({ subtotal, tax, total }: SummaryCardProps) {
  return (
    <div className="space-y-3 border-t pt-4">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal:</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Pajak (PPN):</span>
          <span>{formatCurrency(tax)}</span>
        </div>
      </div>

      <div className="border-t pt-3">
        <div className="flex justify-between items-center">
          <span className="font-semibold">Total:</span>
          <span className="text-2xl font-bold text-primary">
            {formatCurrency(total)}
          </span>
        </div>
      </div>
    </div>
  );
}
