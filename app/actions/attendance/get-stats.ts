"use server";

import { attendanceService } from "@/lib/attendance/attendance.service";
import { validatePermission, getServerSession } from "@/lib/auth/auth";
import { isEqual, isWithinInterval } from "date-fns";

export async function getStatsAction(params: {
  startDate: Date;
  endDate: Date;
  type: "daily" | "weekly" | "monthly";
}) {
  try {
    const { startDate, endDate, type } = params;
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

    // If start and end date are the same, use daily stats
    if (isEqual(startDate, endDate)) {
      const stats = await attendanceService.getDailyStats(startDate, options);
      return { success: true, data: stats };
    }

    // For weekly view
    if (type === "weekly") {
      const stats = await attendanceService.getWeeklyStats(startDate, options);
      return { success: true, data: stats };
    }

    // For monthly view
    if (type === "monthly") {
      const stats = await attendanceService.getMonthlyStats(startDate, options);
      return { success: true, data: stats };
    }

    // For custom date ranges
    const stats = await attendanceService.getDateRangeStats(
      startDate,
      endDate,
      options
    );
    return { success: true, data: stats };
  } catch (error) {
    console.error("Error getting stats:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get stats",
    };
  }
}

// Keep these for backward compatibility if needed
export async function getDailyStatsAction(date: Date) {
  return getStatsAction({ startDate: date, endDate: date, type: "daily" });
}

export async function getWeeklyStatsAction(date: Date) {
  return getStatsAction({ startDate: date, endDate: date, type: "weekly" });
}

export async function getMonthlyStatsAction(date: Date) {
  return getStatsAction({ startDate: date, endDate: date, type: "monthly" });
}
