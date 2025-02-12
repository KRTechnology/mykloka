"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
  LineChart,
} from "recharts";
import { getWeeklyStatsAction } from "@/app/actions/attendance/get-stats";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { startOfWeek } from "date-fns";
import {
  getAttendanceStreakAction,
  getAverageTimingsAction,
} from "@/app/actions/attendance/get-enhanced-stats";

interface AttendanceStatsProps {
  canViewDepartment: boolean;
  canViewAll: boolean;
}

type WeeklyStats = {
  name: string;
  present: number;
  late: number;
  absent: number;
  total: number;
};

// Add new types for enhanced stats
interface AttendanceStreak {
  current: number;
  longest: number;
  lastPerfectWeek: string | null;
}

interface AverageTimings {
  clockIn: string;
  clockOut: string;
  workHours: number;
  lateCount: number;
  earlyLeaveCount: number;
}

export function AttendanceStats({
  canViewDepartment,
  canViewAll,
}: AttendanceStatsProps) {
  const [date] = useState<Date>(startOfWeek(new Date()));
  const [isLoading, setIsLoading] = useState(true);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats[]>([]);
  const [streak, setStreak] = useState<AttendanceStreak | null>(null);
  const [averages, setAverages] = useState<AverageTimings | null>(null);

  useEffect(() => {
    async function fetchStats() {
      setIsLoading(true);
      try {
        const response = await getWeeklyStatsAction(date);
        if (!response.success || !response.data) {
          throw new Error(response.error || "Failed to load statistics");
        }
        setWeeklyStats(response.data as WeeklyStats[]);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to load statistics"
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, [date]);

  // Update the enhanced stats fetch
  useEffect(() => {
    async function fetchEnhancedStats() {
      try {
        const [streakResponse, averagesResponse] = await Promise.all([
          getAttendanceStreakAction(),
          getAverageTimingsAction(),
        ]);

        if (streakResponse.success && streakResponse.data) {
          setStreak(streakResponse.data);
        }
        if (averagesResponse.success && averagesResponse.data) {
          setAverages(averagesResponse.data);
        }
      } catch (error) {
        toast.error("Failed to load enhanced statistics");
      }
    }

    fetchEnhancedStats();
  }, []);

  const attendanceRate = weeklyStats.reduce(
    (acc, day) => {
      acc.total += day.total;
      acc.present += day.present;
      acc.late += day.late;
      return acc;
    },
    { total: 0, present: 0, late: 0 }
  );

  const presentRate = Math.round(
    ((attendanceRate.present + attendanceRate.late) / attendanceRate.total) *
      100
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Weekly Attendance Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[150px] w-full" />
            ) : (
              <div className="text-center">
                <div className="text-4xl font-bold text-kr-green">
                  {presentRate}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {attendanceRate.present} present, {attendanceRate.late} late
                  out of {attendanceRate.total} total
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Daily Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[350px] w-full" />
            ) : (
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={weeklyStats}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      name="Present"
                      dataKey="present"
                      fill="var(--kr-green)"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      name="Late"
                      dataKey="late"
                      fill="var(--yellow-500)"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      name="Absent"
                      dataKey="absent"
                      fill="var(--destructive)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Trends</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[350px] w-full" />
          ) : (
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={weeklyStats}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    name="Present"
                    dataKey="present"
                    stroke="var(--kr-green)"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    name="Late"
                    dataKey="late"
                    stroke="var(--yellow-500)"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Current Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[100px] w-full" />
            ) : (
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold text-kr-green">
                  {streak?.current || 0} days
                </div>
                <p className="text-xs text-muted-foreground">
                  Longest streak: {streak?.longest || 0} days
                </p>
                {streak?.lastPerfectWeek && (
                  <p className="text-xs text-muted-foreground">
                    Last perfect week: {streak.lastPerfectWeek}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Average Timings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[100px] w-full" />
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Clock In
                  </span>
                  <span className="font-medium">{averages?.clockIn}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Clock Out
                  </span>
                  <span className="font-medium">{averages?.clockOut}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Work Hours
                  </span>
                  <span className="font-medium">
                    {averages?.workHours}h/day
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
