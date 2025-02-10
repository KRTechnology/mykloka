import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginData = z.infer<typeof loginSchema>;

class AuthAPI {
  private async fetchAPI(endpoint: string, options: RequestInit) {
    const response = await fetch(`/api/${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle different types of errors
      if (response.status === 400 && data.details) {
        throw new Error(data.details.map((d: any) => d.message).join(", "));
      }
      throw new Error(data.error || "Something went wrong");
    }

    return data;
  }

  async login(credentials: LoginData) {
    // Validate data before sending
    loginSchema.parse(credentials);

    return this.fetchAPI("auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  async verifyEmail(token: string, password: string) {
    return this.fetchAPI("verify", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    });
  }

  async logout() {
    return this.fetchAPI("auth/logout", {
      method: "POST",
    });
  }
}

// Export a singleton instance
export const authAPI = new AuthAPI();
