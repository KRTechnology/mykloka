"use client";

import { updateTaskStatusAction } from "@/actions/tasks";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTasksContext } from "@/contexts/TasksContext";
import { UserJWTPayload } from "@/lib/auth/auth.service";
import { Task } from "@/lib/tasks/types";
import { motion } from "framer-motion";
import {
  Check,
  Clock,
  Info,
  MoreHorizontal,
  Play,
  RotateCcw,
  X,
} from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

interface TaskActionsProps {
  task: Task;
  canApprove: boolean;
  user: UserJWTPayload;
}

export function TaskActions({ task, canApprove, user }: TaskActionsProps) {
  const [isPending, startTransition] = useTransition();
  const { refreshTasks } = useTasksContext();

  // Check if the current user is a department manager but not a super admin
  const isDepartmentManager =
    user.permissions.includes("view_department_tasks") &&
    !user.permissions.includes("approve_tasks");

  // Check if the current user is the assignee of this task
  const isAssignee = task.assignedToId === user.userId;

  // Department managers cannot approve their own tasks
  const cannotApproveSelfTask = isDepartmentManager && isAssignee;

  const handleStatusChange = (status: Task["status"]) => {
    if (isPending) return; // Prevent multiple submissions

    // Additional check to prevent department managers from approving their own tasks
    if (
      cannotApproveSelfTask &&
      (status === "APPROVED" ||
        (task.status === "PENDING" && status === "IN_PROGRESS"))
    ) {
      toast.error(
        "Department managers cannot approve their own tasks. Please ask another manager to approve this task."
      );
      return;
    }

    startTransition(async () => {
      try {
        const result = await updateTaskStatusAction(task.id, status);

        if (result.success) {
          const messages: Record<Task["status"], string> = {
            PENDING: "Task status updated",
            IN_PROGRESS: "Task approved and ready to start",
            COMPLETED: "Task marked as completed",
            APPROVED: "Task completion verified and approved",
            REJECTED: "Task rejected",
          };
          toast.success(messages[status]);

          // Refresh tasks using context
          await refreshTasks();
        } else {
          toast.error(result.error || "Failed to update task status");
        }
      } catch (error) {
        console.error("Error updating task status:", error);
        toast.error("An error occurred while updating the task");
      }
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0" disabled={isPending}>
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {/* Initial approval by manager (Pending -> In Progress) */}
        {task.status === "PENDING" && !canApprove && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <DropdownMenuLabel className="flex items-center text-muted-foreground">
              <Clock className="mr-2 h-4 w-4 text-kr-yellow" />
              Awaiting Manager Approval
            </DropdownMenuLabel>
          </motion.div>
        )}

        {canApprove && task.status === "PENDING" && (
          <>
            <DropdownMenuItem
              onClick={() => handleStatusChange("IN_PROGRESS")}
              disabled={isPending || cannotApproveSelfTask}
              className={cannotApproveSelfTask ? "text-muted-foreground" : ""}
            >
              <Play className="mr-2 h-4 w-4 text-kr-green" />
              Approve to Start
              {cannotApproveSelfTask && (
                <span className="ml-2 text-xs text-destructive">
                  (Cannot approve own task)
                </span>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleStatusChange("REJECTED")}
              disabled={isPending}
              className="text-destructive"
            >
              <X className="mr-2 h-4 w-4" />
              Reject Task
            </DropdownMenuItem>
          </>
        )}

        {/* Task completion by assignee */}
        {task.status === "IN_PROGRESS" && task.assignedToId === user.userId && (
          <DropdownMenuItem
            onClick={() => handleStatusChange("COMPLETED")}
            disabled={isPending}
          >
            <Check className="mr-2 h-4 w-4 text-kr-green" />
            Mark as Completed
          </DropdownMenuItem>
        )}

        {/* Final approval by manager (Completed -> Approved) */}
        {canApprove && task.status === "COMPLETED" && (
          <>
            <DropdownMenuItem
              onClick={() => handleStatusChange("APPROVED")}
              disabled={isPending || cannotApproveSelfTask}
              className={cannotApproveSelfTask ? "text-muted-foreground" : ""}
            >
              <Check className="mr-2 h-4 w-4 text-kr-green" />
              Verify & Approve Completion
              {cannotApproveSelfTask && (
                <span className="ml-2 text-xs text-destructive">
                  (Cannot approve own task)
                </span>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleStatusChange("IN_PROGRESS")}
              disabled={isPending}
              className="text-muted-foreground"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Return to In Progress
            </DropdownMenuItem>
          </>
        )}

        {/* Actions for rejected tasks */}
        {canApprove && task.status === "REJECTED" && (
          <DropdownMenuItem
            onClick={() => handleStatusChange("IN_PROGRESS")}
            disabled={isPending}
          >
            <Play className="mr-2 h-4 w-4 text-kr-green" />
            Restart Task
          </DropdownMenuItem>
        )}

        {/* Actions for approved tasks */}
        {canApprove && task.status === "APPROVED" && (
          <DropdownMenuItem
            onClick={() => handleStatusChange("COMPLETED")}
            disabled={isPending}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reopen for Review
          </DropdownMenuItem>
        )}

        {/* Show status message for non-managers */}
        {!canApprove && task.status === "REJECTED" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <DropdownMenuLabel className="flex items-center text-destructive">
              <X className="mr-2 h-4 w-4" />
              Task Rejected
            </DropdownMenuLabel>
          </motion.div>
        )}

        {!canApprove && task.status === "APPROVED" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <DropdownMenuLabel className="flex items-center text-kr-green">
              <Check className="mr-2 h-4 w-4" />
              Task Completed & Approved
            </DropdownMenuLabel>
          </motion.div>
        )}

        {/* Show message for department managers who can't approve their own tasks */}
        {cannotApproveSelfTask &&
          (task.status === "PENDING" || task.status === "COMPLETED") && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <DropdownMenuLabel className="flex items-center text-muted-foreground text-xs">
                <Info className="mr-2 h-4 w-4 text-kr-yellow" />
                Department managers cannot approve their own tasks
              </DropdownMenuLabel>
            </motion.div>
          )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
