import { getServerSession } from "@/lib/auth/auth";
import { taskService } from "@/lib/tasks/task.service";
import { TasksOverview } from "@/components/tasks/tasks-overview";
import { redirect } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { Metadata } from "next";
import { Task } from "@/lib/tasks/types";

interface PageProps {
  searchParams: {
    page?: string;
    pageSize?: string;
    sortBy?: string;
    sortDirection?: string;
    search?: string;
    viewMode?: string;
    status?: string;
  };
}

export const metadata: Metadata = {
  title: "Tasks | Kimberly Ryan",
  description: "Manage your tasks",
};

export default async function TasksPage({ searchParams }: PageProps) {
  noStore(); // Disable page caching

  const session = await getServerSession();
  if (!session) redirect("/auth/login");

  const page = parseInt(searchParams.page || "1");
  const pageSize = parseInt(searchParams.pageSize || "10");
  const sortBy = searchParams.sortBy;
  const sortDirection = searchParams.sortDirection as
    | "asc"
    | "desc"
    | undefined;
  const search = searchParams.search;
  const viewMode = searchParams.viewMode as
    | "all"
    | "my-tasks"
    | "department"
    | undefined;
  const status = searchParams.status as Task["status"] | undefined;

  const tasks = await taskService.getPaginatedTasks({
    page,
    pageSize,
    sortBy,
    sortDirection,
    search,
    userId: session.userId,
    viewMode,
    departmentId: session.departmentId,
    status,
  });

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <TasksOverview initialTasks={tasks} user={session} />
    </div>
  );
}
