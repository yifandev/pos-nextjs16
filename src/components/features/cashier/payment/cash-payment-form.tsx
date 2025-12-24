import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/format";

interface CashPaymentFormProps {
  totalAmount: number;
  paidAmount: number;
  onPaidAmountChange: (amount: number) => void;
  bankName: string;
  accountNumber: string;
}

export function CashPaymentForm({
  totalAmount,
  paidAmount,
  onPaidAmountChange,
  bankName,
  accountNumber,
}: CashPaymentFormProps) {
  const changeAmount = Math.max(0, paidAmount - totalAmount);
  const isPaidEnough = paidAmount >= totalAmount;

  return (
    <div className="space-y-4">
      {/* Bank Info Card */}
      <Card className="bg-linear-to-r from-muted/50 to-muted/30 border-dashed">
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total:</span>
              <span className="font-bold text-lg">
                {formatCurrency(totalAmount)}
              </span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Bank:</span>
                <span>{bankName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Akun:</span>
                <span className="font-mono font-medium">{accountNumber}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Amount Input */}
      <div className="space-y-2">
        <Label htmlFor="paid-amount" className="flex justify-between">
          <span>Jumlah Dibayar</span>
          <span className="text-sm font-normal text-muted-foreground">
            Min: {formatCurrency(totalAmount)}
          </span>
        </Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            Rp
          </span>
          <Input
            id="paid-amount"
            type="number"
            value={paidAmount || ""}
            onChange={(e) =>
              onPaidAmountChange(parseFloat(e.target.value) || 0)
            }
            className="pl-10 text-lg h-12"
            min={0}
            step={1000}
            placeholder="0"
          />
        </div>
      </div>

      {/* Change Calculation */}
      {paidAmount > 0 && (
        <Card
          className={`border-l-4 ${
            isPaidEnough ? "border-l-green-500" : "border-l-amber-500"
          }`}
        >
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total:</span>
                <span className="font-medium">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Dibayar:</span>
                <span className="font-medium">
                  {formatCurrency(paidAmount)}
                </span>
              </div>
              <div className="flex justify-between items-center border-t pt-3">
                <span className="text-sm font-medium">Kembalian:</span>
                <span
                  className={`text-2xl font-bold ${
                    isPaidEnough ? "text-green-600" : "text-amber-600"
                  }`}
                >
                  {formatCurrency(changeAmount)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
