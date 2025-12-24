import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PaymentMethod } from "@/types";
import { Wallet, Smartphone, Building2 } from "lucide-react";

interface PaymentMethodSelectProps {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
}

const PAYMENT_METHODS = [
  {
    value: "cash",
    label: "Tunai",
    icon: Wallet,
    description: "Bayar dengan uang tunai",
  },
  {
    value: "qris",
    label: "QRIS",
    icon: Smartphone,
    description: "Scan QR code via e-wallet",
  },
  {
    value: "transfer",
    label: "Transfer Bank",
    icon: Building2,
    description: "Virtual Account / Bank Transfer",
  },
] as const;

export function PaymentMethodSelect({
  value,
  onChange,
}: PaymentMethodSelectProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Metode Pembayaran</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-12">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PAYMENT_METHODS.map((method) => {
            const Icon = method.icon;
            return (
              <SelectItem key={method.value} value={method.value}>
                <div className="flex items-center gap-3 py-1">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">{method.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {method.description}
                    </span>
                  </div>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
