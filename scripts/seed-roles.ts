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
        // User Management
        "view_users",
        "create_users",
        "edit_users",
        "delete_users",
        "view_user_profiles",

        // Department Management
        "view_all_departments",
        "create_departments",
        "edit_departments",
        "delete_departments",

        // Attendance Management
        "view_all_attendance",
        "view_own_attendance",
        "create_attendance",
        "view_attendance_reports",

        // Task Management
        "view_all_tasks",
        "create_tasks",
        "edit_tasks",
        "delete_tasks",
        "approve_tasks",
        "create_tasks_for_others",

        // System Management
        "manage_roles",
        "view_system_reports",
        "manage_system_settings",
      ],
    },
    {
      name: "HR Manager",
      permissions: [
        // User Management
        "view_users",
        "create_users",
        "edit_users",
        "delete_users",
        "view_user_profiles",

        // Department Management
        "view_all_departments",
        "create_departments",
        "edit_departments",
        "delete_departments",

        // Attendance Management
        "view_all_attendance",
        "view_own_attendance",
        "create_attendance",
        "view_attendance_reports",

        // Task Management
        "view_all_tasks",
        "create_tasks",
        "edit_tasks",
        "delete_tasks",
        "approve_tasks",
        "create_tasks_for_others",
      ],
    },
    {
      name: "Department Manager",
      permissions: [
        // User Management
        "view_users",
        "view_user_profiles",

        // Department Management
        "view_department",
        "view_department_members",

        // Attendance Management
        "view_department_attendance",
        "create_attendance",
        "view_department_attendance_reports",

        // Task Management
        "view_department_tasks",
        "create_tasks",
        "edit_own_tasks",
        "delete_own_tasks",
        "approve_department_tasks",
        "create_tasks_for_department",
      ],
    },
    {
      name: "Employee",
      permissions: [
        // User Management
        "view_users",
        "view_user_profiles",

        // Attendance Management
        "view_own_attendance",
        "create_attendance",

        // Task Management
        "view_own_tasks",
        "create_tasks",
        "edit_own_tasks",
        "delete_own_tasks",
      ],
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
