import { tasks } from "@/lib/db/schema";
import { type InferSelectModel } from "drizzle-orm";
import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  assignedToId: z.string().uuid(),
  startTime: z.date().optional().nullable(),
  dueTime: z.date().optional().nullable(),
  requiresApproval: z.boolean().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  description: z.string().optional(),
  assignedToId: z.string().uuid().optional(),
  startTime: z.date().optional(),
  dueTime: z.date().optional(),
  status: z
    .enum(["PENDING", "IN_PROGRESS", "COMPLETED", "APPROVED", "REJECTED"])
    .optional(),
});

export type DrizzleTask = InferSelectModel<typeof tasks>;

export type Task = {
  id: string;
  title: string;
  description: string | null;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "APPROVED" | "REJECTED";
  createdAt: Date;
  updatedAt: Date;
  startTime: Date | null;
  dueTime: Date | null;
  completedAt: Date | null;
  requiresApproval: boolean;
  createdById: string;
  assignedToId: string | null;
  approvedById: string | null;
  approvalDate: Date | null;
  completionApprovedById: string | null;
  completionApprovalDate: Date | null;
  // Relations
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
    departmentId: string | null;
  };
  assignedTo: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  approvedBy: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  completionApprovedBy: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
};

export type CreateTaskData = z.infer<typeof createTaskSchema>;
export type UpdateTaskData = z.infer<typeof updateTaskSchema>;

export interface CreateTaskInput extends CreateTaskData {
  createdById: string;
}
