import { db } from "@/lib/db/config";
import { attendance } from "@/lib/db/schema";
import { users } from "@/lib/db/schema/users";
import { addDays, endOfDay, format, startOfDay } from "date-fns";
import { and, between, desc, eq, isNotNull, sql } from "drizzle-orm";
import { cache } from "@/lib/cache";
import { AttendanceStats, AttendanceStreak, AverageTimings } from "./types";

// Define return type for getCurrentDayAttendance
type AttendanceStatus =
  | { status: "not_started" }
  | { status: "completed"; data: typeof attendance.$inferSelect }
  | { status: "in_progress"; data: typeof attendance.$inferSelect };

export type AttendanceRecord = typeof attendance.$inferSelect;

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
    const cacheKey = `daily-stats-${date.toISOString()}-${options.userId || ""}-${
      options.departmentId || ""
    }`;
    const cachedData = cache.get<AttendanceStats>(cacheKey);
    if (cachedData) return cachedData;

    const result = await this._getDailyStats(date, options);
    cache.set<AttendanceStats>(cacheKey, result, 5 * 60 * 1000);
    return result;
  }

  private async _getDailyStats(
    date: Date,
    options: { userId?: string; departmentId?: string }
  ) {
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

  async getAttendanceStreak(userId: string) {
    const cacheKey = `attendance-streak-${userId}`;
    const cachedData = cache.get<AttendanceStreak>(cacheKey);
    if (cachedData) return cachedData;

    try {
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);

      // Get all attendance records for the last 30 days
      const records = await this.db
        .select({
          date: sql<string>`DATE(${attendance.clockInTime})`,
          status: attendance.status,
        })
        .from(attendance)
        .where(
          and(
            eq(attendance.userId, userId),
            between(attendance.clockInTime, thirtyDaysAgo, today)
          )
        )
        .orderBy(desc(attendance.clockInTime));

      // Calculate current streak
      let currentStreak = 0;
      let longestStreak = 0;
      let currentDate = new Date();
      let lastPerfectWeek: string | null = null;

      // Group records by date
      const attendanceByDate = new Map<string, string>();
      records.forEach((record) => {
        attendanceByDate.set(record.date, record.status);
      });

      // Calculate current streak
      while (true) {
        const dateStr = currentDate.toISOString().split("T")[0];
        const status = attendanceByDate.get(dateStr);

        // Skip weekends
        if (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
          currentDate.setDate(currentDate.getDate() - 1);
          continue;
        }

        // Break if no record or absent
        if (!status || status === "absent") break;

        currentStreak++;
        currentDate.setDate(currentDate.getDate() - 1);
      }

      // Calculate longest streak and last perfect week
      let tempStreak = 0;
      let perfectWeekStart = null;
      let currentWeekPerfect = true;
      let weekdayCount = 0;

      records.forEach((record, index) => {
        const recordDate = new Date(record.date);

        // Skip weekends
        if (recordDate.getDay() === 0 || recordDate.getDay() === 6) return;

        if (record.status !== "absent") {
          tempStreak++;
          if (tempStreak > longestStreak) {
            longestStreak = tempStreak;
          }

          // Track perfect weeks
          if (currentWeekPerfect) {
            weekdayCount++;
            if (weekdayCount === 5) {
              lastPerfectWeek = recordDate.toISOString().split("T")[0];
            }
          }
        } else {
          tempStreak = 0;
          currentWeekPerfect = false;
          weekdayCount = 0;
        }

        // Reset week tracking on Mondays
        if (recordDate.getDay() === 1) {
          currentWeekPerfect = true;
          weekdayCount = record.status !== "absent" ? 1 : 0;
        }
      });

      const result: AttendanceStreak = {
        current: currentStreak,
        longest: longestStreak,
        lastPerfectWeek,
      };

      cache.set<AttendanceStreak>(cacheKey, result, 30 * 60 * 1000);
      return result;
    } catch (error) {
      console.error("Error calculating attendance streak:", error);
      throw error;
    }
  }

  async getAverageTimings(userId: string) {
    const cacheKey = `average-timings-${userId}`;
    const cachedData = cache.get<AverageTimings>(cacheKey);
    if (cachedData) return cachedData;

    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Get all attendance records for the last 30 days
      const records = await this.db
        .select({
          clockInTime: attendance.clockInTime,
          clockOutTime: attendance.clockOutTime,
          status: attendance.status,
        })
        .from(attendance)
        .where(
          and(
            eq(attendance.userId, userId),
            between(attendance.clockInTime, thirtyDaysAgo, new Date()),
            isNotNull(attendance.clockOutTime)
          )
        );

      if (records.length === 0) {
        return {
          clockIn: "N/A",
          clockOut: "N/A",
          workHours: 0,
          lateCount: 0,
          earlyLeaveCount: 0,
        };
      }

      // Calculate averages
      let totalClockInMinutes = 0;
      let totalClockOutMinutes = 0;
      let totalWorkHours = 0;
      let lateCount = 0;
      let earlyLeaveCount = 0;

      records.forEach((record) => {
        const clockIn = new Date(record.clockInTime);
        const clockOut = new Date(record.clockOutTime!);

        // Add to totals for averaging
        totalClockInMinutes += clockIn.getHours() * 60 + clockIn.getMinutes();
        totalClockOutMinutes +=
          clockOut.getHours() * 60 + clockOut.getMinutes();

        // Calculate work hours
        const workHours =
          (clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60);
        totalWorkHours += workHours;

        // Count late arrivals
        if (record.status === "late") {
          lateCount++;
        }

        // Count early leaves (before 5 PM)
        if (clockOut.getHours() < 17) {
          earlyLeaveCount++;
        }
      });

      // Calculate averages
      const avgClockInMinutes = Math.round(
        totalClockInMinutes / records.length
      );
      const avgClockOutMinutes = Math.round(
        totalClockOutMinutes / records.length
      );

      // Convert minutes to time strings
      const avgClockInHours = Math.floor(avgClockInMinutes / 60);
      const avgClockInMins = avgClockInMinutes % 60;
      const avgClockOutHours = Math.floor(avgClockOutMinutes / 60);
      const avgClockOutMins = avgClockOutMinutes % 60;

      const clockIn = new Date();
      clockIn.setHours(avgClockInHours, avgClockInMins, 0);
      const clockOut = new Date();
      clockOut.setHours(avgClockOutHours, avgClockOutMins, 0);

      const result: AverageTimings = {
        clockIn: format(clockIn, "hh:mm a"),
        clockOut: format(clockOut, "hh:mm a"),
        workHours: +(totalWorkHours / records.length).toFixed(2),
        lateCount,
        earlyLeaveCount,
      };

      cache.set<AverageTimings>(cacheKey, result, 30 * 60 * 1000);
      return result;
    } catch (error) {
      console.error("Error calculating average timings:", error);
      throw error;
    }
  }
}

export const attendanceService = new AttendanceService();
