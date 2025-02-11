import { z } from "zod";

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

interface GetDepartmentsOptions {
  page?: number;
  pageSize?: number;
}

export async function getAllDepartments(
  baseUrl?: string,
  options: GetDepartmentsOptions = {}
) {
  try {
    const { page = 1, pageSize = 10 } = options;

    if (baseUrl) {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });

      const url = `${baseUrl}/api/departments?${queryParams}`;
      const res = await fetch(url, {
        next: { tags: ["departments"] },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch departments");
      }

      const response = await res.json();
      return {
        data: response.data || [],
        totalPages: response.totalPages || 1,
      };
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
    return {
      data: response.data || [],
      totalPages: response.totalPages || 1,
    };
  } catch (error) {
    console.error("Error fetching departments:", error);
    return { data: [], totalPages: 1 };
  }
}

export async function getAllDepartmentsForDropdown(
  baseUrl?: string
): Promise<{ data: Department[] }> {
  const url = new URL(
    "/api/departments",
    baseUrl || process.env.NEXT_PUBLIC_APP_URL || ""
  );
  url.searchParams.set("dropdown", "true");

  const res = await fetch(url.toString(), {
    next: { tags: ["departments"] },
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
