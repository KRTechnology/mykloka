"use server";

import { getServerSession } from "@/lib/auth/auth";
import { authService } from "@/lib/auth/auth.service";
import { db } from "@/lib/db/config";
import { users, roles } from "@/lib/db/schema";
import { emailService } from "@/lib/email/email.service";
import { eq } from "drizzle-orm";
// import { authService } from "@/lib/auth/authService";
// import { emailService } from "@/lib/email/emailService";

export type CurrentUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: {
    id: string;
    name: string;
  } | null;
  isActive: boolean;
};

export async function getCurrentUser(): Promise<{
  success: boolean;
  data?: CurrentUser;
  error?: string;
}> {
  try {
    const session = await getServerSession();
    if (!session) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, session.userId),
      columns: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        isActive: true,
      },
      with: {
        role: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    return {
      success: true,
      data: {
        ...user,
        role: user.role || null,
      },
    };
  } catch (error) {
    console.error("Error fetching current user:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch user",
    };
  }
}

export async function requestPasswordResetAction(email: string) {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      // For security, don't reveal if email exists
      return { success: true };
    }

    const token = await authService.createEmailVerificationToken(
      email,
      user.id
    );
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

    await emailService.sendPasswordResetEmail(email, resetLink);

    return { success: true };
  } catch (error) {
    console.error("Error requesting password reset:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to request reset",
    };
  }
}

export async function resetPasswordAction(token: string, password: string) {
  try {
    const userId = await authService.verifyEmailToken(token);
    await authService.setPassword(userId, password);

    return { success: true };
  } catch (error) {
    console.error("Error resetting password:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to reset password",
    };
  }
}
