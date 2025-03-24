"use client";

import { Button } from "@/components/ui/button";
import { UserJWTPayload } from "@/lib/auth/auth.service";
import { Plus } from "lucide-react";
import { useState } from "react";
import { CreateTaskDialog } from "./create-task-dialog";

interface CreateTaskButtonProps {
  user: UserJWTPayload;
}

export function CreateTaskButton({ user }: CreateTaskButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="bg-kr-orange hover:bg-kr-orange/90"
      >
        <Plus className="mr-2 h-4 w-4" />
        Create Task
      </Button>
      <CreateTaskDialog open={open} onOpenChange={setOpen} user={user} />
    </>
  );
}
