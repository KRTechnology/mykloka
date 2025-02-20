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
import type {
  AttendanceStats,
  AttendanceStreak,
  AverageTimings,
} from "@/lib/attendance/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users2 } from "lucide-react";

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

// Add color constants at the top
const CHART_COLORS = {
  present: "var(--kr-green)",
  late: "var(--kr-yellow)",
  absent: "var(--kr-red)",
} as const;

// Add viewMode type
type ViewMode = "personal" | "department" | "all";

export function AttendanceStats({
  canViewDepartment,
  canViewAll,
}: AttendanceStatsProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("personal");
  const [date] = useState<Date>(() => {
    const now = new Date();
    return startOfWeek(now, { weekStartsOn: 1 });
  });
  const [isLoading, setIsLoading] = useState(true);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats[]>([]);
  const [streak, setStreak] = useState<AttendanceStreak | null>(null);
  const [averages, setAverages] = useState<AverageTimings | null>(null);

  console.log("Component rendered with date:", date);

  useEffect(() => {
    async function fetchStats() {
      setIsLoading(true);
      try {
        console.log("Fetching stats for date:", date);
        const response = await getWeeklyStatsAction(date, viewMode);
        console.log("Weekly stats response:", response);

        if (!response.success || !response.data) {
          throw new Error(response.error || "Failed to load statistics");
        }
        setWeeklyStats(response.data);
      } catch (error) {
        console.error("Error fetching stats:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to load statistics"
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, [date, viewMode]);

  // Update the enhanced stats fetch
  useEffect(() => {
    async function fetchEnhancedStats() {
      try {
        const [streakResponse, averagesResponse] = await Promise.all([
          getAttendanceStreakAction(),
          getAverageTimingsAction(),
        ]);

        if (streakResponse.success && streakResponse.data) {
          setStreak(streakResponse.data as AttendanceStreak);
        }
        if (averagesResponse.success && averagesResponse.data) {
          setAverages(averagesResponse.data as AverageTimings);
        }
      } catch (error) {
        toast.error("Failed to load enhanced statistics");
      }
    }

    fetchEnhancedStats();
  }, []);

  const attendanceRate = weeklyStats.reduce(
    (acc, day) => ({
      total: acc.total + day.total,
      present: acc.present + day.present,
      late: acc.late + day.late,
    }),
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
      {/* Add view mode selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Statistics</h2>
        <Select
          value={viewMode}
          onValueChange={(value: ViewMode) => setViewMode(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select view" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="personal">
              <div className="flex items-center">
                <Users2 className="mr-2 h-4 w-4" />
                Personal
              </div>
            </SelectItem>
            {canViewDepartment && (
              <SelectItem value="department">
                <div className="flex items-center">
                  <Users2 className="mr-2 h-4 w-4" />
                  Department
                </div>
              </SelectItem>
            )}
            {canViewAll && (
              <SelectItem value="all">
                <div className="flex items-center">
                  <Users2 className="mr-2 h-4 w-4" />
                  All Employees
                </div>
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

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
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                      }}
                      cursor={{ fill: "hsl(var(--muted))" }}
                    />
                    <Legend />
                    <Bar
                      name="Present"
                      dataKey="present"
                      fill={CHART_COLORS.present}
                      radius={[4, 4, 0, 0]}
                      stackId="a"
                    />
                    <Bar
                      name="Late"
                      dataKey="late"
                      fill={CHART_COLORS.late}
                      radius={[4, 4, 0, 0]}
                      stackId="a"
                    />
                    <Bar
                      name="Absent"
                      dataKey="absent"
                      fill={CHART_COLORS.absent}
                      radius={[4, 4, 0, 0]}
                      stackId="a"
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
                    stroke={CHART_COLORS.present}
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    name="Late"
                    dataKey="late"
                    stroke={CHART_COLORS.late}
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    name="Absent"
                    dataKey="absent"
                    stroke={CHART_COLORS.absent}
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
