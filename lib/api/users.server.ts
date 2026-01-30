"use server";

import { revalidateTag } from "next/cache";
import type { InviteUserData, PaginatedUsers, User } from "./users";

// ============================================================================
// SERVER-SIDE API FUNCTIONS
// ============================================================================

export async function getUsers(
  baseUrl?: string,
  options: {
    page?: number;
    pageSize?: number;
    search?: string;
    sortBy?: string;
    sortDirection?: "asc" | "desc";
  } = {},
): Promise<PaginatedUsers> {
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
        next: {
          tags: ["users"],
          revalidate: 0, // Set to 0 to force revalidation on each request
        },
        cache: "no-store", // Disable HTTP cache
      });

      if (!res.ok) {
        throw new Error("Failed to fetch users");
      }

      return (await res.json()) as PaginatedUsers;
    }

    const res = await fetch("/api/users", {
      next: {
        tags: ["users"],
        revalidate: 0,
      },
      cache: "no-store",
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

export async function inviteUserAction(userData: InviteUserData) {
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

  revalidateTag("users", "default");
  return res.json();
}

export async function updateUserAction(userId: string, data: Partial<User>) {
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

  revalidateTag("users", "default");
  return res.json();
}

export async function deleteUserAction(userId: string) {
  const res = await fetch(`/api/users/${userId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Failed to delete user");
  }

  revalidateTag("users", "default");
  return res.json();
}
