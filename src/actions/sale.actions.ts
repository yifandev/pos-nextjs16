"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { saleSchema } from "@/lib/validations";
import { ActionResponse, SaleFormData, SaleWithDetails } from "@/types";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

// Get all sales
export async function getSales(): Promise<ActionResponse<SaleWithDetails[]>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const sales = await prisma.sale.findMany({
      include: {
        cashier: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
        payments: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, data: sales };
  } catch (error) {
    console.error("Error fetching sales:", error);
    return { success: false, error: "Gagal mengambil data penjualan" };
  }
}

// Get sales by cashier
export async function getMySales(): Promise<ActionResponse<SaleWithDetails[]>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const sales = await prisma.sale.findMany({
      where: {
        cashierId: session.user.id,
      },
      include: {
        cashier: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
        payments: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, data: sales };
  } catch (error) {
    console.error("Error fetching my sales:", error);
    return { success: false, error: "Gagal mengambil data penjualan" };
  }
}

// Get single sale
export async function getSale(
  id: string
): Promise<ActionResponse<SaleWithDetails>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const sale = await prisma.sale.findUnique({
      where: { id },
      include: {
        cashier: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
        payments: true,
      },
    });

    if (!sale) {
      return { success: false, error: "Penjualan tidak ditemukan" };
    }

    return { success: true, data: sale };
  } catch (error) {
    console.error("Error fetching sale:", error);
    return { success: false, error: "Gagal mengambil data penjualan" };
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
  return `INV-${year}${month}${day}-${random}`;
}

// Create sale
export async function createSale(
  data: SaleFormData
): Promise<ActionResponse<SaleWithDetails>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Validate data
    const validated = saleSchema.parse(data);

    // Get all products
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: validated.items.map((item) => item.productId),
        },
      },
    });

    // Check stock availability
    for (const item of validated.items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        return { success: false, error: `Produk tidak ditemukan` };
      }
      if (product.stock < item.quantity) {
        return { success: false, error: `Stok ${product.name} tidak cukup` };
      }
    }

    // Calculate totals
    let subtotal = 0;
    let tax = 0;
    const itemsWithCalculations = validated.items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;
      const itemSubtotal = product.price * item.quantity;
      const taxAmount = itemSubtotal * product.taxRate;
      subtotal += itemSubtotal;
      tax += taxAmount;

      return {
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
        taxRate: product.taxRate,
        taxAmount,
        subtotal: itemSubtotal + taxAmount,
      };
    });

    const total = subtotal + tax;
    const change = validated.paid - total;

    if (change < 0) {
      return { success: false, error: "Jumlah bayar kurang" };
    }

    // Generate unique invoice
    let invoice = generateInvoiceNumber();
    let invoiceExists = await prisma.sale.findUnique({
      where: { invoice },
    });

    while (invoiceExists) {
      invoice = generateInvoiceNumber();
      invoiceExists = await prisma.sale.findUnique({
        where: { invoice },
      });
    }

    // Create sale with items in a transaction
    const sale = await prisma.$transaction(async (tx) => {
      // Create sale
      const newSale = await tx.sale.create({
        data: {
          invoice,
          cashierId: session.user.id,
          customerId: validated.customerId,
          total,
          subtotal,
          tax,
          paymentType: validated.paymentType,
          paid: validated.paid,
          change,
          items: {
            create: itemsWithCalculations,
          },
          payments: {
            create: {
              method: validated.paymentType,
              amount: validated.paid,
            },
          },
        },
        include: {
          cashier: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          customer: true,
          items: {
            include: {
              product: true,
            },
          },
          payments: true,
        },
      });

      // Decrease product stock
      for (const item of validated.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      return newSale;
    });

    revalidatePath("/cashier/sales");
    revalidatePath("/admin/analysis");
    revalidatePath("/admin/product");
    return { success: true, data: sale, message: "Transaksi berhasil" };
  } catch (error) {
    console.error("Error creating sale:", error);
    return { success: false, error: "Gagal membuat transaksi" };
  }
}

// Get sales analytics
export async function getSalesAnalytics(
  startDate?: Date,
  endDate?: Date
): Promise<ActionResponse<any>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user || session.user.role !== "admin") {
      return { success: false, error: "Unauthorized - Admin only" };
    }

    const where = {
      createdAt: {
        ...(startDate && { gte: startDate }),
        ...(endDate && { lte: endDate }),
      },
    };

    const [totalSales, totalRevenue, salesCount, topProducts] =
      await Promise.all([
        // Total sales amount
        prisma.sale.aggregate({
          where,
          _sum: {
            total: true,
          },
        }),
        // Revenue breakdown
        prisma.sale.aggregate({
          where,
          _sum: {
            subtotal: true,
            tax: true,
          },
        }),
        // Number of sales
        prisma.sale.count({ where }),
        // Top selling products
        prisma.saleItem.groupBy({
          by: ["productId"],
          where: {
            sale: where,
          },
          _sum: {
            quantity: true,
            subtotal: true,
          },
          orderBy: {
            _sum: {
              quantity: "desc",
            },
          },
          take: 10,
        }),
      ]);

    // Get product details for top products
    const productIds = topProducts.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
      include: {
        category: true,
      },
    });

    const topProductsWithDetails = topProducts.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return {
        product,
        totalQuantity: item._sum.quantity || 0,
        totalRevenue: item._sum.subtotal || 0,
      };
    });

    return {
      success: true,
      data: {
        totalSales: totalSales._sum.total || 0,
        totalRevenue: totalRevenue._sum.subtotal || 0,
        totalTax: totalRevenue._sum.tax || 0,
        salesCount,
        topProducts: topProductsWithDetails,
      },
    };
  } catch (error) {
    console.error("Error fetching sales analytics:", error);
    return { success: false, error: "Gagal mengambil data analytics" };
  }
}
