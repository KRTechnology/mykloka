"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { UserJWTPayload } from "@/lib/auth/auth.service";
import { Task } from "@/lib/tasks/types";
import { AnimatePresence, motion } from "framer-motion";
import { ClipboardList } from "lucide-react";
import { useMemo, useState } from "react";
import { CreateTaskButton } from "./create-task-button";
import { TaskFilters } from "./task-filters";
import { TaskList } from "./task-list";

interface TasksOverviewProps {
  tasks: Task[];
  user: UserJWTPayload;
}

type ViewMode = "all" | "my-tasks" | "department";

interface Filters {
  viewMode: ViewMode;
  status?: Task["status"];
}

export function TasksOverview({ tasks, user }: TasksOverviewProps) {
  const [filters, setFilters] = useState<Filters>({
    viewMode: "all",
    status: undefined,
  });

  const canViewDepartment = user.permissions.includes("view_department");

  const filteredTasks = useMemo(() => {
    let filtered = [...tasks];

    // Apply view mode filter
    if (filters.viewMode === "my-tasks") {
      filtered = filtered.filter(
        (task) =>
          task.createdById === user.userId || task.assignedToId === user.userId
      );
    } else if (filters.viewMode === "department" && canViewDepartment) {
      filtered = filtered.filter(
        (task) => task.requiresApproval && task.status === "PENDING"
      );
    }

    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter((task) => task.status === filters.status);
    }

    return filtered;
  }, [tasks, filters, user.userId, canViewDepartment]);

  const canApproveTasks = user.permissions.includes("approve_tasks");

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
    <div className="space-y-4">
      <TaskFilters
        tasks={tasks}
        onFilterChange={setFilters}
        canViewDepartment={canViewDepartment}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={`${filters.viewMode}-${filters.status}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <TaskList tasks={filteredTasks} user={user} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
