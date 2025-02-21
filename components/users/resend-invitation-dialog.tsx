"use client";

import { resendInvitationAction } from "@/app/actions/users";
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
import { motion } from "framer-motion";
import { useTransition } from "react";
import { toast } from "sonner";

interface ResendInvitationDialogProps {
  user: User | null;
  onClose: () => void;
}

export function ResendInvitationDialog({
  user,
  onClose,
}: ResendInvitationDialogProps) {
  const [isPending, startTransition] = useTransition();

  async function handleResend() {
    if (!user) return;

    startTransition(async () => {
      const result = await resendInvitationAction(user.id);

      if (result.success) {
        toast.success("Invitation email resent successfully");
        onClose();
      } else {
        toast.error(result.error || "Failed to resend invitation");
      }
    });
  }

  if (!user) return null;

  return (
    <Dialog open={!!user} onOpenChange={onClose}>
      <DialogContent>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
        >
          <DialogHeader>
            <DialogTitle>Resend Invitation</DialogTitle>
            <DialogDescription>
              Are you sure you want to resend the invitation email to this user?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              A new invitation email will be sent to{" "}
              <span className="font-semibold text-foreground">
                {user.firstName} {user.lastName}
              </span>{" "}
              at{" "}
              <span className="font-semibold text-foreground">
                {user.email}
              </span>
              .
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
              variant="default"
              onClick={handleResend}
              disabled={isPending}
              className="min-w-[80px] bg-kr-orange hover:bg-kr-orange/90"
            >
              {isPending ? <LoadingSpinner /> : "Resend"}
            </Button>
          </DialogFooter>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
