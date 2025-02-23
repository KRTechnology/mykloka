"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Task } from "@/lib/tasks/types";
import { formatDate } from "@/lib/utils/format";
import { AnimatePresence, motion } from "framer-motion";
import { TaskActions } from "./task-actions";
import { ClipboardList } from "lucide-react";
import { CreateTaskButton } from "./create-task-button";

interface TasksOverviewProps {
  tasks: Task[];
  userRole: {
    id: string;
    name: string;
  };
}

export function TasksOverview({ tasks, userRole }: TasksOverviewProps) {
  const canApproveTasks = [
    "Super Admin",
    "HR Manager",
    "Department Manager",
  ].includes(userRole.name);

  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <ClipboardList className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">No tasks found</h3>
          <p className="mb-4 mt-2 text-center text-sm text-muted-foreground">
            {canApproveTasks
              ? "No tasks require your attention at the moment."
              : "You don't have any tasks yet. Create one to get started!"}
          </p>
          <CreateTaskButton />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tasks Overview</CardTitle>
        <CardDescription>
          Manage and track your tasks and approvals
        </CardDescription>
      </CardHeader>
      <CardContent>
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
            <AnimatePresence mode="popLayout">
              {tasks.map((task) => (
                <motion.tr
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
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
                    <TaskActions task={task} canApprove={canApproveTasks} />
                  </TableCell>
                </motion.tr>
              ))}
            </AnimatePresence>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function TaskStatusBadge({ status }: { status: Task["status"] }) {
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
