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
import { ChevronDown, Loader2, Search } from "lucide-react";
import { useCallback, useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

type ViewMode = "all" | "my-tasks" | "department";

interface TaskFiltersProps {
  onFilterChange: (filters: Record<string, string | null>) => void;
  canViewDepartment: boolean;
  isLoading?: boolean;
  initialFilters: Record<string, string>;
}

export function TaskFilters({
  onFilterChange,
  canViewDepartment,
  isLoading,
  initialFilters,
}: TaskFiltersProps) {
  const [searchQuery, setSearchQuery] = useState(initialFilters.search || "");
  const [viewMode, setViewMode] = useState<ViewMode>(
    (initialFilters.viewMode as ViewMode) || "all"
  );
  const [status, setStatus] = useState<Task["status"] | undefined>(
    initialFilters.status as Task["status"]
  );
  const [sortBy, setSortBy] = useState(initialFilters.sortBy || "createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(
    (initialFilters.sortDirection as "asc" | "desc") || "desc"
  );
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeout = useRef<number | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = useCallback(
    (value: string) => {
      setSearchQuery(value);

      // Clear existing timeout
      if (searchTimeout.current) {
        window.clearTimeout(searchTimeout.current);
      }

      // Set new timeout to debounce the search
      searchTimeout.current = window.setTimeout(() => {
        onFilterChange({ search: value || null });
      }, 200);
    },
    [onFilterChange]
  );

  const handleSort = useCallback(
    (field: string) => {
      const direction =
        sortBy === field && sortDirection === "asc" ? "desc" : "asc";
      onFilterChange({ sortBy: field, sortDirection: direction });
    },
    [sortBy, sortDirection, onFilterChange]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout.current) {
        window.clearTimeout(searchTimeout.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-8"
            autoComplete="off"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" disabled={isLoading}>
              View
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => onFilterChange({ viewMode: "all" })}
              className={viewMode === "all" ? "bg-accent" : ""}
            >
              All Tasks
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onFilterChange({ viewMode: "my-tasks" })}
              className={viewMode === "my-tasks" ? "bg-accent" : ""}
            >
              My Tasks
            </DropdownMenuItem>
            {canViewDepartment && (
              <DropdownMenuItem
                onClick={() => onFilterChange({ viewMode: "department" })}
                className={viewMode === "department" ? "bg-accent" : ""}
              >
                Department Tasks
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" disabled={isLoading}>
              Status
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => onFilterChange({ status: null })}
              className={!status ? "bg-accent" : ""}
            >
              All Statuses
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onFilterChange({ status: "PENDING" })}
              className={status === "PENDING" ? "bg-accent" : ""}
            >
              Pending
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onFilterChange({ status: "IN_PROGRESS" })}
              className={status === "IN_PROGRESS" ? "bg-accent" : ""}
            >
              In Progress
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onFilterChange({ status: "COMPLETED" })}
              className={status === "COMPLETED" ? "bg-accent" : ""}
            >
              Completed
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onFilterChange({ status: "APPROVED" })}
              className={status === "APPROVED" ? "bg-accent" : ""}
            >
              Approved
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onFilterChange({ status: "REJECTED" })}
              className={status === "REJECTED" ? "bg-accent" : ""}
            >
              Rejected
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" disabled={isLoading}>
              Sort By
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => handleSort("createdAt")}
              className={sortBy === "createdAt" ? "bg-accent" : ""}
            >
              Date Created{" "}
              {sortBy === "createdAt" && (sortDirection === "asc" ? "↑" : "↓")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleSort("title")}
              className={sortBy === "title" ? "bg-accent" : ""}
            >
              Title{" "}
              {sortBy === "title" && (sortDirection === "asc" ? "↑" : "↓")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleSort("dueTime")}
              className={sortBy === "dueTime" ? "bg-accent" : ""}
            >
              Due Date{" "}
              {sortBy === "dueTime" && (sortDirection === "asc" ? "↑" : "↓")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
