"use client";

import { useState, useEffect, useMemo } from "react";
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
  clockInTime: Date;
  clockOutTime: Date | null;
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
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  useEffect(() => {
    async function fetchCalendarData() {
      setIsLoading(true);
      try {
        const startOfMonth = new Date(
          currentMonth.getFullYear(),
          currentMonth.getMonth(),
          1
        );
        const endOfMonth = new Date(
          currentMonth.getFullYear(),
          currentMonth.getMonth() + 1,
          0
        );

        const response = await getMonthlyCalendarAction(startOfMonth);

        if (!response.success || !response.data) {
          throw new Error(response.error || "Failed to load calendar data");
        }

        // No need to transform dates as they're already Date objects from the service
        setAttendanceData(response.data);
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
  }, [currentMonth]);

  const modifiers = useMemo(
    () => ({
      present: attendanceData
        .filter((day) => day.status === "present")
        .map((day) => new Date(day.date)),
      late: attendanceData
        .filter((day) => day.status === "late")
        .map((day) => new Date(day.date)),
      absent: attendanceData
        .filter((day) => day.status === "absent")
        .map((day) => new Date(day.date)),
    }),
    [attendanceData]
  );

  const modifiersStyles = {
    present: {
      color: "white",
      backgroundColor: "var(--kr-green)",
      transform: "scale(0.9)",
      borderRadius: "8px",
      fontWeight: "600",
    },
    late: {
      color: "white",
      backgroundColor: "var(--kr-yellow)",
      transform: "scale(0.9)",
      borderRadius: "8px",
      fontWeight: "600",
    },
    absent: {
      color: "white",
      backgroundColor: "var(--kr-red)",
      transform: "scale(0.9)",
      borderRadius: "8px",
      fontWeight: "600",
    },
  } as const;

  const getStatusColor = (status?: "present" | "late" | "absent") => {
    switch (status) {
      case "present":
        return "bg-kr-green/20 text-kr-green font-semibold";
      case "late":
        return "bg-kr-yellow/20 text-kr-yellow font-semibold";
      case "absent":
        return "bg-kr-red/20 text-kr-red font-semibold";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const handleDayClick = (day: Date) => {
    const attendance = attendanceData.find(
      (d) => new Date(d.clockInTime).toDateString() === day.toDateString()
    );
    setSelectedDay(attendance || null);
    // You can also trigger a modal or side panel here
  };

  const formatTime = (date: Date | null | undefined) => {
    if (!date) return "Not recorded";
    try {
      if (isNaN(date.getTime())) return "Invalid time";
      return format(date, "hh:mm a");
    } catch (error) {
      console.error("Error formatting time:", error);
      return "Invalid time";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <Card className="max-w-[400px] shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-semibold">
            Attendance Calendar
          </CardTitle>
          {selectedDay && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={cn(
                "px-3 py-1.5 text-sm rounded-full",
                getStatusColor(selectedDay.status)
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
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              onSelect={(newDate) => {
                if (newDate) {
                  setDate(newDate);
                  handleDayClick(newDate);
                }
              }}
              className="rounded-md border p-3"
              modifiers={modifiers}
              modifiersStyles={modifiersStyles}
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
          >
            <Card className="max-w-[400px] shadow-sm">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-muted">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <span className="text-sm font-medium">
                      Clock In: {formatTime(selectedDay.clockInTime)}
                    </span>
                  </div>
                  {selectedDay.clockOutTime && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-muted">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <span className="text-sm font-medium">
                        Clock Out: {formatTime(selectedDay.clockOutTime)}
                      </span>
                    </div>
                  )}
                  {selectedDay.note && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-muted">
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {selectedDay.note}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-md bg-[var(--kr-green)] shadow-sm" />
          <span className="font-medium">Present</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-md bg-[var(--kr-yellow)] shadow-sm" />
          <span className="font-medium">Late</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-md bg-[var(--kr-red)] shadow-sm" />
          <span className="font-medium">Absent</span>
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
    (day) => new Date(day.clockInTime).toDateString() === date.toDateString()
  );

  const formatTime = (date: Date | null | undefined) => {
    if (!date) return "Not recorded";
    try {
      if (isNaN(date.getTime())) return "Invalid time";
      return format(date, "hh:mm a");
    } catch (error) {
      console.error("Error formatting time:", error);
      return "Invalid time";
    }
  };

  return (
    <HoverCard openDelay={0} closeDelay={0}>
      <HoverCardTrigger asChild>
        <div
          onClick={() => onDayClick(date)}
          className={cn(
            "h-8 w-8 p-0 font-medium cursor-pointer hover:bg-muted/50 rounded-md transition-all duration-200",
            attendance && "font-semibold text-white hover:opacity-90"
          )}
        >
          {date.getDate()}
        </div>
      </HoverCardTrigger>
      {/* {attendance && (
        <HoverCardContent
          side="right"
          align="start"
          className="w-[200px] p-3 shadow-md bg-popover border z-[100]"
          sideOffset={5}
        >
          <div className="space-y-2">
            <p className="text-sm font-semibold">
              {format(date, "EEEE, MMMM d")}
            </p>
            <div className="text-sm space-y-1.5">
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{formatTime(attendance.clockInTime)}</span>
              </div>
              {attendance.clockOutTime && (
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{formatTime(attendance.clockOutTime)}</span>
                </div>
              )}
            </div>
          </div>
        </HoverCardContent>
      )} */}
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
