import { AccountSettings } from "@/components/settings/account-settings";
import { DisplaySettings } from "@/components/settings/display-settings";
import { NotificationSettings } from "@/components/settings/notification-settings";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getServerSession } from "@/lib/auth/auth";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
    const session = await getServerSession();

  if (!session) redirect("/login");

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="space-y-0.5">
        <Heading
          title="Settings"
          description="Manage your account settings and preferences."
        />
      </div>
      <Separator />
      <Tabs defaultValue="notifications" className="space-y-4">
        <TabsList>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="display">Display</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>
        <TabsContent value="notifications" className="space-y-4">
          <NotificationSettings user={session} />
        </TabsContent>
        <TabsContent value="display" className="space-y-4">
          <DisplaySettings />
        </TabsContent>
        <TabsContent value="account" className="space-y-4">
          <AccountSettings user={session} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
