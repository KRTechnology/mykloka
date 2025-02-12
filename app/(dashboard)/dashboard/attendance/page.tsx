import { validatePermission } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { AttendanceOverview } from "@/components/attendance/attendance-overview";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AttendanceCalendar } from "@/components/attendance/attendance-calendar";
import { AttendanceStats } from "@/components/attendance/attendance-stats";

export default async function AttendancePage() {
  // Check for minimum required permission
  const hasPermission = await validatePermission("view_own_attendance");
  if (!hasPermission) {
    redirect("/dashboard");
  }

  // Check additional permissions
  const canViewDepartment = await validatePermission(
    "view_department_attendance"
  );

  const canViewAll = await validatePermission("view_all_attendance");

  console.log({ canViewDepartment, canViewAll });
  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <Heading
          title="Attendance Management"
          description="Track and manage attendance records"
        />
      </div>
      <Separator />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <AttendanceOverview
            canViewDepartment={canViewDepartment}
            canViewAll={canViewAll}
          />
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <AttendanceCalendar
            canViewDepartment={canViewDepartment}
            canViewAll={canViewAll}
          />
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <AttendanceStats
            canViewDepartment={canViewDepartment}
            canViewAll={canViewAll}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
