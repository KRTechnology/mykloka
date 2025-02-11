import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/config";
import { departments } from "@/lib/db/schema";
import { validatePermission } from "@/lib/auth/auth";
import { z } from "zod";
import { eq } from "drizzle-orm";

const departmentSchema = z.object({
  name: z.string().min(1, "Department name is required"),
  headId: z.string().uuid().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const department = await db
      .select()
      .from(departments)
      .where(eq(departments.id, params.id));

    if (!department[0]) {
      return NextResponse.json(
        { error: "Department not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(department[0]);
  } catch (error) {
    console.error("Failed to fetch department:", error);
    return NextResponse.json(
      { error: "Failed to fetch department" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const hasPermission = await validatePermission("edit_departments");
    if (!hasPermission) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = departmentSchema.parse(body);

    const updatedDepartment = await db
      .update(departments)
      .set({ ...validatedData, updatedAt: new Date() })
      .where(eq(departments.id, params.id))
      .returning();

    if (!updatedDepartment[0]) {
      return NextResponse.json(
        { error: "Department not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedDepartment[0]);
  } catch (error) {
    console.error("Error updating department:", error);
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const hasPermission = await validatePermission("delete_departments");
    if (!hasPermission) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const deletedDepartment = await db
      .delete(departments)
      .where(eq(departments.id, params.id))
      .returning();

    if (!deletedDepartment[0]) {
      return NextResponse.json(
        { error: "Department not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(deletedDepartment[0]);
  } catch (error) {
    console.error("Error deleting department:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
