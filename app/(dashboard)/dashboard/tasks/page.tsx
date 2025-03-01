import { getServerSession } from "@/lib/auth/auth";
import { taskService } from "@/lib/tasks/task.service";
import { TasksOverview } from "@/components/tasks/tasks-overview";
import { redirect } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { Metadata } from "next";
import { Task } from "@/lib/tasks/types";

interface SearchParams {
  page?: string;
  pageSize?: string;
  sortBy?: string;
  sortDirection?: string;
  search?: string;
  viewMode?: string;
  status?: string;
}

export const metadata: Metadata = {
  title: "Tasks | Kimberly Ryan",
  description: "Manage your tasks",
};

// Server action to fetch tasks
async function fetchTasks(searchParams: SearchParams, session: any) {
  "use server";

  return taskService.getPaginatedTasks({
    page: parseInt(searchParams.page || "1"),
    pageSize: parseInt(searchParams.pageSize || "10"),
    sortBy: searchParams.sortBy,
    sortDirection: searchParams.sortDirection as "asc" | "desc" | undefined,
    search: searchParams.search,
    userId: session.userId,
    viewMode: searchParams.viewMode as
      | "all"
      | "my-tasks"
      | "department"
      | undefined,
    departmentId: session.departmentId,
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
      <TasksOverview
        initialTasks={tasks}
        user={session}
        fetchTasks={fetchTasks}
      />
    </div>
  );
}
