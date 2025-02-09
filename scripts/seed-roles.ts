import { db } from "@/lib/db/config";
import { roles } from "@/lib/db/schema";

async function seedRoles() {
  // First check if roles already exist
  const existingRoles = await db.select().from(roles);

  if (existingRoles.length > 0) {
    console.log("Roles already seeded, skipping...");
    return;
  }

  console.log("Seeding roles...");

  await db.insert(roles).values([
    {
      name: "Super Admin",
      permissions: [
        "view_users",
        "create_users",
        "edit_users",
        "delete_users",
        "view_reports",
        "manage_roles",
        "view_all_departments",
        "view_all_tasks",
        "view_all_attendance",
        "approve_tasks",
      ],
    },
    {
      name: "HR Manager",
      permissions: [
        "view_users",
        "create_users",
        "edit_users",
        "delete_users",
        "view_all_departments",
        "view_all_attendance",
        "view_all_tasks",
        "view_reports",
      ],
    },
    {
      name: "Department Manager",
      permissions: [
        "view_users",
        "view_department_reports",
        "view_department_attendance",
        "create_tasks",
        "view_tasks",
        "approve_tasks",
      ],
    },
    {
      name: "Employee",
      permissions: ["view_tasks", "create_tasks", "view_attendance"],
    },
  ]);

  console.log("Roles seeded successfully!");
}

// Add error handling and logging
seedRoles()
  .then(() => {
    console.log("Seed script completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error seeding roles:", error);
    process.exit(1);
  });
