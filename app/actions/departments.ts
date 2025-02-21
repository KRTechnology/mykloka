"use server";

import { DepartmentData, departmentSchema } from "@/lib/api/departments";
import { validatePermission } from "@/lib/auth/auth";
import { db } from "@/lib/db/config";
import { departments, roles, users } from "@/lib/db/schema";
import { asc, desc, eq, sql } from "drizzle-orm";
import { type PgColumn } from "drizzle-orm/pg-core";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import type {
  CreateDepartmentData,
  GetDepartmentsOptions,
} from "./types/departments";

const createDepartmentSchema = z.object({
  name: z.string().min(1, "Department name is required"),
  description: z.string().optional(),
  headId: z.string().uuid().optional(),
});

export async function createDepartmentAction(data: CreateDepartmentData) {
  try {
    const hasPermission = await validatePermission("create_departments");
    if (!hasPermission) {
      throw new Error("Unauthorized");
    }

    const validatedData = createDepartmentSchema.parse(data);

    // Start a transaction
    const result = await db.transaction(async (tx) => {
      // Create department
      const [department] = await tx
        .insert(departments)
        .values({
          name: validatedData.name,
          description: validatedData.description || null,
          headId: validatedData.headId || null,
        })
        .returning();

      // If a head is assigned, update their role to Department Manager
      if (validatedData.headId) {
        // Fetch Department Manager role
        const [departmentManagerRole] = await tx
          .select({ id: roles.id })
          .from(roles)
          .where(eq(roles.name, "Department Manager"));

        if (!departmentManagerRole) {
          throw new Error("Department Manager role not found");
        }

        // Check if user already has the Department Manager role
        const [currentUser] = await tx
          .select({ roleId: users.roleId })
          .from(users)
          .where(eq(users.id, validatedData.headId));

        if (currentUser.roleId !== departmentManagerRole.id) {
          // Update user role directly within the transaction
          await tx
            .update(users)
            .set({
              roleId: departmentManagerRole.id,
              updatedAt: new Date(),
            })
            .where(eq(users.id, validatedData.headId));
        }
      }

      return department;
    });

    revalidateTag("departments");
    return { success: true, data: result };
  } catch (error) {
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

export async function getDepartmentsAction(
  options: GetDepartmentsOptions = {}
) {
  try {
    const {
      page = 1,
      pageSize = 10,
      sortBy = "name",
      sortDirection = "asc",
      search = "",
      isDropdown = false,
    } = options;

    // If it's a dropdown request, fetch all departments
    if (isDropdown) {
      const allDepartments = await db
        .select({
          id: departments.id,
          name: departments.name,
          headId: departments.headId,
          head: sql<string | null>`NULL`,
          userCount: sql<number>`0`,
          createdAt: departments.createdAt,
        })
        .from(departments)
        .orderBy(asc(departments.name));

      return { success: true, data: allDepartments };
    }

    // Calculate offset
    const offset = (page - 1) * pageSize;

    // Build base query with head information and user count
    let query = db
      .select({
        id: departments.id,
        name: departments.name,
        createdAt: departments.createdAt,
        headId: departments.headId,
        head: sql<
          string | null
        >`CASE WHEN ${users.id} IS NOT NULL THEN concat(${users.firstName}, ' ', ${users.lastName}) ELSE NULL END`,
        userCount: sql<number>`count(distinct ${users.id}) filter (where ${users.departmentId} = ${departments.id})`,
      })
      .from(departments)
      .leftJoin(users, eq(departments.headId, users.id))
      .groupBy(departments.id, users.id, users.firstName, users.lastName)
      .$dynamic();

    // Add search condition if provided
    if (search) {
      query = query.where(
        sql`LOWER(${departments.name}) LIKE LOWER(${"%" + search + "%"})`
      );
    }

    // Get total count for pagination
    const totalPromise = db
      .select({ count: sql<number>`count(*)` })
      .from(departments)
      .$dynamic();

    // Add sorting
    const sortColumn = departments[
      sortBy as keyof typeof departments
    ] as PgColumn<any>;
    if (sortColumn) {
      query = query.orderBy(
        sortDirection === "desc" ? desc(sortColumn) : asc(sortColumn)
      );
    }

    // Add pagination
    query = query.limit(pageSize).offset(offset);

    // Execute queries in parallel
    const [results, [{ count }]] = await Promise.all([query, totalPromise]);

    // Transform results to match Department interface
    const transformedResults = results.map((dept) => ({
      id: dept.id,
      name: dept.name,
      headId: dept.headId,
      head: dept.head,
      userCount: Number(dept.userCount) || 0,
      createdAt: dept.createdAt,
    }));

    return {
      success: true,
      data: transformedResults,
      total: Number(count) || 0,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil((Number(count) || 0) / pageSize)),
    };
  } catch (error) {
    console.error("Error fetching departments:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch departments",
      data: [],
      total: 0,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    };
  }
}
