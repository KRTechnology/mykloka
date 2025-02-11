import { Suspense } from "react";
import { DepartmentsTable } from "@/components/departments/departments-table";
import { CreateDepartmentDialog } from "@/components/departments/create-department-dialog";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { getAllDepartments } from "@/lib/api/departments";
import { headers } from "next/headers";
import { Button } from "@/components/ui/button";
import { TableSkeleton } from "@/components/ui/table-skeleton";

export default async function DepartmentsPage() {
  try {
    const headersList = await headers();
    const protocol = headersList.get("x-forwarded-proto") || "http";
    const host = headersList.get("host");
    const baseUrl = `${protocol}://${host}`;

    const departments = await getAllDepartments(baseUrl);

    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <Heading
            title="Departments"
            description={
              departments.length
                ? "Manage your organization's departments"
                : "Get started by adding your first department"
            }
          />
          <CreateDepartmentDialog />
        </div>
        <Separator />
        <Suspense fallback={<TableSkeleton />}>
          <DepartmentsTable initialDepartments={departments} />
        </Suspense>
      </div>
    );
  } catch (error) {
    console.error("Error in DepartmentsPage:", error);
    return (
      <div className="flex-1 p-8 pt-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">Error</h2>
          <p className="text-gray-600">Failed to load departments</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }
}
