// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { isAdminEmail } from "@/lib/admin";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // If accessing the Admin panel
    if (path.startsWith("/admin")) {
      const isRoleAdmin = token?.role === "ADMIN";
      const isEmailAdmin = isAdminEmail(token?.email);

      // If neither role nor email matches admin criteria, redirect to homepage
      if (!isRoleAdmin && !isEmailAdmin) {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

// Protect these specific routes
export const config = {
  matcher: ["/admin/:path*"],
};