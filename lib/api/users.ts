import { z } from "zod";
import { revalidateTag } from "next/cache";

export const inviteUserSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  roleId: z.string().uuid(),
  departmentId: z.string().uuid().optional(),
  managerId: z.string().uuid().optional(),
  phoneNumber: z.string().optional(),
});

export type InviteUserData = z.infer<typeof inviteUserSchema>;

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: boolean;
  role: {
    id: string;
    name: string;
  } | null;
  department: {
    id: string;
    name: string;
  } | null;
  createdAt: string;
}

export interface PaginatedUsers {
  data: User[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getUsers(
  baseUrl?: string,
  options: {
    page?: number;
    pageSize?: number;
    search?: string;
    sortBy?: string;
    sortDirection?: "asc" | "desc";
  } = {}
) {
  try {
    const { page = 1, pageSize = 10, search, sortBy, sortDirection } = options;

    if (baseUrl) {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...(search && { search }),
        ...(sortBy && { sortBy }),
        ...(sortDirection && { sortDirection }),
      });

      const url = `${baseUrl}/api/users?${queryParams}`;
      const res = await fetch(url, {
        next: { tags: ["users"] },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch users");
      }

      return (await res.json()) as PaginatedUsers;
    }

    const res = await fetch("/api/users", {
      next: { tags: ["users"] },
    });

    if (!res.ok) {
      throw new Error("Failed to fetch users");
    }

    return (await res.json()) as PaginatedUsers;
  } catch (error) {
    console.error("Error fetching users:", error);
    return {
      data: [],
      total: 0,
      page: 1,
      pageSize: 10,
      totalPages: 0,
    };
  }
}

export async function inviteUser(userData: InviteUserData) {
  const res = await fetch("/api/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  if (!res.ok) {
    const data = await res.json();
    if (res.status === 400 && data?.details) {
      throw new Error(data.details.map((d: any) => d.message).join(", "));
    }
    throw new Error(data?.error || "Failed to invite user");
  }

  revalidateTag("users");
  return res.json();
}

export async function updateUser(userId: string, data: Partial<User>) {
  const res = await fetch(`/api/users/${userId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to update user");
  }

  revalidateTag("users");
  return res.json();
}

export async function deleteUser(userId: string) {
  const res = await fetch(`/api/users/${userId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Failed to delete user");
  }

  revalidateTag("users");
  return res.json();
}
