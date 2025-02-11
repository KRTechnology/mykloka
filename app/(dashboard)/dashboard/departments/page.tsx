import { Suspense } from "react";
import { DepartmentsTable } from "@/components/departments/departments-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { getAllDepartments } from "@/lib/api/departments";
import { headers } from "next/headers";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

type SearchParams = {
  page?: string;
  per_page?: string;
  sortBy?: string;
  sortDirection?: string;
  search?: string;
};

interface PageProps {
  searchParams: Promise<SearchParams | undefined>;
}

export default async function DepartmentsPage({ searchParams }: PageProps) {
  try {
    const headersList = await headers();
    const protocol = headersList.get("x-forwarded-proto") || "http";
    const host = headersList.get("host");
    const baseUrl = `${protocol}://${host}`;

    const params = await searchParams;

    const page = params?.page ? parseInt(params.page) : 1;
    const pageSize = params?.per_page ? parseInt(params.per_page) : 10;

    const { data: departments, totalPages } = await getAllDepartments(baseUrl, {
      page,
      pageSize,
    });

    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <Heading
            title="Departments"
            description="Manage your organization's departments"
          />
          <Link href="/dashboard/departments/add">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Department
            </Button>
          </Link>
        </div>
        <Separator />
        <Suspense fallback={<TableSkeleton />}>
          <DepartmentsTable
            initialDepartments={departments}
            totalPages={totalPages}
            currentPage={page}
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
