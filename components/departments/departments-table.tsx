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

interface DepartmentsTableProps {
  initialDepartments: Department[];
}

// Update the type definition
type SortableField = keyof Pick<Department, "name" | "createdAt" | "updatedAt">;

export function DepartmentsTable({
  initialDepartments,
}: DepartmentsTableProps) {
  const [departments, setDepartments] = useState(initialDepartments);
  const [sorting, setSorting] = useState<SortingState<SortableField>>({
    field: "name",
    direction: "asc",
  });
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(
    null
  );
  const [deletingDepartment, setDeletingDepartment] =
    useState<Department | null>(null);

  const sortedDepartments = [...departments].sort((a, b) => {
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

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => toggleSort("name")}
                  className="hover:bg-transparent"
                >
                  Name
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Updated At</TableHead>
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
                    {new Date(department.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(department.updatedAt).toLocaleDateString()}
                  </TableCell>
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
