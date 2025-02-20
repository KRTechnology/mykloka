"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AttendanceFilter } from "./attendance-filter";
import { AttendanceList } from "./attendance-list";
import { getStatsAction } from "@/app/actions/attendance/get-stats";
import { format, differenceInDays } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, UserCheck, UserX, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface AttendanceOverviewProps {
  canViewDepartment: boolean;
  canViewAll: boolean;
}

export function AttendanceOverview({
  canViewDepartment,
  canViewAll,
}: AttendanceOverviewProps) {
  const [viewMode, setViewMode] = useState<"personal" | "department" | "all">(
    "personal"
  );
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<{
    present: number;
    late: number;
    absent: number;
    total: number;
  } | null>(null);

  //   const { toast } = useToast();

  useEffect(() => {
    async function fetchStats() {
      setIsLoading(true);
      try {
        const startDate = dateRange ? dateRange.from : selectedDate;
        const endDate = dateRange ? dateRange.to : selectedDate;

        // Determine the type based on the date range
        let type: "daily" | "weekly" | "monthly" = "daily";
        if (dateRange) {
          const days = differenceInDays(dateRange.to, dateRange.from);
          if (days > 27) type = "monthly";
          else if (days > 6) type = "weekly";
        }

        const response = await getStatsAction({
          startDate,
          endDate,
          type,
        });

        if (!response.success || !response.data) {
          throw new Error(response.error || "Failed to load stats");
        }
        setStats(response.data);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to load stats"
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, [selectedDate, dateRange, viewMode]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            Attendance Overview
          </h2>
          <p className="text-sm text-muted-foreground">
            {format(selectedDate, "PPPP")}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {(canViewDepartment || canViewAll) && (
            <Select
              value={viewMode}
              onValueChange={(value: "personal" | "department" | "all") =>
                setViewMode(value)
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select view" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="personal">Personal View</SelectItem>
                {canViewDepartment && (
                  <SelectItem value="department">Department View</SelectItem>
                )}
                {canViewAll && (
                  <SelectItem value="all">All Departments</SelectItem>
                )}
              </SelectContent>
            </Select>
          )}

          <AttendanceFilter
            date={selectedDate}
            onDateChange={setSelectedDate}
            onRangeChange={(range) => {
              setDateRange(range);
              setSelectedDate(range.from); // Update selected date to start of range
            }}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Present Today"
          value={stats?.present || 0}
          total={stats?.total || 0}
          icon={UserCheck}
          isLoading={isLoading}
          className="border-green-100 dark:border-green-900"
          valueClassName="text-kr-green"
        />
        <StatsCard
          title="Late Today"
          value={stats?.late || 0}
          total={stats?.total || 0}
          icon={Clock}
          isLoading={isLoading}
          className="border-yellow-100 dark:border-yellow-900"
          valueClassName="text-yellow-500"
        />
        <StatsCard
          title="Absent Today"
          value={stats?.absent || 0}
          total={stats?.total || 0}
          icon={UserX}
          isLoading={isLoading}
          className="border-red-100 dark:border-red-900"
          valueClassName="text-destructive"
        />
        <StatsCard
          title="Total Employees"
          value={stats?.total || 0}
          total={stats?.total || 0}
          icon={AlertTriangle}
          isLoading={isLoading}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
          <CardDescription>
            {dateRange ? (
              <>
                Records from {format(dateRange.from, "PPP")} to{" "}
                {format(dateRange.to, "PPP")}
              </>
            ) : (
              `Records for ${format(selectedDate, "PPP")}`
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AttendanceList
            viewMode={viewMode}
            date={selectedDate}
            dateRange={dateRange}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface StatsCardProps {
  title: string;
  value: number;
  total: number;
  icon: any;
  isLoading?: boolean;
  className?: string;
  valueClassName?: string;
}

function StatsCard({
  title,
  value,
  total,
  icon: Icon,
  isLoading,
  className,
  valueClassName,
}: StatsCardProps) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-7 w-[100px]" />
        ) : (
          <>
            <div className={`text-2xl font-bold ${valueClassName}`}>
              {value}
            </div>
            <p className="text-xs text-muted-foreground">
              {percentage}% of total
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
