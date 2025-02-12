"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

interface AttendanceStatsProps {
  canViewDepartment: boolean;
  canViewAll: boolean;
}

const data = [
  {
    name: "Mon",
    present: 90,
    late: 8,
    absent: 2,
  },
  {
    name: "Tue",
    present: 85,
    late: 10,
    absent: 5,
  },
  {
    name: "Wed",
    present: 88,
    late: 7,
    absent: 5,
  },
  {
    name: "Thu",
    present: 92,
    late: 6,
    absent: 2,
  },
  {
    name: "Fri",
    present: 87,
    late: 8,
    absent: 5,
  },
];

export function AttendanceStats({
  canViewDepartment,
  canViewAll,
}: AttendanceStatsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <Card>
        <CardHeader>
          <CardTitle>Weekly Attendance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full max-w-4xl mx-auto">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  name="Present"
                  dataKey="present"
                  fill="var(--kr-green)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  name="Late"
                  dataKey="late"
                  fill="var(--yellow-500)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  name="Absent"
                  dataKey="absent"
                  fill="var(--destructive)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
