// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { isAdminEmail } from "@/lib/admin";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // If they are trying to access the Admin panel...
    if (path.startsWith("/admin")) {
      // Check if they have the ADMIN role in the database
      const isRoleAdmin = token?.role === "ADMIN";
      // OR check if their email is on the VIP list!
      const isEmailAdmin = isAdminEmail(token?.email);

      // If they are NEITHER, kick them back to the homepage
      if (!isRoleAdmin && !isEmailAdmin) {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }
  },
  {
    callbacks: {
      // This tells the middleware to ALWAYS run, so we can handle the logic above
      authorized: ({ token }) => !!token,
    },
  }
);

// Protect these specific routes
export const config = {
  matcher: ["/admin/:path*"],
};