"use client";

import { deleteUserAction } from "@/actions/users";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { type User } from "@/lib/api/users";
import { useTransition } from "react";
import { toast } from "sonner";

interface DeleteUserDialogProps {
  user: User | null;
  onClose: () => void;
}

export function DeleteUserDialog({ user, onClose }: DeleteUserDialogProps) {
  const [isPending, startTransition] = useTransition();

  async function handleDelete() {
    if (!user) return;

    startTransition(async () => {
      const result = await deleteUserAction(user.id);

      if (result.success) {
        toast.success("User deleted successfully");
        onClose();
      } else {
        toast.error(result.error || "Failed to delete user");
      }
    });
  }

  if (!user) return null;

  return (
    <Dialog open={!!user} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete User</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this user? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            This will permanently delete{" "}
            <span className="font-semibold text-foreground">
              {user.firstName} {user.lastName}
            </span>{" "}
            and remove all their data from the system.
          </p>
        </div>
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
