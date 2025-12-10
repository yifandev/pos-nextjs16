"use server";

import { auth } from "@/lib/auth";
import { ActionResponse } from "@/types";
import { headers } from "next/headers";
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subDays,
} from "date-fns";
import prisma, { Prisma } from "@/lib/prisma";

export interface SalesAnalytics {
  overview: {
    totalRevenue: number;
    totalSales: number;
    totalTransactions: number;
    averageTransaction: number;
    totalTax: number;
  };
  trends: {
    daily: Array<{ date: string; revenue: number; transactions: number }>;
    weekly: Array<{ week: string; revenue: number; transactions: number }>;
    monthly: Array<{ month: string; revenue: number; transactions: number }>;
  };
  topProducts: Array<{
    productId: string;
    productName: string;
    categoryName: string;
    totalQuantity: number;
    totalRevenue: number;
    transactionCount: number;
  }>;
  topCategories: Array<{
    categoryId: string;
    categoryName: string;
    totalRevenue: number;
    totalQuantity: number;
  }>;
  paymentMethods: Array<{
    method: string;
    count: number;
    total: number;
    percentage: number;
  }>;
  cashierPerformance: Array<{
    cashierId: string;
    cashierName: string;
    totalSales: number;
    transactionCount: number;
    averageTransaction: number;
  }>;
  recentSales: Array<{
    id: string;
    invoice: string;
    total: number;
    items: number;
    createdAt: Date;
  }>;
}

export interface AnalyticsFilters {
  startDate?: Date;
  endDate?: Date;
  period?: "today" | "week" | "month" | "year" | "custom";
}
/**
 * Get comprehensive sales analytics
 */
export async function getSalesAnalytics(
  filters?: AnalyticsFilters
): Promise<ActionResponse<SalesAnalytics>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user || session.user.role !== "admin") {
      return { success: false, error: "Unauthorized - Admin only" };
    }

    // Determine date range based on period
    let startDate = filters?.startDate;
    let endDate = filters?.endDate;

    if (filters?.period && !startDate) {
      const now = new Date();
      switch (filters.period) {
        case "today":
          startDate = startOfDay(now);
          endDate = endOfDay(now);
          break;
        case "week":
          startDate = startOfWeek(now);
          endDate = endOfWeek(now);
          break;
        case "month":
          startDate = startOfMonth(now);
          endDate = endOfMonth(now);
          break;
        case "year":
          startDate = new Date(now.getFullYear(), 0, 1);
          endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
          break;
      }
    }

    // Create base date filter for Prisma queries
    const dateFilter = {
      ...(startDate && { gte: startDate }),
      ...(endDate && { lte: endDate }),
    };

    // Run all queries in parallel
    const [
      salesAggregate,
      topProductsData,
      paymentMethodsData,
      cashierPerformanceData,
      recentSalesData,
    ] = await Promise.all([
      // Overview aggregates
      prisma.sale.aggregate({
        where: { createdAt: dateFilter },
        _sum: { total: true, subtotal: true, tax: true },
        _count: true,
        _avg: { total: true },
      }),

      // Top products
      prisma.saleItem.groupBy({
        by: ["productId"],
        where: { sale: { createdAt: dateFilter } },
        _sum: { quantity: true, subtotal: true },
        _count: { saleId: true },
        orderBy: { _sum: { subtotal: "desc" } },
        take: 10,
      }),

      // Payment methods breakdown
      prisma.sale.groupBy({
        by: ["paymentType"],
        where: { createdAt: dateFilter },
        _sum: { total: true },
        _count: true,
      }),

      // Cashier performance
      prisma.sale.groupBy({
        by: ["cashierId"],
        where: { createdAt: dateFilter },
        _sum: { total: true },
        _count: true,
        _avg: { total: true },
        orderBy: { _sum: { total: "desc" } },
        take: 10,
      }),

      // Recent sales
      prisma.sale.findMany({
        where: { createdAt: dateFilter },
        select: {
          id: true,
          invoice: true,
          total: true,
          createdAt: true,
          items: { select: { id: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

    // Daily sales trend query - DIPERBAIKI
    const thirtyDaysAgo = subDays(new Date(), 30);
    let salesByDayQuery = Prisma.sql`
      SELECT 
        DATE("createdAt") as date,
        SUM(total) as revenue,
        COUNT(*) as transactions
      FROM sale
      WHERE "createdAt" >= ${thirtyDaysAgo}
    `;

    if (startDate) {
      salesByDayQuery = Prisma.sql`
        ${salesByDayQuery}
        AND "createdAt" >= ${startDate}
      `;
    }

    if (endDate) {
      salesByDayQuery = Prisma.sql`
        ${salesByDayQuery}
        AND "createdAt" <= ${endDate}
      `;
    }

    salesByDayQuery = Prisma.sql`
      ${salesByDayQuery}
      GROUP BY DATE("createdAt")
      ORDER BY date DESC
      LIMIT 30
    `;

    const salesByDay = await prisma.$queryRaw<
      Array<{ date: string; revenue: string; transactions: string }>
    >(salesByDayQuery);

    // Top categories query - DIPERBAIKI
    let topCategoriesQuery = Prisma.sql`
      SELECT 
        c.id as "categoryId",
        c.name as "categoryName",
        SUM(si.subtotal) as "totalRevenue",
        SUM(si.quantity) as "totalQuantity"
      FROM sale_item si
      JOIN product p ON si."productId" = p.id
      JOIN category c ON p."categoryId" = c.id
      JOIN sale s ON si."saleId" = s.id
      WHERE 1=1
    `;

    if (startDate) {
      topCategoriesQuery = Prisma.sql`
        ${topCategoriesQuery}
        AND s."createdAt" >= ${startDate}
      `;
    }

    if (endDate) {
      topCategoriesQuery = Prisma.sql`
        ${topCategoriesQuery}
        AND s."createdAt" <= ${endDate}
      `;
    }

    topCategoriesQuery = Prisma.sql`
      ${topCategoriesQuery}
      GROUP BY c.id, c.name
      ORDER BY SUM(si.subtotal) DESC
      LIMIT 10
    `;

    const topCategoriesData = await prisma.$queryRaw<
      Array<{
        categoryId: string;
        categoryName: string;
        totalRevenue: string;
        totalQuantity: string;
      }>
    >(topCategoriesQuery);

    // Get product details for top products
    const productIds = topProductsData.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { category: true },
    });

    const topProducts = topProductsData.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return {
        productId: item.productId,
        productName: product?.name || "Unknown",
        categoryName: product?.category.name || "Unknown",
        totalQuantity: item._sum.quantity || 0,
        totalRevenue: item._sum.subtotal || 0,
        transactionCount: item._count.saleId,
      };
    });

    // Get cashier details
    const cashierIds = cashierPerformanceData.map((item) => item.cashierId);
    const cashiers = await prisma.user.findMany({
      where: { id: { in: cashierIds } },
      select: { id: true, name: true },
    });

    const cashierPerformance = cashierPerformanceData.map((item) => {
      const cashier = cashiers.find((c) => c.id === item.cashierId);
      return {
        cashierId: item.cashierId,
        cashierName: cashier?.name || "Unknown",
        totalSales: item._sum.total || 0,
        transactionCount: item._count,
        averageTransaction: item._avg.total || 0,
      };
    });

    // Calculate payment method percentages
    const totalPayments = paymentMethodsData.reduce(
      (sum, item) => sum + item._count,
      0
    );
    const paymentMethods = paymentMethodsData.map((item) => ({
      method: item.paymentType,
      count: item._count,
      total: item._sum.total || 0,
      percentage: totalPayments > 0 ? (item._count / totalPayments) * 100 : 0,
    }));

    const analytics: SalesAnalytics = {
      overview: {
        totalRevenue: salesAggregate._sum.subtotal || 0,
        totalSales: salesAggregate._sum.total || 0,
        totalTransactions: salesAggregate._count,
        averageTransaction: salesAggregate._avg.total || 0,
        totalTax: salesAggregate._sum.tax || 0,
      },
      trends: {
        daily: salesByDay
          .map((item) => ({
            date: item.date,
            revenue: parseFloat(item.revenue),
            transactions: parseInt(item.transactions),
          }))
          .reverse(),
        weekly: [], // Can be implemented if needed
        monthly: [], // Can be implemented if needed
      },
      topProducts,
      topCategories: topCategoriesData.map((item) => ({
        categoryId: item.categoryId,
        categoryName: item.categoryName,
        totalRevenue: parseFloat(item.totalRevenue),
        totalQuantity: parseInt(item.totalQuantity),
      })),
      paymentMethods,
      cashierPerformance,
      recentSales: recentSalesData.map((sale) => ({
        id: sale.id,
        invoice: sale.invoice,
        total: sale.total,
        items: sale.items.length,
        createdAt: sale.createdAt,
      })),
    };

    return { success: true, data: analytics };
  } catch (error) {
    console.error("Error fetching sales analytics:", error);
    return { success: false, error: "Gagal mengambil data analytics" };
  }
}

/**
 * Get product stock analytics
 */
export async function getStockAnalytics(): Promise<ActionResponse<any>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user || session.user.role !== "admin") {
      return { success: false, error: "Unauthorized - Admin only" };
    }

    const [lowStock, outOfStock, topStock] = await Promise.all([
      prisma.product.findMany({
        where: { stock: { lte: 10, gt: 0 }, isActive: true },
        include: { category: true },
        orderBy: { stock: "asc" },
        take: 10,
      }),
      prisma.product.findMany({
        where: { stock: 0, isActive: true },
        include: { category: true },
        take: 10,
      }),
      prisma.product.findMany({
        where: { isActive: true },
        include: { category: true },
        orderBy: { stock: "desc" },
        take: 10,
      }),
    ]);

    return {
      success: true,
      data: { lowStock, outOfStock, topStock },
    };
  } catch (error) {
    console.error("Error fetching stock analytics:", error);
    return { success: false, error: "Gagal mengambil data stok" };
  }
}
