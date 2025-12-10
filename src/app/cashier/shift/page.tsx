import { ShiftManager } from "@/components/features/shift/shift-manager";

export default function CashierShiftPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Kelola Shift</h1>
        <p className="text-muted-foreground">
          Buka dan tutup shift kasir Anda
        </p>
      </div>
      <ShiftManager />
    </div>
  );
}
