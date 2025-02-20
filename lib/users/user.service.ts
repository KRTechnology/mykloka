import { AuthService } from "@/lib/auth/auth.service";
import { db as dbClient } from "@/lib/db/config";
import { users } from "@/lib/db/schema";
import { emailService } from "@/lib/email/email.service";
import { eq } from "drizzle-orm";

const authService = new AuthService(dbClient);

export class UserService {
  constructor(private db: typeof dbClient) {}

  async createUser(data: {
    email: string;
    firstName: string;
    lastName: string;
    roleId: string;
    departmentId?: string;
    managerId?: string;
    phoneNumber?: string;
  }) {
    const existingUser = await this.db.query.users.findFirst({
      where: eq(users.email, data.email),
    });

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Use transaction to create user and verification token
    const result = await this.db.transaction(async (tx) => {
      // Create user without password
      const [user] = await tx
        .insert(users)
        .values({
          ...data,
          passwordHash: "", // Will be set when user verifies email
          isActive: false,
        })
        .returning();

      // Create verification token within the transaction
      const token = await authService.createEmailVerificationToken(
        data.email,
        user.id,
        tx
      );

      return { user, token };
    });

    // Generate verification link
    const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/verify?token=${result.token}`;

    // Send invitation email
    await emailService.sendUserInvitation({
      email: data.email,
      verificationLink,
      companyName: process.env.NEXT_PUBLIC_COMPANY_NAME!,
    });

    return result.user;
  }

  async verifyAndSetPassword(token: string, password: string) {
    const userId = await authService.verifyEmailToken(token);
    await authService.setPassword(userId, password);

    // Create auth token for automatic login
    const authToken = await authService.createAuthToken(userId);
    return authToken;
  }

  async updateUser(id: string, data: any) {
    const updatedUser = await this.db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();

    if (!updatedUser[0]) {
      throw new Error("User not found");
    }

    return updatedUser[0];
  }
}

// Create a singleton instance
export const userService = new UserService(dbClient);
