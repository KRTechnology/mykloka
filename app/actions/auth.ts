"use server";

import { getServerSession } from "@/lib/auth/auth";
import { db } from "@/lib/db/config";
import { users, roles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

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
