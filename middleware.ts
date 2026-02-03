import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const MAIN_DOMAIN = "mykloka.vercel.app";
const ALLOWED_SUBDOMAINS = ["kr", "med"]; // Only these subdomains are allowed
const PUBLIC_ROUTES = ["/login"];
const DASHBOARD_PREFIX = "/dashboard";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignore Next internals & API
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  /* ─────────────────────────────
     DOMAIN / SUBDOMAIN DETECTION
     ───────────────────────────── */

  const rawHost = request.headers.get("host") || "";
  const hostname = rawHost.split(":")[0]; // strip port

  const isLocalhost = hostname.endsWith("localhost");

  let tenant: string | null = null;

  if (isLocalhost) {
    // tenant.localhost for local dev
    const parts = hostname.split(".");
    if (parts.length > 1) tenant = parts[0];
  } else if (hostname.endsWith(`.${MAIN_DOMAIN}`)) {
    // Extract subdomain from production URL
    tenant = hostname.replace(`.${MAIN_DOMAIN}`, "");
  }

  const isSubdomain = !!tenant && tenant !== "www";

  // Block access if subdomain is not in allowed list
  if (isSubdomain && tenant && !ALLOWED_SUBDOMAINS.includes(tenant)) {
    return new NextResponse("Subdomain not found", { status: 404 });
  }

  /* ─────────────────────────────
     AUTH TOKEN
     ───────────────────────────── */

  const token = request.cookies.get("auth_token");
  let userPayload: any = null;

  if (token) {
    try {
      const verified = await jwtVerify(
        token.value,
        new TextEncoder().encode(process.env.JWT_SECRET!),
      );
      userPayload = verified.payload;
    } catch {
      const res = NextResponse.redirect(new URL("/login", request.url));
      res.cookies.delete("auth_token");
      return res;
    }
  }

  /* ─────────────────────────────
     SUBDOMAIN ACCESS LOCKDOWN
     ───────────────────────────── */

  if (isSubdomain) {
    const isDashboard =
      pathname === DASHBOARD_PREFIX ||
      pathname.startsWith(`${DASHBOARD_PREFIX}/`);

    const isPublic = PUBLIC_ROUTES.includes(pathname);

    // "/" → /login
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Logged in user should NOT see login again
    if (token && pathname === "/login") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Block everything except login & dashboard
    if (!isDashboard && !isPublic) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Dashboard requires auth
    if (isDashboard && !token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  const response = NextResponse.next();

  if (userPayload) {
    response.headers.set("X-User-Info", JSON.stringify(userPayload));
    if (isSubdomain) response.headers.set("X-Tenant", tenant!);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
