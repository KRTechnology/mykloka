"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// This will be replaced with real data from an action
const DEMO_DATA = [
  { day: "Mon", present: 45, late: 5 },
  { day: "Tue", present: 42, late: 8 },
  { day: "Wed", present: 44, late: 6 },
  { day: "Thu", present: 40, late: 10 },
  { day: "Fri", present: 43, late: 7 },
];

export function WeeklyAttendanceChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Attendance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={DEMO_DATA}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="present" fill="hsl(var(--primary))" name="Present" />
              <Bar dataKey="late" fill="hsl(var(--destructive))" name="Late" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
} 