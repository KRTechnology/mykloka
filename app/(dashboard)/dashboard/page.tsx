import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Clock, ClipboardList, Building2 } from "lucide-react";
import { getDashboardStatsAction } from "@/app/actions/dashboard";
import { QuickLinks } from "./components/quick-links";
import { RecentActivity } from "./components/recent-activity";
import { WeeklyAttendanceChart } from "./components/weekly-attendance-chart";
import { TaskOverview } from "./components/task-overview";

function StatCard({
  title,
  value,
  icon: Icon,
  loading = false,
}: {
  title: string;
  value: string | number;
  icon: any;
  loading?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-7 w-20" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
      </CardContent>
    </Card>
  );
}

async function DashboardStats() {
  const { data: stats } = await getDashboardStatsAction();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Employees"
        value={stats?.totalEmployees || 0}
        icon={Users}
      />
      <StatCard
        title="Clocked In Today"
        value={stats?.clockedInToday || 0}
        icon={Clock}
      />
      <StatCard
        title="Active Tasks"
        value={stats?.activeTasks || 0}
        icon={ClipboardList}
      />
      <StatCard
        title="Departments"
        value={stats?.totalDepartments || 0}
        icon={Building2}
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <Suspense
        fallback={
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Total Employees" value={0} icon={Users} loading />
            <StatCard title="Clocked In Today" value={0} icon={Clock} loading />
            <StatCard
              title="Active Tasks"
              value={0}
              icon={ClipboardList}
              loading
            />
            <StatCard title="Departments" value={0} icon={Building2} loading />
          </div>
        }
      >
        <DashboardStats />
      </Suspense>

      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-4">Quick Access</h2>
        <QuickLinks />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <WeeklyAttendanceChart />
        </div>
        <div className="col-span-3">
          <TaskOverview />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <RecentActivity />
        {/* You can add another component here for balance */}
      </div>
    </div>
  );
}
