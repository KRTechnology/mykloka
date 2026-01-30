import { DepartmentForm } from "@/components/departments/department-form";
import { BackButton } from "@/components/ui/back-button";
import { Skeleton } from "@/components/ui/skeleton";
import { getUsers } from "@/lib/api/users.server";
import { headers } from "next/headers";
import { Suspense } from "react";

export default async function AddDepartmentPage() {
  const headersList = await headers();
  const protocol = headersList.get("x-forwarded-proto") || "http";
  const host = headersList.get("host");
  const baseUrl = `${protocol}://${host}`;

  const { data: users } = await getUsers(baseUrl, {
    page: 1,
    pageSize: 100, // Adjust as needed
  });

  // Filter users to only show employees (not managers or admins)
  const eligibleHeads = users.filter((user) => user.role?.name !== "Employee");

  return (
    <div className="flex-1 p-8 pt-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <BackButton href="/dashboard/departments" />
          <h2 className="text-3xl font-semibold tracking-tight mt-4">
            Add Department
          </h2>
          <p className="text-muted-foreground">
            Create a new department and optionally assign a head.
          </p>
        </div>
        <Suspense fallback={<Skeleton className="h-[400px]" />}>
          <DepartmentForm users={eligibleHeads} />
        </Suspense>
      </div>
    </div>
  );
}
