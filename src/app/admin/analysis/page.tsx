"use client";

import * as React from "react";
import {
  getSalesAnalytics,
  AnalyticsFilters as FilterType,
} from "@/actions/analytics.actions";
import { OverviewCards } from "@/components/features/analytics/overview-cards";
import { SalesTrendChart } from "@/components/features/analytics/sales-trend-chart";
import { TopProductsChart } from "@/components/features/analytics/top-products-chart";
import { PaymentMethodsChart } from "@/components/features/analytics/payment-methods-chart";
import { CashierPerformanceTable } from "@/components/features/analytics/cashier-performance-table";
import { CategoryPerformanceChart } from "@/components/features/analytics/category-performance-chart";
import { RecentSalesList } from "@/components/features/analytics/recent-sales-list";
import {
  AnalyticsFilters,
  PeriodFilter,
} from "@/components/features/analytics/analytics-filters";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency, formatDateTime } from "@/lib/utils/format";

export default function AnalysisPage() {
  const [data, setData] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [period, setPeriod] = React.useState<PeriodFilter>("month");

  const loadAnalytics = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const filters: FilterType = { period };
      const result = await getSalesAnalytics(filters);

      if (result.success && result.data) {
        setData(result.data);
      } else {
        toast.error(result.error || "Gagal memuat data analytics");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat memuat data");
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  React.useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const handleExportExcel = () => {
    if (!data) {
      toast.error("Tidak ada data untuk diexport");
      return;
    }

    try {
      // Create workbook
      const wb = XLSX.utils.book_new();

      // Overview sheet
      const overviewData = [
        {
          Metric: "Total Pendapatan",
          Value: formatCurrency(data.overview.totalRevenue),
        },
        {
          Metric: "Total Penjualan",
          Value: formatCurrency(data.overview.totalSales),
        },
        { Metric: "Total Transaksi", Value: data.overview.totalTransactions },
        {
          Metric: "Rata-rata Transaksi",
          Value: formatCurrency(data.overview.averageTransaction),
        },
        {
          Metric: "Total Pajak",
          Value: formatCurrency(data.overview.totalTax),
        },
      ];
      const wsOverview = XLSX.utils.json_to_sheet(overviewData);
      XLSX.utils.book_append_sheet(wb, wsOverview, "Overview");

      // Top Products sheet
      const productsData = data.topProducts.map((p: any) => ({
        Produk: p.productName,
        Kategori: p.categoryName,
        Terjual: p.totalQuantity,
        Pendapatan: formatCurrency(p.totalRevenue),
        Transaksi: p.transactionCount,
      }));
      const wsProducts = XLSX.utils.json_to_sheet(productsData);
      XLSX.utils.book_append_sheet(wb, wsProducts, "Top Produk");

      // Categories sheet
      const categoriesData = data.topCategories.map((c: any) => ({
        Kategori: c.categoryName,
        Terjual: c.totalQuantity,
        Pendapatan: formatCurrency(c.totalRevenue),
      }));
      const wsCategories = XLSX.utils.json_to_sheet(categoriesData);
      XLSX.utils.book_append_sheet(wb, wsCategories, "Kategori");

      // Cashier Performance sheet
      const cashierData = data.cashierPerformance.map((c: any) => ({
        Kasir: c.cashierName,
        "Total Penjualan": formatCurrency(c.totalSales),
        Transaksi: c.transactionCount,
        "Rata-rata": formatCurrency(c.averageTransaction),
      }));
      const wsCashier = XLSX.utils.json_to_sheet(cashierData);
      XLSX.utils.book_append_sheet(wb, wsCashier, "Performa Kasir");

      // Payment Methods sheet
      const paymentData = data.paymentMethods.map((p: any) => ({
        Metode: p.method.toUpperCase(),
        Transaksi: p.count,
        Total: formatCurrency(p.total),
        Persentase: `${p.percentage.toFixed(2)}%`,
      }));
      const wsPayment = XLSX.utils.json_to_sheet(paymentData);
      XLSX.utils.book_append_sheet(wb, wsPayment, "Metode Pembayaran");

      // Save file
      XLSX.writeFile(
        wb,
        `analytics-${period}-${new Date().toISOString().split("T")[0]}.xlsx`
      );
      toast.success("Data berhasil diexport ke Excel");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Gagal export data");
    }
  };

  const handleExportPDF = () => {
    if (!data) {
      toast.error("Tidak ada data untuk diexport");
      return;
    }

    try {
      const doc = new jsPDF();
      let yPos = 15;

      // Title
      doc.setFontSize(18);
      doc.text("Laporan Analytics", 14, yPos);
      yPos += 10;

      // Period and date
      doc.setFontSize(10);
      doc.text(`Periode: ${period}`, 14, yPos);
      doc.text(`Tanggal: ${formatDateTime(new Date())}`, 14, yPos + 5);
      yPos += 15;

      // Overview
      doc.setFontSize(14);
      doc.text("Overview", 14, yPos);
      yPos += 7;

      autoTable(doc, {
        startY: yPos,
        head: [["Metric", "Value"]],
        body: [
          ["Total Pendapatan", formatCurrency(data.overview.totalRevenue)],
          ["Total Penjualan", formatCurrency(data.overview.totalSales)],
          ["Total Transaksi", data.overview.totalTransactions.toString()],
          [
            "Rata-rata Transaksi",
            formatCurrency(data.overview.averageTransaction),
          ],
          ["Total Pajak", formatCurrency(data.overview.totalTax)],
        ],
        theme: "grid",
        headStyles: { fillColor: [41, 128, 185] },
      });

      yPos = (doc as any).lastAutoTable.finalY + 10;

      // Top Products
      if (yPos > 250) {
        doc.addPage();
        yPos = 15;
      }

      doc.setFontSize(14);
      doc.text("Top 10 Produk", 14, yPos);
      yPos += 7;

      autoTable(doc, {
        startY: yPos,
        head: [["Produk", "Kategori", "Terjual", "Pendapatan"]],
        body: data.topProducts
          .slice(0, 10)
          .map((p: any) => [
            p.productName,
            p.categoryName,
            p.totalQuantity.toString(),
            formatCurrency(p.totalRevenue),
          ]),
        theme: "grid",
        headStyles: { fillColor: [41, 128, 185] },
        styles: { fontSize: 8 },
      });

      // Add new page for cashier performance
      doc.addPage();
      yPos = 15;

      doc.setFontSize(14);
      doc.text("Performa Kasir", 14, yPos);
      yPos += 7;

      autoTable(doc, {
        startY: yPos,
        head: [["Kasir", "Total Penjualan", "Transaksi", "Rata-rata"]],
        body: data.cashierPerformance.map((c: any) => [
          c.cashierName,
          formatCurrency(c.totalSales),
          c.transactionCount.toString(),
          formatCurrency(c.averageTransaction),
        ]),
        theme: "grid",
        headStyles: { fillColor: [41, 128, 185] },
      });

      doc.save(
        `analytics-${period}-${new Date().toISOString().split("T")[0]}.pdf`
      );
      toast.success("Data berhasil diexport ke PDF");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Gagal export data");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Dashboard analisis penjualan dan performa
          </p>
        </div>
        <Skeleton className="h-24 w-full" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center h-[50vh]">
        <div className="text-center space-y-4">
          <div className="w-24 h-24 mx-auto rounded-full bg-card flex items-center justify-center">
            <div className="text-4xl">☕</div>
          </div>
          <p className="text-muted-foreground">
            Tidak ada data analytics yang tersedia
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Analytics
        </h1>
        <p className="text-muted-foreground">
          Dashboard analisis penjualan dan performa
        </p>
      </div>

      {/* Filters */}
      <AnalyticsFilters
        period={period}
        onPeriodChange={setPeriod}
        onExportExcel={handleExportExcel}
        onExportPDF={handleExportPDF}
        isLoading={isLoading}
      />

      {/* Charts Row 1 */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <SalesTrendChart data={data.trends.daily} />
        <PaymentMethodsChart data={data.paymentMethods} />
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <TopProductsChart data={data.topProducts} />
        <CategoryPerformanceChart data={data.topCategories} />
      </div>

      {/* Tables and Lists */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <CashierPerformanceTable data={data.cashierPerformance} />
        <RecentSalesList data={data.recentSales} />
      </div>
    </div>
  );
}
