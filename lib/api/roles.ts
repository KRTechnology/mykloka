import { z } from "zod";

const roleSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type Role = z.infer<typeof roleSchema>;

class RolesAPI {
  private async fetchAPI(endpoint: string, options?: RequestInit) {
    const response = await fetch(`/api/roles/${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    const contentType = response.headers.get("content-type");
    const data = contentType?.includes("application/json")
      ? await response.json()
      : null;

    if (!response.ok) {
      throw new Error(data?.error || "Something went wrong");
    }

    return data;
  }

  async getAllRoles(): Promise<Role[]> {
    const roles = await this.fetchAPI("");
    try {
      return z.array(roleSchema).parse(roles);
    } catch (error) {
      console.error("Role validation error:", error);
      throw error;
    }
  }
}

export const rolesAPI = new RolesAPI();
