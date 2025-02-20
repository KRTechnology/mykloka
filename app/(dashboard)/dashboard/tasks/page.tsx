import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TasksPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Task Management</h1>

      <Card>
        <CardHeader>
          <CardTitle>Tasks Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Task management functionality coming soon...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
