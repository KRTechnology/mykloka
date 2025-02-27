"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserJWTPayload } from "@/lib/auth/auth.service";
import { Task } from "@/lib/tasks/types";
import { formatDate } from "@/lib/utils/format";
import { Edit2, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { TaskActions } from "./task-actions";

interface TaskListProps {
  tasks: Task[];
  user: UserJWTPayload;
//   userId: string;
}

export function TaskList({ tasks, user }: TaskListProps) {
  const router = useRouter();
  const canApproveTasks = user.permissions.includes("approve_tasks");

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Created By</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id}>
              <TableCell className="font-medium">{task.title}</TableCell>
              <TableCell>
                <TaskStatusBadge status={task.status} />
              </TableCell>
              <TableCell>
                {task.assignedTo
                  ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}`
                  : "Unassigned"}
              </TableCell>
              <TableCell>
                {task.dueTime ? formatDate(task.dueTime) : "No due date"}
              </TableCell>
              <TableCell>
                {`${task.createdBy.firstName} ${task.createdBy.lastName}`}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/dashboard/tasks/${task.id}`)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {(task.createdById === user.userId || canApproveTasks) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        router.push(`/dashboard/tasks/${task.id}/edit`)
                      }
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                  <TaskActions task={task} canApprove={canApproveTasks} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function TaskStatusBadge({ status }: { status: Task["status"] }) {
  const variants: Record<
    Task["status"],
    {
      label: string;
      variant: "default" | "secondary" | "destructive" | "outline" | "success";
    }
  > = {
    PENDING: { label: "Pending", variant: "secondary" },
    IN_PROGRESS: { label: "In Progress", variant: "default" },
    COMPLETED: { label: "Completed", variant: "success" },
    APPROVED: { label: "Approved", variant: "success" },
    REJECTED: { label: "Rejected", variant: "destructive" },
  };

  const { label, variant } = variants[status];

  return <Badge variant={variant}>{label}</Badge>;
}
