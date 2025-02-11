import { Suspense } from "react";
import { UsersTable } from "@/components/users/users-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { getUsers } from "@/lib/api/users";
import { headers } from "next/headers";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

interface PageProps {
  searchParams?: {
    page?: string;
    per_page?: string;
  };
}

export default async function UsersPage({ searchParams = {} }: PageProps) {
  try {
    const headersList = await headers();
    const protocol = headersList.get("x-forwarded-proto") || "http";
    const host = headersList.get("host");
    const baseUrl = `${protocol}://${host}`;

    const params = await searchParams;
    const currentPage = Number(params?.page) || 1;
    const pageSize = Number(params?.per_page) || 10;

    const { data: users = [], totalPages = 1 } = await getUsers(baseUrl, {
      page: currentPage,
      pageSize,
    });

    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <Heading
            title="Users"
            description={
              users?.length
                ? "Manage your organization's users"
                : "Get started by inviting your first user"
            }
          />
          <Link href="/dashboard/users/add">
            <Button className="bg-kr-orange hover:bg-kr-orange/90">
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
            currentPage={currentPage}
          />
        </Suspense>
      </div>
    );
  } catch (error) {
    console.error("Error in UsersPage:", error);
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
