"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Building2,
  ChevronLeft,
  ClipboardList,
  Clock,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    title: "Users",
    icon: Users,
    href: "/dashboard/users",
  },
  {
    title: "Attendance",
    icon: Clock,
    href: "/dashboard/attendance",
  },
  {
    title: "Tasks",
    icon: ClipboardList,
    href: "/dashboard/tasks",
  },
  {
    title: "Departments",
    icon: Building2,
    href: "/dashboard/departments",
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/dashboard/settings",
  },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <motion.div
      className={cn(
        "h-screen bg-card border-r flex flex-col",
        collapsed ? "w-20" : "w-64"
      )}
      animate={{ width: collapsed ? 80 : 256 }}
    >
      <div className="p-4 flex justify-between items-center">
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <img src="/images/kr-logo.png" alt="Logo" className="h-8" />
          </motion.div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-accent"
        >
          <ChevronLeft
            className={cn(
              "h-6 w-6 transition-transform",
              collapsed && "rotate-180"
            )}
          />
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
              collapsed ? "justify-center" : "",
              "hover:bg-accent",
              pathname === item.href && "bg-kr-orange/10 text-kr-orange"
            )}
          >
            <item.icon
              className={cn(
                "transition-all",
                collapsed ? "h-6 w-6" : "h-5 w-5"
              )}
            />
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {item.title}
              </motion.span>
            )}
          </Link>
        ))}
      </nav>
    </motion.div>
  );
}
