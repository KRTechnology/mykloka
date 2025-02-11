'use server'

import { db } from "@/lib/db/config";
import { departments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { departmentSchema, type DepartmentData } from "@/lib/api/departments";
import { validatePermission } from "@/lib/auth/auth";

export async function updateDepartmentAction(id: string, data: DepartmentData) {
  try {
    // Validate permission
    const hasPermission = await validatePermission("edit_departments");
    if (!hasPermission) {
      throw new Error("Unauthorized");
    }

    // Validate input
    const validatedData = departmentSchema.parse(data);

    // Update department
    const updatedDepartment = await db
      .update(departments)
      .set({ ...validatedData, updatedAt: new Date() })
      .where(eq(departments.id, id))
      .returning();

    if (!updatedDepartment[0]) {
      throw new Error("Department not found");
    }

    // Revalidate cache
    revalidateTag("departments");

    return { success: true, data: updatedDepartment[0] };
  } catch (error) {
    console.error("Error updating department:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to update department" 
    };
  }
} 