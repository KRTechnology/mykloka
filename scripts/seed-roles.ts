// scripts/seed-roles.ts

import { db } from "@/lib/db/config";
import { roles } from "@/lib/db/schema";

async function seedRoles() {
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
      ],
    },
    {
      name: "Manager",
      permissions: ["view_users", "view_reports"],
    },
    {
      name: "User",
      permissions: ["view_reports"],
    },
  ]);
}

seedRoles().catch(console.error);
