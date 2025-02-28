"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { User } from "lucide-react";

interface ProfileHeaderProps {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: {
      id: string;
      name: string;
    } | null;
    profileImage?: string | null;
  };
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardContent className="flex items-center gap-6 p-6">
          <div className="relative h-24 w-24 rounded-full bg-muted flex items-center justify-center overflow-hidden">
            {user.profileImage ? (
              <img
                src={user.profileImage}
                alt={`${user.firstName} ${user.lastName}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <User className="h-12 w-12 text-muted-foreground" />
            )}
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-muted-foreground">{user.email}</p>
            {user.role && (
              <Badge variant="secondary" className="mt-1">
                {user.role.name}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
