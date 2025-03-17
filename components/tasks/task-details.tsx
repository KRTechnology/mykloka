"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserJWTPayload } from "@/lib/auth/auth.service";
import { Task } from "@/lib/tasks/types";
import { formatDate } from "@/lib/utils/format";
import { motion } from "framer-motion";
import {
  CalendarIcon,
  CheckCircle2,
  Clock,
  Edit2,
  User,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { TaskActions } from "./task-actions";
import { TaskStatusBadge } from "./task-list";

interface TaskDetailsProps {
  task: Task;
  user: UserJWTPayload;
}

export function TaskDetails({ task, user }: TaskDetailsProps) {
  const canEdit =
    task.createdById === user.userId ||
    user.permissions.includes("approve_tasks");
  const canApproveTasks = user.permissions.includes("approve_tasks");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{task.title}</h1>
        <div className="flex items-center gap-2">
          {canEdit && (
            <Button asChild className="bg-kr-orange hover:bg-kr-orange/90">
              <Link href={`/dashboard/tasks/${task.id}/edit`}>
                <Edit2 className="mr-2 h-4 w-4" />
                Edit Task
              </Link>
            </Button>
          )}
          <TaskActions task={task} canApprove={canApproveTasks} user={user} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Task Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <TaskStatusBadge status={task.status} />
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Created {formatDate(task.createdAt)}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Description</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {task.description || "No description provided"}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Assignment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Created By</h4>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {`${task.createdBy.firstName} ${task.createdBy.lastName}`}
                    </span>
                  </div>
                </div>

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

              {task.status !== "PENDING" && (
                <div className="space-y-4 pt-4 border-t">
                  <h4 className="text-sm font-medium">Status History</h4>
                  {task.approvedById && (
                    <div className="flex items-start gap-2">
                      {task.status === "APPROVED" ? (
                        <CheckCircle2 className="h-4 w-4 text-kr-green mt-0.5" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive mt-0.5" />
                      )}
                      <div className="space-y-1">
                        <p className="text-sm">
                          Task {task.status.toLowerCase()} by{" "}
                          {`${task.approvedBy?.firstName} ${task.approvedBy?.lastName}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(task.approvalDate!)}
                        </p>
                      </div>
                    </div>
                  )}

                  {task.completionApprovedById && (
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-kr-green mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-sm">
                          Completion approved by{" "}
                          {`${task.completionApprovedBy?.firstName} ${task.completionApprovedBy?.lastName}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(task.completionApprovalDate!)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
