import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/lib/auth/auth.service";
import { db } from "@/lib/db/config";
import { z } from "zod";
import { cookies } from "next/headers";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const authService = new AuthService(db);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    // Validate credentials and get user ID
    const userId = await authService.validateLogin(email, password);

    // Generate auth token
    const token = await authService.createAuthToken(userId);

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Login error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
}
