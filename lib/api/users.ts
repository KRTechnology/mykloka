import { z } from "zod";

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

class UsersAPI {
  private async fetchAPI(endpoint: string, options: RequestInit) {
    const response = await fetch(`/api/users/${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    const contentType = response.headers.get("content-type");
    const data = contentType?.includes("application/json")
      ? await response.json()
      : null;

    if (!response.ok) {
      if (response.status === 400 && data?.details) {
        throw new Error(data.details.map((d: any) => d.message).join(", "));
      }
      throw new Error(data?.error || "Something went wrong");
    }

    return data;
  }

  async inviteUser(userData: InviteUserData) {
    inviteUserSchema.parse(userData);

    return this.fetchAPI("", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }
}

export const userAPI = new UsersAPI();
