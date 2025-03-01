"use server";

import { attendanceService } from "@/lib/attendance/attendance.service";
import { revalidateTag } from "next/cache";

export async function clockInAction(data: {
  userId: string;
  latitude: number;
  longitude: number;
  address: string;
  isRemote: boolean;
}) {
  try {
    if (!data.userId) {
      throw new Error("User ID is required");
    }

    // Create a date object and adjust for the local timezone
    const now = new Date();
    const clockInTime = new Date(
      now.getTime() - now.getTimezoneOffset() * 60000
    );

    const record = await attendanceService.clockIn({
      userId: data.userId,
      clockInTime,
      clockInLocation: { x: data.longitude, y: data.latitude },
      clockInAddress: data.address,
      isRemote: data.isRemote,
    });

    revalidateTag("attendance");
    return { success: true, data: record };
  } catch (error) {
    console.error("Error clocking in:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to clock in",
    };
  }
}

export async function clockOutAction(data: {
  attendanceId: string;
  latitude: number;
  longitude: number;
  address: string;
  isRemote: boolean;
}) {
  try {
    // Create a date object and adjust for the local timezone
    const now = new Date();
    const clockOutTime = new Date(
      now.getTime() - now.getTimezoneOffset() * 60000
    );

    const record = await attendanceService.clockOut(data.attendanceId, {
      clockOutTime,
      clockOutLocation: { x: data.longitude, y: data.latitude },
      clockOutAddress: data.address,
      isRemote: data.isRemote,
    });

    revalidateTag("attendance");
    return { success: true, data: record };
  } catch (error) {
    console.error("Error clocking out:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to clock out",
    };
  }
}

export async function checkAttendanceStatusAction(userId: string) {
  try {
    const attendance = await attendanceService.getCurrentDayAttendance(userId);

    return {
      success: true,
      data: {
        isClockedIn: attendance.status === "in_progress",
        isCompleted: attendance.status === "completed",
        attendanceId:
          attendance.status !== "not_started" ? attendance.data?.id : undefined,
      },
    };
  } catch (error) {
    console.error("Error checking attendance status:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to check attendance status",
    };
  }
}
