import { NextRequest, NextResponse } from "next/server";
import { userService } from "@/lib/users/user.service";
import { validatePermission } from "@/lib/auth/auth";
import { z } from "zod";
import { db } from "@/lib/db/config";
import { users, roles, departments } from "@/lib/db/schema";
import { eq, sql, desc, asc } from "drizzle-orm";
import { type PgColumn } from "drizzle-orm/pg-core";

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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const sortBy = searchParams.get("sortBy") || "name";
    const sortDirection = searchParams.get("sortDirection") || "asc";
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role");
    const department = searchParams.get("department");
    const status = searchParams.get("status");

    // Calculate offset
    const offset = (page - 1) * pageSize;

    // Build base query
    let query = db
      .select({
        id: users.id,
        name: sql`${users.firstName} || ' ' || ${users.lastName}`,
        email: users.email,
        role: roles.name,
        department: departments.name,
        status: users.isActive,
        joinedAt: users.createdAt,
      })
      .from(users)
      .leftJoin(roles, eq(users.roleId, roles.id))
      .leftJoin(departments, eq(users.departmentId, departments.id))
      .$dynamic();

    // Add filters
    if (search) {
      query = query.where(
        sql`LOWER(${users.firstName} || ' ' || ${users.lastName}) LIKE LOWER(${"%" + search + "%"})
        OR LOWER(${users.email}) LIKE LOWER(${"%" + search + "%"})`
      );
    }

    if (role) {
      query = query.where(eq(roles.name, role));
    }

    if (department) {
      query = query.where(eq(departments.name, department));
    }

    if (status !== null && status !== undefined) {
      query = query.where(eq(users.isActive, status === "true"));
    }

    // Get total count
    const totalPromise = db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .$dynamic();

    // Add sorting
    const sortColumn = users[sortBy as keyof typeof users] as PgColumn<any>;
    if (sortColumn) {
      query = query.orderBy(
        sortDirection === "desc" ? desc(sortColumn) : asc(sortColumn)
      );
    }

    // Add pagination
    query = query.limit(pageSize).offset(offset);

    // Execute queries in parallel
    const [results, [{ count }]] = await Promise.all([query, totalPromise]);

    return NextResponse.json({
      data: results,
      total: count,
      page,
      pageSize,
      totalPages: Math.ceil(count / pageSize),
    });
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
