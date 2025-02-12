"use client";

import { useState } from "react";
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
  const [selectedDepartment, setSelectedDepartment] = useState<string>();

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
            View and manage attendance records
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

          <AttendanceFilter />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-kr-orange">89%</div>
            <p className="text-xs text-muted-foreground">+2% from last week</p>
          </CardContent>
        </Card>
        {/* Add more stat cards */}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
          <CardDescription>
            A list of attendance records for{" "}
            {viewMode === "personal"
              ? "you"
              : viewMode === "department"
                ? "your department"
                : "all departments"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AttendanceList
            viewMode={viewMode}
            departmentId={selectedDepartment}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}
