import { TaskDetails } from "@/components/tasks/task-details";
import { BackButton } from "@/components/ui/back-button";
import { getServerSession } from "@/lib/auth/auth";
import { taskService } from "@/lib/tasks/task.service";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import TaskDetailsWrapper from "./task-details-wrapper";

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
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="mb-8">
        <BackButton href="/dashboard/tasks" />
      </div>
      <TaskDetailsWrapper task={task} user={session} />
    </div>
  );
}
