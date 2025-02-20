import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function TaskOverview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div>Completed</div>
            <div className="text-muted-foreground">24/50</div>
          </div>
          <Progress value={48} className="h-2" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div>In Progress</div>
            <div className="text-muted-foreground">12/50</div>
          </div>
          <Progress value={24} className="h-2" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div>Pending</div>
            <div className="text-muted-foreground">14/50</div>
          </div>
          <Progress value={28} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
} 