"use client";

import { motion } from "framer-motion";
import { UserInviteForm } from "@/components/users/user-invite-form";

export default function AddUserPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <div className="mb-8">
        <h2 className="text-3xl font-semibold tracking-tight">Invite User</h2>
        <p className="text-muted-foreground">
          Send an invitation to a new user to join the platform.
        </p>
      </div>
      <UserInviteForm />
    </motion.div>
  );
} 