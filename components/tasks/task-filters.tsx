"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Task } from "@/lib/tasks/types";
import { ChevronDown, Search } from "lucide-react";
import { useCallback, useState } from "react";

interface TaskFiltersProps {
  tasks: Task[];
  onFilterChange: (filters: {
    viewMode?: "all" | "my-tasks" | "department";
    status?: Task["status"];
    sortBy?: string;
    sortDirection?: "asc" | "desc";
    search?: string;
  }) => void;
  canViewDepartment: boolean;
  currentFilters: {
    viewMode: string;
    status?: Task["status"];
    sortBy?: string;
    sortDirection?: "asc" | "desc";
    search?: string;
  };
}

export function TaskFilters({
  tasks,
  onFilterChange,
  canViewDepartment,
  currentFilters,
}: TaskFiltersProps) {
  const [searchQuery, setSearchQuery] = useState(currentFilters.search || "");

  const handleSearch = useCallback(
    (value: string) => {
      setSearchQuery(value);
      onFilterChange({ search: value || undefined });
    },
    [onFilterChange]
  );

  const handleSort = useCallback(
    (field: string) => {
      const direction =
        currentFilters.sortBy === field &&
        currentFilters.sortDirection === "asc"
          ? "desc"
          : "asc";
      onFilterChange({ sortBy: field, sortDirection: direction });
    },
    [currentFilters.sortBy, currentFilters.sortDirection, onFilterChange]
  );

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              View
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => onFilterChange({ viewMode: "all" })}
              className={currentFilters.viewMode === "all" ? "bg-accent" : ""}
            >
              All Tasks
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onFilterChange({ viewMode: "my-tasks" })}
              className={
                currentFilters.viewMode === "my-tasks" ? "bg-accent" : ""
              }
            >
              My Tasks
            </DropdownMenuItem>
            {canViewDepartment && (
              <DropdownMenuItem
                onClick={() => onFilterChange({ viewMode: "department" })}
                className={
                  currentFilters.viewMode === "department" ? "bg-accent" : ""
                }
              >
                Department Tasks
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Status
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => onFilterChange({ status: undefined })}
              className={!currentFilters.status ? "bg-accent" : ""}
            >
              All Statuses
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onFilterChange({ status: "PENDING" })}
              className={currentFilters.status === "PENDING" ? "bg-accent" : ""}
            >
              Pending
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onFilterChange({ status: "IN_PROGRESS" })}
              className={
                currentFilters.status === "IN_PROGRESS" ? "bg-accent" : ""
              }
            >
              In Progress
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onFilterChange({ status: "COMPLETED" })}
              className={
                currentFilters.status === "COMPLETED" ? "bg-accent" : ""
              }
            >
              Completed
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onFilterChange({ status: "APPROVED" })}
              className={
                currentFilters.status === "APPROVED" ? "bg-accent" : ""
              }
            >
              Approved
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onFilterChange({ status: "REJECTED" })}
              className={
                currentFilters.status === "REJECTED" ? "bg-accent" : ""
              }
            >
              Rejected
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Sort By
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => handleSort("createdAt")}
              className={
                currentFilters.sortBy === "createdAt" ? "bg-accent" : ""
              }
            >
              Date Created{" "}
              {currentFilters.sortBy === "createdAt" &&
                (currentFilters.sortDirection === "asc" ? "↑" : "↓")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleSort("title")}
              className={currentFilters.sortBy === "title" ? "bg-accent" : ""}
            >
              Title{" "}
              {currentFilters.sortBy === "title" &&
                (currentFilters.sortDirection === "asc" ? "↑" : "↓")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleSort("dueTime")}
              className={currentFilters.sortBy === "dueTime" ? "bg-accent" : ""}
            >
              Due Date{" "}
              {currentFilters.sortBy === "dueTime" &&
                (currentFilters.sortDirection === "asc" ? "↑" : "↓")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
