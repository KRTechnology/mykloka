import { db as dbClient } from "@/lib/db/config";
import { tasks, users } from "@/lib/db/schema";
import { and, asc, desc, eq, ilike, isNotNull, or, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { type CreateTaskInput, type Task, type UpdateTaskData } from "./types";

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

  async getPaginatedTasks(options: {
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortDirection?: "asc" | "desc";
    search?: string;
    userId?: string;
    viewMode?: "all" | "my-tasks" | "department";
    departmentId?: string;
    status?: Task["status"];
  }) {
    const {
      page = 1,
      pageSize = 10,
      sortBy = "createdAt",
      sortDirection = "desc",
      search,
      userId,
      viewMode = "all",
      departmentId,
      status,
    } = options;

    const assignedToUsers = alias(users, "assignedTo");
    const approvedByUsers = alias(users, "approvedBy");
    const completionApprovedByUsers = alias(users, "completionApprovedBy");

    // Build conditions array
    const conditions = [];

    // Add view mode conditions
    if (viewMode === "my-tasks" && userId) {
      conditions.push(
        or(eq(tasks.createdById, userId), eq(tasks.assignedToId, userId))
      );
    } else if (viewMode === "department" && departmentId) {
      conditions.push(eq(users.departmentId, departmentId));
    }

    // Add department filter for "all" view mode
    if (viewMode === "all" && departmentId) {
      conditions.push(eq(users.departmentId, departmentId));
    }

    // Add status condition
    if (status) {
      conditions.push(eq(tasks.status, status));
    }

    // Add search condition
    if (search) {
      conditions.push(
        or(
          ilike(tasks.title, `%${search}%`),
          ilike(tasks.description || "", `%${search}%`),
          and(
            isNotNull(tasks.assignedToId),
            or(
              ilike(assignedToUsers.firstName, `%${search}%`),
              ilike(assignedToUsers.lastName, `%${search}%`),
              sql<boolean>`concat(${assignedToUsers.firstName}, ' ', ${assignedToUsers.lastName}) ilike ${`%${search}%`}`
            )
          )
        )
      );
    }

    // Build the where clause
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count directly without using a subquery
    const countResult = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(tasks)
      .innerJoin(users, eq(tasks.createdById, users.id))
      .leftJoin(assignedToUsers, eq(tasks.assignedToId, assignedToUsers.id))
      .leftJoin(approvedByUsers, eq(tasks.approvedById, approvedByUsers.id))
      .leftJoin(
        completionApprovedByUsers,
        eq(tasks.completionApprovedById, completionApprovedByUsers.id)
      )
      .where(whereClause);

    const total = Number(countResult[0].count);

    // Get paginated results with sorting
    const sortColumn = sortBy === "title" ? tasks.title : tasks.createdAt;
    const results = await this.db
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
      .where(whereClause)
      .orderBy(sortDirection === "asc" ? asc(sortColumn) : desc(sortColumn))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    // Transform results with type assertion
    type TaskWithRelations = Task & {
      assignedTo: { id: string; firstName: string; lastName: string } | null;
      approvedBy: { id: string; firstName: string; lastName: string } | null;
      completionApprovedBy: {
        id: string;
        firstName: string;
        lastName: string;
      } | null;
    };

    const transformedTasks = results.map((task: any) => ({
      ...task,
      assignedTo: task.assignedTo?.id ? task.assignedTo : null,
      approvedBy: task.approvedBy?.id ? task.approvedBy : null,
      completionApprovedBy: task.completionApprovedBy?.id
        ? task.completionApprovedBy
        : null,
    })) as TaskWithRelations[];

    return {
      data: transformedTasks,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }
}

// Create a singleton instance
export const taskService = new TaskService(dbClient);
