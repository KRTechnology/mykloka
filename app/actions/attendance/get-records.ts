"use server";

import { attendanceService } from "@/lib/attendance/attendance.service";
import { validatePermission, getServerSession } from "@/lib/auth/auth";

export async function getAttendanceRecordsAction(
  startDate: Date,
  endDate: Date,
  viewMode: "personal" | "department" | "all"
) {
  try {
    const session = await getServerSession();
    if (!session) throw new Error("Unauthorized");

    let options = {};

    switch (viewMode) {
      case "personal":
        options = { userId: session.userId };
        break;
      case "department":
        const canViewDepartment = await validatePermission(
          "view_department_attendance"
        );
        if (!canViewDepartment) {
          throw new Error("Unauthorized to view department attendance");
        }
        options = { departmentId: session.departmentId };
        break;
      case "all":
        const canViewAll = await validatePermission("view_all_attendance");
        if (!canViewAll) {
          throw new Error("Unauthorized to view all attendance");
        }
        break;
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
      error:
        error instanceof Error
          ? error.message
          : "Failed to get attendance records",
    };
  }
}

export async function getMonthlyCalendarAction(date: Date) {
  try {
    const session = await getServerSession();
    if (!session) throw new Error("Unauthorized");

    const records = await attendanceService.getMonthlyCalendar(
      date,
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
