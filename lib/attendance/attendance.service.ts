import { db } from "@/lib/db/config";
import { attendance } from "@/lib/db/schema";
import { eq, and, isNull, sql } from "drizzle-orm";

class AttendanceService {
  private db;

  constructor() {
    this.db = db;
  }

  async clockIn(data: {
    userId: string;
    clockInTime: Date;
    clockInLocation: { x: number; y: number };
    clockInAddress: string;
  }) {
    if (!data.userId) {
      throw new Error("User ID is required");
    }

    const { clockInLocation, ...rest } = data;

    const [record] = await this.db
      .insert(attendance)
      .values({
        ...rest,
        clockInLocation: [clockInLocation.x, clockInLocation.y] as [
          number,
          number,
        ],
      })
      .returning();

    return record;
  }

  async clockOut(
    attendanceId: string,
    data: {
      clockOutTime: Date;
      clockOutLocation: { x: number; y: number };
      clockOutAddress: string;
    }
  ) {
    const { clockOutLocation, ...rest } = data;

    const [record] = await this.db
      .update(attendance)
      .set({
        ...rest,
        clockOutLocation: [clockOutLocation.x, clockOutLocation.y] as [
          number,
          number,
        ],
      })
      .where(eq(attendance.id, attendanceId))
      .returning();

    return record;
  }

  async getCurrentAttendance(userId: string) {
    const record = await this.db
      .select()
      .from(attendance)
      .where(eq(attendance.userId, userId))
      .orderBy(attendance.createdAt)
      .limit(1);

    return record[0];
  }

  async getCurrentDayAttendance(userId: string) {
    // Get today's date at midnight in UTC
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const record = await this.db
      .select()
      .from(attendance)
      .where(
        and(
          eq(attendance.userId, userId),
          sql`DATE(clock_in_time) = ${today.toISOString().split("T")[0]}`,
          isNull(attendance.clockOutTime)
        )
      )
      .orderBy(attendance.createdAt)
      .limit(1);

    return record[0];
  }
}

export const attendanceService = new AttendanceService();
