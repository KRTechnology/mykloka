import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Add auth routes that should be accessible without a token
const publicRoutes = [
  "/login",
  "/verify",
  "/reset-password",
  "/forgot-password",
];
// Add routes that should redirect to dashboard if user is authenticated
const authRoutes = ["/login"];
// const authRoutes = ["/login", "/verify", "/reset-password"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for API routes
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const token = request.cookies.get("auth_token");

  // Check if the path is a public route
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // If no token and trying to access protected route
  if (!token && !isPublicRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If has token and trying to access auth routes (login, etc)
  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // For protected routes, verify token and add user info to headers
  if (token && !isPublicRoute) {
    try {
      const verified = await jwtVerify(
        token.value,
        new TextEncoder().encode(process.env.JWT_SECRET!)
      );

      const response = NextResponse.next();
      response.headers.set("X-User-Info", JSON.stringify(verified.payload));

      return response;
    } catch {
      // If token is invalid, clear it and redirect to login
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("auth_token");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  // Update matcher to include all routes that need protection
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - images folder (added this)
     */
    "/((?!_next/static|_next/image|favicon.ico|public/|images/).*)",
  ],
};
