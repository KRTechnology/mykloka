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
      <Card className="shadow-sm w-fit">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-semibold">
            Attendance Calendar
          </CardTitle>
          {selectedDay && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={cn(
                "px-3 py-1.5 text-sm rounded-full ml-4",
                getStatusColor(selectedDay.status)
              )}
            >
              {format(new Date(selectedDay.date), "d MMMM yyyy")}
            </motion.div>
          )}
        </CardHeader>
        <CardContent className="px-1 pb-4">
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
              className="rounded-md p-3"
              classNames={{
                months: "flex flex-col space-y-4",
                month: "space-y-4",
                caption: "flex justify-center pt-1 relative items-center px-8",
                caption_label: "text-sm font-medium",
                nav: "space-x-1 flex items-center",
                nav_button:
                  "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse space-y-1",
                head_row: "flex",
                head_cell:
                  "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                row: "flex w-full",
                cell: "h-9 w-9 text-center text-sm relative p-0 focus-within:relative focus-within:z-20",
                day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
                day_range_end: "day-range-end",
                day_selected: "rounded-md",
                day_today: "rounded-md",
                day_outside: "opacity-50",
                day_disabled: "opacity-50",
                day_hidden: "invisible",
              }}
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
            <Card className="w-fit shadow-sm">
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

      <div className="flex items-center gap-6 w-fit text-sm">
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

  return (
    <HoverCard openDelay={0} closeDelay={0}>
      <HoverCardTrigger asChild>
        <div
          onClick={() => onDayClick(date)}
          className={cn(
            "h-9 w-9 p-0 font-medium cursor-pointer hover:bg-muted/50 rounded-md transition-all duration-200 flex items-center justify-center",
            attendance && "font-semibold text-white hover:opacity-90"
          )}
        >
          {date.getDate()}
        </div>
      </HoverCardTrigger>
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
