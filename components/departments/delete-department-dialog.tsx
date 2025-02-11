"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { type Department } from "@/lib/api/departments";
import { deleteDepartmentAction } from "@/app/actions/departments";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface DeleteDepartmentDialogProps {
  department: Department | null;
  onClose: () => void;
}

export function DeleteDepartmentDialog({
  department,
  onClose,
}: DeleteDepartmentDialogProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function handleDelete() {
    if (!department) return;

    startTransition(async () => {
      const result = await deleteDepartmentAction(department.id);

      if (result.success) {
        toast.success("Department deleted successfully");
        router.refresh();
        onClose();
      } else {
        toast.error(result.error || "Failed to delete department");
      }
    });
  }

  return (
    <Dialog open={!!department} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Department</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this department? This action cannot
            be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
            className="min-w-[80px]"
          >
            {isPending ? <LoadingSpinner /> : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
