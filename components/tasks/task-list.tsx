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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { UserJWTPayload } from "@/lib/auth/auth.service";
import { Task } from "@/lib/tasks/types";
import { formatDate } from "@/lib/utils/format";
import { Edit2, Eye, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { TaskActions } from "./task-actions";

interface TaskListProps {
  tasks: Task[];
  user: UserJWTPayload;
  //   userId: string;
}

export function TaskList({ tasks, user }: TaskListProps) {
  const router = useRouter();
  const canApproveTasks =
    user.permissions.includes("approve_tasks") ||
    (user.permissions.includes("approve_department_tasks") &&
      user.departmentId);

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
          {tasks.map((task) => {
            // Check if the task belongs to the manager's department
            const isTaskInDepartment =
              task.createdBy.departmentId === user.departmentId;
            const canApproveThisTask =
              user.permissions.includes("approve_tasks") ||
              (user.permissions.includes("approve_department_tasks") &&
                isTaskInDepartment);

            return (
              <TableRow key={task.id}>
                <TableCell className="font-medium">{task.title}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <TaskStatusBadge status={task.status} />
                    {(task.approvedBy || task.completionApprovedBy) && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" className="h-4 w-4 p-0">
                              <Info className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="space-y-2 text-xs">
                              {task.approvedBy && (
                                <p>
                                  Initially approved by{" "}
                                  {`${task.approvedBy.firstName} ${task.approvedBy.lastName}`}
                                  <br />
                                  on {formatDate(task.approvalDate!)}
                                </p>
                              )}
                              {task.completionApprovedBy && (
                                <p>
                                  Completion verified by{" "}
                                  {`${task.completionApprovedBy.firstName} ${task.completionApprovedBy.lastName}`}
                                  <br />
                                  on {formatDate(task.completionApprovalDate!)}
                                </p>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
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
                    {(task.createdById === user.userId ||
                      canApproveThisTask) && (
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
                    <TaskActions task={task} canApprove={canApproveThisTask} />
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
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
      className?: string;
    }
  > = {
    PENDING: {
      label: "Pending",
      variant: "secondary",
      className:
        "bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80 border-yellow-200",
    },
    IN_PROGRESS: {
      label: "In Progress",
      variant: "default",
      className:
        "bg-blue-100 text-blue-800 hover:bg-blue-100/80 border-blue-200",
    },
    COMPLETED: {
      label: "Completed",
      variant: "outline",
      className:
        "bg-orange-100 text-orange-800 hover:bg-orange-100/80 border-orange-200",
    },
    APPROVED: {
      label: "Approved",
      variant: "success",
      className:
        "bg-green-100 text-green-800 hover:bg-green-100/80 border-green-200",
    },
    REJECTED: {
      label: "Rejected",
      variant: "destructive",
      className: "bg-red-100 text-red-800 hover:bg-red-100/80 border-red-200",
    },
  };

  const { label, className } = variants[status];

  return <Badge className={className}>{label}</Badge>;
}
