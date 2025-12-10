"use client";

import * as React from "react";
import { DataTable, Column } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { CustomerForm } from "./customer-form";
import { deleteCustomer, getCustomers } from "@/actions/customer.actions";
import { CustomerWithSales } from "@/types";
import { formatDate } from "@/lib/utils/format";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, User } from "lucide-react";

export function CustomerList() {
  const [customers, setCustomers] = React.useState<CustomerWithSales[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedCustomer, setSelectedCustomer] = React.useState<CustomerWithSales | undefined>();
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [deleteDialog, setDeleteDialog] = React.useState<{
    open: boolean;
    customerId: string | null;
  }>({ open: false, customerId: null });

  const loadCustomers = React.useCallback(async () => {
    setIsLoading(true);
    const result = await getCustomers();
    if (result.success && result.data) {
      setCustomers(result.data);
    } else {
      toast.error(result.error);
    }
    setIsLoading(false);
  }, []);

  React.useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const handleEdit = (customer: CustomerWithSales) => {
    setSelectedCustomer(customer);
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteDialog.customerId) return;

    const result = await deleteCustomer(deleteDialog.customerId);
    if (result.success) {
      toast.success(result.message);
      loadCustomers();
    } else {
      toast.error(result.error);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedCustomer(undefined);
  };

  const columns: Column<CustomerWithSales>[] = [
    {
      header: "Nama",
      accessorKey: "name",
      sortable: true,
      cell: (item) => (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-4 w-4 text-primary" />
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
      header: "Total Transaksi",
      cell: (item) => (
        <Badge variant="secondary">
          {item.sales.length} transaksi
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
              setDeleteDialog({ open: true, customerId: item.id })
            }
            disabled={item.sales.length > 0}
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
          <h2 className="text-2xl font-bold tracking-tight">Pelanggan</h2>
          <p className="text-muted-foreground">
            Kelola data pelanggan Anda
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Pelanggan
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={customers}
        searchKey="name"
        searchPlaceholder="Cari pelanggan..."
        isLoading={isLoading}
        emptyMessage="Belum ada pelanggan"
      />

      <CustomerForm
        open={isFormOpen}
        onOpenChange={handleFormClose}
        customer={selectedCustomer}
        onSuccess={loadCustomers}
      />

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          setDeleteDialog({ open, customerId: null })
        }
        title="Hapus Pelanggan"
        description="Apakah Anda yakin ingin menghapus pelanggan ini? Aksi ini tidak dapat dibatalkan."
        onConfirm={handleDelete}
        confirmText="Hapus"
        cancelText="Batal"
        variant="destructive"
      />
    </div>
  );
}
