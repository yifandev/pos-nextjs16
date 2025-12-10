import { AdminDashboard } from "@/components/features/dashboard/admin-dashboard";

export default function AdminPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview penjualan dan performa bisnis Anda
        </p>
      </div>
      <AdminDashboard />
    </div>
  );
}
