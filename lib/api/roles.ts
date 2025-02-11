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
    // Remove the trailing slash and handle base URL properly
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "";
    const url = new URL("/api/roles" + endpoint, baseUrl);

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      const data = contentType?.includes("application/json")
        ? await response.json()
        : null;
      throw new Error(data?.error || "Something went wrong");
    }

    return response.json();
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
