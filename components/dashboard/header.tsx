"use client";

import { checkAttendanceStatusAction } from "@/app/actions/attendance";
import { AttendanceDialog } from "@/components/attendance/attendance-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icons } from "@/components/ui/icons";
import { authAPI } from "@/lib/api/auth";
import { UserJWTPayload } from "@/lib/auth/auth.service";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { LoadingSpinner } from "../ui/loading-spinner";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  user: UserJWTPayload & { userId: string };
}

interface AttendanceStatus {
  isClockedIn: boolean;
  isCompleted: boolean;
  attendanceId?: string;
}

export function Header({ user }: HeaderProps) {
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [attendanceId, setAttendanceId] = useState<string>();
  const [showAttendanceDialog, setShowAttendanceDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const router = useRouter();

  const checkStatus = async () => {
    try {
      setIsCheckingStatus(true);
      const result = await checkAttendanceStatusAction(user.userId);

      if (result.success && result.data) {
        const status: AttendanceStatus = {
          isClockedIn: result.data.isClockedIn ?? false,
          isCompleted: result.data.isCompleted ?? false,
          attendanceId: result.data.attendanceId,
        };
        setIsClockedIn(status.isClockedIn);
        setIsCompleted(status.isCompleted);
        setAttendanceId(status.attendanceId);
      } else {
        setIsClockedIn(false);
        setIsCompleted(false);
        setAttendanceId(undefined);
      }
    } catch (error) {
      console.error("Error checking attendance status:", error);
      toast.error("Failed to check attendance status");
      setIsClockedIn(false);
      setIsCompleted(false);
      setAttendanceId(undefined);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  // Check status on mount
  useEffect(() => {
    checkStatus();
  }, [user.userId]);

  const handleClockInOut = () => {
    if (!user.userId) {
      toast.error("User ID not found");
      return;
    }
    if (isCompleted) {
      toast.error("You have already completed your attendance for today");
      return;
    }
    setShowAttendanceDialog(true);
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await authAPI.logout();

      // Clear any client-side state here if needed

      toast.success("Logged out successfully");
      router.push("/login");
      router.refresh();
    } catch (error) {
      toast.error("Failed to logout");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <header className="border-b bg-card">
        <div className="flex items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>

          <div className="flex items-center space-x-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={isCompleted ? "completed" : isClockedIn ? "out" : "in"}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Button
                  variant={
                    isCompleted
                      ? "secondary"
                      : isClockedIn
                        ? "destructive"
                        : "default"
                  }
                  onClick={handleClockInOut}
                  className={
                    isCompleted
                      ? "bg-muted hover:bg-muted/90 cursor-not-allowed"
                      : isClockedIn
                        ? "bg-destructive hover:bg-destructive/90"
                        : "bg-kr-orange hover:bg-kr-orange/90"
                  }
                  disabled={isCheckingStatus || isCompleted}
                >
                  {isCheckingStatus ? (
                    <LoadingSpinner />
                  ) : isCompleted ? (
                    "Attendance Completed"
                  ) : (
                    <>{isClockedIn ? "Clock Out" : "Clock In"}</>
                  )}
                </Button>
              </motion.div>
            </AnimatePresence>

            <button className="p-2 rounded-lg hover:bg-accent relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-kr-orange rounded-full" />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-accent">
                  <User className="h-5 w-5" />
                  <div className="flex items-center gap-2">
                    <span>{`${user.firstName} ${user.lastName}`}</span>
                    <Badge variant="secondary" className="font-normal">
                      {user.role.name}
                    </Badge>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-sm text-muted-foreground">
                  {user.email}
                </DropdownMenuItem>
                <DropdownMenuItem className="text-sm text-muted-foreground">
                  Role: {user.role.name}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? (
                    <>
                      <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                      Logging out...
                    </>
                  ) : (
                    "Logout"
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {user.userId && (
        <AttendanceDialog
          isOpen={showAttendanceDialog}
          onClose={() => {
            setShowAttendanceDialog(false);
            checkStatus();
          }}
          userId={user.userId}
          mode={isClockedIn ? "out" : "in"}
          attendanceId={attendanceId}
        />
      )}
    </>
  );
}
