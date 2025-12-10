"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { shiftOpenSchema, shiftCloseSchema } from "@/lib/validations";
import { ActionResponse, ShiftWithUser } from "@/types";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

// Get current active shift for user
export async function getActiveShift(): Promise<
  ActionResponse<ShiftWithUser | null>
> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const shift = await prisma.shift.findFirst({
      where: {
        userId: session.user.id,
        closeAt: null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return { success: true, data: shift };
  } catch (error) {
    console.error("Error fetching active shift:", error);
    return { success: false, error: "Gagal mengambil data shift" };
  }
}

// Get all shifts
export async function getShifts(): Promise<ActionResponse<ShiftWithUser[]>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const where =
      session.user.role === "admin" ? {} : { userId: session.user.id };

    const shifts = await prisma.shift.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        openAt: "desc",
      },
    });

    return { success: true, data: shifts };
  } catch (error) {
    console.error("Error fetching shifts:", error);
    return { success: false, error: "Gagal mengambil data shift" };
  }
}

// Open shift
export async function openShift(
  openingCash: number
): Promise<ActionResponse<ShiftWithUser>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Validate
    const validated = shiftOpenSchema.parse({ openingCash });

    // Check if there's already an active shift
    const activeShift = await prisma.shift.findFirst({
      where: {
        userId: session.user.id,
        closeAt: null,
      },
    });

    if (activeShift) {
      return { success: false, error: "Anda masih memiliki shift yang aktif" };
    }

    const shift = await prisma.shift.create({
      data: {
        userId: session.user.id,
        openingCash: validated.openingCash,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    revalidatePath("/cashier/shift");
    return { success: true, data: shift, message: "Shift berhasil dibuka" };
  } catch (error) {
    console.error("Error opening shift:", error);
    return { success: false, error: "Gagal membuka shift" };
  }
}

// Close shift
export async function closeShift(
  shiftId: string,
  closingCash: number
): Promise<ActionResponse<ShiftWithUser>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Validate
    const validated = shiftCloseSchema.parse({ shiftId, closingCash });

    // Check if shift exists and belongs to user
    const existingShift = await prisma.shift.findUnique({
      where: { id: validated.shiftId },
    });

    if (!existingShift) {
      return { success: false, error: "Shift tidak ditemukan" };
    }

    if (
      existingShift.userId !== session.user.id &&
      session.user.role !== "admin"
    ) {
      return { success: false, error: "Unauthorized" };
    }

    if (existingShift.closeAt) {
      return { success: false, error: "Shift sudah ditutup" };
    }

    const shift = await prisma.shift.update({
      where: { id: validated.shiftId },
      data: {
        closeAt: new Date(),
        closingCash: validated.closingCash,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    revalidatePath("/cashier/shift");
    return { success: true, data: shift, message: "Shift berhasil ditutup" };
  } catch (error) {
    console.error("Error closing shift:", error);
    return { success: false, error: "Gagal menutup shift" };
  }
}

// Get shift summary (for reporting)
export async function getShiftSummary(
  shiftId: string
): Promise<ActionResponse<any>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const shift = await prisma.shift.findUnique({
      where: { id: shiftId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!shift) {
      return { success: false, error: "Shift tidak ditemukan" };
    }

    // Get sales during this shift
    const sales = await prisma.sale.findMany({
      where: {
        cashierId: shift.userId,
        createdAt: {
          gte: shift.openAt,
          ...(shift.closeAt && { lte: shift.closeAt }),
        },
      },
      include: {
        items: true,
        payments: true,
      },
    });

    // Calculate summary
    const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
    const totalTransactions = sales.length;
    const cashSales = sales.filter((s) => s.paymentType === "cash");
    const totalCash = cashSales.reduce((sum, sale) => sum + sale.paid, 0);

    const expectedCash = shift.openingCash + totalCash;
    const difference = shift.closingCash ? shift.closingCash - expectedCash : 0;

    return {
      success: true,
      data: {
        shift,
        sales,
        summary: {
          totalSales,
          totalTransactions,
          totalCash,
          expectedCash,
          actualCash: shift.closingCash || 0,
          difference,
        },
      },
    };
  } catch (error) {
    console.error("Error fetching shift summary:", error);
    return { success: false, error: "Gagal mengambil ringkasan shift" };
  }
}
