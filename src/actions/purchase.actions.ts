"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { purchaseOrderSchema } from "@/lib/validations";
import {
  ActionResponse,
  PurchaseOrderFormData,
  PurchaseOrderWithDetails,
} from "@/types";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

// Get all purchase orders
export async function getPurchaseOrders(): Promise<
  ActionResponse<PurchaseOrderWithDetails[]>
> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const purchases = await prisma.purchaseOrder.findMany({
      include: {
        supplier: true,
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, data: purchases };
  } catch (error) {
    console.error("Error fetching purchase orders:", error);
    return { success: false, error: "Gagal mengambil data pembelian" };
  }
}

// Get single purchase order
export async function getPurchaseOrder(
  id: string
): Promise<ActionResponse<PurchaseOrderWithDetails>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const purchase = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        supplier: true,
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!purchase) {
      return { success: false, error: "Purchase order tidak ditemukan" };
    }

    return { success: true, data: purchase };
  } catch (error) {
    console.error("Error fetching purchase order:", error);
    return { success: false, error: "Gagal mengambil data pembelian" };
  }
}

// Generate invoice number
function generateInvoiceNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `PO-${year}${month}${day}-${random}`;
}

// Create purchase order
export async function createPurchaseOrder(
  data: PurchaseOrderFormData
): Promise<ActionResponse<PurchaseOrderWithDetails>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user || session.user.role !== "admin") {
      return { success: false, error: "Unauthorized - Admin only" };
    }

    // Validate data
    const validated = purchaseOrderSchema.parse(data);

    // Calculate total
    let total = 0;
    const itemsWithSubtotal = validated.items.map((item) => {
      const subtotal = item.quantity * item.cost;
      total += subtotal;
      return {
        ...item,
        subtotal,
      };
    });

    // Generate unique invoice
    let invoice = generateInvoiceNumber();
    let invoiceExists = await prisma.purchaseOrder.findUnique({
      where: { invoice },
    });

    while (invoiceExists) {
      invoice = generateInvoiceNumber();
      invoiceExists = await prisma.purchaseOrder.findUnique({
        where: { invoice },
      });
    }

    // Create purchase order with items in a transaction
    const purchase = await prisma.$transaction(async (tx) => {
      // Create purchase order
      const po = await tx.purchaseOrder.create({
        data: {
          invoice,
          supplierId: validated.supplierId,
          createdBy: session.user.id,
          total,
          items: {
            create: itemsWithSubtotal,
          },
        },
        include: {
          supplier: true,
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      // Update product stock
      for (const item of validated.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });
      }

      return po;
    });

    revalidatePath("/admin/purchases");
    revalidatePath("/admin/product");
    return {
      success: true,
      data: purchase,
      message: "Purchase order berhasil dibuat",
    };
  } catch (error) {
    console.error("Error creating purchase order:", error);
    return { success: false, error: "Gagal membuat purchase order" };
  }
}

// Delete purchase order (admin only, and will decrease stock)
export async function deletePurchaseOrder(id: string): Promise<ActionResponse> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user || session.user.role !== "admin") {
      return { success: false, error: "Unauthorized - Admin only" };
    }

    const purchase = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!purchase) {
      return { success: false, error: "Purchase order tidak ditemukan" };
    }

    // Delete and adjust stock in transaction
    await prisma.$transaction(async (tx) => {
      // Decrease stock
      for (const item of purchase.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      // Delete purchase order (cascade will delete items)
      await tx.purchaseOrder.delete({
        where: { id },
      });
    });

    revalidatePath("/admin/purchases");
    revalidatePath("/admin/product");
    return { success: true, message: "Purchase order berhasil dihapus" };
  } catch (error) {
    console.error("Error deleting purchase order:", error);
    return { success: false, error: "Gagal menghapus purchase order" };
  }
}
