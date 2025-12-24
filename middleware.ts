
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";                                                                                                               
const PUBLIC_ROUTES = ["/login", "/register"];

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = req.nextUrl;

  // 🔓 Allow public routes
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // 🚫 Not logged in
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const role = token.role as "ADMIN" | "SHOPPER" | "CUSTOMER";

  // 🔁 Dashboard auto-redirect
  if (pathname === "/dashboard") {
    return NextResponse.redirect(
      new URL(`/${role.toLowerCase()}/dashboard`, req.url)
    );
  }

  // 🛡 Role-based access control
  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    return deny(req, role);
  }

  if (pathname.startsWith("/shopper") && role !== "SHOPPER") {
    return deny(req, role);
  }

  if (pathname.startsWith("/customer") && role !== "CUSTOMER") {
    return deny(req, role);
  }

  return NextResponse.next();
}

/**
 * Redirect user to their correct dashboard
 */
function deny(req: NextRequest, role: string) {
  return NextResponse.redirect(
    new URL(`/${role.toLowerCase()}/dashboard`, req.url)
  );
}

export const config = {
  matcher: [
    "/dashboard",
    "/admin/:path*",
    "/shopper/:path*",
    "/customer/:path*",
  ],
};

