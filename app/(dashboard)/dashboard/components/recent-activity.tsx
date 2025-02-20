import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, UserPlus, CheckCircle2, AlertCircle } from "lucide-react";

type Activity = {
  id: string;
  type: "clock-in" | "clock-out" | "task-complete" | "new-user";
  user: string;
  time: string;
  description: string;
};

// This will be replaced with real data from an action
const DEMO_ACTIVITIES: Activity[] = [
  {
    id: "1",
    type: "clock-in",
    user: "John Doe",
    time: "2 minutes ago",
    description: "Clocked in for the day",
  },
  {
    id: "2",
    type: "task-complete",
    user: "Jane Smith",
    time: "1 hour ago",
    description: "Completed task: Q1 Report Review",
  },
  // Add more demo activities...
];

function ActivityIcon({ type }: { type: Activity["type"] }) {
  switch (type) {
    case "clock-in":
      return <Clock className="h-4 w-4 text-blue-500" />;
    case "clock-out":
      return <Clock className="h-4 w-4 text-orange-500" />;
    case "task-complete":
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case "new-user":
      return <UserPlus className="h-4 w-4 text-purple-500" />;
    default:
      return <AlertCircle className="h-4 w-4" />;
  }
}

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-4">
            {DEMO_ACTIVITIES.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start space-x-3 text-sm"
              >
                <ActivityIcon type={activity.type} />
                <div className="space-y-1">
                  <p className="font-medium">{activity.user}</p>
                  <p className="text-muted-foreground">
                    {activity.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
