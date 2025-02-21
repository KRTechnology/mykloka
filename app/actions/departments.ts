"use server";

import { DepartmentData, departmentSchema } from "@/lib/api/departments";
import { validatePermission } from "@/lib/auth/auth";
import { db } from "@/lib/db/config";
import { departments, roles, users } from "@/lib/db/schema";
import { asc, desc, eq, sql } from "drizzle-orm";
import { type PgColumn, alias } from "drizzle-orm/pg-core";
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

    // Create department
    const [department] = await db
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
      const [departmentManagerRole] = await db
        .select({ id: roles.id })
        .from(roles)
        .where(eq(roles.name, "Department Manager"));

      if (!departmentManagerRole) {
        throw new Error("Department Manager role not found");
      }

      // Check if user already has the Department Manager role
      const [currentUser] = await db
        .select({ roleId: users.roleId })
        .from(users)
        .where(eq(users.id, validatedData.headId));

      if (currentUser.roleId !== departmentManagerRole.id) {
        // Update user role
        await db
          .update(users)
          .set({
            roleId: departmentManagerRole.id,
            updatedAt: new Date(),
          })
          .where(eq(users.id, validatedData.headId));
      }
    }

    revalidateTag("departments");
    return { success: true, data: department };
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
    const hasPermission = await validatePermission("edit_departments");
    if (!hasPermission) {
      throw new Error("Unauthorized");
    }

    const validatedData = departmentSchema.parse(data);

    const updatedDepartment = await db
      .update(departments)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(departments.id, id))
      .returning();

    if (!updatedDepartment[0]) {
      throw new Error("Department not found");
    }

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

export async function getDepartmentsAction({
  page = 1,
  pageSize = 10,
  sortBy = "createdAt",
  sortDirection = "desc",
  search,
}: GetDepartmentsOptions = {}) {
  try {
    // Create aliases for the users table
    const deptMembers = alias(users, "dept_members");
    const head = alias(users, "head");

    // Build base query
    let baseQuery = db
      .select({
        id: departments.id,
        name: departments.name,
        description: departments.description,
        headId: departments.headId,
        createdAt: departments.createdAt,
        updatedAt: departments.updatedAt,
        userCount: sql<number>`COUNT(DISTINCT ${deptMembers.id})`,
        head: sql<string | null>`
          CASE 
            WHEN ${head.id} IS NOT NULL 
            THEN CONCAT(${head.firstName}, ' ', ${head.lastName})
            ELSE NULL
          END
        `,
      })
      .from(departments)
      .leftJoin(deptMembers, eq(departments.id, deptMembers.departmentId))
      .leftJoin(head, eq(departments.headId, head.id))
      .groupBy(
        departments.id,
        departments.name,
        departments.description,
        departments.headId,
        departments.createdAt,
        departments.updatedAt,
        head.id,
        head.firstName,
        head.lastName
      )
      .$dynamic();

    // Add search condition if provided
    if (search) {
      baseQuery = baseQuery.where(
        sql`LOWER(${departments.name}) LIKE ${`%${search.toLowerCase()}%`}`
      );
    }

    // Add sorting
    const sortableColumns = {
      name: departments.name,
      createdAt: departments.createdAt,
      userCount: sql`COUNT(DISTINCT ${deptMembers.id})`,
    } as const;

    const sortColumn =
      sortBy in sortableColumns
        ? sortableColumns[sortBy as keyof typeof sortableColumns]
        : departments.createdAt;

    baseQuery = baseQuery.orderBy(
      sortDirection === "desc" ? desc(sortColumn) : asc(sortColumn)
    );

    // Get total count for pagination
    const countQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(departments)
      .$dynamic();

    // Add pagination
    const offset = (page - 1) * pageSize;
    const paginatedQuery = baseQuery.limit(pageSize).offset(offset);

    // Execute queries in parallel
    const [results, [{ count }]] = await Promise.all([
      paginatedQuery,
      countQuery,
    ]);

    return {
      success: true,
      data: results.map((dept) => ({
        ...dept,
        userCount: Number(dept.userCount) || 0,
      })),
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

export async function getManagersForDepartmentAction() {
  try {
    // First get the role IDs for managers and admins
    const managerRoles = await db.query.roles.findMany({
      where: (roles, { inArray }) =>
        inArray(roles.name, [
          "Department Manager",
          "HR Manager",
          "Super Admin",
        ]),
      columns: {
        id: true,
      },
    });

    if (!managerRoles.length) {
      throw new Error("Manager roles not found");
    }

    // Get the role IDs
    const roleIds = managerRoles.map((role) => role.id);

    // Then fetch users with these roles
    const managers = await db.query.users.findMany({
      where: (users, { inArray }) => inArray(users.roleId, roleIds),
      columns: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
      with: {
        role: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
    });

    return { success: true, data: managers };
  } catch (error) {
    console.error("Error fetching managers:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch managers",
    };
  }
}
