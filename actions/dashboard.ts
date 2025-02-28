"use server";

import { db } from "@/lib/db/config";
import { users, attendance, tasks, departments } from "@/lib/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { format, startOfDay } from "date-fns";

export type DashboardStats = {
  totalEmployees: number;
  clockedInToday: number;
  activeTasks: number;
  totalDepartments: number;
};

export async function getDashboardStatsAction(): Promise<{
  success: boolean;
  data?: DashboardStats;
  error?: string;
}> {
  try {
    const today = format(startOfDay(new Date()), "yyyy-MM-dd");

    // Get total employees
    const [{ count: totalEmployees }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.isActive, true));

    // Get clocked in users for today
    const [{ count: clockedInToday }] = await db
      .select({ count: sql<number>`count(distinct user_id)` })
      .from(attendance)
      .where(
        and(
          sql`DATE(${attendance.clockInTime}) = ${today}::date`
          // sql`${attendance.clockOutTime} IS NULL`
        )
      );

    // Get active tasks
    const [{ count: activeTasks }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(tasks)
      .where(eq(tasks.status, "IN_PROGRESS"));

    // Get total departments
    const [{ count: totalDepartments }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(departments);

    return {
      success: true,
      data: {
        totalEmployees,
        clockedInToday,
        activeTasks,
        totalDepartments,
      },
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch stats",
    };
  }
}
