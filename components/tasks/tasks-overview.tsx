"use client";

import { UserJWTPayload } from "@/lib/auth/auth.service";
import { Task } from "@/lib/tasks/types";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState, useEffect, useMemo } from "react";
import { TaskFilters } from "./task-filters";
import { TaskList } from "./task-list";
import { CreateTaskButton } from "./create-task-button";
import { TasksContext } from "@/contexts/TasksContext";

interface TasksOverviewProps {
  initialTasks: {
    data: Task[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  user: UserJWTPayload;
  fetchTasks: (
    searchParams: any,
    session: UserJWTPayload
  ) => Promise<{
    data: Task[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }>;
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

export function TasksOverview({
  initialTasks,
  user,
  fetchTasks,
}: TasksOverviewProps) {
  const [tasks, setTasks] = useState(initialTasks);
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Function to refresh tasks
  const refreshTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = Object.fromEntries(searchParams.entries());
      const newTasks = await fetchTasks(params, user);
      setTasks(newTasks);
    } catch (error) {
      console.error("Error refreshing tasks:", error);
    } finally {
      setIsLoading(false);
    }
  }, [searchParams, user, fetchTasks]);

  // Listen for URL changes to refresh tasks
  useEffect(() => {
    refreshTasks();
  }, [searchParams, refreshTasks]);

  const handleSearch = useCallback(
    async (params: Record<string, string | null>) => {
      try {
        setIsLoading(true);

        // Create new search params from current state
        const newSearchParams = new URLSearchParams(searchParams);

        // If any filter is changing (not page), reset to page 1
        const isChangingFilters = Object.keys(params).some(
          (key) => key !== "page"
        );
        if (isChangingFilters) {
          newSearchParams.set("page", "1");
        }

        // Update other params
        Object.entries(params).forEach(([key, value]) => {
          if (value) {
            newSearchParams.set(key, value);
          } else {
            newSearchParams.delete(key);
          }
        });

        // Update the URL without forcing a re-render
        router.replace(`${pathname}?${newSearchParams.toString()}`, {
          scroll: false,
        });

        // Fetch tasks with new params
        const newTasks = await fetchTasks(
          Object.fromEntries(newSearchParams.entries()),
          user
        );
        setTasks(newTasks);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [searchParams, router, fetchTasks, user, pathname]
  );

  // Expose refresh function to child components
  const contextValue = useMemo(
    () => ({
      refreshTasks,
      isLoading,
    }),
    [refreshTasks, isLoading]
  );

  const canViewDepartment = user.permissions.includes("view_department_tasks");

  return (
    <TasksContext.Provider value={contextValue}>
      <div className="space-y-4">
        <TaskFilters
          onFilterChange={handleSearch}
          canViewDepartment={canViewDepartment}
          isLoading={isLoading}
          initialFilters={Object.fromEntries(searchParams.entries())}
          user={user}
        />
        {tasks.data.length === 0 ? (
          <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
            <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
              <h3 className="mt-4 text-lg font-semibold">No tasks found</h3>
              <p className="mb-4 mt-2 text-sm text-muted-foreground">
                {user.permissions.includes("approve_tasks")
                  ? "No tasks require your attention at the moment."
                  : "You don't have any tasks yet. Create one to get started!"}
              </p>
              <CreateTaskButton />
            </div>
          </div>
        ) : (
          <TaskList
            tasks={tasks.data}
            currentPage={tasks.page}
            totalPages={tasks.totalPages}
            onPageChange={(page) => handleSearch({ page: page.toString() })}
            isLoading={isLoading}
            user={user}
          />
        )}
      </div>
    </TasksContext.Provider>
  );
}
