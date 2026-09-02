import { NextRequest, NextResponse } from "next/server";

// Public paths that don't require auth
const PUBLIC_PATHS = [
  "/login",
  "/reset-password",
  "/api/v1/login",
  "/api/v1/register",
  "/api/v1/forgot-password",
  "/api/v1/reset-password",
  "/api/v1/verify-token",
  "/api/v1/test",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow all API routes to handle their own auth (via withAuth helper)
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Check if path is public
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  if (isPublic) {
    return NextResponse.next();
  }

  // For client-side navigation pages, we let the client-side App.jsx auth logic handle it
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.svg$).*)",
  ],
};
