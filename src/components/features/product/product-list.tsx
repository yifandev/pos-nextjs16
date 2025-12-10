"use client";

import * as React from "react";
import { DataTable, Column } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ProductForm } from "./product-form";
import { deleteProduct, getProducts } from "@/actions/product.actions";
import { ProductWithRelations } from "@/types";
import { formatCurrency } from "@/lib/utils/format";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Package } from "lucide-react";
import Image from "next/image";

export function ProductList() {
  const [products, setProducts] = React.useState<ProductWithRelations[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedProduct, setSelectedProduct] = React.useState<
    ProductWithRelations | undefined
  >();
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [deleteDialog, setDeleteDialog] = React.useState<{
    open: boolean;
    productId: string | null;
  }>({ open: false, productId: null });

  const loadProducts = React.useCallback(async () => {
    setIsLoading(true);
    const result = await getProducts();
    if (result.success && result.data) {
      setProducts(result.data);
    } else {
      toast.error(result.error);
    }
    setIsLoading(false);
  }, []);

  React.useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleEdit = (product: ProductWithRelations) => {
    setSelectedProduct(product);
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteDialog.productId) return;

    const result = await deleteProduct(deleteDialog.productId);
    if (result.success) {
      toast.success(result.message);
      loadProducts();
    } else {
      toast.error(result.error);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedProduct(undefined);
  };

  const columns: Column<ProductWithRelations>[] = [
    {
      header: "Produk",
      cell: (item) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-md overflow-hidden bg-muted flex items-center justify-center">
            {item.image ? (
              <Image
                src={item.image}
                alt={item.name}
                width={40}
                height={40}
                className="object-cover"
              />
            ) : (
              <Package className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <div>
            <div className="font-medium">{item.name}</div>
            <div className="text-xs text-muted-foreground">SKU: {item.sku}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Kategori",
      cell: (item) => <Badge variant="outline">{item.category.name}</Badge>,
    },
    {
      header: "Harga",
      cell: (item) => (
        <div className="font-medium">{formatCurrency(item.price)}</div>
      ),
    },
    {
      header: "Stok",
      cell: (item) => (
        <Badge
          variant={
            item.stock > 10
              ? "default"
              : item.stock > 0
              ? "secondary"
              : "destructive"
          }
        >
          {item.stock} unit
        </Badge>
      ),
    },
    {
      header: "Status",
      cell: (item) => (
        <Badge variant={item.isActive ? "default" : "secondary"}>
          {item.isActive ? "Aktif" : "Nonaktif"}
        </Badge>
      ),
    },
    {
      header: "Aksi",
      cell: (item) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setDeleteDialog({ open: true, productId: item.id })}
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
          <h2 className="text-2xl font-bold tracking-tight">Produk</h2>
          <p className="text-muted-foreground">
            Kelola produk dan inventori Anda
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Produk
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={products}
        searchKey="name"
        searchPlaceholder="Cari produk..."
        isLoading={isLoading}
        emptyMessage="Belum ada produk"
      />

      <ProductForm
        open={isFormOpen}
        onOpenChange={handleFormClose}
        product={selectedProduct}
        onSuccess={loadProducts}
      />

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, productId: null })}
        title="Nonaktifkan Produk"
        description="Produk akan dinonaktifkan dan tidak akan muncul di kasir. Anda masih dapat mengaktifkannya kembali nanti."
        onConfirm={handleDelete}
        confirmText="Nonaktifkan"
        cancelText="Batal"
        variant="destructive"
      />
    </div>
  );
}
