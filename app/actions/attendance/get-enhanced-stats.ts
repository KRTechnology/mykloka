"use server";

import { attendanceService } from "@/lib/attendance/attendance.service";
import { getServerSession } from "@/lib/auth/auth";

export async function getAttendanceStreakAction() {
  try {
    const session = await getServerSession();
    if (!session) throw new Error("Unauthorized");

    const streak = await attendanceService.getAttendanceStreak(session.userId);
    return { success: true, data: streak };
  } catch (error) {
    console.error("Error getting attendance streak:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get streak",
    };
  }
}

export async function getAverageTimingsAction() {
  try {
    const session = await getServerSession();
    if (!session) throw new Error("Unauthorized");

    const averages = await attendanceService.getAverageTimings(session.userId);
    return { success: true, data: averages };
  } catch (error) {
    console.error("Error getting average timings:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get averages",
    };
  }
}
