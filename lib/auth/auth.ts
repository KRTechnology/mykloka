// lib/auth/auth.ts
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { type Permission } from "./types";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function getServerSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token");

  if (!token) return null;

  try {
    const verified = await jwtVerify(token.value, JWT_SECRET);
    return verified.payload;
  } catch {
    return null;
  }
}

export async function validatePermission(permission: Permission) {
  const session = await getServerSession();
  if (!session) return false;

  return (session.permissions as Permission[]).includes(permission);
}
