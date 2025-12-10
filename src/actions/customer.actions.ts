"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { customerSchema } from "@/lib/validations";
import { ActionResponse, CustomerFormData, CustomerWithSales } from "@/types";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

// Get all customers
export async function getCustomers(): Promise<
  ActionResponse<CustomerWithSales[]>
> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const customers = await prisma.customer.findMany({
      include: {
        sales: {
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

    return { success: true, data: customers };
  } catch (error) {
    console.error("Error fetching customers:", error);
    return { success: false, error: "Gagal mengambil data pelanggan" };
  }
}

// Get single customer
export async function getCustomer(
  id: string
): Promise<ActionResponse<CustomerWithSales>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        sales: {
          select: {
            id: true,
            invoice: true,
            total: true,
            createdAt: true,
          },
        },
      },
    });

    if (!customer) {
      return { success: false, error: "Pelanggan tidak ditemukan" };
    }

    return { success: true, data: customer };
  } catch (error) {
    console.error("Error fetching customer:", error);
    return { success: false, error: "Gagal mengambil data pelanggan" };
  }
}

// Create customer
export async function createCustomer(
  data: CustomerFormData
): Promise<ActionResponse<CustomerWithSales>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Validate data
    const validated = customerSchema.parse(data);

    const customer = await prisma.customer.create({
      data: validated,
      include: {
        sales: true,
      },
    });

    revalidatePath("/admin/customers");
    return {
      success: true,
      data: customer,
      message: "Pelanggan berhasil dibuat",
    };
  } catch (error) {
    console.error("Error creating customer:", error);
    return { success: false, error: "Gagal membuat pelanggan" };
  }
}

// Update customer
export async function updateCustomer(
  id: string,
  data: CustomerFormData
): Promise<ActionResponse<CustomerWithSales>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Validate data
    const validated = customerSchema.parse(data);

    const customer = await prisma.customer.update({
      where: { id },
      data: validated,
      include: {
        sales: true,
      },
    });

    revalidatePath("/admin/customers");
    return {
      success: true,
      data: customer,
      message: "Pelanggan berhasil diupdate",
    };
  } catch (error) {
    console.error("Error updating customer:", error);
    return { success: false, error: "Gagal mengupdate pelanggan" };
  }
}

// Delete customer
export async function deleteCustomer(id: string): Promise<ActionResponse> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user || session.user.role !== "admin") {
      return { success: false, error: "Unauthorized - Admin only" };
    }

    // Check if customer has sales
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        sales: true,
      },
    });

    if (!customer) {
      return { success: false, error: "Pelanggan tidak ditemukan" };
    }

    if (customer.sales.length > 0) {
      return {
        success: false,
        error:
          "Tidak dapat menghapus pelanggan yang memiliki riwayat transaksi",
      };
    }

    await prisma.customer.delete({
      where: { id },
    });

    revalidatePath("/admin/customers");
    return { success: true, message: "Pelanggan berhasil dihapus" };
  } catch (error) {
    console.error("Error deleting customer:", error);
    return { success: false, error: "Gagal menghapus pelanggan" };
  }
}
