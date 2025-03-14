"use client";

import { clockInAction, clockOutAction } from "@/actions/attendance";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Icons } from "@/components/ui/icons";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { cn } from "@/lib/utils";
import { isWithinOfficeRadius } from "@/lib/utils/geo";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

interface AttendanceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  mode: "in" | "out";
  attendanceId?: string;
}

interface LocationState {
  latitude: number;
  longitude: number;
  address: string;
  isWithinRadius: boolean;
}

export function AttendanceDialog({
  isOpen,
  onClose,
  userId,
  mode,
  attendanceId,
}: AttendanceDialogProps) {
  const [isPending, setIsPending] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [location, setLocation] = useState<LocationState | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

  const OFFICE_LAT = Number(process.env.NEXT_PUBLIC_OFFICE_LAT);
  const OFFICE_LONG = Number(process.env.NEXT_PUBLIC_OFFICE_LONG);
  const ACCEPTABLE_DISTANCE = Number(
    process.env.NEXT_PUBLIC_ACCEPTABLE_DISTANCE_AWAY_FROM_THE_OFFICE
  );

  // Check if today is an onsite day (Monday or Friday)
  const isOnsiteDay = useMemo(() => {
    const today = new Date().getDay();
    return today === 1 || today === 5; // 1 is Monday, 5 is Friday
  }, []);

  // Determine if clock in should be disabled
  const shouldDisableClockIn = useMemo(() => {
    if (!location || isLoadingLocation) return true;
    if (isOnsiteDay && !location.isWithinRadius) return true;
    return false;
  }, [location, isLoadingLocation, isOnsiteDay]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format time in WAT
  const formatTimeInWAT = (date: Date) => {
    return date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  // Format date in WAT
  const formatDateInWAT = (date: Date) => {
    return date.toLocaleDateString("en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  useEffect(() => {
    async function getLocation() {
      try {
        const position = await new Promise<GeolocationPosition>(
          (resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          }
        );

        const { latitude, longitude } = position.coords;
        const address = await getAddressFromCoords(latitude, longitude);
        const isWithinRadius = isWithinOfficeRadius(
          latitude,
          longitude,
          OFFICE_LAT,
          OFFICE_LONG,
          ACCEPTABLE_DISTANCE
        );

        setLocation({ latitude, longitude, address, isWithinRadius });
      } catch (error) {
        console.error("Error getting location:", error);
        toast.error("Failed to get location");
      } finally {
        setIsLoadingLocation(false);
      }
    }

    if (isOpen) {
      getLocation();
    }
  }, [isOpen]);

  async function getAddressFromCoords(latitude: number, longitude: number) {
    const API_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;
    const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=${API_KEY}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      // Get the formatted address from the first feature's properties
      const formattedAddress = data.features[0]?.properties?.formatted;
      return formattedAddress || "Address not found";
    } catch (error) {
      console.error("Error getting address:", error);
      return null;
    }
  }

  async function handleSubmit() {
    if (!location || !userId) return;

    setIsPending(true);
    try {
      // Get the current browser time
      const currentBrowserTime = new Date();
      // Set seconds and milliseconds to 0 for cleaner time
      currentBrowserTime.setSeconds(0, 0);

      const result =
        mode === "in"
          ? await clockInAction({
              userId,
              latitude: location.latitude,
              longitude: location.longitude,
              address: location.address,
              isRemote: !location.isWithinRadius,
              clockInTime: currentBrowserTime,
            })
          : await clockOutAction({
              attendanceId: attendanceId!,
              latitude: location.latitude,
              longitude: location.longitude,
              address: location.address,
              isRemote: !location.isWithinRadius,
              clockOutTime: currentBrowserTime,
            });

      if (result.success) {
        toast.success(
          mode === "in" ? "Clocked in successfully" : "Clocked out successfully"
        );
        onClose();
      } else {
        toast.error(result.error || `Failed to clock ${mode}`);
      }
    } catch (error) {
      console.error("Error submitting attendance:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsPending(false);
    }
  }

  const locationAlert = location && (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      {!location.isWithinRadius && (
        <Alert
          className={cn(
            "mb-4 border-kr-yellow/50",
            isOnsiteDay ? "bg-destructive/10" : "bg-kr-yellow/10"
          )}
        >
          <Icons.alertTriangle
            className={cn(
              "h-4 w-4",
              isOnsiteDay ? "text-destructive" : "text-kr-yellow"
            )}
          />
          <AlertDescription className="text-sm ml-2">
            {isOnsiteDay ? (
              <>
                You must be within office premises to clock in on{" "}
                {new Date().toLocaleDateString("en-US", { weekday: "long" })}s.
                Please ensure you are at the office before attempting to clock
                in.
              </>
            ) : (
              "You are currently away from the office. Your attendance will be marked as remote."
            )}
          </AlertDescription>
        </Alert>
      )}
    </motion.div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Clock {mode === "in" ? "In" : "Out"} Confirmation
          </DialogTitle>
        </DialogHeader>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 py-4"
        >
          <div className="text-center">
            <motion.div
              className="text-4xl font-bold text-kr-orange"
              key={currentTime.toISOString()}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
            >
              {formatTimeInWAT(currentTime)}
            </motion.div>
            <p className="mt-2 text-sm text-muted-foreground">
              {formatDateInWAT(currentTime)}
            </p>
          </div>

          <AnimatePresence>{locationAlert}</AnimatePresence>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Location</h4>
            {isLoadingLocation ? (
              <div className="flex items-center justify-center py-4">
                <LoadingSpinner />
              </div>
            ) : location ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={cn(
                  "rounded-lg border p-4",
                  !location.isWithinRadius && "border-kr-yellow/50"
                )}
              >
                <div className="flex items-start space-x-2">
                  <Icons.mapPin
                    className={cn(
                      "h-4 w-4 mt-1",
                      location.isWithinRadius
                        ? "text-kr-orange"
                        : "text-kr-yellow"
                    )}
                  />
                  <p className="text-sm">{location.address}</p>
                </div>
              </motion.div>
            ) : (
              <p className="text-sm text-destructive">Failed to get location</p>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                isPending ||
                isLoadingLocation ||
                !location ||
                shouldDisableClockIn
              }
              className={cn(
                "relative",
                shouldDisableClockIn && isOnsiteDay
                  ? "bg-destructive hover:bg-destructive/90"
                  : "bg-kr-orange hover:bg-kr-orange/90"
              )}
            >
              {isPending ? (
                <LoadingSpinner />
              ) : (
                <>
                  {shouldDisableClockIn && isOnsiteDay ? (
                    <div className="flex items-center space-x-2">
                      <Icons.x className="h-4 w-4" />
                      <span>Must Be Onsite</span>
                    </div>
                  ) : (
                    <>Confirm Clock {mode === "in" ? "In" : "Out"}</>
                  )}
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
