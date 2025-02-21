import { eq } from "drizzle-orm";
import { SignJWT, jwtVerify, JWTPayload } from "jose";
import { nanoid } from "nanoid";
import { hash, verify } from "argon2";
import { Permission } from "./types";
import { roles, users } from "../db/schema";
import { emailVerificationTokens } from "../db/schema/email-verification";
import { db as dbClient } from "../db/config";
// import {  } from "drizzle-orm";

export interface UserJWTPayload {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: {
    id: string;
    name: string;
  };
  roleId: string;
  roleName: string;
  permissions: Permission[];
  departmentId?: string;
  managerId?: string;
  [key: string]: unknown;
}

export class AuthService {
  constructor(private db: typeof dbClient) {}

  private readonly JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET!
  );

  async createEmailVerificationToken(email: string, userId: string) {
    // Delete any existing tokens for this user
    await this.db
      .delete(emailVerificationTokens)
      .where(eq(emailVerificationTokens.userId, userId));

    const token = nanoid(32);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create new token
    await this.db.insert(emailVerificationTokens).values({
      token,
      userId,
      expiresAt,
    });

    return token;
  }

  async verifyEmailToken(token: string) {
    try {
      const verificationToken = await this.db
        .select()
        .from(emailVerificationTokens)
        .where(eq(emailVerificationTokens.token, token))
        .leftJoin(users, eq(emailVerificationTokens.userId, users.id))
        .limit(1)
        .then((rows) => rows[0]);

      if (!verificationToken) {
        throw new Error("Invalid token");
      }

      if (verificationToken.email_verification_tokens.expiresAt < new Date()) {
        // Delete expired token
        await this.db
          .delete(emailVerificationTokens)
          .where(eq(emailVerificationTokens.token, token));
        throw new Error("Token expired");
      }

      // Delete used token
      await this.db
        .delete(emailVerificationTokens)
        .where(eq(emailVerificationTokens.token, token));

      return verificationToken.email_verification_tokens.userId;
    } catch (error) {
      console.error("Error verifying token:", error);
      throw error;
    }
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
    const user = await this.db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        roleId: true,
        departmentId: true,
        managerId: true,
      },
      with: {
        role: {
          columns: {
            name: true,
            permissions: true,
          },
        },
      },
    });

    if (!user) throw new Error("User not found");
    if (!user.role) throw new Error("User role not found");

    const payload: UserJWTPayload = {
      userId: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: {
        id: user.roleId!,
        name: user.role.name,
      },
      roleId: user.roleId!,
      roleName: user.role.name,
      permissions: user.role.permissions as Permission[],
      departmentId: user.departmentId ?? undefined,
      managerId: user.managerId ?? undefined,
    };

    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(this.JWT_SECRET);

    return token;
  }

  async verifyToken(token: string): Promise<UserJWTPayload> {
    try {
      const verified = await jwtVerify(token, this.JWT_SECRET);
      return verified.payload as UserJWTPayload;
    } catch {
      throw new Error("Invalid token");
    }
  }

  async validateLogin(email: string, password: string) {
    const user = await this.db.query.users.findFirst({
      where: eq(users.email, email),
      columns: {
        id: true,
        passwordHash: true,
        isActive: true,
      },
    });

    if (!user) throw new Error("Invalid credentials");
    if (!user.isActive) throw new Error("Account is not active");

    const isValid = await verify(user.passwordHash, password);
    if (!isValid) throw new Error("Invalid credentials");

    return user.id;
  }
}

export const authService = new AuthService(dbClient);
