import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils/format";
import { Copy, CheckCircle, Building2 } from "lucide-react";
import { useState } from "react";

interface VaPaymentDisplayProps {
  orderId: string;
  totalAmount: number;
  vaNumber: string;
  bank?: string;
  onManualConfirm: () => void;
  onClose: () => void;
}

export function VaPaymentDisplay({
  orderId,
  totalAmount,
  vaNumber,
  bank = "BRI",
  onManualConfirm,
  onClose,
}: VaPaymentDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(vaNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-2">
          <Building2 className="h-6 w-6 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold">Virtual Account</h3>
        <p className="text-sm text-muted-foreground">
          Transfer ke virtual account di bawah ini
        </p>
      </div>

      {/* VA Details Card */}
      <Card className="border-blue-200">
        <CardContent className="pt-6 space-y-6">
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Bank</Label>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-md bg-blue-100 flex items-center justify-center">
                <Building2 className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-lg font-semibold">{bank}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">
              Nomor Virtual Account
            </Label>
            <div className="space-y-3">
              <div className="bg-muted rounded-lg p-4">
                <p className="text-2xl font-mono font-bold tracking-wider text-center">
                  {vaNumber.match(/.{1,4}/g)?.join(" ")}
                </p>
              </div>
              <Button
                onClick={handleCopy}
                variant="outline"
                className="w-full gap-2"
              >
                {copied ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copied ? "Tersalin!" : "Salin Nomor VA"}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">
              Jumlah Transfer
            </Label>
            <div className="bg-linear-to-r from-blue-50 to-blue-100 rounded-lg p-4">
              <p className="text-2xl font-bold text-blue-800 text-center">
                {formatCurrency(totalAmount)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Info */}
      <div className="space-y-3">
        <div className="flex justify-center">
          <Badge variant="outline" className="font-mono">
            Order: #{orderId}
          </Badge>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Pembayaran akan dikonfirmasi otomatis setelah transfer berhasil
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2">
        <Button variant="outline" onClick={onClose} className="flex-1">
          Tutup
        </Button>
        <Button
          onClick={onManualConfirm}
          className="flex-1"
          variant="secondary"
        >
          Konfirmasi Manual
        </Button>
      </div>
    </div>
  );
}
