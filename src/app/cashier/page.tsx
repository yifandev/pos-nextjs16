import { POSSystem } from "@/components/features/cashier/pos-system";

export default function CashierOrderPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Point of Sale</h1>
        <p className="text-muted-foreground">Buat transaksi penjualan baru</p>
      </div>
      <POSSystem />
    </div>
  );
}
