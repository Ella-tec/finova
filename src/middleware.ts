import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const role = (req.nextauth.token as { role?: string } | undefined)?.role;
    const path = req.nextUrl.pathname;

    // Clients only use the client portal — never staff dashboard routes
    if (role === "CLIENT" && path.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/portal", req.url));
    }
    if (role && role !== "CLIENT" && path.startsWith("/portal")) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/portal/:path*", "/api/protected/:path*"],
};
