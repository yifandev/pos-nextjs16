"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils/format";
import {
  Loader2,
  CreditCard,
  Smartphone,
  Building2,
  Wallet,
  QrCode,
} from "lucide-react";
import { DUMMY_BRI_ATM, DUMMY_BRI_BANK_NAME } from "@/lib/midtrans";
import Image from "next/image";

type PaymentMethod = "cash" | "qris" | "transfer";
type PaymentStatus = "idle" | "processing" | "success" | "failed";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalAmount: number;
  orderId: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  onPaymentComplete: (data: {
    method: PaymentMethod;
    paid: number;
    change: number;
    reference?: string;
  }) => void;
}

export function PaymentDialog({
  open,
  onOpenChange,
  totalAmount,
  orderId,
  items,
  onPaymentComplete,
}: PaymentDialogProps) {
  const [paymentMethod, setPaymentMethod] =
    React.useState<PaymentMethod>("cash");
  const [paidAmount, setPaidAmount] = React.useState<number>(0);
  const [selectedBank, setSelectedBank] = React.useState<string>("bri");
  const [paymentStatus, setPaymentStatus] =
    React.useState<PaymentStatus>("idle");
  const [paymentData, setPaymentData] = React.useState<{
    qrisUrl?: string;
    qrisString?: string; // Untuk fallback jika QR image tidak tersedia
    vaNumber?: string;
    bank?: string;
  }>({});

  React.useEffect(() => {
    if (open) {
      // Reset state when dialog opens
      setPaymentStatus("idle");
      setPaidAmount(totalAmount); // Set default to total amount for cash
      setPaymentMethod("cash");
      setPaymentData({});
    }
  }, [open, totalAmount]);

  const changeAmount = React.useMemo(() => {
    return Math.max(0, paidAmount - totalAmount);
  }, [paidAmount, totalAmount]);

  const handleProcessPayment = async () => {
    if (paymentMethod === "cash") {
      if (paidAmount < totalAmount) {
        alert("Jumlah bayar kurang dari total");
        return;
      }
      onPaymentComplete({
        method: "cash",
        paid: paidAmount,
        change: changeAmount,
        reference: DUMMY_BRI_ATM,
      });
      return;
    }

    setPaymentStatus("processing");

    try {
      if (paymentMethod === "qris") {
        // Validasi items
        if (!items || items.length === 0) {
          alert("Item details are required for QRIS payment");
          setPaymentStatus("idle");
          return;
        }

        // Process QRIS payment - TIDAK perlu kirim grossAmount lagi
        const response = await fetch("/api/payment/charge-qris", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId,
            // grossAmount: totalAmount, // TIDAK PERLU dikirim, akan dihitung otomatis
            itemDetails: items.map((item) => ({
              id: item.id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
            })),
          }),
        });

        const result = await response.json();

        if (result.success) {
          setPaymentData({
            qrisUrl: result.data.qrisUrl,
            qrisString: result.data.qrisString || "",
          });
          setPaymentStatus("success");

          // In production, you should wait for webhook confirmation
          // For demo, we'll complete the payment immediately after 5 seconds
          setTimeout(() => {
            onPaymentComplete({
              method: "qris",
              paid: result.data.grossAmount || totalAmount, // Gunakan grossAmount dari response
              change: 0,
              reference: orderId,
            });
          }, 5000); // Beri waktu 5 detik untuk scan QR
        } else {
          setPaymentStatus("failed");
          alert(result.error || "QRIS payment failed");
        }
      } else if (paymentMethod === "transfer") {
        // Validasi items
        if (!items || items.length === 0) {
          alert("Item details are required for bank transfer");
          setPaymentStatus("idle");
          return;
        }

        // Process Bank Transfer payment
        const response = await fetch("/api/payment/charge-transfer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId,
            // grossAmount: totalAmount, // TIDAK PERLU dikirim, akan dihitung otomatis
            bank: selectedBank,
            itemDetails: items.map((item) => ({
              id: item.id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
            })),
          }),
        });

        const result = await response.json();

        if (result.success) {
          setPaymentData({
            vaNumber: result.data.vaNumber,
            bank: result.data.bank,
          });
          setPaymentStatus("success");

          // In production, you should wait for webhook confirmation
          // For demo, we'll complete the payment immediately
          setTimeout(() => {
            onPaymentComplete({
              method: "transfer",
              paid: result.data.grossAmount || totalAmount, // Gunakan grossAmount dari response
              change: 0,
              reference: `${result.data.bank}-${result.data.vaNumber}`,
            });
          }, 2000);
        } else {
          setPaymentStatus("failed");
          alert(result.error || "Transfer payment failed");
        }
      }
    } catch (error) {
      console.error("Payment error:", error);
      setPaymentStatus("failed");
      alert("Payment processing failed");
    }
  };

  // Fungsi untuk render QR code dari string (fallback jika URL tidak tersedia)
  const renderQRCode = () => {
    if (paymentData.qrisUrl) {
      return (
        <div className="relative w-64 h-64 border rounded-lg p-4 bg-white mx-auto">
          <Image
            src={paymentData.qrisUrl}
            alt="QRIS Code"
            fill
            className="object-contain"
            unoptimized={true} // Untuk URL eksternal
          />
        </div>
      );
    } else if (paymentData.qrisString) {
      // Fallback: generate QR code dari string (gunakan library seperti qrcode.react jika perlu)
      return (
        <div className="flex flex-col items-center justify-center">
          <div className="w-64 h-64 border rounded-lg p-4 bg-white flex items-center justify-center">
            <QrCode className="h-48 w-48 text-gray-700" />
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center break-all max-w-xs">
            {paymentData.qrisString}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => {
              navigator.clipboard.writeText(paymentData.qrisString!);
              alert("QR String copied!");
            }}
          >
            Copy QR String
          </Button>
        </div>
      );
    }
    return null;
  };

  const renderPaymentContent = () => {
    if (paymentStatus === "processing") {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg font-medium">Memproses pembayaran...</p>
          <p className="text-sm text-muted-foreground">Harap tunggu</p>
        </div>
      );
    }

    if (paymentStatus === "success") {
      if (paymentMethod === "qris") {
        return (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Scan QRIS Code</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Gunakan aplikasi e-wallet untuk scan QR code ini
              </p>
            </div>

            {renderQRCode()}

            <div className="text-center">
              <Badge variant="outline" className="mb-2">
                Order ID: {orderId}
              </Badge>
              <p className="text-sm text-muted-foreground">
                Pembayaran akan dikonfirmasi otomatis setelah scan
              </p>
              <p className="text-sm font-medium mt-2">
                Total: {formatCurrency(totalAmount)}
              </p>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Tutup
              </Button>
              <Button
                onClick={() => {
                  onPaymentComplete({
                    method: "qris",
                    paid: totalAmount,
                    change: 0,
                    reference: orderId,
                  });
                }}
                className="flex-1"
              >
                Bayar Manual
              </Button>
            </div>
          </div>
        );
      }

      if (paymentMethod === "transfer" && paymentData.vaNumber) {
        return (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Bank Transfer</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Transfer ke virtual account di bawah
              </p>
            </div>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Bank</Label>
                  <p className="text-lg font-semibold">{paymentData.bank}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">
                    Nomor Virtual Account
                  </Label>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-2xl font-mono font-bold tracking-wider">
                      {paymentData.vaNumber}
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(paymentData.vaNumber!);
                        alert("Nomor VA disalin!");
                      }}
                    >
                      Salin
                    </Button>
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">
                    Jumlah
                  </Label>
                  <p className="text-xl font-bold text-primary">
                    {formatCurrency(totalAmount)}
                  </p>
                </div>
              </CardContent>
            </Card>
            <div className="text-center">
              <Badge variant="outline" className="mb-2">
                Order ID: {orderId}
              </Badge>
              <p className="text-sm text-muted-foreground">
                Pembayaran akan dikonfirmasi otomatis setelah transfer
              </p>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Tutup
              </Button>
              <Button
                onClick={() => {
                  onPaymentComplete({
                    method: "transfer",
                    paid: totalAmount,
                    change: 0,
                    reference: `${paymentData.bank}-${paymentData.vaNumber}`,
                  });
                }}
                className="flex-1"
              >
                Konfirmasi Manual
              </Button>
            </div>
          </div>
        );
      }
    }

    if (paymentStatus === "failed") {
      return (
        <div className="space-y-4">
          <div className="flex flex-col items-center justify-center py-8">
            <div className="rounded-full bg-destructive/10 p-3 mb-4">
              <CreditCard className="h-8 w-8 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Pembayaran Gagal</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Terjadi kesalahan saat memproses pembayaran
            </p>
            <Button onClick={() => setPaymentStatus("idle")}>Coba Lagi</Button>
          </div>
        </div>
      );
    }

    // Default payment form (idle state)
    return (
      <div className="space-y-4">
        <div>
          <Label>Metode Pembayaran</Label>
          <Select
            value={paymentMethod}
            onValueChange={(value) => {
              setPaymentMethod(value as PaymentMethod);
              if (value === "cash") {
                setPaidAmount(totalAmount);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  <span>Tunai</span>
                </div>
              </SelectItem>
              <SelectItem value="qris">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  <span>QRIS</span>
                </div>
              </SelectItem>
              <SelectItem value="transfer">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  <span>Transfer Bank</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {paymentMethod === "cash" && (
          <>
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Total:</span>
                    <span className="font-bold">
                      {formatCurrency(totalAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span className="text-sm">Bayar ke:</span>
                    <span className="text-sm">{DUMMY_BRI_BANK_NAME}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span className="text-sm">Akun:</span>
                    <span className="text-sm font-mono">{DUMMY_BRI_ATM}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div>
              <Label htmlFor="paid-amount">Jumlah Dibayar</Label>
              <Input
                id="paid-amount"
                type="number"
                value={paidAmount || ""}
                onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                placeholder="0"
                className="text-lg"
                min={0}
                step={500} // Kelipatan 500
              />
            </div>

            {paidAmount > 0 && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total:</span>
                      <span className="font-bold">
                        {formatCurrency(totalAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Dibayar:</span>
                      <span className="font-bold">
                        {formatCurrency(paidAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-t pt-2">
                      <span className="text-sm font-medium">Kembalian:</span>
                      <span className="text-2xl font-bold text-primary">
                        {formatCurrency(changeAmount)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {paymentMethod === "transfer" && (
          <>
            <div>
              <Label>Pilih Bank</Label>
              <Select value={selectedBank} onValueChange={setSelectedBank}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bri">
                    BRI (Bank Rakyat Indonesia)
                  </SelectItem>
                  <SelectItem value="bni">
                    BNI (Bank Negara Indonesia)
                  </SelectItem>
                  <SelectItem value="bca">BCA (Bank Central Asia)</SelectItem>
                  <SelectItem value="permata">Bank Permata</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Total:</span>
                    <span className="font-bold">
                      {formatCurrency(totalAmount)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Virtual account akan digenerate setelah konfirmasi
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {paymentMethod === "qris" && (
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Total:</span>
                  <span className="font-bold">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  QR code akan digenerate untuk pembayaran
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Batal
          </Button>
          <Button
            onClick={handleProcessPayment}
            className="flex-1"
            disabled={
              (paymentMethod === "cash" && paidAmount < totalAmount) ||
              (paymentMethod !== "cash" && (!items || items.length === 0))
            }
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Proses Pembayaran
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pembayaran</DialogTitle>
          <DialogDescription>
            Selesaikan pembayaran untuk Order #{orderId}
          </DialogDescription>
        </DialogHeader>
        {renderPaymentContent()}
      </DialogContent>
    </Dialog>
  );
}
