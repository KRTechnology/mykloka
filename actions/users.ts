"use server";

import {
  InviteUserData,
  inviteUserSchema
} from "@/lib/api/users";
import { getServerSession, validatePermission } from "@/lib/auth/auth";
import { authService } from "@/lib/auth/auth.service";
import { db } from "@/lib/db/config";
import { users } from "@/lib/db/schema";
import { emailService } from "@/lib/email/email.service";
import { userService } from "@/lib/users/user.service";
import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";

export async function inviteUserAction(data: InviteUserData) {
  try {
    // Validate permission
    const hasPermission = await validatePermission("create_users");
    if (!hasPermission) {
      throw new Error("Unauthorized");
    }

    // Validate input
    const validatedData = inviteUserSchema.parse(data);

    // Use the user service to create user
    const user = await userService.createUser(validatedData);

    // Revalidate cache
    revalidateTag("users");

    return { success: true, data: user };
  } catch (error) {
    console.error("Error inviting user:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to invite user",
    };
  }
}

interface UpdateUserData {
  id: string;
  roleId: string;
  departmentId?: string | null;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export async function updateUserAction(data: UpdateUserData) {
  try {
    // Validate permission
    const hasPermission = await validatePermission("edit_users");
    if (!hasPermission) {
      throw new Error("Unauthorized");
    }

    // Create update object using the schema type
    const updateData = {
      ...(data.roleId && { roleId: data.roleId }),
      ...(data.departmentId !== undefined && {
        departmentId: data.departmentId,
      }),
      ...(data.firstName && { firstName: data.firstName }),
      ...(data.lastName && { lastName: data.lastName }),
      ...(data.email && { email: data.email }),
      updatedAt: new Date(),
    };

    // Update user
    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, data.id))
      .returning();

    if (!updatedUser) {
      throw new Error("User not found");
    }

    // Revalidate cache
    revalidateTag("users");

    return { success: true, data: updatedUser };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update user",
    };
  }
}

export async function deleteUserAction(id: string) {
  try {
    const hasPermission = await validatePermission("delete_users");
    if (!hasPermission) {
      throw new Error("Unauthorized");
    }

    const deletedUser = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning();

    if (!deletedUser[0]) {
      throw new Error("User not found");
    }

    revalidateTag("users");

    return { success: true, data: deletedUser[0] };
  } catch (error) {
    console.error("Error deleting user:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete user",
    };
  }
}

export async function resendInvitationAction(userId: string) {
  try {
    const hasPermission = await validatePermission("edit_users");
    if (!hasPermission) {
      throw new Error("Unauthorized");
    }

    // Get user details
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        id: true,
        email: true,
        isActive: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (user.isActive) {
      throw new Error("User is already active");
    }

    // Create new verification token
    const token = await authService.createEmailVerificationToken(
      user.email,
      user.id
    );

    // Generate verification link
    const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/verify?token=${token}`;

    // Send invitation email
    await emailService.sendUserInvitation({
      email: user.email,
      verificationLink,
      companyName: process.env.NEXT_PUBLIC_COMPANY_NAME!,
    });

    return { success: true };
  } catch (error) {
    console.error("Error resending invitation:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to resend invitation",
    };
  }
}

interface DepartmentUser {
  id: string;
  firstName: string;
  lastName: string;
}

type GetDepartmentUsersResponse =
  | { success: true; data: DepartmentUser[] }
  | { success: false; error: string };

export async function getDepartmentUsersAction(
  departmentId?: string
): Promise<GetDepartmentUsersResponse> {
  try {
    const session = await getServerSession();
    if (!session) throw new Error("Unauthorized");

    if (!departmentId) {
      return { success: true, data: [] };
    }

    const departmentUsers = await db.query.users.findMany({
      where: eq(users.departmentId, departmentId),
      columns: {
        id: true,
        firstName: true,
        lastName: true,
      },
    });

    return { success: true, data: departmentUsers };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch users",
    };
  }
}

export async function getUserProfileAction(userId: string) {
  try {
    const session = await getServerSession();
    if (!session) throw new Error("Unauthorized");

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      with: {
        role: {
          columns: {
            id: true,
            name: true,
          },
        },
        department: {
          columns: {
            id: true,
            name: true,
          },
        },
        manager: {
          columns: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        subordinates: {
          columns: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!user) throw new Error("User not found");

    return { success: true, data: user };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch user profile",
    };
  }
}
