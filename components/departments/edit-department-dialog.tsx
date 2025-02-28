"use client";

import {
  getManagersForDepartmentAction,
  updateDepartmentAction,
} from "@/actions/departments";
import { Button } from "@/components/ui/button";
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
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { type Department } from "@/lib/api/departments";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const formSchema = z.object({
  name: z.string().min(1, "Department name is required"),
  description: z.string().optional(),
  headId: z.string().uuid().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

interface EditDepartmentDialogProps {
  department: Department | null;
  onClose: () => void;
}

interface Manager {
  id: string;
  firstName: string;
  lastName: string;
  role: { name: string } | null;
}

export function EditDepartmentDialog({
  department,
  onClose,
}: EditDepartmentDialogProps) {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: department?.name || "",
      description: department?.description || "",
      headId: department?.headId || null,
    },
  });

  useEffect(() => {
    if (department) {
      form.reset({
        name: department.name,
        description: department.description || "",
        headId: department.headId,
      });
    }
  }, [department, form]);

  useEffect(() => {
    async function fetchManagers() {
      const response = await getManagersForDepartmentAction();
      if (response.success && response.data) {
        setManagers(response.data as Manager[]);
      }
    }
    fetchManagers();
  }, []);

  async function onSubmit(values: FormValues) {
    if (!department) return;

    setIsLoading(true);
    try {
      const result = await updateDepartmentAction(department.id, values);

      if (result.success) {
        toast.success("Department updated successfully");
        router.refresh();
        onClose();
      } else {
        toast.error(result.error || "Failed to update department");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={!!department} onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Department</DialogTitle>
          <DialogDescription>
            Update department information and assign a head.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="headId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department Head</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || undefined}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a department head" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="null">None</SelectItem>
                      <AnimatePresence>
                        {managers.map((manager) => (
                          <motion.div
                            key={manager.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            <SelectItem value={manager.id}>
                              {manager.firstName} {manager.lastName}
                              {manager.role && ` (${manager.role.name})`}
                            </SelectItem>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <LoadingSpinner /> : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
