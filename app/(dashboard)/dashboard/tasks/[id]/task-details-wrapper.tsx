"use client";

import { TaskDetails } from "@/components/tasks/task-details";
import { TasksProvider } from "@/contexts/TasksContext";
import { Task } from "@/lib/tasks/types";
import { UserJWTPayload } from "@/lib/auth/types";

interface TaskDetailsWrapperProps {
  task: Task;
  user: UserJWTPayload;
}

export default function TaskDetailsWrapper({
  task,
  user,
}: TaskDetailsWrapperProps) {
  return (
    <TasksProvider>
      <TaskDetails task={task} user={user} />
    </TasksProvider>
  );
}
