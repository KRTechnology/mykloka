"use client";

import { createTaskAction } from "@/actions/tasks";
import { getUsersForTaskAssignmentAction } from "@/actions/users";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { UserJWTPayload } from "@/lib/auth/auth.service";
import { createTaskSchema } from "@/lib/tasks/types";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserJWTPayload;
}

// Include assignedToId in the form schema
const formSchema = createTaskSchema.refine(
  (data) => {
    // If both dates are provided, ensure due date is not before start date
    if (data.startTime && data.dueTime) {
      return data.dueTime >= data.startTime;
    }
    // If one or both dates are not provided, validation passes
    return true;
  },
  {
    message: "Due date cannot be before start date",
    path: ["dueTime"],
  }
);
type FormData = z.infer<typeof formSchema>;

interface AssignableUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  departmentId: string | null;
}

export function CreateTaskDialog({
  open,
  onOpenChange,
  user,
}: CreateTaskDialogProps) {
  const router = useRouter();
  const [assignableUsers, setAssignableUsers] = useState<AssignableUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  const canAssignToOthers =
    user.permissions.includes("create_tasks_for_others") ||
    user.permissions.includes("create_tasks_for_department");

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      assignedToId: user.userId, // Default to current user
      startTime: null,
      dueTime: null,
    },
  });

  // Fetch assignable users when dialog opens
  useEffect(() => {
    if (open && canAssignToOthers) {
      fetchAssignableUsers();
    }
  }, [open, canAssignToOthers]);

  async function fetchAssignableUsers() {
    setIsLoadingUsers(true);
    try {
      const result = await getUsersForTaskAssignmentAction();
      if (result.success) {
        setAssignableUsers(result.data || []);
      } else {
        toast.error(result.error || "Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load assignable users");
    } finally {
      setIsLoadingUsers(false);
    }
  }

  async function onSubmit(data: FormData) {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (value instanceof Date) {
            formData.append(key, value.toISOString());
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      const result = await createTaskAction(formData);

      if (result.success) {
        toast.success("Task created successfully");
        form.reset();
        onOpenChange(false);
        router.refresh();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create task"
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Create a new task and assign it to team members.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter task title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter task description"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            {canAssignToOthers && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <FormField
                  control={form.control}
                  name="assignedToId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assign To</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a user" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={user.userId}>
                            Me ({user.firstName} {user.lastName})
                          </SelectItem>
                          {isLoadingUsers ? (
                            <div className="flex items-center justify-center py-2">
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              <span>Loading users...</span>
                            </div>
                          ) : (
                            assignableUsers.map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.firstName} {user.lastName}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
                      <Popover modal={true}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value ?? undefined}
                            onSelect={(date) => {
                              field.onChange(date);

                              // Check if due date needs to be adjusted
                              const dueDate = form.getValues("dueTime");
                              if (dueDate && date && dueDate < date) {
                                // If due date is before the new start date, update it
                                form.setValue("dueTime", date);
                              }
                            }}
                            disabled={(date) =>
                              date <
                                new Date(new Date().setHours(0, 0, 0, 0)) ||
                              date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <FormField
                  control={form.control}
                  name="dueTime"
                  render={({ field }) => {
                    // Watch the start date to update the helper text
                    const startDate = form.watch("startTime");

                    return (
                      <FormItem className="flex flex-col">
                        <FormLabel>Due Date</FormLabel>
                        <Popover modal={true}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value ?? undefined}
                              onSelect={field.onChange}
                              disabled={(date) => {
                                // Get the start date from form
                                const startDate = form.getValues("startTime");

                                // Disable dates before today
                                const isBeforeToday =
                                  date <
                                  new Date(new Date().setHours(0, 0, 0, 0));

                                // Disable dates before start date (if start date is selected)
                                const isBeforeStartDate = startDate
                                  ? date < startDate
                                  : false;

                                return (
                                  isBeforeToday ||
                                  isBeforeStartDate ||
                                  date < new Date("1900-01-01")
                                );
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        {startDate && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Must be on or after start date (
                            {format(startDate, "PP")})
                          </p>
                        )}
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </motion.div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={form.formState.isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-kr-orange hover:bg-kr-orange/90"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2"
                  >
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating Task
                  </motion.div>
                ) : (
                  "Create Task"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
