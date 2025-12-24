import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/format";

interface TransferPaymentFormProps {
  selectedBank: string;
  onBankChange: (bank: string) => void;
  totalAmount: number;
}

const BANKS = [
  { value: "bri", label: "BRI", fullName: "Bank Rakyat Indonesia" },
  { value: "bni", label: "BNI", fullName: "Bank Negara Indonesia" },
  { value: "bca", label: "BCA", fullName: "Bank Central Asia" },
  { value: "permata", label: "Permata", fullName: "Bank Permata" },
] as const;

export function TransferPaymentForm({
  selectedBank,
  onBankChange,
  totalAmount,
}: TransferPaymentFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Pilih Bank</label>
        <Select value={selectedBank} onValueChange={onBankChange}>
          <SelectTrigger className="h-12">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {BANKS.map((bank) => (
              <SelectItem key={bank.value} value={bank.value}>
                <div className="flex flex-col py-1">
                  <span className="font-medium">{bank.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {bank.fullName}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="bg-linear-to-r from-blue-50 to-blue-100/50 border-blue-200">
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-blue-700">
                Total Pembayaran:
              </span>
              <span className="font-bold text-lg text-blue-800">
                {formatCurrency(totalAmount)}
              </span>
            </div>
            <p className="text-sm text-blue-600/80">
              Virtual account akan digenerate secara otomatis setelah konfirmasi
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
