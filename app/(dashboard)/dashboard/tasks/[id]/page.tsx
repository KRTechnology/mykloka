import { getServerSession } from "@/lib/auth/auth";
import { taskService } from "@/lib/tasks/task.service";
import { notFound } from "next/navigation";
// import { TaskDetails } from "@/components/tasks/task-details";
import { Metadata } from "next";
import { TaskDetails } from "@/components/tasks/task-details";

interface TaskPageProps {
  params: Promise<{
    id: string;
  }>;
}

export const metadata: Metadata = {
  title: "Task Details | Kimberly Ryan",
  description: "View task details",
};

export default async function TaskPage({ params }: TaskPageProps) {
  const session = await getServerSession();
  if (!session) return null;

  const { id } = await params;

  const task = await taskService.getTaskById(id);
  if (!task) {
    notFound();
  }

  // Check if user has access to this task
  const canView =
    task.createdById === session.userId ||
    task.assignedToId === session.userId ||
    session.permissions.includes("view_all_tasks") ||
    (session.permissions.includes("view_department_tasks") &&
      task.createdBy.departmentId === session.departmentId);

  if (!canView) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <TaskDetails task={task} user={session} />
    </div>
  );
}
