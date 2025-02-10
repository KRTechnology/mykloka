"use client";

import { motion } from "framer-motion";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { UserJWTPayload } from "@/lib/auth/auth.service";

interface DashboardClientProps {
  children: React.ReactNode;
  user: UserJWTPayload;
}

export function DashboardClient({ children, user }: DashboardClientProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar user={user} />
      <motion.div
        className="flex-1 overflow-auto"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
      >
        <Header user={user} />
        <main className="p-6">{children}</main>
      </motion.div>
    </div>
  );
}
