"use client";

import * as React from "react";
import { DataTable, Column } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { CategoryForm } from "./category-form";
import { deleteCategory, getCategories } from "@/actions/category.actions";
import { CategoryWithProducts } from "@/types";
import { formatDate } from "@/lib/utils/format";
import { toast } from "sonner";
import { Pencil, Trash2, Plus } from "lucide-react";

export function CategoryList() {
  const [categories, setCategories] = React.useState<CategoryWithProducts[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedCategory, setSelectedCategory] = React.useState<CategoryWithProducts | undefined>();
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [deleteDialog, setDeleteDialog] = React.useState<{
    open: boolean;
    categoryId: string | null;
  }>({ open: false, categoryId: null });

  const loadCategories = React.useCallback(async () => {
    setIsLoading(true);
    const result = await getCategories();
    if (result.success && result.data) {
      setCategories(result.data);
    } else {
      toast.error(result.error);
    }
    setIsLoading(false);
  }, []);

  React.useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleEdit = (category: CategoryWithProducts) => {
    setSelectedCategory(category);
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteDialog.categoryId) return;

    const result = await deleteCategory(deleteDialog.categoryId);
    if (result.success) {
      toast.success(result.message);
      loadCategories();
    } else {
      toast.error(result.error);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedCategory(undefined);
  };

  const columns: Column<CategoryWithProducts>[] = [
    {
      header: "Nama",
      accessorKey: "name",
      sortable: true,
      cell: (item) => (
        <div className="font-medium">{item.name}</div>
      ),
    },
    {
      header: "Deskripsi",
      accessorKey: "description",
      cell: (item) => (
        <div className="text-muted-foreground max-w-md truncate">
          {item.description || "-"}
        </div>
      ),
    },
    {
      header: "Jumlah Produk",
      cell: (item) => (
        <Badge variant="secondary">
          {item.products.length} produk
        </Badge>
      ),
    },
    {
      header: "Dibuat Oleh",
      cell: (item) => (
        <div className="text-sm">
          <div>{item.creator.name}</div>
          <div className="text-muted-foreground text-xs">
            {formatDate(item.createdAt)}
          </div>
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
              setDeleteDialog({ open: true, categoryId: item.id })
            }
            disabled={item.products.length > 0}
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
          <h2 className="text-2xl font-bold tracking-tight">Kategori</h2>
          <p className="text-muted-foreground">
            Kelola kategori produk Anda
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Kategori
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={categories}
        searchKey="name"
        searchPlaceholder="Cari kategori..."
        isLoading={isLoading}
        emptyMessage="Belum ada kategori"
      />

      <CategoryForm
        open={isFormOpen}
        onOpenChange={handleFormClose}
        category={selectedCategory}
        onSuccess={loadCategories}
      />

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          setDeleteDialog({ open, categoryId: null })
        }
        title="Hapus Kategori"
        description="Apakah Anda yakin ingin menghapus kategori ini? Aksi ini tidak dapat dibatalkan."
        onConfirm={handleDelete}
        confirmText="Hapus"
        cancelText="Batal"
        variant="destructive"
      />
    </div>
  );
}
