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
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils/format";
import { CreditCard } from "lucide-react";
import { DUMMY_BRI_ATM, DUMMY_BRI_BANK_NAME } from "@/lib/midtrans";
import { PaymentMethod, PaymentStatus } from "@/types";
import { PaymentStatusDisplay } from "./payment-status-display";
import { QrisPaymentDisplay } from "./qris-payment-display";
import { VaPaymentDisplay } from "./va-payment-display";
import { PaymentMethodSelect } from "./payment-method-select";
import { CashPaymentForm } from "./cash-payment-form";
import { TransferPaymentForm } from "./transfer-payment-form";

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
  const [paidAmount, setPaidAmount] = React.useState<number>(totalAmount);
  const [selectedBank, setSelectedBank] = React.useState<string>("bri");
  const [paymentStatus, setPaymentStatus] =
    React.useState<PaymentStatus>("idle");
  const [paymentData, setPaymentData] = React.useState<{
    qrisUrl?: string;
    qrisString?: string;
    vaNumber?: string;
    bank?: string;
    grossAmount?: number;
  }>({});

  // Reset state ketika dialog dibuka
  React.useEffect(() => {
    if (open) {
      resetPaymentState();
    }
  }, [open, totalAmount]);

  const resetPaymentState = () => {
    setPaymentStatus("idle");
    setPaidAmount(totalAmount);
    setPaymentMethod("cash");
    setPaymentData({});
  };

  const handleMethodChange = (method: PaymentMethod) => {
    setPaymentMethod(method);
    if (method === "cash") {
      setPaidAmount(totalAmount);
    }
  };

  const processCashPayment = () => {
    if (paidAmount < totalAmount) {
      alert("Jumlah bayar kurang dari total");
      return;
    }

    const change = Math.max(0, paidAmount - totalAmount);
    onPaymentComplete({
      method: "cash",
      paid: paidAmount,
      change,
      reference: DUMMY_BRI_ATM,
    });
  };

  const processDigitalPayment = async () => {
    if (!items || items.length === 0) {
      alert("Item details are required for digital payment");
      return;
    }

    setPaymentStatus("processing");

    try {
      const endpoint =
        paymentMethod === "qris"
          ? "/api/payment/charge-qris"
          : "/api/payment/charge-transfer";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          bank: paymentMethod === "transfer" ? selectedBank : undefined,
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
        setPaymentData(result.data);
        setPaymentStatus("success");

        // Auto-confirm setelah delay
        setTimeout(
          () => {
            completePayment(result.data);
          },
          paymentMethod === "qris" ? 5000 : 2000
        );
      } else {
        throw new Error(result.error || "Payment failed");
      }
    } catch (error) {
      console.error("Payment error:", error);
      setPaymentStatus("failed");
      alert(`Payment processing failed: `);
    }
  };

  const completePayment = (data: any) => {
    onPaymentComplete({
      method: paymentMethod,
      paid: data.grossAmount || totalAmount,
      change: 0,
      reference:
        paymentMethod === "qris" ? orderId : `${data.bank}-${data.vaNumber}`,
    });
  };

  const handleManualConfirm = () => {
    onPaymentComplete({
      method: paymentMethod,
      paid: paymentData.grossAmount || totalAmount,
      change: 0,
      reference:
        paymentMethod === "qris"
          ? orderId
          : `${paymentData.bank}-${paymentData.vaNumber}`,
    });
  };

  const renderPaymentContent = () => {
    switch (paymentStatus) {
      case "processing":
        return <PaymentStatusDisplay status="processing" />;

      case "success":
        if (paymentMethod === "qris") {
          return (
            <QrisPaymentDisplay
              orderId={orderId}
              totalAmount={totalAmount}
              qrisUrl={paymentData.qrisUrl}
              qrisString={paymentData.qrisString}
              onManualConfirm={handleManualConfirm}
              onClose={() => onOpenChange(false)}
            />
          );
        }

        if (paymentMethod === "transfer" && paymentData.vaNumber) {
          return (
            <VaPaymentDisplay
              orderId={orderId}
              totalAmount={totalAmount}
              vaNumber={paymentData.vaNumber}
              bank={paymentData.bank}
              onManualConfirm={handleManualConfirm}
              onClose={() => onOpenChange(false)}
            />
          );
        }
        break;

      case "failed":
        return (
          <PaymentStatusDisplay
            status="failed"
            onRetry={() => setPaymentStatus("idle")}
          />
        );
    }

    // Default: payment form (idle state)
    return (
      <div className="space-y-6">
        <PaymentMethodSelect
          value={paymentMethod}
          onChange={handleMethodChange}
        />

        {paymentMethod === "cash" && (
          <CashPaymentForm
            totalAmount={totalAmount}
            paidAmount={paidAmount}
            onPaidAmountChange={setPaidAmount}
            bankName={DUMMY_BRI_BANK_NAME}
            accountNumber={DUMMY_BRI_ATM}
          />
        )}

        {paymentMethod === "transfer" && (
          <TransferPaymentForm
            selectedBank={selectedBank}
            onBankChange={setSelectedBank}
            totalAmount={totalAmount}
          />
        )}

        {paymentMethod === "qris" && (
          <div className="rounded-lg bg-muted/50 p-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Pembayaran:</span>
                <span className="font-bold text-lg">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                QRIS code akan digenerate untuk pembayaran via e-wallet
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Batal
          </Button>
          <Button
            onClick={
              paymentMethod === "cash"
                ? processCashPayment
                : processDigitalPayment
            }
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
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Pembayaran
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono">
              #{orderId}
            </Badge>
            <span>Selesaikan pembayaran untuk transaksi ini</span>
          </DialogDescription>
        </DialogHeader>

        {renderPaymentContent()}
      </DialogContent>
    </Dialog>
  );
}
