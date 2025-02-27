"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Task } from "@/lib/tasks/types";
import { motion } from "framer-motion";
import { Filter } from "lucide-react";
import { useState } from "react";

interface TaskFiltersProps {
  tasks: Task[];
  onFilterChange: (filters: {
    viewMode: "all" | "my-tasks" | "department";
    status?: Task["status"];
  }) => void;
  canViewDepartment: boolean;
}

export function TaskFilters({
  tasks,
  onFilterChange,
  canViewDepartment,
}: TaskFiltersProps) {
  const [viewMode, setViewMode] = useState<"all" | "my-tasks" | "department">(
    "all"
  );
  const [status, setStatus] = useState<Task["status"] | "all">("all");

  const handleViewModeChange = (newMode: typeof viewMode) => {
    setViewMode(newMode);
    onFilterChange({
      viewMode: newMode,
      status: status === "all" ? undefined : status,
    });
  };

  const handleStatusChange = (newStatus: Task["status"] | "all") => {
    setStatus(newStatus);
    onFilterChange({
      viewMode,
      status: newStatus === "all" ? undefined : newStatus,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap gap-4 items-center mb-6"
    >
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">View:</span>
        <Select value={viewMode} onValueChange={handleViewModeChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select view" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tasks</SelectItem>
            <SelectItem value="my-tasks">My Tasks</SelectItem>
            {canViewDepartment && (
              <SelectItem value="department">Department Tasks</SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Status:</span>
        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </motion.div>
  );
}
