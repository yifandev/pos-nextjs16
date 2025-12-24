import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/format";
import { QrCode, Copy, CheckCircle } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface QrisPaymentDisplayProps {
  orderId: string;
  totalAmount: number;
  qrisUrl?: string;
  qrisString?: string;
  onManualConfirm: () => void;
  onClose: () => void;
}

export function QrisPaymentDisplay({
  orderId,
  totalAmount,
  qrisUrl,
  qrisString,
  onManualConfirm,
  onClose,
}: QrisPaymentDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (qrisString) {
      navigator.clipboard.writeText(qrisString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-2">
          <QrCode className="h-6 w-6 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold">Scan QRIS Code</h3>
        <p className="text-sm text-muted-foreground">
          Gunakan aplikasi e-wallet untuk scan QR code ini
        </p>
      </div>

      {/* QR Code Display */}
      <div className="flex justify-center">
        <Card className="border-2 border-dashed border-primary/20 p-6">
          <CardContent className="p-0">
            {qrisUrl ? (
              <div className="relative w-64 h-64">
                <Image
                  src={qrisUrl}
                  alt="QRIS Code"
                  fill
                  className="object-contain"
                  unoptimized={true}
                />
              </div>
            ) : qrisString ? (
              <div className="flex flex-col items-center space-y-4">
                <div className="w-64 h-64 border rounded-lg p-4 bg-white flex items-center justify-center">
                  <QrCode className="h-48 w-48 text-gray-700" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-xs text-muted-foreground break-all max-w-xs">
                    {qrisString}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className="gap-2"
                  >
                    {copied ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                    {copied ? "Tersalin!" : "Salin QR String"}
                  </Button>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {/* Order Info */}
      <div className="space-y-3">
        <div className="flex justify-center">
          <Badge variant="outline" className="font-mono">
            Order: #{orderId}
          </Badge>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Status:</span>
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                  Menunggu Pembayaran
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total:</span>
                <span className="font-bold text-lg">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-xs text-center text-muted-foreground">
          Pembayaran akan dikonfirmasi otomatis setelah scan QRIS
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
