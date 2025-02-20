"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, ClipboardList } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export function QuickLinks() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Link href="/dashboard/attendance" className="block h-full">
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="h-full"
        >
          <Card className="h-full hover:bg-accent transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Attendance Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View and manage attendance records, check clock-in status, and
                generate reports.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </Link>

      <Link href="/dashboard/tasks" className="block h-full">
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="h-full"
        >
          <Card className="h-full hover:bg-accent transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Task Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Create, assign, and track tasks. Monitor progress and manage
                deadlines.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </Link>
    </div>
  );
}
