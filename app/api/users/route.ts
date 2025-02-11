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
    if (!db) {
      return NextResponse.json(
        { error: "Database connection not available" },
        { status: 500 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const sortBy = searchParams.get("sortBy") || "firstName";
    const sortDirection = searchParams.get("sortDirection") || "asc";
    const search = searchParams.get("search") || "";

    const offset = (page - 1) * pageSize;

    let query = db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        status: users.isActive,
        role: {
          id: roles.id,
          name: roles.name,
        },
        department: {
          id: departments.id,
          name: departments.name,
        },
        createdAt: users.createdAt,
      })
      .from(users)
      .leftJoin(roles, eq(users.roleId, roles.id))
      .leftJoin(departments, eq(users.departmentId, departments.id))
      .$dynamic();

    if (search) {
      query = query.where(
        sql`LOWER(${users.firstName}) LIKE LOWER(${"%" + search + "%"}) OR 
            LOWER(${users.lastName}) LIKE LOWER(${"%" + search + "%"}) OR 
            LOWER(${users.email}) LIKE LOWER(${"%" + search + "%"})`
      );
    }

    const totalPromise = db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .$dynamic();

    const sortColumn = users[sortBy as keyof typeof users] as PgColumn<any>;
    if (sortColumn) {
      query = query.orderBy(
        sortDirection === "desc" ? desc(sortColumn) : asc(sortColumn)
      );
    }

    query = query.limit(pageSize).offset(offset);

    const [results, [{ count }]] = await Promise.all([query, totalPromise]);

    const transformedResults = results.map((user) => ({
      ...user,
      department: user?.department?.id ? user.department.name : null,
      role: user?.role?.id ? user.role : null,
    }));

    return NextResponse.json({
      data: transformedResults,
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    });
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return NextResponse.json(
      {
        data: [],
        total: 0,
        page: 1,
        pageSize: 10,
        totalPages: 0,
      },
      { status: 500 }
    );
  }
}
