"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { UserJWTPayload } from "@/lib/auth/auth.service";
import { Task } from "@/lib/tasks/types";
import { AnimatePresence, motion } from "framer-motion";
import { ClipboardList } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CreateTaskButton } from "./create-task-button";
import { TaskFilters } from "./task-filters";
import { TaskList } from "./task-list";

interface TasksOverviewProps {
  initialTasks: {
    data: Task[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  user: UserJWTPayload;
}

type ViewMode = "all" | "my-tasks" | "department";

interface Filters {
  viewMode: ViewMode;
  status?: Task["status"];
  page?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  search?: string;
}

export function TasksOverview({ initialTasks, user }: TasksOverviewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [tasks, setTasks] = useState(initialTasks);

  const [filters, setFilters] = useState<Filters>({
    viewMode: (searchParams.get("viewMode") as ViewMode) || "all",
    status: (searchParams.get("status") as Task["status"]) || undefined,
    page: parseInt(searchParams.get("page") || "1"),
    sortBy: searchParams.get("sortBy") || "createdAt",
    sortDirection:
      (searchParams.get("sortDirection") as "asc" | "desc") || "desc",
    search: searchParams.get("search") || undefined,
  });

  const canViewDepartment = user.permissions.includes("view_department");

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.viewMode) params.set("viewMode", filters.viewMode);
    if (filters.status) params.set("status", filters.status);
    if (filters.page) params.set("page", filters.page.toString());
    if (filters.sortBy) params.set("sortBy", filters.sortBy);
    if (filters.sortDirection)
      params.set("sortDirection", filters.sortDirection);
    if (filters.search) params.set("search", filters.search);

    router.push(`${pathname}?${params.toString()}`);
  }, [filters, pathname, router]);

  // Update tasks when URL params change
  useEffect(() => {
    const fetchTasks = async () => {
      const params = new URLSearchParams(searchParams);
      const response = await fetch(`/api/tasks?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    };

    fetchTasks();
  }, [searchParams]);

  const handlePageChange = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const handleFilterChange = useCallback((newFilters: Partial<Filters>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: 1, // Reset to first page when filters change
    }));
  }, []);

  const canApproveTasks = user.permissions.includes("approve_tasks");

  if (tasks.data.length === 0) {
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
        tasks={tasks.data}
        onFilterChange={handleFilterChange}
        canViewDepartment={canViewDepartment}
        currentFilters={filters}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={`${filters.viewMode}-${filters.status}-${filters.page}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <TaskList
            tasks={tasks.data}
            user={user}
            currentPage={tasks.page}
            totalPages={tasks.totalPages}
            onPageChange={handlePageChange}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
