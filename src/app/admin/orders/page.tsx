import { SalesListUpdated } from "@/components/features/sales/sales-list";

export default function AnalysisPage() {
  return (
    <div className="container mx-auto py-6">
      <SalesListUpdated viewMode="admin" />
    </div>
  );
}
