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
import { Icons } from "@/components/ui/icons";
import { authAPI } from "@/lib/api/auth";
import { UserJWTPayload } from "@/lib/auth/auth.service";
import { Bell, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { AttendanceDialog } from "@/components/attendance/attendance-dialog";

interface HeaderProps {
  user: UserJWTPayload & { userId: string };
}

export function Header({ user }: HeaderProps) {
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [showAttendanceDialog, setShowAttendanceDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  const handleClockInOut = () => {
    if (!user.userId) {
      toast.error("User ID not found");
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
            <Button
              variant={isClockedIn ? "destructive" : "default"}
              onClick={handleClockInOut}
              className="bg-kr-orange hover:bg-kr-orange/90"
            >
              {isClockedIn ? "Clock Out" : "Clock In"}
            </Button>

            <button className="p-2 rounded-lg hover:bg-accent relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-kr-orange rounded-full" />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-accent">
                  <User className="h-5 w-5" />
                  <span>{`${user.firstName} ${user.lastName}`}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-sm text-muted-foreground">
                  {user.email}
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
          onClose={() => setShowAttendanceDialog(false)}
          userId={user.userId}
          mode={isClockedIn ? "out" : "in"}
        />
      )}
    </>
  );
}
