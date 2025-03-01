import { getUserProfileAction } from "@/actions/users";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileInfo } from "@/components/profile/profile-info";
import { ProfileTeam } from "@/components/profile/profile-team";
import { Separator } from "@/components/ui/separator";
import { getServerSession } from "@/lib/auth/auth";
import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Profile | Kimberly Ryan",
  description: "View and manage your profile",
};

export default async function ProfilePage() {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }

  const result = await getUserProfileAction(session.userId);
  if (!result.success || !result.data) {
    notFound();
  }

  const user = result.data;

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <ProfileHeader
        user={{
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role ?? null,
          profileImage: user.profileImage,
        }}
      />
      <Separator />
      <div className="grid gap-8 md:grid-cols-2">
        <ProfileInfo
          user={{
            phoneNumber: user.phoneNumber,
            department: user.department,
            role: user.role ?? null,
            createdAt: user.createdAt,
          }}
        />
        <ProfileTeam
          manager={user.manager}
          subordinates={user.subordinates ?? []}
          departmentMembers={user.departmentMembers ?? []}
          department={user.department}
        />
      </div>
    </div>
  );
}
