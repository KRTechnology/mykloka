"use client";

import { updateTaskStatusAction } from "@/actions/tasks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
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
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils/format";
import { motion } from "framer-motion";
import { Check, Edit2, Eye, Info, Play } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { TaskActions } from "./task-actions";

interface TaskListProps {
  tasks: Task[];
  user: UserJWTPayload;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export function TaskList({
  tasks,
  user,
  currentPage,
  totalPages,
  onPageChange,
  isLoading,
}: TaskListProps) {
  const router = useRouter();
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());

  // Check if user has permission to approve tasks
  const canApproveTasks =
    user.permissions.includes("approve_tasks") ||
    user.permissions.includes("approve_department_tasks");

  // Get the common status of selected tasks
  const selectedTasksStatus =
    selectedTasks.size > 0
      ? tasks.find((task) => selectedTasks.has(task.id))?.status
      : null;

  // Handle bulk status change
  const handleBulkStatusChange = async (newStatus: Task["status"]) => {
    if (selectedTasks.size === 0) return;

    try {
      const promises = Array.from(selectedTasks).map((taskId) =>
        updateTaskStatusAction(taskId, newStatus)
      );

      const results = await Promise.all(promises);
      const hasErrors = results.some((result) => !result.success);

      if (hasErrors) {
        toast.error("Some tasks failed to update");
      } else {
        toast.success(`Successfully updated ${selectedTasks.size} tasks`);
        setSelectedTasks(new Set());
        router.refresh();
      }
    } catch (error) {
      console.error("Error updating tasks:", error);
      toast.error("Failed to update tasks");
    }
  };

  // Handle task selection
  const handleTaskSelect = (taskId: string) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId);
    } else {
      newSelected.add(taskId);
    }
    setSelectedTasks(newSelected);
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedTasks.size === tasks.length) {
      setSelectedTasks(new Set());
    } else {
      setSelectedTasks(new Set(tasks.map((task) => task.id)));
    }
  };

  // Generate pagination items
  const paginationItems = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      paginationItems.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => onPageChange(i)}
            isActive={currentPage === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      paginationItems.push(
        <PaginationItem key={i}>
          <PaginationEllipsis />
        </PaginationItem>
      );
    }
  }

  return (
    <div className="space-y-4">
      {selectedTasks.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between rounded-md border bg-muted/50 p-4"
        >
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">
              {selectedTasks.size} task{selectedTasks.size !== 1 ? "s" : ""}{" "}
              selected
            </span>
            {selectedTasksStatus === "PENDING" && canApproveTasks && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkStatusChange("IN_PROGRESS")}
                className="gap-2"
              >
                <Play className="h-4 w-4" />
                Approve Selected
              </Button>
            )}
            {selectedTasksStatus === "COMPLETED" && canApproveTasks && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkStatusChange("APPROVED")}
                className="gap-2"
              >
                <Check className="h-4 w-4" />
                Approve Selected
              </Button>
            )}
            {selectedTasksStatus === "IN_PROGRESS" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkStatusChange("COMPLETED")}
                className="gap-2"
              >
                <Check className="h-4 w-4" />
                Mark Selected as Completed
              </Button>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedTasks(new Set())}
          >
            Clear Selection
          </Button>
        </motion.div>
      )}
      <div className="relative rounded-md border">
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 rounded-md bg-background/50 backdrop-blur-[1px]"
          >
            <div className="flex h-full items-center justify-center">
              <div className="flex items-center space-x-4">
                <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-kr-orange" />
                <span className="text-sm text-muted-foreground">
                  Loading...
                </span>
              </div>
            </div>
          </motion.div>
        )}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={selectedTasks.size === tasks.length}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className={cn(isLoading && "opacity-50")}>
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
                  <TableCell>
                    <Checkbox
                      checked={selectedTasks.has(task.id)}
                      onCheckedChange={() => handleTaskSelect(task.id)}
                    />
                  </TableCell>
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
                                    on{" "}
                                    {formatDate(task.completionApprovalDate!)}
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
                        onClick={() =>
                          router.push(`/dashboard/tasks/${task.id}`)
                        }
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
                      <TaskActions
                        task={task}
                        canApprove={canApproveThisTask}
                        user={user}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1 || isLoading}
                />
              </PaginationItem>
              {paginationItems}
              <PaginationItem>
                <PaginationNext
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || isLoading}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
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
