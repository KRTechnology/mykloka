import { db as dbClient } from "@/lib/db/config";
import { departments, users } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

export class DepartmentService {
  constructor(private db: typeof dbClient) {}

  async updateDepartmentHead(departmentId: string, headId: string | null) {
    try {
      // 1. Update the department head first
      const [updatedDepartment] = await this.db
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

      // 2. Then update all users in the department to have the new head as their manager
      // If this fails, at least the department head is updated correctly
      await this.db
        .update(users)
        .set({
          managerId: headId,
          updatedAt: new Date(),
        })
        .where(eq(users.departmentId, departmentId));

      return updatedDepartment;
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

  async getAllDepartments() {
    try {
      const departments = await this.db.query.departments.findMany({
        columns: {
          id: true,
          name: true,
        },
        orderBy: (departments, { asc }) => [asc(departments.name)],
      });

      return departments;
    } catch (error) {
      console.error("Error getting departments:", error);
      throw error;
    }
  }

  // New method to update users' managers for a department
  async updateDepartmentUsersManager(
    departmentId: string,
    managerId: string | null
  ) {
    try {
      await this.db
        .update(users)
        .set({
          managerId,
          updatedAt: new Date(),
        })
        .where(eq(users.departmentId, departmentId));
    } catch (error) {
      console.error("Error updating department users' manager:", error);
      // Log the error but don't throw, as this is a secondary operation
      // This way, if updating users fails, it won't affect the department head update
    }
  }
}

// Create a singleton instance
export const departmentService = new DepartmentService(dbClient);
