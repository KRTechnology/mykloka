"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Department } from "@/lib/api/departments";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpDown, MoreHorizontal, Pencil, Trash } from "lucide-react";
import { useState } from "react";
import { DeleteDepartmentDialog } from "./delete-department-dialog";
import { EditDepartmentDialog } from "./edit-department-dialog";
import { type SortingState } from "@/types/table";
import { formatDate } from "@/lib/utils/format";

interface DepartmentsTableProps {
  initialDepartments: Department[];
}

type SortableField = "name" | "createdAt" | "userCount";

export function DepartmentsTable({
  initialDepartments = [],
}: DepartmentsTableProps) {
  const [sorting, setSorting] = useState<SortingState<SortableField>>({
    field: "name",
    direction: "asc",
  });
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(
    null
  );
  const [deletingDepartment, setDeletingDepartment] =
    useState<Department | null>(null);

  const sortedDepartments = [...initialDepartments].sort((a, b) => {
    const aValue = a[sorting.field];
    const bValue = b[sorting.field];

    if (aValue === null || bValue === null) return 0;

    const modifier = sorting.direction === "asc" ? 1 : -1;
    if (typeof aValue === "string") {
      return aValue.localeCompare(bValue as string) * modifier;
    }
    return ((aValue as any) > (bValue as any) ? 1 : -1) * modifier;
  });

  const toggleSort = (column: SortableField) => {
    if (sorting.field === column) {
      setSorting((prev) => ({
        ...prev,
        direction: prev.direction === "asc" ? "desc" : "asc",
      }));
    } else {
      setSorting({
        field: column,
        direction: "asc",
      });
    }
  };

  if (!initialDepartments.length) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Updated At</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell
                colSpan={4}
                className="h-24 text-center text-muted-foreground"
              >
                No departments found.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer"
                onClick={() => toggleSort("name")}
              >
                Name
                <SortIcon field="name" sorting={sorting} />
              </TableHead>
              <TableHead>Department Head</TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => toggleSort("userCount")}
              >
                Members
                <SortIcon field="userCount" sorting={sorting} />
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => toggleSort("createdAt")}
              >
                Created
                <SortIcon field="createdAt" sorting={sorting} />
              </TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence mode="wait">
              {sortedDepartments.map((department) => (
                <motion.tr
                  key={department.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="group"
                >
                  <TableCell className="font-medium">
                    {department.name}
                  </TableCell>
                  <TableCell>
                    {department.head || (
                      <span className="text-muted-foreground">
                        No head assigned
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{department.userCount}</TableCell>
                  <TableCell>{formatDate(department.createdAt)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setEditingDepartment(department)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeletingDepartment(department)}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </motion.tr>
              ))}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>

      <EditDepartmentDialog
        department={editingDepartment}
        onClose={() => setEditingDepartment(null)}
      />
      <DeleteDepartmentDialog
        department={deletingDepartment}
        onClose={() => setDeletingDepartment(null)}
      />
    </>
  );
}

// Helper component for sort icons
function SortIcon({
  field,
  sorting,
}: {
  field: string;
  sorting: SortingState<string>;
}) {
  if (sorting.field !== field) {
    return null;
  }

  return (
    <span className="ml-2 inline-block">
      {sorting.direction === "asc" ? "↑" : "↓"}
    </span>
  );
}
