import { db as dbClient } from "@/lib/db/config";
import { tasks, users } from "@/lib/db/schema";
import { eq, and, desc, or } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import {
  type Task,
  type CreateTaskData,
  type UpdateTaskData,
  type CreateTaskInput,
} from "./types";

export class TaskService {
  constructor(private db: typeof dbClient) {}

  async createTask(data: CreateTaskInput) {
    const [task] = await this.db
      .insert(tasks)
      .values({
        ...data,
        status: "PENDING",
        requiresApproval: data.requiresApproval ?? true,
      })
      .returning();

    return task;
  }

  async updateTask(id: string, data: UpdateTaskData) {
    const [task] = await this.db
      .update(tasks)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, id))
      .returning();

    return task;
  }

  async updateTaskStatus(id: string, status: Task["status"], userId: string) {
    const updates: Partial<Task> = {
      status,
      updatedAt: new Date(),
    };

    // When moving from PENDING to IN_PROGRESS, record the initial approver
    if (status === "IN_PROGRESS") {
      updates.approvedById = userId;
      updates.approvalDate = new Date();
    }

    // When giving final approval (COMPLETED to APPROVED), record the completion approver
    if (status === "APPROVED") {
      updates.completionApprovedById = userId;
      updates.completionApprovalDate = new Date();
    }

    // When task is completed by assignee
    if (status === "COMPLETED") {
      updates.completedAt = new Date();
    }

    const [task] = await this.db
      .update(tasks)
      .set(updates)
      .where(eq(tasks.id, id))
      .returning();

    return task;
  }

  async approveCompletion(id: string, userId: string) {
    const [task] = await this.db
      .update(tasks)
      .set({
        completionApprovedById: userId,
        completionApprovalDate: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, id))
      .returning();

    return task;
  }

  async getTasksByDepartment(departmentId: string) {
    const assignedToUsers = alias(users, "assignedTo");
    const approvedByUsers = alias(users, "approvedBy");
    const completionApprovedByUsers = alias(users, "completionApprovedBy");

    const departmentTasks = await this.db
      .select({
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
        status: tasks.status,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,
        startTime: tasks.startTime,
        dueTime: tasks.dueTime,
        completedAt: tasks.completedAt,
        requiresApproval: tasks.requiresApproval,
        createdById: tasks.createdById,
        assignedToId: tasks.assignedToId,
        approvedById: tasks.approvedById,
        approvalDate: tasks.approvalDate,
        completionApprovedById: tasks.completionApprovedById,
        completionApprovalDate: tasks.completionApprovalDate,
        createdBy: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          departmentId: users.departmentId,
        },
        assignedTo: {
          id: assignedToUsers.id,
          firstName: assignedToUsers.firstName,
          lastName: assignedToUsers.lastName,
        },
        approvedBy: {
          id: approvedByUsers.id,
          firstName: approvedByUsers.firstName,
          lastName: approvedByUsers.lastName,
        },
        completionApprovedBy: {
          id: completionApprovedByUsers.id,
          firstName: completionApprovedByUsers.firstName,
          lastName: completionApprovedByUsers.lastName,
        },
      })
      .from(tasks)
      .innerJoin(users, eq(tasks.createdById, users.id))
      .leftJoin(assignedToUsers, eq(tasks.assignedToId, assignedToUsers.id))
      .leftJoin(approvedByUsers, eq(tasks.approvedById, approvedByUsers.id))
      .leftJoin(
        completionApprovedByUsers,
        eq(tasks.completionApprovedById, completionApprovedByUsers.id)
      )
      .where(
        or(
          eq(users.departmentId, departmentId),
          eq(assignedToUsers.departmentId, departmentId)
        )
      )
      .orderBy(desc(tasks.createdAt));

    return departmentTasks.map((task) => ({
      ...task,
      assignedTo: task.assignedTo?.id ? task.assignedTo : null,
      approvedBy: task.approvedBy?.id ? task.approvedBy : null,
      completionApprovedBy: task.completionApprovedBy?.id
        ? task.completionApprovedBy
        : null,
    }));
  }

  async getPendingApprovals(departmentId: string) {
    const assignedToUsers = alias(users, "assignedTo");
    const approvedByUsers = alias(users, "approvedBy");
    const completionApprovedByUsers = alias(users, "completionApprovedBy");

    const pendingTasks = await this.db
      .select({
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
        status: tasks.status,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,
        startTime: tasks.startTime,
        dueTime: tasks.dueTime,
        completedAt: tasks.completedAt,
        requiresApproval: tasks.requiresApproval,
        createdById: tasks.createdById,
        assignedToId: tasks.assignedToId,
        approvedById: tasks.approvedById,
        approvalDate: tasks.approvalDate,
        completionApprovedById: tasks.completionApprovedById,
        completionApprovalDate: tasks.completionApprovalDate,
        createdBy: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          departmentId: users.departmentId,
        },
        assignedTo: {
          id: assignedToUsers.id,
          firstName: assignedToUsers.firstName,
          lastName: assignedToUsers.lastName,
        },
        approvedBy: {
          id: approvedByUsers.id,
          firstName: approvedByUsers.firstName,
          lastName: approvedByUsers.lastName,
        },
        completionApprovedBy: {
          id: completionApprovedByUsers.id,
          firstName: completionApprovedByUsers.firstName,
          lastName: completionApprovedByUsers.lastName,
        },
      })
      .from(tasks)
      .innerJoin(users, eq(tasks.createdById, users.id))
      .leftJoin(assignedToUsers, eq(tasks.assignedToId, assignedToUsers.id))
      .leftJoin(approvedByUsers, eq(tasks.approvedById, approvedByUsers.id))
      .leftJoin(
        completionApprovedByUsers,
        eq(tasks.completionApprovedById, completionApprovedByUsers.id)
      )
      .where(
        and(
          eq(users.departmentId, departmentId),
          eq(tasks.status, "PENDING"),
          eq(tasks.requiresApproval, true)
        )
      )
      .orderBy(desc(tasks.createdAt));

    return pendingTasks.map((task) => ({
      ...task,
      assignedTo: task.assignedTo?.id ? task.assignedTo : null,
      approvedBy: task.approvedBy?.id ? task.approvedBy : null,
      completionApprovedBy: task.completionApprovedBy?.id
        ? task.completionApprovedBy
        : null,
    }));
  }

  async getUserTasks(userId: string) {
    const assignedToUsers = alias(users, "assignedTo");
    const approvedByUsers = alias(users, "approvedBy");
    const completionApprovedByUsers = alias(users, "completionApprovedBy");

    const userTasks = await this.db
      .select({
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
        status: tasks.status,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,
        startTime: tasks.startTime,
        dueTime: tasks.dueTime,
        completedAt: tasks.completedAt,
        requiresApproval: tasks.requiresApproval,
        createdById: tasks.createdById,
        assignedToId: tasks.assignedToId,
        approvedById: tasks.approvedById,
        approvalDate: tasks.approvalDate,
        completionApprovedById: tasks.completionApprovedById,
        completionApprovalDate: tasks.completionApprovalDate,
        createdBy: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          departmentId: users.departmentId,
        },
        assignedTo: {
          id: assignedToUsers.id,
          firstName: assignedToUsers.firstName,
          lastName: assignedToUsers.lastName,
        },
        approvedBy: {
          id: approvedByUsers.id,
          firstName: approvedByUsers.firstName,
          lastName: approvedByUsers.lastName,
        },
        completionApprovedBy: {
          id: completionApprovedByUsers.id,
          firstName: completionApprovedByUsers.firstName,
          lastName: completionApprovedByUsers.lastName,
        },
      })
      .from(tasks)
      .innerJoin(users, eq(tasks.createdById, users.id))
      .leftJoin(assignedToUsers, eq(tasks.assignedToId, assignedToUsers.id))
      .leftJoin(approvedByUsers, eq(tasks.approvedById, approvedByUsers.id))
      .leftJoin(
        completionApprovedByUsers,
        eq(tasks.completionApprovedById, completionApprovedByUsers.id)
      )
      .where(or(eq(tasks.createdById, userId), eq(tasks.assignedToId, userId)))
      .orderBy(desc(tasks.createdAt));

    // Transform the results to match our Task type
    return userTasks.map((task) => ({
      ...task,
      assignedTo: task.assignedTo?.id ? task.assignedTo : null,
      approvedBy: task.approvedBy?.id ? task.approvedBy : null,
      completionApprovedBy: task.completionApprovedBy?.id
        ? task.completionApprovedBy
        : null,
    }));
  }

  async getTaskById(id: string): Promise<Task | null> {
    const task = await this.db.query.tasks.findFirst({
      where: eq(tasks.id, id),
      with: {
        createdBy: {
          columns: {
            id: true,
            firstName: true,
            lastName: true,
            departmentId: true,
          },
        },
        assignedTo: {
          columns: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        approvedBy: {
          columns: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        completionApprovedBy: {
          columns: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!task) return null;

    // Transform the data to match our Task type
    return {
      ...task,
      createdBy: {
        id: task.createdBy.id,
        firstName: task.createdBy.firstName,
        lastName: task.createdBy.lastName,
        departmentId: task.createdBy.departmentId,
      },
      assignedTo: task.assignedTo
        ? {
            id: task.assignedTo.id,
            firstName: task.assignedTo.firstName,
            lastName: task.assignedTo.lastName,
          }
        : null,
      approvedBy: task.approvedBy
        ? {
            id: task.approvedBy.id,
            firstName: task.approvedBy.firstName,
            lastName: task.approvedBy.lastName,
          }
        : null,
      completionApprovedBy: task.completionApprovedBy
        ? {
            id: task.completionApprovedBy.id,
            firstName: task.completionApprovedBy.firstName,
            lastName: task.completionApprovedBy.lastName,
          }
        : null,
    };
  }

  async getAllTasks() {
    const assignedToUsers = alias(users, "assignedTo");
    const approvedByUsers = alias(users, "approvedBy");
    const completionApprovedByUsers = alias(users, "completionApprovedBy");

    const allTasks = await this.db
      .select({
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
        status: tasks.status,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,
        startTime: tasks.startTime,
        dueTime: tasks.dueTime,
        completedAt: tasks.completedAt,
        requiresApproval: tasks.requiresApproval,
        createdById: tasks.createdById,
        assignedToId: tasks.assignedToId,
        approvedById: tasks.approvedById,
        approvalDate: tasks.approvalDate,
        completionApprovedById: tasks.completionApprovedById,
        completionApprovalDate: tasks.completionApprovalDate,
        createdBy: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          departmentId: users.departmentId,
        },
        assignedTo: {
          id: assignedToUsers.id,
          firstName: assignedToUsers.firstName,
          lastName: assignedToUsers.lastName,
        },
        approvedBy: {
          id: approvedByUsers.id,
          firstName: approvedByUsers.firstName,
          lastName: approvedByUsers.lastName,
        },
        completionApprovedBy: {
          id: completionApprovedByUsers.id,
          firstName: completionApprovedByUsers.firstName,
          lastName: completionApprovedByUsers.lastName,
        },
      })
      .from(tasks)
      .innerJoin(users, eq(tasks.createdById, users.id))
      .leftJoin(assignedToUsers, eq(tasks.assignedToId, assignedToUsers.id))
      .leftJoin(approvedByUsers, eq(tasks.approvedById, approvedByUsers.id))
      .leftJoin(
        completionApprovedByUsers,
        eq(tasks.completionApprovedById, completionApprovedByUsers.id)
      )
      .orderBy(desc(tasks.createdAt));

    return allTasks.map((task) => ({
      ...task,
      assignedTo: task.assignedTo?.id ? task.assignedTo : null,
      approvedBy: task.approvedBy?.id ? task.approvedBy : null,
      completionApprovedBy: task.completionApprovedBy?.id
        ? task.completionApprovedBy
        : null,
    }));
  }
}

// Create a singleton instance
export const taskService = new TaskService(dbClient);
