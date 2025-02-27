"use server";

import { validatePermission } from "@/lib/auth/auth";
import { getServerSession } from "@/lib/auth/auth";
import { taskService } from "@/lib/tasks/task.service";
import { createTaskSchema, updateTaskSchema } from "@/lib/tasks/types";
import { revalidateTag } from "next/cache";

export async function createTaskAction(data: FormData) {
  try {
    const session = await getServerSession();
    if (!session) throw new Error("Unauthorized");

    // Parse form data
    const rawData = {
      title: data.get("title") as string,
      description: data.get("description") as string,
      // Assign the task to the creator by default
      assignedToId: session.userId,
      startTime: data.get("startTime")
        ? new Date(data.get("startTime") as string)
        : undefined,
      dueTime: data.get("dueTime")
        ? new Date(data.get("dueTime") as string)
        : undefined,
    };

    const validatedData = createTaskSchema.parse(rawData);

    // Check if user needs approval for tasks
    const requiresApproval = !session.permissions.includes("approve_tasks");

    const task = await taskService.createTask({
      ...validatedData,
      createdById: session.userId,
      requiresApproval,
    });

    revalidateTag("tasks");
    return { success: true, data: task };
  } catch (error) {
    console.error("Error creating task:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create task",
    };
  }
}

export async function updateTaskAction(id: string, data: FormData) {
  try {
    const session = await getServerSession();
    if (!session) throw new Error("Unauthorized");

    const rawData = {
      title: data.get("title"),
      description: data.get("description"),
      assignedToId: data.get("assignedToId"),
      startTime: data.get("startTime")
        ? new Date(data.get("startTime") as string)
        : undefined,
      dueTime: data.get("dueTime")
        ? new Date(data.get("dueTime") as string)
        : undefined,
    };

    const validatedData = updateTaskSchema.parse(rawData);
    const task = await taskService.updateTask(id, validatedData);

    revalidateTag("tasks");
    return { success: true, data: task };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update task",
    };
  }
}

export async function updateTaskStatusAction(
  id: string,
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "APPROVED" | "REJECTED"
) {
  try {
    const session = await getServerSession();
    if (!session) throw new Error("Unauthorized");

    // Check permissions based on status change
    if (["APPROVED", "REJECTED"].includes(status)) {
      const hasPermission = await validatePermission("approve_tasks");
      if (!hasPermission) throw new Error("Unauthorized");
    }

    const task = await taskService.updateTaskStatus(id, status, session.userId);

    revalidateTag("tasks");
    return { success: true, data: task };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update task status",
    };
  }
}

export async function approveTaskCompletionAction(id: string) {
  try {
    const session = await getServerSession();
    if (!session) throw new Error("Unauthorized");

    const hasPermission = await validatePermission("approve_tasks");
    if (!hasPermission) throw new Error("Unauthorized");

    const task = await taskService.approveCompletion(id, session.userId);

    revalidateTag("tasks");
    return { success: true, data: task };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to approve task completion",
    };
  }
}

export async function getTaskAction(id: string) {
  try {
    const session = await getServerSession();
    if (!session) throw new Error("Unauthorized");

    const task = await taskService.getTaskById(id);
    if (!task) throw new Error("Task not found");

    // Check if user has access to this task
    const canView =
      task.createdById === session.userId ||
      task.assignedToId === session.userId ||
      session.permissions.includes("view_all_tasks") ||
      (session.permissions.includes("view_department_tasks") &&
        task.createdBy.departmentId === session.departmentId);

    if (!canView) throw new Error("Unauthorized");

    return { success: true, data: task };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch task",
    };
  }
}
