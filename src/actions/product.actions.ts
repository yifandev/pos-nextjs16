"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { productSchema } from "@/lib/validations";
import { ActionResponse, ProductFormData, ProductWithRelations } from "@/types";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

// Get all products
export async function getProducts(): Promise<
  ActionResponse<ProductWithRelations[]>
> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const products = await prisma.product.findMany({
      include: {
        category: true,
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, data: products };
  } catch (error) {
    console.error("Error fetching products:", error);
    return { success: false, error: "Gagal mengambil data produk" };
  }
}

// Get single product
export async function getProduct(
  id: string
): Promise<ActionResponse<ProductWithRelations>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!product) {
      return { success: false, error: "Produk tidak ditemukan" };
    }

    return { success: true, data: product };
  } catch (error) {
    console.error("Error fetching product:", error);
    return { success: false, error: "Gagal mengambil data produk" };
  }
}

// Get product by SKU or Barcode (for cashier)
export async function getProductByCode(
  code: string
): Promise<ActionResponse<ProductWithRelations>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const product = await prisma.product.findFirst({
      where: {
        OR: [{ sku: code }, { barcode: code }],
        isActive: true,
      },
      include: {
        category: true,
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!product) {
      return { success: false, error: "Produk tidak ditemukan" };
    }

    if (product.stock <= 0) {
      return { success: false, error: "Produk stok habis" };
    }

    return { success: true, data: product };
  } catch (error) {
    console.error("Error fetching product by code:", error);
    return { success: false, error: "Gagal mengambil data produk" };
  }
}

// Create product
export async function createProduct(
  data: ProductFormData
): Promise<ActionResponse<ProductWithRelations>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user || session.user.role !== "admin") {
      return { success: false, error: "Unauthorized - Admin only" };
    }

    // Validate data
    const validated = productSchema.parse(data);

    // Check if SKU already exists
    const existingSku = await prisma.product.findUnique({
      where: { sku: validated.sku },
    });

    if (existingSku) {
      return { success: false, error: "SKU sudah digunakan" };
    }

    // Check if barcode already exists (if provided)
    if (validated.barcode) {
      const existingBarcode = await prisma.product.findUnique({
        where: { barcode: validated.barcode },
      });

      if (existingBarcode) {
        return { success: false, error: "Barcode sudah digunakan" };
      }
    }

    const product = await prisma.product.create({
      data: {
        ...validated,
        createdBy: session.user.id,
      },
      include: {
        category: true,
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    revalidatePath("/admin/product");
    return { success: true, data: product, message: "Produk berhasil dibuat" };
  } catch (error) {
    console.error("Error creating product:", error);
    return { success: false, error: "Gagal membuat produk" };
  }
}

// Update product
export async function updateProduct(
  id: string,
  data: ProductFormData
): Promise<ActionResponse<ProductWithRelations>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user || session.user.role !== "admin") {
      return { success: false, error: "Unauthorized - Admin only" };
    }

    // Validate data
    const validated = productSchema.parse(data);

    // Check if product exists
    const existing = await prisma.product.findUnique({
      where: { id },
    });

    if (!existing) {
      return { success: false, error: "Produk tidak ditemukan" };
    }

    // Check SKU conflict
    if (validated.sku !== existing.sku) {
      const skuConflict = await prisma.product.findUnique({
        where: { sku: validated.sku },
      });

      if (skuConflict) {
        return { success: false, error: "SKU sudah digunakan" };
      }
    }

    // Check barcode conflict
    if (validated.barcode && validated.barcode !== existing.barcode) {
      const barcodeConflict = await prisma.product.findUnique({
        where: { barcode: validated.barcode },
      });

      if (barcodeConflict) {
        return { success: false, error: "Barcode sudah digunakan" };
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data: validated,
      include: {
        category: true,
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    revalidatePath("/admin/product");
    return {
      success: true,
      data: product,
      message: "Produk berhasil diupdate",
    };
  } catch (error) {
    console.error("Error updating product:", error);
    return { success: false, error: "Gagal mengupdate produk" };
  }
}

// Delete product
export async function deleteProduct(id: string): Promise<ActionResponse> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user || session.user.role !== "admin") {
      return { success: false, error: "Unauthorized - Admin only" };
    }

    // Instead of deleting, we'll set isActive to false
    const product = await prisma.product.update({
      where: { id },
      data: {
        isActive: false,
      },
    });

    revalidatePath("/admin/product");
    return { success: true, message: "Produk berhasil dinonaktifkan" };
  } catch (error) {
    console.error("Error deleting product:", error);
    return { success: false, error: "Gagal menghapus produk" };
  }
}
