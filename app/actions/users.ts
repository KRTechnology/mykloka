"use server";

import {
    InviteUserData,
    inviteUserSchema,
    updateUserSchema,
} from "@/lib/api/users";
import { validatePermission } from "@/lib/auth/auth";
import { db } from "@/lib/db/config";
import { users } from "@/lib/db/schema";
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

export async function updateUserAction(data: any) {
  try {
    const hasPermission = await validatePermission("edit_users");
    if (!hasPermission) {
      throw new Error("Unauthorized");
    }

    const { id, ...updateData } = data;
    const validatedData = updateUserSchema.parse(updateData);

    const updatedUser = await db
      .update(users)
      .set({ ...validatedData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();

    if (!updatedUser[0]) {
      throw new Error("User not found");
    }

    revalidateTag("users");
    return { success: true, data: updatedUser[0] };
  } catch (error) {
    console.error("Error updating user:", error);
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
