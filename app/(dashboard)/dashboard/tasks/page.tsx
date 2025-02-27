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

  // Fetch tasks based on user role
  let tasks;
  if (session.permissions.includes("view_all_departments")) {
    // For super admin and HR manager
    tasks = await taskService.getTasksByDepartment(session.departmentId!);
  } else if (session.permissions.includes("approve_tasks")) {
    // For department managers
    tasks = await taskService.getPendingApprovals(session.departmentId!);
  } else {
    // For regular employees
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
