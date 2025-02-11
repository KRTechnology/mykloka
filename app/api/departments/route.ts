import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/config";
import { departments } from "@/lib/db/schema";
import { validatePermission } from "@/lib/auth/auth";
import { z } from "zod";
import { eq, desc, asc, sql } from "drizzle-orm";
import { type PgColumn } from "drizzle-orm/pg-core";

const departmentSchema = z.object({
  name: z.string().min(1, "Department name is required"),
  headId: z.string().uuid().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const sortBy = searchParams.get("sortBy") || "name";
    const sortDirection = searchParams.get("sortDirection") || "asc";
    const search = searchParams.get("search") || "";

    // Calculate offset
    const offset = (page - 1) * pageSize;

    // Build base query
    let query = db.select().from(departments).$dynamic();

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

    return NextResponse.json({
      data: results,
      total: count,
      page,
      pageSize,
      totalPages: Math.ceil(count / pageSize),
    });
  } catch (error) {
    console.error("Failed to fetch departments:", error);
    return NextResponse.json(
      { error: "Failed to fetch departments" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const hasPermission = await validatePermission("create_departments");
    if (!hasPermission) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = departmentSchema.parse(body);

    const newDepartment = await db
      .insert(departments)
      .values(validatedData)
      .returning();

    return NextResponse.json(newDepartment[0], { status: 201 });
  } catch (error) {
    console.error("Error creating department:", error);
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
