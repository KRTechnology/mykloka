import { TaskEditForm } from "@/components/tasks/task-edit-form";
import { getServerSession } from "@/lib/auth/auth";
import { getTaskAction } from "@/actions/tasks";
import { Metadata } from "next";
import { notFound } from "next/navigation";

interface EditTaskPageProps {
  params: {
    id: string;
  };
}

export const metadata: Metadata = {
  title: "Edit Task | Kimberly Ryan",
  description: "Edit task details",
};

export default async function EditTaskPage({ params }: EditTaskPageProps) {
  const session = await getServerSession();
  if (!session) return null;

  const result = await getTaskAction(params.id);
  if (!result.success || !result.data) {
    notFound();
  }

  const task = result.data;

  // Check if user can edit this task
  const canEdit =
    task.createdById === session.userId ||
    session.permissions.includes("approve_tasks");

  if (!canEdit) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Edit Task</h1>
      <TaskEditForm task={task} user={session} />
    </div>
  );
}
