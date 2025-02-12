"use client";

import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { getMonthlyCalendarAction } from "@/app/actions/attendance/get-records";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { format } from "date-fns";
import { Clock, AlertCircle } from "lucide-react";

interface AttendanceCalendarProps {
  canViewDepartment: boolean;
  canViewAll: boolean;
}

type CalendarDay = {
  date: Date;
  status: "present" | "late" | "absent";
  clockInTime: string;
  clockOutTime?: string;
  note?: string;
};

export function AttendanceCalendar({
  canViewDepartment,
  canViewAll,
}: AttendanceCalendarProps) {
  const [date, setDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState<CalendarDay[]>([]);
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);

  useEffect(() => {
    async function fetchCalendarData() {
      setIsLoading(true);
      try {
        const response = await getMonthlyCalendarAction(date);
        if (!response.success || !response.data) {
          throw new Error(response.error || "Failed to load calendar data");
        }
        setAttendanceData(response.data as CalendarDay[]);
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to load calendar data"
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchCalendarData();
  }, [date]);

  const modifiers = {
    present: attendanceData
      .filter((day) => day.status === "present")
      .map((day) => new Date(day.date)),
    late: attendanceData
      .filter((day) => day.status === "late")
      .map((day) => new Date(day.date)),
    absent: attendanceData
      .filter((day) => day.status === "absent")
      .map((day) => new Date(day.date)),
  };

  const handleDayClick = (day: Date) => {
    const attendance = attendanceData.find(
      (d) => new Date(d.date).toDateString() === day.toDateString()
    );
    setSelectedDay(attendance || null);
    // You can also trigger a modal or side panel here
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <Card className="max-w-[400px]">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Attendance Calendar</CardTitle>
          {selectedDay && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={cn(
                "px-2 py-1 text-sm rounded-full",
                selectedDay.status === "present" &&
                  "bg-kr-green/10 text-kr-green",
                selectedDay.status === "late" &&
                  "bg-yellow-500/10 text-yellow-500",
                selectedDay.status === "absent" &&
                  "bg-destructive/10 text-destructive"
              )}
            >
              {format(new Date(selectedDay.date), "d MMMM yyyy")}
            </motion.div>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <CalendarSkeleton />
          ) : (
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => {
                if (newDate) {
                  setDate(newDate);
                  handleDayClick(newDate);
                }
              }}
              className="rounded-md border"
              modifiers={modifiers}
              modifiersStyles={{
                present: {
                  color: "white",
                  backgroundColor: "var(--kr-green)",
                },
                late: {
                  color: "white",
                  backgroundColor: "var(--yellow-500)",
                },
                absent: {
                  color: "white",
                  backgroundColor: "var(--destructive)",
                },
              }}
              components={{
                DayContent: ({ date }) => (
                  <DayContent
                    date={date}
                    attendanceData={attendanceData}
                    onDayClick={handleDayClick}
                  />
                ),
              }}
            />
          )}
        </CardContent>
      </Card>

      <AnimatePresence mode="wait">
        {selectedDay && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-2"
          >
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Clock In:{" "}
                      {format(new Date(selectedDay.clockInTime), "hh:mm a")}
                    </span>
                  </div>
                  {selectedDay.clockOutTime && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Clock Out:{" "}
                        {format(new Date(selectedDay.clockOutTime), "hh:mm a")}
                      </span>
                    </div>
                  )}
                  {selectedDay.note && (
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selectedDay.note}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

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

function DayContent({
  date,
  attendanceData,
  onDayClick,
}: {
  date: Date;
  attendanceData: CalendarDay[];
  onDayClick: (date: Date) => void;
}) {
  const attendance = attendanceData.find(
    (day) => new Date(day.date).toDateString() === date.toDateString()
  );

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div
          onClick={() => onDayClick(date)}
          className={cn(
            "h-8 w-8 p-0 font-normal cursor-pointer hover:bg-muted/50 rounded-md transition-colors",
            attendance && "font-semibold text-white"
          )}
        >
          {date.getDate()}
        </div>
      </HoverCardTrigger>
      {attendance && (
        <HoverCardContent side="right" align="start" className="w-[200px] p-2">
          <div className="space-y-2">
            <p className="text-sm font-semibold">
              {format(date, "EEEE, MMMM d")}
            </p>
            <div className="text-sm space-y-1">
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3" />
                <span>{attendance.clockInTime}</span>
              </div>
              {attendance.clockOutTime && (
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  <span>{attendance.clockOutTime}</span>
                </div>
              )}
              {attendance.note && (
                <p className="text-xs text-muted-foreground">
                  {attendance.note}
                </p>
              )}
            </div>
          </div>
        </HoverCardContent>
      )}
    </HoverCard>
  );
}

function CalendarSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-7 gap-1">
        {[...Array(35)].map((_, i) => (
          <Skeleton key={i} className="h-8 w-8 rounded-full" />
        ))}
      </div>
    </div>
  );
}
