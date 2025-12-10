"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { categorySchema } from "@/lib/validations";
import {
  ActionResponse,
  CategoryFormData,
  CategoryWithProducts,
} from "@/types";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

// Get all categories
export async function getCategories(): Promise<
  ActionResponse<CategoryWithProducts[]>
> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const categories = await prisma.category.findMany({
      include: {
        products: true,
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

    return { success: true, data: categories };
  } catch (error) {
    console.error("Error fetching categories:", error);
    return { success: false, error: "Gagal mengambil data kategori" };
  }
}

// Get single category
export async function getCategory(
  id: string
): Promise<ActionResponse<CategoryWithProducts>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        products: true,
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!category) {
      return { success: false, error: "Kategori tidak ditemukan" };
    }

    return { success: true, data: category };
  } catch (error) {
    console.error("Error fetching category:", error);
    return { success: false, error: "Gagal mengambil data kategori" };
  }
}

// Create category
export async function createCategory(
  data: CategoryFormData
): Promise<ActionResponse<CategoryWithProducts>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Validate data
    const validated = categorySchema.parse(data);

    // Check if category name already exists
    const existing = await prisma.category.findUnique({
      where: { name: validated.name },
    });

    if (existing) {
      return { success: false, error: "Kategori dengan nama ini sudah ada" };
    }

    const category = await prisma.category.create({
      data: {
        ...validated,
        createdBy: session.user.id,
      },
      include: {
        products: true,
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    revalidatePath("/admin/category");
    return {
      success: true,
      data: category,
      message: "Kategori berhasil dibuat",
    };
  } catch (error) {
    console.error("Error creating category:", error);
    return { success: false, error: "Gagal membuat kategori" };
  }
}

// Update category
export async function updateCategory(
  id: string,
  data: CategoryFormData
): Promise<ActionResponse<CategoryWithProducts>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Validate data
    const validated = categorySchema.parse(data);

    // Check if category exists
    const existing = await prisma.category.findUnique({
      where: { id },
    });

    if (!existing) {
      return { success: false, error: "Kategori tidak ditemukan" };
    }

    // Check if new name conflicts with another category
    if (validated.name !== existing.name) {
      const nameConflict = await prisma.category.findUnique({
        where: { name: validated.name },
      });

      if (nameConflict) {
        return { success: false, error: "Kategori dengan nama ini sudah ada" };
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data: validated,
      include: {
        products: true,
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    revalidatePath("/admin/category");
    return {
      success: true,
      data: category,
      message: "Kategori berhasil diupdate",
    };
  } catch (error) {
    console.error("Error updating category:", error);
    return { success: false, error: "Gagal mengupdate kategori" };
  }
}

// Delete category
export async function deleteCategory(id: string): Promise<ActionResponse> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user || session.user.role !== "admin") {
      return { success: false, error: "Unauthorized - Admin only" };
    }

    // Check if category has products
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        products: true,
      },
    });

    if (!category) {
      return { success: false, error: "Kategori tidak ditemukan" };
    }

    if (category.products.length > 0) {
      return {
        success: false,
        error: "Tidak dapat menghapus kategori yang memiliki produk",
      };
    }

    await prisma.category.delete({
      where: { id },
    });

    revalidatePath("/admin/category");
    return { success: true, message: "Kategori berhasil dihapus" };
  } catch (error) {
    console.error("Error deleting category:", error);
    return { success: false, error: "Gagal menghapus kategori" };
  }
}
