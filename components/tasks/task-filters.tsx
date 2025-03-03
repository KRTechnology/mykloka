"use client";

import { getDepartmentsForFilterAction } from "@/actions/departments";
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
import { useCallback, useEffect, useRef, useState } from "react";

type ViewMode = "all" | "my-tasks" | "department";

interface Department {
  id: string;
  name: string;
}

interface TaskFiltersProps {
  onFilterChange: (filters: Record<string, string | null>) => void;
  canViewDepartment: boolean;
  isLoading?: boolean;
  initialFilters: Record<string, string>;
  user: { permissions: string[] };
}

export function TaskFilters({
  onFilterChange,
  canViewDepartment,
  isLoading,
  initialFilters,
  user,
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
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(
    initialFilters.departmentId || null
  );
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeout = useRef<number | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch departments if user has view_all_tasks permission
  useEffect(() => {
    if (user.permissions.includes("view_all_tasks")) {
      getDepartmentsForFilterAction().then((response) => {
        if (response.success) {
          setDepartments(response.data);
        }
      });
    }
  }, [user.permissions]);

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
      setSortDirection(direction);
      setSortBy(field);
      onFilterChange({ sortBy: field, sortDirection: direction });
    },
    [sortBy, sortDirection, onFilterChange]
  );

  const handleViewModeChange = useCallback(
    (mode: ViewMode) => {
      setViewMode(mode);
      onFilterChange({ viewMode: mode });
    },
    [onFilterChange]
  );

  const handleStatusChange = useCallback(
    (newStatus: Task["status"] | null) => {
      setStatus(newStatus === null ? undefined : newStatus);
      onFilterChange({ status: newStatus });
    },
    [onFilterChange]
  );

  const handleDepartmentChange = useCallback(
    (departmentId: string | null) => {
      setSelectedDepartment(departmentId);
      onFilterChange({ departmentId: departmentId });
    },
    [onFilterChange]
  );

  const resetFilters = useCallback(() => {
    setSearchQuery("");
    setViewMode("all");
    setStatus(undefined);
    setSortBy("createdAt");
    setSortDirection("desc");
    setSelectedDepartment(null);
    onFilterChange({
      search: null,
      viewMode: null,
      status: null,
      sortBy: null,
      sortDirection: null,
      departmentId: null,
    });
  }, [onFilterChange]);

  // Get display names for current filters
  const getViewModeDisplay = () => {
    switch (viewMode) {
      case "all":
        return "All Tasks";
      case "my-tasks":
        return "My Tasks";
      case "department":
        return "Department Tasks";
      default:
        return "View";
    }
  };

  const getStatusDisplay = () => {
    if (!status) return "All Statuses";
    return status.charAt(0) + status.slice(1).toLowerCase().replace("_", " ");
  };

  const getSortDisplay = () => {
    const sortName = {
      createdAt: "Date Created",
      title: "Title",
      dueTime: "Due Date",
    }[sortBy];
    return `${sortName} ${sortDirection === "asc" ? "↑" : "↓"}`;
  };

  const getDepartmentDisplay = () => {
    if (!selectedDepartment) return "All Departments";
    const department = departments.find((d) => d.id === selectedDepartment);
    return department ? department.name : "All Departments";
  };

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
            placeholder="Search tasks by title, description, or assignee..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-8"
            autoComplete="off"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" disabled={isLoading}>
              {getViewModeDisplay()}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {user.permissions.includes("view_all_tasks") && (
              <DropdownMenuItem
                onClick={() => handleViewModeChange("all")}
                className={viewMode === "all" ? "bg-accent" : ""}
              >
                All Tasks
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => handleViewModeChange("my-tasks")}
              className={viewMode === "my-tasks" ? "bg-accent" : ""}
            >
              My Tasks
            </DropdownMenuItem>
            {canViewDepartment && (
              <DropdownMenuItem
                onClick={() => handleViewModeChange("department")}
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
              {getStatusDisplay()}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => handleStatusChange(null)}
              className={!status ? "bg-accent" : ""}
            >
              All Statuses
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleStatusChange("PENDING")}
              className={status === "PENDING" ? "bg-accent" : ""}
            >
              Pending
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleStatusChange("IN_PROGRESS")}
              className={status === "IN_PROGRESS" ? "bg-accent" : ""}
            >
              In Progress
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleStatusChange("COMPLETED")}
              className={status === "COMPLETED" ? "bg-accent" : ""}
            >
              Completed
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleStatusChange("APPROVED")}
              className={status === "APPROVED" ? "bg-accent" : ""}
            >
              Approved
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleStatusChange("REJECTED")}
              className={status === "REJECTED" ? "bg-accent" : ""}
            >
              Rejected
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {user.permissions.includes("view_all_tasks") &&
          departments.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={isLoading}>
                  {getDepartmentDisplay()}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => handleDepartmentChange(null)}
                  className={!selectedDepartment ? "bg-accent" : ""}
                >
                  All Departments
                </DropdownMenuItem>
                {departments.map((dept) => (
                  <DropdownMenuItem
                    key={dept.id}
                    onClick={() => handleDepartmentChange(dept.id)}
                    className={
                      selectedDepartment === dept.id ? "bg-accent" : ""
                    }
                  >
                    {dept.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" disabled={isLoading}>
              {getSortDisplay()}
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
        <Button variant="outline" onClick={resetFilters} disabled={isLoading}>
          Reset Filters
        </Button>
      </div>
    </div>
  );
}
