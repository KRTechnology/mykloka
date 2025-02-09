import { NextRequest, NextResponse } from "next/server";
import { userService } from "@/lib/users/user.service";
import { validatePermission } from "@/lib/auth/auth";
import { z } from "zod";

const createUserSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  roleId: z.string().uuid(),
  departmentId: z.string().uuid().optional(),
  managerId: z.string().uuid().optional(),
  phoneNumber: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Verify permission
    const hasPermission = await validatePermission("create_users");
    if (!hasPermission) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = createUserSchema.parse(body);

    const user = await userService.createUser(validatedData);

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
