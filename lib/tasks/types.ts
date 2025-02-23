import { tasks } from "@/lib/db/schema";
import { type InferSelectModel } from "drizzle-orm";
import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  assignedToId: z.string().uuid(),
  startTime: z.date().optional(),
  dueTime: z.date().optional(),
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

export type Task = DrizzleTask & {
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  assignedTo?: {
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
