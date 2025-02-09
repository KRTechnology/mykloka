import { db } from "@/lib/db/config";
import { roles, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { hash } from "argon2";

async function seedSuperAdmin() {
  // First check if any users exist
  const existingUsers = await db.select().from(users);

  if (existingUsers.length > 0) {
    console.log({ existingUsers });
    console.log("Users already exist, skipping super admin creation...");
    return;
  }

  console.log("Creating super admin user...");

  // Get the Super Admin role
  const superAdminRole = await db.query.roles.findFirst({
    where: eq(roles.name, "Super Admin"),
  });

  if (!superAdminRole) {
    throw new Error("Super Admin role not found. Please run seed-roles first.");
  }

  // Create hashed password
  const hashedPassword = await hash("Admin@123");

  // Create super admin user
  await db.insert(users).values({
    email: "super-admin@kimberly-ryan.net",
    firstName: "Super",
    lastName: "Admin",
    passwordHash: hashedPassword,
    roleId: superAdminRole.id,
    isActive: true,
  });

  console.log("Super admin created successfully!");
  console.log("Email: admin@company.com");
  console.log("Password: Admin@123");
  console.log("Please change these credentials after first login!");
}

// Add error handling and logging
seedSuperAdmin()
  .then(() => {
    console.log("Seed script completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error seeding super admin:", error);
    process.exit(1);
  });
