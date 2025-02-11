import { z } from "zod";
import { revalidateTag } from "next/cache";
import { PaginatedResponse, TableState } from "@/types/table";
import { buildQueryString } from "@/lib/utils/query-builder";

export const departmentSchema = z.object({
  name: z.string().min(1, "Department name is required"),
  headId: z.string().uuid().optional(),
});

export type DepartmentData = z.infer<typeof departmentSchema>;

export interface Department {
  id: string;
  name: string;
  headId: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function getAllDepartments() {
  const res = await fetch("/api/departments", {
    next: { tags: ["departments"] },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch departments");
  }
  return res.json() as Promise<Department[]>;
}

export async function createDepartment(data: DepartmentData) {
  const res = await fetch("/api/departments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to create department");
  }

  revalidateTag("departments");
  return res.json();
}

export async function updateDepartment(id: string, data: DepartmentData) {
  const res = await fetch(`/api/departments/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to update department");
  }

  revalidateTag("departments");
  return res.json();
}

export async function deleteDepartment(id: string) {
  const res = await fetch(`/api/departments/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Failed to delete department");
  }

  revalidateTag("departments");
  return res.json();
}

export async function getDepartments(
  tableState: TableState<"name" | "createdAt" | "updatedAt">
): Promise<PaginatedResponse<Department>> {
  const queryString = buildQueryString(
    tableState.pagination,
    tableState.sorting,
    tableState.filters
  );

  const res = await fetch(`/api/departments?${queryString}`, {
    next: { tags: ["departments"] },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch departments");
  }

  return res.json();
}
