import { db } from "@/lib/db/config";
import { attendance } from "@/lib/db/schema";
import { eq, and, isNull, sql, between, desc } from "drizzle-orm";
import { addDays, startOfDay, endOfDay } from "date-fns";
import { users } from "@/lib/db/schema/users";

// Define return type for getCurrentDayAttendance
type AttendanceStatus =
  | { status: "not_started" }
  | { status: "completed"; data: typeof attendance.$inferSelect }
  | { status: "in_progress"; data: typeof attendance.$inferSelect };

export type AttendanceRecord = typeof attendance.$inferSelect;

interface AttendanceStats {
  present: number;
  late: number;
  absent: number;
  total: number;
}

const EARLIEST_CLOCK_IN = 6; // 6:00 AM
const LATE_AFTER = 8.5; // 8:30 AM

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

    const clockInHour =
      data.clockInTime.getHours() + data.clockInTime.getMinutes() / 60;

    // Check if trying to clock in too early
    if (clockInHour < EARLIEST_CLOCK_IN) {
      throw new Error("Cannot clock in before 6:00 AM");
    }

    // Determine if late
    const status = clockInHour > LATE_AFTER ? "late" : "present";

    const { clockInLocation, ...rest } = data;

    const [record] = await this.db
      .insert(attendance)
      .values({
        ...rest,
        status,
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

  async getCurrentDayAttendance(userId: string): Promise<AttendanceStatus> {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const records = await this.db
      .select()
      .from(attendance)
      .where(
        and(
          eq(attendance.userId, userId),
          sql`DATE(clock_in_time) = ${today.toISOString().split("T")[0]}`
        )
      )
      .orderBy(attendance.createdAt)
      .limit(1);

    const currentAttendance = records[0];

    if (!currentAttendance) {
      return { status: "not_started" };
    }

    if (currentAttendance.clockOutTime) {
      return {
        status: "completed",
        data: currentAttendance,
      };
    }

    return {
      status: "in_progress",
      data: currentAttendance,
    };
  }

  async getAttendanceByDateRange(
    startDate: Date,
    endDate: Date,
    options: {
      userId?: string;
      departmentId?: string;
    }
  ) {
    let whereConditions = [between(attendance.clockInTime, startDate, endDate)];

    if (options.userId) {
      whereConditions.push(eq(attendance.userId, options.userId));
    }

    if (options.departmentId) {
      whereConditions.push(eq(users.departmentId, options.departmentId));
    }

    return await this.db
      .select({
        attendance: attendance,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          departmentId: users.departmentId,
        },
      })
      .from(attendance)
      .innerJoin(users, eq(attendance.userId, users.id))
      .where(and(...whereConditions))
      .orderBy(desc(attendance.clockInTime));
  }

  async getDailyStats(
    date: Date,
    options: {
      userId?: string;
      departmentId?: string;
    }
  ): Promise<AttendanceStats> {
    const startOfDayDate = startOfDay(date);
    const endOfDayDate = endOfDay(date);

    const records = await this.getAttendanceByDateRange(
      startOfDayDate,
      endOfDayDate,
      options
    );

    return {
      present: records.filter((r) => r.attendance.status === "present").length,
      late: records.filter((r) => r.attendance.status === "late").length,
      absent: records.filter((r) => r.attendance.status === "absent").length,
      total: records.length,
    };
  }

  async getWeeklyStats(
    date: Date,
    options: {
      userId?: string;
      departmentId?: string;
    }
  ) {
    const startOfWeek = startOfDay(date);
    const endOfWeek = endOfDay(addDays(date, 6));

    const records = await this.getAttendanceByDateRange(
      startOfWeek,
      endOfWeek,
      options
    );

    // Group by day and status
    const stats = new Map<string, AttendanceStats>();

    records.forEach((record) => {
      const day = record.attendance.clockInTime.toLocaleDateString("en-US", {
        weekday: "short",
      });
      const status = record.attendance.status;

      if (!stats.has(day)) {
        stats.set(day, { present: 0, late: 0, absent: 0, total: 0 });
      }

      const dayStats = stats.get(day)!;
      dayStats[status]++;
      dayStats.total++;
    });

    return Array.from(stats.entries()).map(([day, stats]) => ({
      name: day,
      ...stats,
    }));
  }

  async getMonthlyCalendar(date: Date, userId: string) {
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const records = await this.getAttendanceByDateRange(
      startOfMonth,
      endOfMonth,
      { userId }
    );

    return records.map((record) => ({
      date: record.attendance.clockInTime,
      status: record.attendance.status,
    }));
  }
}

export const attendanceService = new AttendanceService();
