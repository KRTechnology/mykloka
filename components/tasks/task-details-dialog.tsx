"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Task } from "@/lib/tasks/types";
import { formatDate } from "@/lib/utils/format";
import { motion } from "framer-motion";
import { CalendarIcon, Clock, User } from "lucide-react";
import { TaskStatusBadge } from "./task-list";

interface TaskDetailsDialogProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskDetailsDialog({
  task,
  open,
  onOpenChange,
}: TaskDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{task.title}</DialogTitle>
        </DialogHeader>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <TaskStatusBadge status={task.status} />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Created {formatDate(task.createdAt)}
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Description</h4>
              <p className="text-sm text-muted-foreground">
                {task.description || "No description provided"}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Assigned To</h4>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {task.assignedTo
                      ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}`
                      : "Unassigned"}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Due Date</h4>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {task.dueTime ? formatDate(task.dueTime) : "No due date"}
                  </span>
                </div>
              </div>
            </div>

            {task.approvedById && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Approval Details</h4>
                <div className="text-sm text-muted-foreground">
                  Approved on {formatDate(task.approvalDate!)}
                </div>
              </div>
            )}

            {task.completionApprovedById && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Completion Details</h4>
                <div className="text-sm text-muted-foreground">
                  Completion approved on{" "}
                  {formatDate(task.completionApprovalDate!)}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
