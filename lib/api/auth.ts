import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginData = z.infer<typeof loginSchema>;

const verifyEmailSchema = z.object({
  token: z.string(),
  password: z.string(),
});

type VerifyEmailData = z.infer<typeof verifyEmailSchema>;

class AuthAPI {
  private async fetchAPI(endpoint: string, options: RequestInit) {
    const response = await fetch(`/api/${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    // Only try to parse JSON if we have content
    const contentType = response.headers.get("content-type");
    const data = contentType?.includes("application/json")
      ? await response.json()
      : null;

    if (!response.ok) {
      // Handle different types of errors
      if (response.status === 400 && data?.details) {
        throw new Error(data.details.map((d: any) => d.message).join(", "));
      }
      throw new Error(data?.error || "Something went wrong");
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

  async verifyEmail(data: VerifyEmailData) {
    verifyEmailSchema.parse(data);

    return this.fetchAPI("auth/verify", {
      method: "POST",
      body: JSON.stringify(data),
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
