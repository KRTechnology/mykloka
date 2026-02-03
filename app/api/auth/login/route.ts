import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/lib/auth/auth.service";
import { db } from "@/lib/db/config";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const authService = new AuthService(db);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    const userId = await authService.validateLogin(email, password);
    const token = await authService.createAuthToken(userId);

    const response = NextResponse.json({ success: true }, { status: 200 });

    const isProd = process.env.NODE_ENV === "production";

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      ...(isProd && { domain: ".mysite.com" }), // 🔥 THIS LINE FIXES SUBDOMAINS
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
}
