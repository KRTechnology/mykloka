"use client";

import { updateTaskStatusAction } from "@/app/actions/tasks";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Task } from "@/lib/tasks/types";
import { Check, MoreHorizontal, Play, RotateCcw, X } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

interface TaskActionsProps {
  task: Task;
  canApprove: boolean;
}

export function TaskActions({ task, canApprove }: TaskActionsProps) {
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (status: Task["status"]) => {
    startTransition(async () => {
      const result = await updateTaskStatusAction(task.id, status);

      if (result.success) {
        toast.success("Task status updated successfully");
      } else {
        toast.error(result.error || "Failed to update task status");
      }
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {/* Approval actions for managers */}
        {canApprove && task.status === "PENDING" && (
          <>
            <DropdownMenuItem
              onClick={() => handleStatusChange("APPROVED")}
              disabled={isPending}
            >
              <Play className="mr-2 h-4 w-4" />
              Approve Task
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

        {/* Actions for task owners/assignees */}
        {task.status === "APPROVED" && (
          <DropdownMenuItem
            onClick={() => handleStatusChange("COMPLETED")}
            disabled={isPending}
          >
            <Check className="mr-2 h-4 w-4" />
            Mark as Completed
          </DropdownMenuItem>
        )}

        {/* Managers can revert completed tasks */}
        {canApprove && task.status === "COMPLETED" && (
          <DropdownMenuItem
            onClick={() => handleStatusChange("IN_PROGRESS")}
            disabled={isPending}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Revert to In Progress
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
