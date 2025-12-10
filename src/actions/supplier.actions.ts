"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { supplierSchema } from "@/lib/validations";
import {
  ActionResponse,
  SupplierFormData,
  SupplierWithPurchases,
} from "@/types";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

// Get all suppliers
export async function getSuppliers(): Promise<
  ActionResponse<SupplierWithPurchases[]>
> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const suppliers = await prisma.supplier.findMany({
      include: {
        purchases: {
          select: {
            id: true,
            invoice: true,
            total: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, data: suppliers };
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return { success: false, error: "Gagal mengambil data supplier" };
  }
}

// Get single supplier
export async function getSupplier(
  id: string
): Promise<ActionResponse<SupplierWithPurchases>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: {
        purchases: {
          select: {
            id: true,
            invoice: true,
            total: true,
            createdAt: true,
          },
        },
      },
    });

    if (!supplier) {
      return { success: false, error: "Supplier tidak ditemukan" };
    }

    return { success: true, data: supplier };
  } catch (error) {
    console.error("Error fetching supplier:", error);
    return { success: false, error: "Gagal mengambil data supplier" };
  }
}

// Create supplier
export async function createSupplier(
  data: SupplierFormData
): Promise<ActionResponse<SupplierWithPurchases>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user || session.user.role !== "admin") {
      return { success: false, error: "Unauthorized - Admin only" };
    }

    // Validate data
    const validated = supplierSchema.parse(data);

    const supplier = await prisma.supplier.create({
      data: validated,
      include: {
        purchases: true,
      },
    });

    revalidatePath("/admin/supliers");
    return {
      success: true,
      data: supplier,
      message: "Supplier berhasil dibuat",
    };
  } catch (error) {
    console.error("Error creating supplier:", error);
    return { success: false, error: "Gagal membuat supplier" };
  }
}

// Update supplier
export async function updateSupplier(
  id: string,
  data: SupplierFormData
): Promise<ActionResponse<SupplierWithPurchases>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user || session.user.role !== "admin") {
      return { success: false, error: "Unauthorized - Admin only" };
    }

    // Validate data
    const validated = supplierSchema.parse(data);

    const supplier = await prisma.supplier.update({
      where: { id },
      data: validated,
      include: {
        purchases: true,
      },
    });

    revalidatePath("/admin/supliers");
    return {
      success: true,
      data: supplier,
      message: "Supplier berhasil diupdate",
    };
  } catch (error) {
    console.error("Error updating supplier:", error);
    return { success: false, error: "Gagal mengupdate supplier" };
  }
}

// Delete supplier
export async function deleteSupplier(id: string): Promise<ActionResponse> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user || session.user.role !== "admin") {
      return { success: false, error: "Unauthorized - Admin only" };
    }

    // Check if supplier has purchases
    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: {
        purchases: true,
      },
    });

    if (!supplier) {
      return { success: false, error: "Supplier tidak ditemukan" };
    }

    if (supplier.purchases.length > 0) {
      return {
        success: false,
        error: "Tidak dapat menghapus supplier yang memiliki riwayat pembelian",
      };
    }

    await prisma.supplier.delete({
      where: { id },
    });

    revalidatePath("/admin/supliers");
    return { success: true, message: "Supplier berhasil dihapus" };
  } catch (error) {
    console.error("Error deleting supplier:", error);
    return { success: false, error: "Gagal menghapus supplier" };
  }
}
