"use client";

import * as React from "react";
import { DataTable, Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getSales, getSale } from "@/actions/sale.actions";
import { SaleWithDetails } from "@/types";
import { formatCurrency, formatDateTime } from "@/lib/utils/format";
import { toast } from "sonner";
import {
  Eye,
  FileText,
  CreditCard,
  Wallet,
  Smartphone,
  Download,
  FileSpreadsheet,
} from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface SalesListProps {
  viewMode?: "admin" | "cashier";
}

export function SalesListUpdated({ viewMode = "admin" }: SalesListProps) {
  const [sales, setSales] = React.useState<SaleWithDetails[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [detailDialog, setDetailDialog] = React.useState<{
    open: boolean;
    sale: SaleWithDetails | null;
  }>({ open: false, sale: null });

  const loadSales = React.useCallback(async () => {
    setIsLoading(true);
    const result = await getSales();
    if (result.success && result.data) {
      setSales(result.data);
    } else {
      toast.error(result.error);
    }
    setIsLoading(false);
  }, []);

  React.useEffect(() => {
    loadSales();
  }, [loadSales]);

  const handleViewDetail = async (id: string) => {
    const result = await getSale(id);
    if (result.success && result.data) {
      setDetailDialog({ open: true, sale: result.data });
    } else {
      toast.error(result.error);
    }
  };

  const handleExportExcel = () => {
    try {
      const exportData = sales.map((sale) => ({
        Invoice: sale.invoice,
        Tanggal: formatDateTime(sale.createdAt),
        Kasir: sale.cashier.name,
        Pelanggan: sale.customer?.name || "-",
        "Total Item": sale.items.length,
        Subtotal: sale.subtotal,
        Pajak: sale.tax,
        Total: sale.total,
        "Metode Pembayaran": sale.paymentType,
        Dibayar: sale.paid,
        Kembalian: sale.change,
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Penjualan");

      // Auto-size columns
      const maxWidth = 50;
      const colWidths = Object.keys(exportData[0] || {}).map((key) => {
        const maxLength = Math.max(
          key.length,
          ...exportData.map(
            (row) => String(row[key as keyof typeof row] || "").length
          )
        );
        return { wch: Math.min(maxLength + 2, maxWidth) };
      });
      ws["!cols"] = colWidths;

      XLSX.writeFile(
        wb,
        `sales-report-${new Date().toISOString().split("T")[0]}.xlsx`
      );
      toast.success("Data berhasil diexport ke Excel");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Gagal export data");
    }
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF("landscape");

      doc.setFontSize(16);
      doc.text("Laporan Penjualan", 14, 15);

      doc.setFontSize(10);
      doc.text(`Tanggal: ${formatDateTime(new Date())}`, 14, 22);
      doc.text(`Total Transaksi: ${sales.length}`, 14, 27);

      const tableData = sales.map((sale) => [
        sale.invoice,
        formatDateTime(sale.createdAt),
        sale.cashier.name,
        sale.customer?.name || "-",
        sale.items.length.toString(),
        formatCurrency(sale.total),
        sale.paymentType,
      ]);

      autoTable(doc, {
        startY: 35,
        head: [
          [
            "Invoice",
            "Tanggal",
            "Kasir",
            "Pelanggan",
            "Items",
            "Total",
            "Pembayaran",
          ],
        ],
        body: tableData,
        theme: "grid",
        headStyles: { fillColor: [41, 128, 185] },
        styles: { fontSize: 8 },
      });

      // Add summary
      const finalY = (doc as any).lastAutoTable.finalY + 10;
      const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);

      doc.setFontSize(10);
      doc.text(`Total Pendapatan: ${formatCurrency(totalRevenue)}`, 14, finalY);

      doc.save(`sales-report-${new Date().toISOString().split("T")[0]}.pdf`);
      toast.success("Data berhasil diexport ke PDF");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Gagal export data");
    }
  };

  const getPaymentIcon = (type: string) => {
    switch (type) {
      case "cash":
        return <Wallet className="h-4 w-4" />;
      case "qris":
        return <Smartphone className="h-4 w-4" />;
      case "transfer":
        return <CreditCard className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const columns: Column<SaleWithDetails>[] = [
    {
      header: "Invoice",
      accessorKey: "invoice",
      sortable: true,
      cell: (item) => (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="font-mono font-medium">{item.invoice}</span>
        </div>
      ),
    },
    {
      header: "Kasir",
      cell: (item) => <div>{item.cashier.name}</div>,
    },
    {
      header: "Pelanggan",
      cell: (item) => (
        <div>
          {item.customer?.name || (
            <span className="text-muted-foreground">-</span>
          )}
        </div>
      ),
    },
    {
      header: "Total Item",
      cell: (item) => (
        <Badge variant="secondary">{item.items.length} item</Badge>
      ),
    },
    {
      header: "Pembayaran",
      cell: (item) => (
        <div className="flex items-center gap-2">
          {getPaymentIcon(item.paymentType)}
          <span className="capitalize">{item.paymentType}</span>
        </div>
      ),
    },
    {
      header: "Total",
      cell: (item) => (
        <div className="font-bold text-primary">
          {formatCurrency(item.total)}
        </div>
      ),
    },
    {
      header: "Waktu",
      cell: (item) => (
        <div className="text-sm text-muted-foreground">
          {formatDateTime(item.createdAt)}
        </div>
      ),
    },
    {
      header: "Aksi",
      cell: (item) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleViewDetail(item.id)}
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {viewMode === "admin" ? "Semua Penjualan" : "Riwayat Penjualan"}
          </h2>
          <p className="text-muted-foreground">
            Lihat riwayat transaksi penjualan
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportExcel}
            disabled={isLoading || sales.length === 0}
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPDF}
            disabled={isLoading || sales.length === 0}
          >
            <FileText className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={sales}
        searchKey="invoice"
        searchPlaceholder="Cari invoice..."
        isLoading={isLoading}
        emptyMessage="Belum ada transaksi"
      />

      <Dialog
        open={detailDialog.open}
        onOpenChange={(open) => setDetailDialog({ open, sale: null })}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detail Penjualan</DialogTitle>
            <DialogDescription>
              Invoice: {detailDialog.sale?.invoice}
            </DialogDescription>
          </DialogHeader>

          {detailDialog.sale && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Kasir
                  </div>
                  <div className="font-medium">
                    {detailDialog.sale.cashier.name}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Pelanggan
                  </div>
                  <div>{detailDialog.sale.customer?.name || "-"}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Pembayaran
                  </div>
                  <div className="flex items-center gap-2 capitalize">
                    {getPaymentIcon(detailDialog.sale.paymentType)}
                    {detailDialog.sale.paymentType}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Waktu
                  </div>
                  <div>{formatDateTime(detailDialog.sale.createdAt)}</div>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium mb-2">Items:</div>
                <div className="space-y-2">
                  {detailDialog.sale.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center border p-3 rounded-md"
                    >
                      <div>
                        <div className="font-medium">{item.product.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.quantity} x {formatCurrency(item.price)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">
                          {formatCurrency(item.subtotal)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          + {formatCurrency(item.taxAmount)} pajak
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(detailDialog.sale.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Pajak (PPN):</span>
                  <span>{formatCurrency(detailDialog.sale.tax)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-primary">
                    {formatCurrency(detailDialog.sale.total)}
                  </span>
                </div>
                <div className="flex justify-between text-sm border-t pt-2">
                  <span>Dibayar:</span>
                  <span>{formatCurrency(detailDialog.sale.paid)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Kembalian:</span>
                  <span className="font-medium">
                    {formatCurrency(detailDialog.sale.change)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
