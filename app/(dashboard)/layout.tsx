import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { getServerSession } from "@/lib/auth/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  return <DashboardClient user={session}>{children}</DashboardClient>;
}
