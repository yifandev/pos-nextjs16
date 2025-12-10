import "server-only";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Role types for the application
 */
export type UserRole = "admin" | "cashier";

/**
 * Get current session with error handling
 * Server-side only
 */
export async function getServerSession() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    return session;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}

/**
 * Require authentication for a page
 * Redirects to login if not authenticated
 * Server-side only
 */
export async function requireAuth() {
  const session = await getServerSession();

  if (!session) {
    redirect("/");
  }

  return session;
}

/**
 * Require specific role for a page
 * Redirects to unauthorized if role doesn't match
 * Server-side only
 */
export async function requireRole(allowedRoles: UserRole[]) {
  const session = await requireAuth();
  const userRole = session.user.role?.toLowerCase() as UserRole;

  if (!userRole || !allowedRoles.includes(userRole)) {
    redirect("/unauthorized");
  }

  return session;
}

/**
 * Check if user has specific role
 */
export function hasRole(
  userRole: string | undefined,
  allowedRoles: UserRole[]
): boolean {
  if (!userRole) return false;
  return allowedRoles.includes(userRole.toLowerCase() as UserRole);
}

/**
 * Get redirect URL based on user role
 */
export function getRoleRedirectUrl(role: string | null | undefined): string {
  const userRole = role?.toLowerCase();

  switch (userRole) {
    case "admin":
      return "/admin";
    case "cashier":
      return "/cashier";
    default:
      return "/cashier"; // Default to cashier
  }
}
