"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type User } from "@/lib/api/users";
import { formatDate } from "@/lib/utils/format";
import { type SortingState } from "@/types/table";
import { AnimatePresence, motion } from "framer-motion";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { DeleteUserDialog } from "./delete-user-dialog";
import { EditUserDialog } from "./edit-user-dialog";

interface UsersTableProps {
  initialUsers: User[];
  totalPages: number;
  currentPage: number;
}

type SortableField = "firstName" | "email" | "createdAt";

export function UsersTable({
  initialUsers = [],
  totalPages = 1,
  currentPage = 1,
}: UsersTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [users, setUsers] = useState(initialUsers);

  // Update local state when props change
  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  const [sorting, setSorting] = useState<SortingState<SortableField>>({
    field: (searchParams.get("sortBy") as SortableField) || "firstName",
    direction: (searchParams.get("sortDirection") as "asc" | "desc") || "asc",
  });
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  // Update URL and trigger new data fetch when sorting changes
  const handleSort = useCallback(
    (field: SortableField) => {
      const direction =
        sorting.field === field && sorting.direction === "asc" ? "desc" : "asc";

      const params = new URLSearchParams(searchParams);
      params.set("sortBy", field);
      params.set("sortDirection", direction);

      // Reset to first page when sorting changes
      params.set("page", "1");

      router.push(`${pathname}?${params.toString()}`);
      router.refresh(); // This will trigger a new server request

      setSorting({ field, direction });
    },
    [sorting, pathname, searchParams, router]
  );

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  // Generate pagination items
  const paginationItems = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      paginationItems.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => handlePageChange(i)}
            isActive={currentPage === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      paginationItems.push(
        <PaginationItem key={i}>
          <PaginationEllipsis />
        </PaginationItem>
      );
    }
  }

  // Add a refresh function
  const refreshData = useCallback(() => {
    router.refresh();
  }, [router]);

  // Refresh data periodically
  useEffect(() => {
    const interval = setInterval(refreshData, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, [refreshData]);

  if (!initialUsers.length) {
    return (
      <div className="rounded-md border">
        <div className="flex h-24 items-center justify-center">
          <p className="text-muted-foreground">No users found</p>
        </div>
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
                onClick={() => handleSort("firstName")}
              >
                Name
                <SortIcon field="firstName" sorting={sorting} />
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("email")}
              >
                Email
                <SortIcon field="email" sorting={sorting} />
              </TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Status</TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("createdAt")}
              >
                Joined
                <SortIcon field="createdAt" sorting={sorting} />
              </TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence mode="popLayout">
              {users.map((user) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                  className="group"
                >
                  <TableCell className="font-medium">
                    {user.firstName} {user.lastName}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {user.role?.name || "No role"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.department?.name || (
                      <span className="text-muted-foreground">
                        No department
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status ? "default" : "secondary"}>
                      {user.status ? "Active" : "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingUser(user)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeletingUser(user)}
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

      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                />
              </PaginationItem>
              {paginationItems}
              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <EditUserDialog user={editingUser} onClose={() => setEditingUser(null)} />
      <DeleteUserDialog
        user={deletingUser}
        onClose={() => setDeletingUser(null)}
      />
    </>
  );
}

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
