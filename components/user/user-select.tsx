"use client";

import { getDepartmentUsersAction } from "@/actions/users";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";

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
        const result = await getDepartmentUsersAction(departmentId);
        if (result.success) {
          setUsers(result.data);
        } else {
          console.error(result.error);
          setUsers([]);
        }
      } catch (error) {
        console.error("Failed to load users:", error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, [departmentId]);

  if (loading) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Loading users..." />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select user" />
      </SelectTrigger>
      <SelectContent>
        {users.map((user) => (
          <SelectItem key={user.id} value={user.id}>
            {user.firstName} {user.lastName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
