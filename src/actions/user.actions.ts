"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { userUpdateSchema } from "@/lib/validations";
import { ActionResponse, UserWithRelations } from "@/types";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

// Get all users (admin only)
export async function getUsers(): Promise<ActionResponse<UserWithRelations[]>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user || session.user.role !== "admin") {
      return { success: false, error: "Unauthorized - Admin only" };
    }

    const users = await prisma.user.findMany({
      include: {
        sessions: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, data: users };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { success: false, error: "Gagal mengambil data user" };
  }
}

// Update user (admin only)
export async function updateUser(
  id: string,
  data: any
): Promise<ActionResponse<UserWithRelations>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user || session.user.role !== "admin") {
      return { success: false, error: "Unauthorized - Admin only" };
    }

    const validated = userUpdateSchema.parse(data);

    const user = await prisma.user.update({
      where: { id },
      data: validated,
      include: {
        sessions: true,
      },
    });

    revalidatePath("/admin/user");
    return { success: true, data: user, message: "User berhasil diupdate" };
  } catch (error) {
    console.error("Error updating user:", error);
    return { success: false, error: "Gagal mengupdate user" };
  }
}

// Ban user (admin only)
export async function banUser(
  id: string,
  reason: string,
  expiresAt?: Date
): Promise<ActionResponse> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user || session.user.role !== "admin") {
      return { success: false, error: "Unauthorized - Admin only" };
    }

    await prisma.user.update({
      where: { id },
      data: {
        banned: true,
        banReason: reason,
        banExpires: expiresAt,
      },
    });

    revalidatePath("/admin/user");
    return { success: true, message: "User berhasil dibanned" };
  } catch (error) {
    console.error("Error banning user:", error);
    return { success: false, error: "Gagal mem-ban user" };
  }
}

// Unban user (admin only)
export async function unbanUser(id: string): Promise<ActionResponse> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user || session.user.role !== "admin") {
      return { success: false, error: "Unauthorized - Admin only" };
    }

    await prisma.user.update({
      where: { id },
      data: {
        banned: false,
        banReason: null,
        banExpires: null,
      },
    });

    revalidatePath("/admin/user");
    return { success: true, message: "User berhasil di-unban" };
  } catch (error) {
    console.error("Error unbanning user:", error);
    return { success: false, error: "Gagal meng-unban user" };
  }
}
