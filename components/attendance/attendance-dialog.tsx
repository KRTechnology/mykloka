"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { clockInAction, clockOutAction } from "@/app/actions/attendance";
import { toast } from "sonner";
import { Icons } from "@/components/ui/icons";

interface AttendanceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  mode: "in" | "out";
  attendanceId?: string;
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
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    address: string;
  } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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

        setLocation({ latitude, longitude, address });
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
    const API_KEY = process.env.NEXT_PUBLIC_GEOCODE_API_KEY;
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${API_KEY}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      return data.results[0].formatted;
    } catch (error) {
      console.error("Error getting address:", error);
      return null;
    }
  }

  async function handleSubmit() {
    if (!location || !userId) return;

    setIsPending(true);
    try {
      const result =
        mode === "in"
          ? await clockInAction({
              userId,
              ...location,
            })
          : await clockOutAction({
              attendanceId: attendanceId!,
              ...location,
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
              {currentTime.toLocaleTimeString()}
            </motion.div>
            <p className="mt-2 text-sm text-muted-foreground">
              {currentTime.toLocaleDateString()}
            </p>
          </div>

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
                className="rounded-lg border p-4"
              >
                <div className="flex items-start space-x-2">
                  <Icons.mapPin className="h-4 w-4 text-kr-orange mt-1" />
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
              disabled={isPending || isLoadingLocation || !location}
              className="bg-kr-orange hover:bg-kr-orange/90"
            >
              {isPending ? (
                <LoadingSpinner />
              ) : (
                <>Confirm Clock {mode === "in" ? "In" : "Out"}</>
              )}
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
