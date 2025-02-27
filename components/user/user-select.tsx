"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { userService } from "@/lib/users/user.service";
import { toast } from "sonner";

interface User {
  id: string;
  firstName: string;
  lastName: string;
}

interface UserSelectProps {
  value?: string;
  onChange: (value: string) => void;
  departmentId?: string;
}

export function UserSelect({ value, onChange, departmentId }: UserSelectProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUsers() {
      try {
        let departmentUsers;
        if (departmentId) {
          departmentUsers = await userService.getDepartmentUsers(departmentId);
        } else {
          departmentUsers = await userService.getAllUsers();
        }
        setUsers(departmentUsers);
      } catch (error) {
        toast.error("Failed to load users");
        console.error("Error loading users:", error);
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, [departmentId]);

  return (
    <Select value={value} onValueChange={onChange} disabled={loading}>
      <SelectTrigger>
        <SelectValue placeholder="Select a user" />
      </SelectTrigger>
      <SelectContent>
        {users.map((user) => (
          <SelectItem key={user.id} value={user.id}>
            {`${user.firstName} ${user.lastName}`}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
