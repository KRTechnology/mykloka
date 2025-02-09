// lib/auth/auth.service.ts
// import { DrizzleClient } from "@/db";

import { eq } from "drizzle-orm";
import { SignJWT, jwtVerify } from "jose";
import { nanoid } from "nanoid";
import { hash, verify } from "argon2";
import { Permission } from "./types";
import { roles, users } from "../db/schema";
import { emailVerificationTokens } from "../db/schema/email-verification";
import { db as dbClient } from "../db/config";

export class AuthService {
  constructor(private db: typeof dbClient) {}

  private readonly JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET!
  );

  async createEmailVerificationToken(userId: string) {
    const token = nanoid(32);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await this.db.insert(emailVerificationTokens).values({
      token,
      userId,
      expiresAt,
    });

    return token;
  }

  async verifyEmailToken(token: string) {
    const verificationToken =
      await this.db.query.emailVerificationTokens.findFirst({
        where: eq(emailVerificationTokens.token, token),
      });

    if (!verificationToken) {
      throw new Error("Invalid token");
    }

    if (verificationToken.expiresAt < new Date()) {
      throw new Error("Token expired");
    }

    return verificationToken.userId;
  }

  async setPassword(userId: string, password: string) {
    const hashedPassword = await hash(password);

    await this.db
      .update(users)
      .set({
        passwordHash: hashedPassword,
        isActive: true,
      })
      .where(eq(users.id, userId));
  }

  async getUserPermissions(userId: string): Promise<Permission[]> {
    const user = await this.db.query.users.findFirst({
      where: eq(users.id, userId),
      with: {
        role: true,
      },
    });

    if (!user?.role) return [];
    return user.role.permissions as Permission[];
  }

  async createAuthToken(userId: string) {
    const [user, permissions] = await Promise.all([
      this.db.query.users.findFirst({
        where: eq(users.id, userId),
        columns: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          roleId: true,
        },
        with: {
          role: {
            columns: {
              name: true,
            },
          },
        },
      }),
      this.getUserPermissions(userId),
    ]);

    if (!user) throw new Error("User not found");

    const token = await new SignJWT({
      sub: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roleId: user.roleId,
      roleName: user.role?.name,
      permissions,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("24h")
      .sign(this.JWT_SECRET);

    return token;
  }

  async verifyToken(token: string) {
    try {
      const verified = await jwtVerify(token, this.JWT_SECRET);
      return verified.payload;
    } catch {
      throw new Error("Invalid token");
    }
  }
}
