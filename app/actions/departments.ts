"use server";

import { departmentSchema, type DepartmentData } from "@/lib/api/departments";
import { validatePermission } from "@/lib/auth/auth";
import { db } from "@/lib/db/config";
import { departments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";

export async function createDepartmentAction(data: DepartmentData) {
  try {
    // Validate permission
    const hasPermission = await validatePermission("create_departments");
    if (!hasPermission) {
      throw new Error("Unauthorized");
    }

    // Validate input
    const validatedData = departmentSchema.parse(data);

    // Create department
    const newDepartment = await db
      .insert(departments)
      .values(validatedData)
      .returning();

    if (!newDepartment[0]) {
      throw new Error("Failed to create department");
    }

    // Revalidate cache
    revalidateTag("departments");

    return { success: true, data: newDepartment[0] };
  } catch (error) {
    console.error("Error creating department:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create department",
    };
  }
}

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
      error:
        error instanceof Error ? error.message : "Failed to update department",
    };
  }
}

export async function deleteDepartmentAction(id: string) {
  try {
    // Validate permission
    const hasPermission = await validatePermission("delete_departments");
    if (!hasPermission) {
      throw new Error("Unauthorized");
    }

    // Delete department
    const deletedDepartment = await db
      .delete(departments)
      .where(eq(departments.id, id))
      .returning();

    if (!deletedDepartment[0]) {
      throw new Error("Department not found");
    }

    // Revalidate cache
    revalidateTag("departments");

    return { success: true, data: deletedDepartment[0] };
  } catch (error) {
    console.error("Error deleting department:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete department",
    };
  }
}
