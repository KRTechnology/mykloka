"use server";

import { attendanceService } from "@/lib/attendance/attendance.service";
import { validatePermission, getServerSession } from "@/lib/auth/auth";
import { revalidateTag } from "next/cache";

export async function getDailyStatsAction(date: Date) {
  try {
    const session = await getServerSession();
    if (!session) throw new Error("Unauthorized");

    const canViewAll = await validatePermission("view_all_attendance");
    const canViewDepartment = await validatePermission(
      "view_department_attendance"
    );

    let options = {};
    if (!canViewAll) {
      if (canViewDepartment && session.departmentId) {
        options = { departmentId: session.departmentId };
      } else {
        options = { userId: session.userId };
      }
    }

    const stats = await attendanceService.getDailyStats(date, options);
    return { success: true, data: stats };
  } catch (error) {
    console.error("Error getting daily stats:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to get daily stats",
    };
  }
}

export async function getWeeklyStatsAction(date: Date) {
  try {
    const session = await getServerSession();
    if (!session) throw new Error("Unauthorized");

    const canViewAll = await validatePermission("view_all_attendance");
    const canViewDepartment = await validatePermission(
      "view_department_attendance"
    );

    let options = {};
    if (!canViewAll) {
      if (canViewDepartment && session.departmentId) {
        options = { departmentId: session.departmentId };
      } else {
        options = { userId: session.userId };
      }
    }

    const stats = await attendanceService.getWeeklyStats(date, options);
    return { success: true, data: stats };
  } catch (error) {
    console.error("Error getting weekly stats:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to get weekly stats",
    };
  }
}
