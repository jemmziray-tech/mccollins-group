// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// 1. Add your VIP Admin emails here!
const ADMIN_EMAILS = [
  "jem.mziray@gmail.com",
  "festomcrowland@gmail.com",
  "nyombicolins04@gmail.com"
];

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // If they are trying to access the Admin panel...
    if (path.startsWith("/admin")) {
      // Check if they have the ADMIN role in the database
      const isRoleAdmin = token?.role === "ADMIN";
      // OR check if their email is on the VIP list!
      const isEmailAdmin = token?.email ? ADMIN_EMAILS.includes(token.email) : false;

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