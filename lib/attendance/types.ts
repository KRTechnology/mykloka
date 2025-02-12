export interface AttendanceStats {
  present: number;
  late: number;
  absent: number;
  total: number;
}

export interface AttendanceStreak {
  current: number;
  longest: number;
  lastPerfectWeek: string | null;
}

export interface AverageTimings {
  clockIn: string;
  clockOut: string;
  workHours: number;
  lateCount: number;
  earlyLeaveCount: number;
}
