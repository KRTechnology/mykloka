import { getServerSession } from "@/lib/auth/auth";
import { getDepartmentsAction } from "@/actions/departments";
import { DepartmentsTable } from "@/components/departments/departments-table";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { Plus } from "lucide-react";
import { unstable_noStore as noStore } from "next/cache";
import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    per_page?: string;
    sortBy?: string;
    sortDirection?: string;
    search?: string;
  }>;
}

export default async function DepartmentsPage({ searchParams }: PageProps) {
  noStore();

  const session = await getServerSession();
  if (!session) redirect("/auth/login");

  // Check permissions
  const canCreateDepartments =
    session.permissions.includes("create_departments");
  const canEditDepartments = session.permissions.includes("edit_departments");

  try {
    const pageParams = await searchParams;
    const page = pageParams?.page ? parseInt(pageParams.page) : 1;
    const pageSize = pageParams?.per_page ? parseInt(pageParams.per_page) : 10;
    const sortBy = pageParams?.sortBy;
    const sortDirection = pageParams?.sortDirection as
      | "asc"
      | "desc"
      | undefined;
    const search = pageParams?.search;

    const result = await getDepartmentsAction({
      page,
      pageSize,
      sortBy,
      sortDirection,
      search,
    });

    if (!result.success) {
      throw new Error(result.error);
    }

    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <Heading
            title="Departments"
            description="Manage your organization's departments"
          />
          {canCreateDepartments && (
            <Link href="/dashboard/departments/add">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Department
              </Button>
            </Link>
          )}
        </div>
        <Separator />
        <Suspense fallback={<TableSkeleton />}>
          <DepartmentsTable
            initialDepartments={result.data}
            totalPages={result.totalPages || 1}
            currentPage={page}
            canEditDepartments={canEditDepartments}
          />
        </Suspense>
      </div>
    );
  } catch (error) {
    console.error("Failed to load departments:", error);
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
