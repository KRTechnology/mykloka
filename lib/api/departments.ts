import { z } from "zod";
import { revalidateTag } from "next/cache";
import { PaginatedResponse, TableState } from "@/types/table";
import { buildQueryString } from "@/lib/utils/query-builder";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const departmentSchema = z.object({
  name: z.string().min(1, "Department name is required"),
  headId: z.string().uuid().optional(),
});

export type DepartmentData = z.infer<typeof departmentSchema>;

export interface Department {
  id: string;
  name: string;
  headId: string | null;
  head: string | null;
  userCount: number;
  createdAt: string;
  updatedAt: string;
}

export async function getAllDepartments(baseUrl?: string) {
  try {
    // For server-side requests
    if (baseUrl) {
      const url = `${baseUrl}/api/departments`;
      const res = await fetch(url, {
        next: { tags: ["departments"] },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch departments");
      }

      const response = await res.json();
      // Return the data array from the paginated response
      return response.data || [];
    }

    // For client-side requests
    const res = await fetch("/api/departments", {
      next: { tags: ["departments"] },
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      throw new Error("Failed to fetch departments");
    }

    const response = await res.json();
    // Return the data array from the paginated response
    return response.data || [];
  } catch (error) {
    console.error("Error fetching departments:", error);
    return []; // Return empty array on error
  }
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

//   revalidateTag("departments");
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

//   revalidateTag("departments");
//   return res.json();
// }

// export async function deleteDepartment(id: string) {
//   const res = await fetch(`${BASE_URL}/api/departments/${id}`, {
//     method: "DELETE",
//   });

//   if (!res.ok) {
//     throw new Error("Failed to delete department");
//   }

//   revalidateTag("departments");
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
