import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { type Permission } from "./types";
import type { UserJWTPayload } from "./auth.service";
import { db } from "@/lib/db/config";
import { eq } from "drizzle-orm";
import { users } from "@/lib/db/schema";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function getServerSession(): Promise<UserJWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token");

  if (!token) return null;

  try {
    const verified = await jwtVerify(token.value, JWT_SECRET);
    // Safe to cast here since we control the token creation
    return verified.payload as UserJWTPayload;
  } catch {
    return null;
  }
}

export async function validatePermission(permission: Permission) {
  const session = await getServerSession();
  if (!session) return false;

  return session.permissions.includes(permission);
}

async function getUserDepartment(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      departmentId: true,
    },
  });

  return user;
}

export async function validateDepartmentAccess(departmentId: string) {
  const session = await getServerSession();
  if (!session) return false;

  // Super Admin and HR Manager can access all departments
  if (session.permissions.includes("view_all_departments")) return true;

  // Department managers can only access their department
  return session.departmentId === departmentId;
}

export async function validateUserAccess(targetUserId: string) {
  const session = await getServerSession();
  if (!session) return false;

  // Super Admin and HR Manager can access all users
  if (session.permissions.includes("view_all_departments")) return true;

  // Department managers can access users in their department
  if (session.permissions.includes("view_department_reports")) {
    const user = await getUserDepartment(targetUserId);
    return user?.departmentId === session.departmentId;
  }

  // Users can only access their own data
  return session.sub === targetUserId;
}
