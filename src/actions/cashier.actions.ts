"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { ActionResponse } from "@/types";
import { revalidatePath } from "next/cache";

export interface CashierProfile {
  id: string;
  name: string;
  email: string;
  image: string | null;
  emailVerified: boolean;
  role: string | null;
  banned: boolean | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Get current cashier profile
 * Server-side only - returns current logged-in user data
 */
export async function getCashierProfile(): Promise<
  ActionResponse<CashierProfile>
> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        emailVerified: true,
        role: true,
        banned: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    return { success: true, data: user };
  } catch (error) {
    console.error("Error fetching cashier profile:", error);
    return { success: false, error: "Failed to fetch profile" };
  }
}

/**
 * Update cashier profile
 * Server-side only - update current user's profile
 */
export async function updateCashierProfile(
  data: Partial<{ name: string; image: string }>
): Promise<ActionResponse<CashierProfile>> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Validate input
    if (data.name && (data.name.trim().length < 2 || data.name.length > 100)) {
      return {
        success: false,
        error: "Name must be between 2 and 100 characters",
      };
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: data.name?.trim(),
        image: data.image,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        emailVerified: true,
        role: true,
        banned: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    revalidatePath("/cashier/setting");
    return { success: true, data: user };
  } catch (error) {
    console.error("Error updating cashier profile:", error);
    return { success: false, error: "Failed to update profile" };
  }
}

/**
 * Get cashier statistics
 */
export async function getCashierStats(): Promise<
  ActionResponse<{
    totalSales: number;
    totalTransactions: number;
    accountAge: string;
    lastActive: Date | null;
  }>
> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const [salesCount, transactionsCount, lastSession] = await Promise.all([
      prisma.sale.count({
        where: { cashierId: session.user.id },
      }),
      prisma.session.count({
        where: { userId: session.user.id },
      }),
      prisma.session.findFirst({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      }),
    ]);

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { createdAt: true },
    });

    const accountAge =
      user && new Date(user.createdAt)
        ? `${Math.floor(
            (new Date().getTime() - new Date(user.createdAt).getTime()) /
              (1000 * 60 * 60 * 24)
          )} days`
        : "N/A";

    return {
      success: true,
      data: {
        totalSales: salesCount,
        totalTransactions: transactionsCount,
        accountAge,
        lastActive: lastSession?.createdAt || null,
      },
    };
  } catch (error) {
    console.error("Error fetching cashier stats:", error);
    return {
      success: false,
      error: "Failed to fetch statistics",
    };
  }
}
