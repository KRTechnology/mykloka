import { db } from "@/lib/db/config";
import { workLocations, users } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

async function seedWorkLocations() {
  // First check if work locations already exist
  const existingLocations = await db.select().from(workLocations);
  if (existingLocations.length > 0) {
    console.log("Work locations already seeded, skipping...");
    return;
  }

  console.log("Seeding work locations...");

  // Insert Lagos office
  const lagosOffice = await db
    .insert(workLocations)
    .values({
      name: "Landmark Center",
      address:
        "Plot 2 & 3, Water Corporation Dr, Victoria Island, Annex 106104, Lagos",
      coordinates: sql`point(3.4453496806934245, 6.423763400177621)`,
      radiusInMeters: 750,
      isActive: true,
    })
    .returning();

  // Insert Abuja office
  const abujaOffice = await db
    .insert(workLocations)
    .values({
      name: "The Bunker",
      address:
        "No 3 Atbara Street, off Cairo Street, Ademola Adetokunbo Crescent, Wuse 2, Abuja",
      coordinates: sql`point(7.480407097138789, 9.077727558108839)`,
      radiusInMeters: 750,
      isActive: true,
    })
    .returning();

  console.log("Work locations seeded successfully!");

  // Update all existing users to be assigned to Lagos office
  console.log("Updating existing users to Lagos office...");
  await db
    .update(users)
    .set({
      workLocationId: lagosOffice[0].id,
      workStructure: "HYBRID", // Default to hybrid work structure
    })
    .where(sql`work_location_id IS NULL`);

  console.log("Users updated successfully!");
}

// Add error handling and logging
seedWorkLocations()
  .then(() => {
    console.log("Seed script completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error seeding work locations:", error);
    process.exit(1);
  });
