"use server";

import { validatePermission } from "@/lib/auth/auth";
import { getServerSession } from "@/lib/auth/auth";
import { taskService } from "@/lib/tasks/task.service";
import { createTaskSchema, updateTaskSchema, Task } from "@/lib/tasks/types";
import { revalidateTag, revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/config";
import { users } from "@/lib/db/schema";

export async function createTaskAction(data: FormData) {
  try {
    const session = await getServerSession();
    if (!session) throw new Error("Unauthorized");

    // Parse form data
    const rawData = {
      title: data.get("title") as string,
      description: data.get("description") as string,
      assignedToId: data.get("assignedToId") as string,
      startTime: data.get("startTime")
        ? new Date(data.get("startTime") as string)
        : undefined,
      dueTime: data.get("dueTime")
        ? new Date(data.get("dueTime") as string)
        : undefined,
    };

    // Validate permissions for assigning tasks to others
    if (rawData.assignedToId && rawData.assignedToId !== session.userId) {
      const canAssignToOthers = session.permissions.includes(
        "create_tasks_for_others"
      );
      const canAssignToDepartment = session.permissions.includes(
        "create_tasks_for_department"
      );

      if (!canAssignToOthers && !canAssignToDepartment) {
        throw new Error("You don't have permission to assign tasks to others");
      }

      // If user can only assign to department members, verify the assignee is in their department
      if (!canAssignToOthers && canAssignToDepartment) {
        // Get the assignee's department
        const assignee = await db.query.users.findFirst({
          where: eq(users.id, rawData.assignedToId),
          columns: {
            departmentId: true,
          },
        });

        if (!assignee || assignee.departmentId !== session.departmentId) {
          throw new Error(
            "You can only assign tasks to members of your department"
          );
        }
      }
    }

    const validatedData = createTaskSchema.parse(rawData);

    // Check if user needs approval for tasks
    const requiresApproval = !session.permissions.includes("approve_tasks");

    const task = await taskService.createTask({
      ...validatedData,
      createdById: session.userId,
      requiresApproval,
    });

    revalidateTag("tasks");
    revalidatePath("/dashboard/tasks");
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
    revalidatePath("/dashboard/tasks");
    return { success: true, data: task };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update task",
    };
  }
}

// Helper function to validate task status transitions
function validateTaskStatusTransition(
  currentStatus: Task["status"],
  newStatus: Task["status"],
  isManager: boolean,
  isAssignee: boolean
): { isValid: boolean; error?: string } {
  // Status transition rules
  const transitions: Record<
    Task["status"],
    {
      allowedStatuses: Task["status"][];
      requiredRole: "manager" | "assignee" | "both";
    }[]
  > = {
    PENDING: [
      { allowedStatuses: ["IN_PROGRESS", "REJECTED"], requiredRole: "manager" },
    ],
    IN_PROGRESS: [{ allowedStatuses: ["COMPLETED"], requiredRole: "assignee" }],
    COMPLETED: [
      { allowedStatuses: ["APPROVED", "IN_PROGRESS"], requiredRole: "manager" },
    ],
    REJECTED: [{ allowedStatuses: ["IN_PROGRESS"], requiredRole: "manager" }],
    APPROVED: [{ allowedStatuses: ["COMPLETED"], requiredRole: "manager" }],
  };

  const allowedTransitions = transitions[currentStatus];
  if (!allowedTransitions) {
    return { isValid: false, error: "Invalid current status" };
  }

  // Find a valid transition rule
  const validTransition = allowedTransitions.find((t) =>
    t.allowedStatuses.includes(newStatus)
  );

  if (!validTransition) {
    return {
      isValid: false,
      error: `Cannot transition from ${currentStatus} to ${newStatus}`,
    };
  }

  // Check if user has the required role for this transition
  const hasRequiredRole =
    validTransition.requiredRole === "both"
      ? isManager && isAssignee
      : validTransition.requiredRole === "manager"
        ? isManager
        : isAssignee;

  if (!hasRequiredRole) {
    return {
      isValid: false,
      error: `Only ${validTransition.requiredRole} can perform this action`,
    };
  }

  return { isValid: true };
}

export async function updateTaskStatusAction(
  id: string,
  newStatus: Task["status"]
) {
  try {
    const session = await getServerSession();
    if (!session) throw new Error("Unauthorized");

    // Get the current task
    const currentTask = await taskService.getTaskById(id);
    if (!currentTask) {
      throw new Error("Task not found");
    }

    // Check basic permissions
    const isManager = session.permissions.includes("approve_tasks");
    const isAssignee = currentTask.assignedToId === session.userId;

    // Check department manager permissions
    const isDepartmentManager =
      session.permissions.includes("view_department_tasks") &&
      session.departmentId === currentTask.createdBy.departmentId;

    // Validate if user can modify this task
    if (!isManager && !isAssignee && !isDepartmentManager) {
      throw new Error("You don't have permission to modify this task");
    }

    // Prevent department managers from approving their own tasks
    // Super admins (with approve_tasks permission) can still approve their own tasks
    if (
      isDepartmentManager &&
      !isManager &&
      isAssignee &&
      (newStatus === "APPROVED" ||
        (currentTask.status === "PENDING" && newStatus === "IN_PROGRESS"))
    ) {
      throw new Error(
        "Department managers cannot approve their own tasks. Please ask another manager to approve this task."
      );
    }

    // Validate status transition
    const { isValid, error } = validateTaskStatusTransition(
      currentTask.status,
      newStatus,
      isManager || isDepartmentManager,
      isAssignee
    );

    if (!isValid) {
      throw new Error(error || "Invalid status transition");
    }

    // Update task status
    const updatedTask = await taskService.updateTaskStatus(
      id,
      newStatus,
      session.userId
    );

    // Revalidate both the tag and the paths
    revalidateTag("tasks");
    revalidatePath("/dashboard/tasks");
    revalidatePath("/api/tasks");

    return { success: true, data: updatedTask };
  } catch (error) {
    console.error("Error updating task status:", error);
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
    revalidatePath("/dashboard/tasks");
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
