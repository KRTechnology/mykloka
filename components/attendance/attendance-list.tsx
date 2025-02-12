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
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface AttendanceListProps {
  viewMode: "personal" | "department" | "all";
  departmentId?: string;
}

export function AttendanceList({
  viewMode,
  departmentId,
}: AttendanceListProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    // Fetch attendance data based on viewMode and departmentId
    // This will be implemented in the next step
  }, [viewMode, departmentId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="relative">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Clock In</TableHead>
            <TableHead>Clock Out</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <AnimatePresence mode="wait">
            {data.map((record) => (
              <motion.tr
                key={record.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <TableCell>{record.employeeName}</TableCell>
                <TableCell>{record.department}</TableCell>
                <TableCell>
                  {format(new Date(record.clockInTime), "hh:mm a")}
                </TableCell>
                <TableCell>
                  {record.clockOutTime
                    ? format(new Date(record.clockOutTime), "hh:mm a")
                    : "---"}
                </TableCell>
                <TableCell>{record.duration || "---"}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      record.status === "present"
                        ? "success"
                        : record.status === "late"
                          ? "warning"
                          : "destructive"
                    }
                  >
                    {record.status}
                  </Badge>
                </TableCell>
              </motion.tr>
            ))}
          </AnimatePresence>
        </TableBody>
      </Table>
    </div>
  );
}
