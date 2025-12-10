"use client";

import * as React from "react";
import { DataTable, Column } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PurchaseForm } from "./purchase-form";
import { getPurchaseOrders, getPurchaseOrder } from "@/actions/purchase.actions";
import { PurchaseOrderWithDetails } from "@/types";
import { formatCurrency, formatDateTime } from "@/lib/utils/format";
import { toast } from "sonner";
import { Plus, Eye, FileText } from "lucide-react";

export function PurchaseList() {
  const [purchases, setPurchases] = React.useState<PurchaseOrderWithDetails[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [detailDialog, setDetailDialog] = React.useState<{
    open: boolean;
    purchase: PurchaseOrderWithDetails | null;
  }>({ open: false, purchase: null });

  const loadPurchases = React.useCallback(async () => {
    setIsLoading(true);
    const result = await getPurchaseOrders();
    if (result.success && result.data) {
      setPurchases(result.data);
    } else {
      toast.error(result.error);
    }
    setIsLoading(false);
  }, []);

  React.useEffect(() => {
    loadPurchases();
  }, [loadPurchases]);

  const handleViewDetail = async (id: string) => {
    const result = await getPurchaseOrder(id);
    if (result.success && result.data) {
      setDetailDialog({ open: true, purchase: result.data });
    } else {
      toast.error(result.error);
    }
  };

  const columns: Column<PurchaseOrderWithDetails>[] = [
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
      header: "Supplier",
      cell: (item) => (
        <div className="font-medium">{item.supplier.name}</div>
      ),
    },
    {
      header: "Total Item",
      cell: (item) => (
        <Badge variant="secondary">
          {item.items.length} item
        </Badge>
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
      header: "Dibuat Oleh",
      cell: (item) => (
        <div className="text-sm">
          <div>{item.creator.name}</div>
          <div className="text-muted-foreground">
            {formatDateTime(item.createdAt)}
          </div>
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
          <h2 className="text-2xl font-bold tracking-tight">Purchase Orders</h2>
          <p className="text-muted-foreground">
            Kelola pembelian dan stok masuk
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Buat Purchase Order
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={purchases}
        searchKey="invoice"
        searchPlaceholder="Cari invoice..."
        isLoading={isLoading}
        emptyMessage="Belum ada purchase order"
      />

      <PurchaseForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={loadPurchases}
      />

      <Dialog
        open={detailDialog.open}
        onOpenChange={(open) =>
          setDetailDialog({ open, purchase: null })
        }
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detail Purchase Order</DialogTitle>
            <DialogDescription>
              Invoice: {detailDialog.purchase?.invoice}
            </DialogDescription>
          </DialogHeader>

          {detailDialog.purchase && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Supplier
                  </div>
                  <div className="font-medium">
                    {detailDialog.purchase.supplier.name}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Tanggal
                  </div>
                  <div>{formatDateTime(detailDialog.purchase.createdAt)}</div>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium mb-2">Items:</div>
                <div className="space-y-2">
                  {detailDialog.purchase.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center border p-3 rounded-md"
                    >
                      <div>
                        <div className="font-medium">{item.product.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.quantity} x {formatCurrency(item.cost)}
                        </div>
                      </div>
                      <div className="font-bold">
                        {formatCurrency(item.subtotal)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-primary">
                    {formatCurrency(detailDialog.purchase.total)}
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
