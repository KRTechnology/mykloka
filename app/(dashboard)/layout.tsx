import { getServerSession } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { DashboardClient } from "./dashboard-client";


export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  return <DashboardClient  user={session}>{children}</DashboardClient>;
}
