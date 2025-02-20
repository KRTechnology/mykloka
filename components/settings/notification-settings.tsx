"use client";

import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useState } from "react";
import { updateNotificationSettingsAction } from "@/app/actions/settings";
import type { UserJWTPayload } from "@/lib/auth/auth.service";

interface NotificationSettingsProps {
  user: UserJWTPayload;
}

export function NotificationSettings({ user }: NotificationSettingsProps) {
  const [settings, setSettings] = useState({
    emailClockInNotifications: false,
    emailTaskNotifications: false,
    emailDepartmentUpdates: false,
    emailLeaveRequestUpdates: false,
  });

  const handleToggle = async (key: keyof typeof settings) => {
    try {
      const newSettings = { ...settings, [key]: !settings[key] };
      setSettings(newSettings);

      const result = await updateNotificationSettingsAction({
        userId: user.userId,
        settings: newSettings,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      toast.success("Settings updated successfully");
    } catch (error) {
      setSettings(settings); // Revert on error
      toast.error(
        error instanceof Error ? error.message : "Failed to update settings"
      );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>
            Choose how you want to be notified about various events.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="clock-in" className="flex flex-col space-y-1">
              <span>Clock In/Out Notifications</span>
              <span className="text-sm text-muted-foreground">
                Receive email notifications when you clock in or out
              </span>
            </Label>
            <Switch
              id="clock-in"
              checked={settings.emailClockInNotifications}
              onCheckedChange={() => handleToggle("emailClockInNotifications")}
            />
          </div>
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="task-notifications" className="flex flex-col space-y-1">
              <span>Task Notifications</span>
              <span className="text-sm text-muted-foreground">
                Get notified when tasks are created in your department
              </span>
            </Label>
            <Switch
              id="task-notifications"
              checked={settings.emailTaskNotifications}
              onCheckedChange={() => handleToggle("emailTaskNotifications")}
            />
          </div>
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="leave-requests" className="flex flex-col space-y-1">
              <span>Leave Request Updates</span>
              <span className="text-sm text-muted-foreground">
                Get notified when your leave requests are approved or rejected
              </span>
            </Label>
            <Switch
              id="leave-requests"
              checked={settings.emailLeaveRequestUpdates}
              onCheckedChange={() => handleToggle("emailLeaveRequestUpdates")}
            />
          </div>
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="department-updates" className="flex flex-col space-y-1">
              <span>Department Updates</span>
              <span className="text-sm text-muted-foreground">
                Get notified about important updates in your department
              </span>
            </Label>
            <Switch
              id="department-updates"
              checked={settings.emailDepartmentUpdates}
              onCheckedChange={() => handleToggle("emailDepartmentUpdates")}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
