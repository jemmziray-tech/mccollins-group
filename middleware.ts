import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// This is the main Bouncer logic
export default withAuth(
  function middleware(req) {
    const path = req.nextUrl.pathname;
    const userRole = req.nextauth.token?.role;

    // SECURITY CHECK: If a user is trying to access the /admin portal...
    if (path.startsWith("/admin")) {
      // ...but their database role is NOT "ADMIN"
      if (userRole !== "ADMIN") {
        // Kick them back to the public homepage immediately
        return NextResponse.redirect(new URL("/", req.url));
      }
    }
    
    // If they pass the checks, let them through
    return NextResponse.next();
  },
  {
    callbacks: {
      // This forces NextAuth to check for a token. 
      // If there is no token (user is not logged in), it automatically kicks them to our /login page.
      authorized: ({ token }) => !!token,
    },
  }
);

// This section tells the Bouncer exactly which routes to protect.
// It will ignore the homepage (/) and login page (/login) so anyone can visit them.
export const config = {
  matcher: [
    "/admin/:path*",    // Protects /admin and all pages inside it
    "/customer/:path*", // Protects /customer and all pages inside it
  ],
};