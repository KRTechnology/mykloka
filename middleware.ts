import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import type { UserJWTPayload } from "@/lib/auth/auth.service";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token");
  const response = NextResponse.next();

  // Public paths that don't require authentication
  const publicPaths = ["/login", "/verify", "/reset-password"];
  if (publicPaths.some((path) => request.nextUrl.pathname.startsWith(path))) {
    return response;
  }

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const verified = await jwtVerify(
      token.value,
      new TextEncoder().encode(process.env.JWT_SECRET!)
    );

    // Add user info to request headers for API routes
    response.headers.set(
      "X-User-Info",
      JSON.stringify(verified.payload as UserJWTPayload)
    );

    return response;
  } catch {
    // Clear invalid token
    response.cookies.delete("auth_token");

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/protected/:path*",
    "/login",
    "/verify",
    "/reset-password",
  ],
};
