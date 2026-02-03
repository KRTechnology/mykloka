import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { tenantChecker } from "@/lib/api/organization"; // mock checker

const MAIN_DOMAIN = "mysite.com";
const PUBLIC_ROUTES = ["/login"];
const DASHBOARD_PREFIX = "/dashboard";
const EXCLUDED_ROUTES = ["/invalid-tenant", ...PUBLIC_ROUTES];

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
    const parts = hostname.split(".");
    if (parts.length > 1) tenant = parts[0]; // tenant.localhost
  } else if (hostname.endsWith(`.${MAIN_DOMAIN}`)) {
    tenant = hostname.replace(`.${MAIN_DOMAIN}`, "");
  }

  const isSubdomain = !!tenant && tenant !== "www";

  /* ─────────────────────────────
     CHECK IF SUBDOMAIN IS ALLOWED
  ───────────────────────────── */

  if (isSubdomain && tenant && !EXCLUDED_ROUTES.includes(pathname)) {
    const allowed = await tenantChecker.checkTenant(tenant);
    if (!allowed) {
      const redirectUrl = isLocalhost
        ? `http://localhost:3000/invalid-tenant`
        : `https://${MAIN_DOMAIN}/invalid-tenant`;
      return NextResponse.redirect(redirectUrl);
    }
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
      const redirectUrl = isLocalhost
        ? `http://localhost:3000/login`
        : `https://${MAIN_DOMAIN}/login`;
      const res = NextResponse.redirect(redirectUrl);
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
      const redirectUrl = isLocalhost
        ? `http://localhost:3000/login`
        : `https://${MAIN_DOMAIN}/login`;
      return NextResponse.redirect(redirectUrl);
    }

    // Logged in user should NOT see login again
    if (token && pathname === "/login") {
      const redirectUrl = isLocalhost
        ? `http://localhost:3000/dashboard`
        : `https://${MAIN_DOMAIN}/dashboard`;
      return NextResponse.redirect(redirectUrl);
    }

    // Block everything except dashboard & public routes
    if (!isDashboard && !isPublic) {
      const redirectUrl = isLocalhost
        ? `http://localhost:3000/login`
        : `https://${MAIN_DOMAIN}/login`;
      return NextResponse.redirect(redirectUrl);
    }

    // Dashboard requires auth
    if (isDashboard && !token) {
      const redirectUrl = isLocalhost
        ? `http://localhost:3000/login`
        : `https://${MAIN_DOMAIN}/login`;
      return NextResponse.redirect(redirectUrl);
    }
  }

  /* ─────────────────────────────
     ATTACH HEADERS
  ───────────────────────────── */

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
