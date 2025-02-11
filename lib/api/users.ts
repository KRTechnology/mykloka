import { z } from "zod";
import { revalidateTag } from "next/cache";

export const inviteUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  roleId: z.string().uuid("Please select a role"),
  departmentId: z.string().optional(),
  managerId: z.string().optional(),
  phoneNumber: z.string().optional(),
});

export type InviteUserData = z.infer<typeof inviteUserSchema>;

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: boolean;
  joinedAt: string;
}

export async function getAllUsers() {
  const res = await fetch("/api/users", {
    next: { tags: ["users"] },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch users");
  }
  return res.json() as Promise<User[]>;
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
