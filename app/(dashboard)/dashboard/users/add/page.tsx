import { Suspense } from "react";
import { Heading } from "@/components/ui/heading";
import { UserInviteForm } from "@/components/users/user-invite-form";
import { UserInviteFormSkeleton } from "@/components/users/user-invite-form-skeleton";
import { getAllDepartmentsForDropdown } from "@/lib/api/departments";
import { headers } from "next/headers";
import { rolesAPI } from "@/lib/api/roles";

export default async function AddUserPage() {
  const headersList = await headers();
  const protocol = headersList.get("x-forwarded-proto") || "http";
  const host = headersList.get("host");
  const baseUrl = `${protocol}://${host}`;

  // Fetch roles and departments in parallel
  const [roles, { data: departments }] = await Promise.all([
    rolesAPI.getAllRoles(),
    getAllDepartmentsForDropdown(baseUrl),
  ]);

  return (
    <div className="flex-1 p-8 pt-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h2 className="text-3xl font-semibold tracking-tight">Invite User</h2>
          <p className="text-muted-foreground">
            Send an invitation to a new user to join the platform.
          </p>
        </div>
        <Suspense fallback={<UserInviteFormSkeleton />}>
          <UserInviteForm roles={roles} departments={departments} />
        </Suspense>
      </div>
    </div>
  );
}
