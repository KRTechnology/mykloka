"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Building2, Phone } from "lucide-react";

interface ProfileInfoProps {
  user: {
    phoneNumber: string | null;
    department: {
      id: string;
      name: string;
    } | null;
    role: {
      id: string;
      name: string;
    } | null;
    createdAt: Date;
  };
}

export function ProfileInfo({ user }: ProfileInfoProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Your personal and work details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-1">
            <Label className="text-muted-foreground">Department</Label>
            <div className="flex items-center space-x-2">
              <Building2 className="h-4 w-4 text-kr-orange" />
              <span>{user.department?.name || "Not Assigned"}</span>
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-muted-foreground">Phone Number</Label>
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-kr-orange" />
              <span>{user.phoneNumber || "Not provided"}</span>
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-muted-foreground">Role</Label>
            <div className="flex items-center space-x-2">
              <span className="font-medium">
                {user.role?.name || "Not Assigned"}
              </span>
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-muted-foreground">Member Since</Label>
            <div className="flex items-center space-x-2">
              <span>
                {new Date(user.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
