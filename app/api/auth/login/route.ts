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

    // Validate credentials and get user ID
    const userId = await authService.validateLogin(email, password);

    // Generate auth token
    const token = await authService.createAuthToken(userId);

    // Create response with JSON
    const response = NextResponse.json(
      { success: true },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Set cookie in the response
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
    return NextResponse.json(
      { error: "Invalid credentials" },
      {
        status: 401,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
