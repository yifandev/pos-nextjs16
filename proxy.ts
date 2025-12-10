import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

/**
 * Middleware for authentication and role-based access control
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get session using Better Auth
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  /**
   * Public routes yang hanya boleh diakses TANPA session
   * - "/": halaman login
   * - "/api/auth": auth API
   */
  const publicRoutes = ["/", "/api/auth"];
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  // 🚨 **FIXED**: User sudah login tapi mencoba akses public routes
  if (
    session &&
    (isPublicRoute || pathname.startsWith("/verification-request"))
  ) {
    const userRole = session.user.role?.toLowerCase();

    // Redirect berdasarkan role
    if (userRole === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    } else if (userRole === "cashier") {
      return NextResponse.redirect(new URL("/cashier", request.url));
    }
    // Fallback untuk role lain
    return NextResponse.redirect(new URL("/cashier", request.url));
  }

  // 🚨 **FIXED**: User belum login tapi mencoba akses /verification-request
  if (pathname.startsWith("/verification-request") && !session) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // ❌ User belum login → mencoba akses protected route
  if (!session && !isPublicRoute) {
    const loginUrl = new URL("/", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ✔ User sudah login dan mengakses route yang sesuai
  if (session) {
    const user = session.user;
    const userRole = user.role?.toLowerCase();

    // 🔐 Admin routes protection
    if (pathname.startsWith("/admin") && userRole !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    // 🔐 Cashier routes protection
    if (
      pathname.startsWith("/cashier") &&
      userRole !== "cashier" &&
      userRole !== "admin"
    ) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
