import { TasksOverview } from "@/components/tasks/tasks-overview";
import { getServerSession } from "@/lib/auth/auth";
import { UserJWTPayload } from "@/lib/auth/types";
import { taskService } from "@/lib/tasks/task.service";
import { Task } from "@/lib/tasks/types";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Plus } from "lucide-react";
import { Metadata } from "next";
import { unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation";
import { CreateTaskButton } from "@/components/tasks/create-task-button";

interface SearchParams {
  page?: string;
  pageSize?: string;
  sortBy?: string;
  sortDirection?: string;
  search?: string;
  viewMode?: string;
  status?: string;
  departmentId?: string;
}

export const metadata: Metadata = {
  title: "Tasks | Kimberly Ryan",
  description: "Manage your tasks",
};

// Server action to fetch tasks
async function fetchTasks(searchParams: SearchParams, session: UserJWTPayload) {
  "use server";

  // Determine the view mode based on permissions
  let viewMode = searchParams.viewMode as
    | "all"
    | "my-tasks"
    | "department"
    | undefined;

  // If no view mode is specified, set default based on permissions
  if (!viewMode) {
    if (session.permissions.includes("view_all_tasks")) {
      viewMode = "all";
    } else if (session.permissions.includes("view_department_tasks")) {
      viewMode = "department";
    } else {
      viewMode = "my-tasks"; // Default for regular employees
    }
  }

  // Validate view mode permissions
  if (
    (viewMode === "all" && !session.permissions.includes("view_all_tasks")) ||
    (viewMode === "department" &&
      !session.permissions.includes("view_department_tasks"))
  ) {
    viewMode = "my-tasks"; // Fallback to my-tasks if user doesn't have permission
  }

  // Use the selected departmentId from filters if user has view_all_tasks permission
  // Otherwise, use the user's own departmentId for department view
  const departmentId = session.permissions.includes("view_all_tasks")
    ? searchParams.departmentId
    : viewMode === "department"
      ? session.departmentId
      : undefined;

  return taskService.getPaginatedTasks({
    page: parseInt(searchParams.page || "1"),
    pageSize: parseInt(searchParams.pageSize || "10"),
    sortBy: searchParams.sortBy,
    sortDirection: searchParams.sortDirection as "asc" | "desc" | undefined,
    search: searchParams.search,
    userId: session.userId,
    viewMode,
    departmentId,
    status: searchParams.status as Task["status"] | undefined,
  });
}

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  noStore(); // Disable page caching

  const session = await getServerSession();
  if (!session) redirect("/auth/login");

  const params = await searchParams;
  const tasks = await fetchTasks(params, session);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <Heading title="Tasks" description="Manage your organization's tasks" />
        <CreateTaskButton />
      </div>
      <Separator />

      <TasksOverview
        initialTasks={tasks}
        user={session}
        fetchTasks={fetchTasks}
      />
    </div>
  );
}
