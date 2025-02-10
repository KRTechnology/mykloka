import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Clock, ClipboardList, Building2 } from "lucide-react";

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

function DashboardContent() {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Employees" value={42} icon={Users} />
        <StatCard title="Clocked In Today" value={38} icon={Clock} />
        <StatCard title="Active Tasks" value={12} icon={ClipboardList} />
        <StatCard title="Departments" value={5} icon={Building2} />
      </div>

      {/* Add more dashboard sections here */}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense 
      fallback={
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Employees" value={0} icon={Users} loading />
          <StatCard title="Clocked In Today" value={0} icon={Clock} loading />
          <StatCard title="Active Tasks" value={0} icon={ClipboardList} loading />
          <StatCard title="Departments" value={0} icon={Building2} loading />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
} 