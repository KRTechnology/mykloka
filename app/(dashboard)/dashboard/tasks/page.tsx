import { CreateTaskButton } from "@/components/tasks/create-task-button";
import { TasksOverview } from "@/components/tasks/tasks-overview";
import { getServerSession } from "@/lib/auth/auth";
import { taskService } from "@/lib/tasks/task.service";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tasks | Kimberly Ryan",
  description: "Manage your tasks",
};

export default async function TasksPage() {
  const session = await getServerSession();
  if (!session) return null;

  // Fetch tasks based on user role and permissions
  let tasks;
  if (session.permissions.includes("view_all_tasks")) {
    // For super admin and HR manager - show all tasks
    tasks = await taskService.getAllTasks();
  } else if (session.permissions.includes("view_department_tasks")) {
    // For department managers - show department tasks
    tasks = await taskService.getTasksByDepartment(session.departmentId!);
  } else {
    // For regular employees - show only their tasks
    tasks = await taskService.getUserTasks(session.userId);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
        <CreateTaskButton />
      </div>
      <TasksOverview tasks={tasks} user={session} />
    </div>
  );
}
