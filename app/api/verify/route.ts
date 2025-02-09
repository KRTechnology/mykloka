import { NextRequest, NextResponse } from "next/server";
import { userService } from "@/lib/users/user.service";
import { z } from "zod";
import { cookies } from "next/headers";

const verifySchema = z.object({
  token: z.string(),
  password: z.string().min(8),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = verifySchema.parse(body);

    const authToken = await userService.verifyAndSetPassword(token, password);

    // Set auth token cookie
    const cookieStore = await cookies();
    cookieStore.set("auth_token", authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error verifying user:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 400 }
    );
  }
}
