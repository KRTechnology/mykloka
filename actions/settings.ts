"use server";

import { db } from "@/lib/db/config";
import { users } from "@/lib/db/schema";
import { userSettings } from "@/lib/db/schema/user-settings";
import { hash, verify } from "argon2";
import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";

interface NotificationSettings {
  emailClockInNotifications: boolean;
  emailTaskNotifications: boolean;
  emailDepartmentUpdates: boolean;
  emailLeaveRequestUpdates: boolean;
}

interface AccountSettings {
  currentPassword?: string;
  newPassword?: string;
}

export async function updateNotificationSettingsAction({
  userId,
  settings,
}: {
  userId: string;
  settings: NotificationSettings;
}) {
  try {
    const [updatedSettings] = await db
      .insert(userSettings)
      .values({
        userId,
        ...settings,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: userSettings.userId,
        set: {
          ...settings,
          updatedAt: new Date(),
        },
      })
      .returning();

    revalidateTag("user-settings", "default");
    return { success: true, data: updatedSettings };
  } catch (error) {
    console.error("Error updating notification settings:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update settings",
    };
  }
}

export async function updateAccountSettingsAction({
  userId,
  ...settings
}: {
  userId: string;
} & AccountSettings) {
  try {
    if (settings.currentPassword && settings.newPassword) {
      // Verify current password and update to new password
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
        columns: { passwordHash: true },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const isValid = await verify(user.passwordHash, settings.currentPassword);
      if (!isValid) {
        throw new Error("Current password is incorrect");
      }

      const newPasswordHash = await hash(settings.newPassword);
      await db
        .update(users)
        .set({ passwordHash: newPasswordHash })
        .where(eq(users.id, userId));
    }

    revalidateTag("user-settings", "default");
    return { success: true };
  } catch (error) {
    console.error("Error updating account settings:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update settings",
    };
  }
}
