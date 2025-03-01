import { db as dbClient } from "@/lib/db/config";
import { departments, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export class DepartmentService {
  constructor(private db: typeof dbClient) {}

  async updateDepartmentHead(departmentId: string, headId: string | null) {
    try {
      // Start a transaction
      return await this.db.transaction(async (tx) => {
        // 1. Update the department head
        const [updatedDepartment] = await tx
          .update(departments)
          .set({
            headId,
            updatedAt: new Date(),
          })
          .where(eq(departments.id, departmentId))
          .returning();

        if (!updatedDepartment) {
          throw new Error("Department not found");
        }

        // 2. Update all users in the department to have the new head as their manager
        await tx
          .update(users)
          .set({
            managerId: headId,
            updatedAt: new Date(),
          })
          .where(eq(users.departmentId, departmentId));

        return updatedDepartment;
      });
    } catch (error) {
      console.error("Error updating department head:", error);
      throw error;
    }
  }

  async getDepartmentHead(departmentId: string) {
    try {
      const department = await this.db.query.departments.findFirst({
        where: eq(departments.id, departmentId),
        columns: {
          headId: true,
        },
      });

      return department?.headId || null;
    } catch (error) {
      console.error("Error getting department head:", error);
      throw error;
    }
  }
}

// Create a singleton instance
export const departmentService = new DepartmentService(dbClient);
