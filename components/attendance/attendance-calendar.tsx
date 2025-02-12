"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

interface AttendanceCalendarProps {
  canViewDepartment: boolean;
  canViewAll: boolean;
}

export function AttendanceCalendar({
  canViewDepartment,
  canViewAll,
}: AttendanceCalendarProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <Card className="max-w-[400px]">
        <CardHeader>
          <CardTitle>Attendance Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
            modifiers={{
              present: [new Date()], // Example: Mark today as present
              absent: [], // Will be populated with actual data
              late: [], // Will be populated with actual data
            }}
            modifiersStyles={{
              present: { color: "white", backgroundColor: "var(--kr-green)" },
              absent: { color: "white", backgroundColor: "var(--destructive)" },
              late: { color: "white", backgroundColor: "var(--yellow-500)" },
            }}
          />
        </CardContent>
      </Card>

      {/* Add a legend */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-kr-green" />
          <span>Present</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-yellow-500" />
          <span>Late</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-destructive" />
          <span>Absent</span>
        </div>
      </div>
    </motion.div>
  );
}
