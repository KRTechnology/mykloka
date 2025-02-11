import { db } from "@/lib/db/config";
import { departments } from "@/lib/db/schema";

async function seedDepartments() {
  // First check if departments already exist
  const existingDepartments = await db.select().from(departments);
  if (existingDepartments.length > 0) {
    console.log("Departments already seeded, skipping...");
    return;
  }

  console.log("Seeding departments...");
  await db
    .insert(departments)
    .values([
      { name: "MANAGEMENT" },
      { name: "PEOPLE SERVICE DEPARTMENT" },
      { name: "TECH AND PRODUCT" },
      { name: "SALES" },
      { name: "OUTSOURCING" },
      { name: "LEARNING AND DEVELOPMENT" },
      { name: "FINANCE" },
      { name: "STRATEGY AND COMMUNICATIONS" },
      { name: "RECRUITMENT" },
    ]);

  console.log("Departments seeded successfully!");
}

// Add error handling and logging
seedDepartments()
  .then(() => {
    console.log("Seed script completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error seeding departments:", error);
    process.exit(1);
  });
