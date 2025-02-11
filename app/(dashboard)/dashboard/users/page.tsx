import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { UsersTable } from "@/components/users/users-table";
import { getUsers } from "@/lib/api/users";
import { Plus } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { Suspense } from "react";

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

export default async function UsersPage({ searchParams }: PageProps) {
  try {
    const headersList = await headers();
    const protocol = headersList.get("x-forwarded-proto") || "http";
    const host = headersList.get("host");
    const baseUrl = `${protocol}://${host}`;

    const params = await searchParams;

    const page = params?.page ? parseInt(params.page) : 1;
    const pageSize = params?.per_page ? parseInt(params.per_page) : 10;
    const sortBy = params?.sortBy;
    const sortDirection = params?.sortDirection as "asc" | "desc" | undefined;
    const search = params?.search;

    const { data: users, totalPages } = await getUsers(baseUrl, {
      page,
      pageSize,
      sortBy,
      sortDirection,
      search,
    });

    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <Heading
            title="Users"
            description="Manage your organization's users"
          />
          <Link href="/dashboard/users/add">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </Link>
        </div>
        <Separator />
        <Suspense fallback={<TableSkeleton />}>
          <UsersTable
            initialUsers={users}
            totalPages={totalPages}
            currentPage={page}
          />
        </Suspense>
      </div>
    );
  } catch (error) {
    console.error("Failed to load users:", error);
    return (
      <div className="flex-1 p-8 pt-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">Error</h2>
          <p className="text-gray-600">Failed to load users</p>
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
