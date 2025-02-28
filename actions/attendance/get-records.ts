"use server";

import { attendanceService } from "@/lib/attendance/attendance.service";
import { validatePermission, getServerSession } from "@/lib/auth/auth";

export async function getAttendanceRecordsAction(
  startDate: Date,
  endDate: Date,
  viewMode: "personal" | "department" | "all",
  statusFilters: ("present" | "late" | "absent")[] = []
) {
  try {
    const session = await getServerSession();
    if (!session) throw new Error("Unauthorized");

    let options: {
      userId?: string;
      departmentId?: string;
      statusFilters?: ("present" | "late" | "absent")[];
    } = {};

    if (viewMode === "personal") {
      options.userId = session.userId;
    } else if (viewMode === "department" && session.departmentId) {
      options.departmentId = session.departmentId;
    }

    // Add status filters to options
    if (statusFilters.length > 0) {
      options.statusFilters = statusFilters;
    }

    const records = await attendanceService.getAttendanceByDateRange(
      startDate,
      endDate,
      options
    );

    return { success: true, data: records };
  } catch (error) {
    console.error("Error getting attendance records:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get records",
    };
  }
}

export async function getMonthlyCalendarAction(date: Date) {
  try {
    const session = await getServerSession();
    if (!session) throw new Error("Unauthorized");

    // Get first and last day of the month
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const records = await attendanceService.getMonthlyCalendar(
      startOfMonth,
      endOfMonth,
      session.userId
    );
    return { success: true, data: records };
  } catch (error) {
    console.error("Error getting calendar data:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to get calendar data",
    };
  }
}
