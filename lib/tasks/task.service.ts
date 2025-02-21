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

    if (status === "APPROVED") {
      updates.approvedById = userId;
      updates.approvalDate = new Date();
    } else if (status === "COMPLETED") {
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
        },
        assignedTo: {
          id: assignedToUsers.id,
          firstName: assignedToUsers.firstName,
          lastName: assignedToUsers.lastName,
        },
      })
      .from(tasks)
      .innerJoin(users, eq(tasks.createdById, users.id))
      .leftJoin(assignedToUsers, eq(tasks.assignedToId, assignedToUsers.id))
      .where(eq(users.departmentId, departmentId))
      .orderBy(desc(tasks.createdAt));

    return departmentTasks;
  }

  async getPendingApprovals(departmentId: string) {
    const assignedToUsers = alias(users, "assignedTo");

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
        },
        assignedTo: {
          id: assignedToUsers.id,
          firstName: assignedToUsers.firstName,
          lastName: assignedToUsers.lastName,
        },
      })
      .from(tasks)
      .innerJoin(users, eq(tasks.createdById, users.id))
      .leftJoin(assignedToUsers, eq(tasks.assignedToId, assignedToUsers.id))
      .where(
        and(
          eq(users.departmentId, departmentId),
          eq(tasks.status, "PENDING"),
          eq(tasks.requiresApproval, true)
        )
      )
      .orderBy(desc(tasks.createdAt));

    return pendingTasks;
  }

  async getUserTasks(userId: string) {
    const assignedToUsers = alias(users, "assignedTo");

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
        },
        assignedTo: {
          id: assignedToUsers.id,
          firstName: assignedToUsers.firstName,
          lastName: assignedToUsers.lastName,
        },
      })
      .from(tasks)
      .innerJoin(users, eq(tasks.createdById, users.id))
      .leftJoin(assignedToUsers, eq(tasks.assignedToId, assignedToUsers.id))
      .where(or(eq(tasks.createdById, userId), eq(tasks.assignedToId, userId)))
      .orderBy(desc(tasks.createdAt));

    return userTasks;
  }
}

// Create a singleton instance
export const taskService = new TaskService(dbClient);
