import { getDepartmentsAction } from "@/actions/departments";
import type { GetDepartmentsOptions as TypeGetDepartmentsOptions } from "@/actions/types/departments";
import { z } from "zod";

export const departmentSchema = z.object({
  name: z.string().min(1, "Department name is required"),
  headId: z.string().uuid().nullish(),
  description: z.string().optional(),
});

export type DepartmentData = z.infer<typeof departmentSchema>;

export interface Department {
  id: string;
  name: string;
  description?: string | null;
  headId: string | null;
  head: string | null;
  userCount: number;
  createdAt: Date;
  updatedAt?: Date;
}

export async function getAllDepartments(
  options: TypeGetDepartmentsOptions = {},
) {
  const result = await getDepartmentsAction(options);
  if (!result.success) {
    return { data: [], totalPages: 1 };
  }

  const departments: Department[] = result.data.map((dept: any) => ({
    id: dept.id,
    name: dept.name,
    headId: dept.headId,
    head: dept.head,
    userCount: dept.userCount || 0,
    createdAt: dept.createdAt,
    updatedAt: dept.updatedAt,
  }));

  return {
    data: departments,
    totalPages: result.totalPages || 1,
  };
}

export async function getAllDepartmentsForDropdown(
  baseUrl?: string,
): Promise<{ data: Department[] }> {
  const url = new URL(
    "/api/departments",
    baseUrl || process.env.NEXT_PUBLIC_APP_URL || "",
  );
  url.searchParams.set("dropdown", "true");

  const res = await fetch(url.toString(), {
    next: { tags: ["departments"], revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch departments");
  }

  return res.json();
}

// export async function createDepartment(data: DepartmentData) {
//   const res = await fetch(`${BASE_URL}/api/departments`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(data),
//   });

//   if (!res.ok) {
//     const error = await res.json();
//     throw new Error(error.error || "Failed to create department");
//   }

//   revalidateTag("departments","default");
//   return res.json();
// }

// export async function updateDepartment(id: string, data: DepartmentData) {
//   const res = await fetch(`${BASE_URL}/api/departments/${id}`, {
//     method: "PATCH",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(data),
//   });

//   if (!res.ok) {
//     throw new Error("Failed to update department");
//   }

//   revalidateTag("departments","default");
//   return res.json();
// }

// export async function deleteDepartment(id: string) {
//   const res = await fetch(`${BASE_URL}/api/departments/${id}`, {
//     method: "DELETE",
//   });

//   if (!res.ok) {
//     throw new Error("Failed to delete department");
//   }

//   revalidateTag("departments","default");
//   return res.json();
// }

// export async function getDepartments(
//   tableState: TableState<"name" | "createdAt" | "updatedAt">
// ): Promise<PaginatedResponse<Department>> {
//   const queryString = buildQueryString(
//     tableState.pagination,
//     tableState.sorting,
//     tableState.filters
//   );

//   const res = await fetch(`${BASE_URL}/api/departments?${queryString}`, {
//     next: { tags: ["departments"] },
//   });

//   if (!res.ok) {
//     throw new Error("Failed to fetch departments");
//   }

//   return res.json();
// }
