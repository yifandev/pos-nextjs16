"use client";

import * as React from "react";
import { DataTable, Column } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { SupplierForm } from "./supplier-form";
import { deleteSupplier, getSuppliers } from "@/actions/supplier.actions";
import { SupplierWithPurchases } from "@/types";
import { formatDate } from "@/lib/utils/format";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Building2 } from "lucide-react";

export function SupplierList() {
  const [suppliers, setSuppliers] = React.useState<SupplierWithPurchases[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedSupplier, setSelectedSupplier] = React.useState<SupplierWithPurchases | undefined>();
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [deleteDialog, setDeleteDialog] = React.useState<{
    open: boolean;
    supplierId: string | null;
  }>({ open: false, supplierId: null });

  const loadSuppliers = React.useCallback(async () => {
    setIsLoading(true);
    const result = await getSuppliers();
    if (result.success && result.data) {
      setSuppliers(result.data);
    } else {
      toast.error(result.error);
    }
    setIsLoading(false);
  }, []);

  React.useEffect(() => {
    loadSuppliers();
  }, [loadSuppliers]);

  const handleEdit = (supplier: SupplierWithPurchases) => {
    setSelectedSupplier(supplier);
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteDialog.supplierId) return;

    const result = await deleteSupplier(deleteDialog.supplierId);
    if (result.success) {
      toast.success(result.message);
      loadSuppliers();
    } else {
      toast.error(result.error);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedSupplier(undefined);
  };

  const columns: Column<SupplierWithPurchases>[] = [
    {
      header: "Nama",
      accessorKey: "name",
      sortable: true,
      cell: (item) => (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Building2 className="h-4 w-4 text-primary" />
          </div>
          <span className="font-medium">{item.name}</span>
        </div>
      ),
    },
    {
      header: "Kontak",
      cell: (item) => (
        <div className="text-sm">
          <div>{item.phone || "-"}</div>
          <div className="text-muted-foreground">{item.email || "-"}</div>
        </div>
      ),
    },
    {
      header: "Alamat",
      accessorKey: "address",
      cell: (item) => (
        <div className="text-sm text-muted-foreground max-w-xs truncate">
          {item.address || "-"}
        </div>
      ),
    },
    {
      header: "Total Purchase",
      cell: (item) => (
        <Badge variant="secondary">
          {item.purchases.length} PO
        </Badge>
      ),
    },
    {
      header: "Terdaftar",
      cell: (item) => (
        <div className="text-sm text-muted-foreground">
          {formatDate(item.createdAt)}
        </div>
      ),
    },
    {
      header: "Aksi",
      cell: (item) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleEdit(item)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              setDeleteDialog({ open: true, supplierId: item.id })
            }
            disabled={item.purchases.length > 0}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Supplier</h2>
          <p className="text-muted-foreground">
            Kelola data supplier Anda
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Supplier
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={suppliers}
        searchKey="name"
        searchPlaceholder="Cari supplier..."
        isLoading={isLoading}
        emptyMessage="Belum ada supplier"
      />

      <SupplierForm
        open={isFormOpen}
        onOpenChange={handleFormClose}
        supplier={selectedSupplier}
        onSuccess={loadSuppliers}
      />

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          setDeleteDialog({ open, supplierId: null })
        }
        title="Hapus Supplier"
        description="Apakah Anda yakin ingin menghapus supplier ini? Aksi ini tidak dapat dibatalkan."
        onConfirm={handleDelete}
        confirmText="Hapus"
        cancelText="Batal"
        variant="destructive"
      />
    </div>
  );
}
