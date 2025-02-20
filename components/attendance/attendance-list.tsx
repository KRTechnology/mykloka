"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { getAttendanceRecordsAction } from "@/app/actions/attendance/get-records";
import { toast } from "sonner";
import { startOfDay, endOfDay } from "date-fns";

interface AttendanceListProps {
  viewMode: "personal" | "department" | "all";
  date: Date;
  dateRange?: { from: Date; to: Date } | null;
}

type AttendanceRecord = {
  attendance: {
    id: string;
    clockInTime: Date;
    clockOutTime: Date | null;
    status: "present" | "late" | "absent";
  };
  user: {
    firstName: string;
    lastName: string;
    departmentId: string | null;
  };
};

export function AttendanceList({ viewMode, date, dateRange }: AttendanceListProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    async function fetchRecords() {
      setIsLoading(true);
      try {
        const startDate = dateRange ? dateRange.from : startOfDay(date);
        const endDate = dateRange ? dateRange.to : endOfDay(date);

        const response = await getAttendanceRecordsAction(
          startDate,
          endDate,
          viewMode
        );
        if (!response.success || !response.data) {
          throw new Error(
            response.error || "Failed to load attendance records"
          );
        }
        setData(response.data as AttendanceRecord[]);
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to load attendance records"
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchRecords();
  }, [date, dateRange, viewMode]);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="relative">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Clock In</TableHead>
            <TableHead>Clock Out</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center text-muted-foreground"
              >
                No attendance records found
              </TableCell>
            </TableRow>
          ) : (
            <AnimatePresence mode="wait">
              {data.map((record) => (
                <motion.tr
                  key={record.attendance.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <TableCell>
                    {record.user.firstName} {record.user.lastName}
                  </TableCell>
                  <TableCell>
                    {format(new Date(record.attendance.clockInTime), "hh:mm a")}
                  </TableCell>
                  <TableCell>
                    {record.attendance.clockOutTime
                      ? format(
                          new Date(record.attendance.clockOutTime),
                          "hh:mm a"
                        )
                      : "---"}
                  </TableCell>
                  <TableCell>
                    {record.attendance.clockOutTime
                      ? calculateDuration(
                          record.attendance.clockInTime,
                          record.attendance.clockOutTime
                        )
                      : "---"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        record.attendance.status === "present"
                          ? "success"
                          : record.attendance.status === "late"
                            ? "warning"
                            : "destructive"
                      }
                    >
                      {record.attendance.status}
                    </Badge>
                  </TableCell>
                </motion.tr>
              ))}
            </AnimatePresence>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-4 w-[100px]" />
        ))}
      </div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          {[...Array(5)].map((_, j) => (
            <Skeleton key={j} className="h-4 w-[100px]" />
          ))}
        </div>
      ))}
    </div>
  );
}

function calculateDuration(start: Date, end: Date): string {
  const diff = new Date(end).getTime() - new Date(start).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}
