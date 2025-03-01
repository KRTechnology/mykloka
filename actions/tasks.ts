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

    // Get the task first to check department and current status
    const task = await taskService.getTaskById(id);
    if (!task) throw new Error("Task not found");

    // Helper function to check manager approval permissions
    const checkManagerApprovalPermission = async () => {
      const canApproveAll = await validatePermission("approve_tasks");
      const canApproveDepartment = await validatePermission(
        "approve_department_tasks"
      );
      const isTaskInDepartment =
        task.createdBy.departmentId === session.departmentId;
      return canApproveAll || (canApproveDepartment && isTaskInDepartment);
    };

    // Check permissions based on status change and current status
    if (status === "APPROVED") {
      // For final approval of completed tasks
      const hasPermission = await checkManagerApprovalPermission();
      if (!hasPermission) throw new Error("Unauthorized");
      if (task.status !== "COMPLETED")
        throw new Error("Task must be completed before final approval");
    }

    if (status === "IN_PROGRESS") {
      const hasPermission = await checkManagerApprovalPermission();
      if (!hasPermission) throw new Error("Unauthorized");

      // Allow IN_PROGRESS for initial approval, rejected tasks, or when returning from completed
      if (!["PENDING", "COMPLETED", "REJECTED"].includes(task.status)) {
        throw new Error("Cannot move task to in progress from current status");
      }
    }

    if (status === "COMPLETED") {
      // Allow completion by assigned user OR allow managers to reopen approved tasks
      const isManager = await checkManagerApprovalPermission();
      const isAssignedUser = task.assignedToId === session.userId;
      const isReopeningApproved = task.status === "APPROVED" && isManager;

      if (!isAssignedUser && !isReopeningApproved) {
        throw new Error("Only the assigned user can mark as completed");
      }

      // Only allow COMPLETED status from IN_PROGRESS or when reopening from APPROVED
      if (task.status !== "IN_PROGRESS" && !isReopeningApproved) {
        throw new Error("Task must be in progress before completion");
      }
    }

    if (status === "REJECTED") {
      const hasPermission = await checkManagerApprovalPermission();
      if (!hasPermission) throw new Error("Unauthorized");
    }

    const updatedTask = await taskService.updateTaskStatus(
      id,
      status,
      session.userId
    );

    revalidateTag("tasks");
    return { success: true, data: updatedTask };
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
