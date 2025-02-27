"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { CreateTaskDialog } from "./create-task-dialog";


export function CreateTaskButton() {
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
      <CreateTaskDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
