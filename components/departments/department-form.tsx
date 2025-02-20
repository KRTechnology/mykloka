"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { createDepartmentAction } from "@/app/actions/departments";

import { Button } from "@/components/ui/button";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { type User } from "@/lib/api/users";
import { CreateDepartmentData } from "@/app/actions/types/departments";
import { departmentSchema } from "@/lib/api/departments";

interface DepartmentFormProps {
  users: User[];
}

export function DepartmentForm({ users }: DepartmentFormProps) {
  const router = useRouter();
  const form = useForm<CreateDepartmentData>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: "",
      description: "",
      headId: undefined,
    },
  });

  const onSubmit = async (data: CreateDepartmentData) => {
    try {
      const result = await createDepartmentAction(data);
      if (!result.success) {
        throw new Error(result.error);
      }
      toast.success("Department created successfully");
      router.push("/dashboard/departments");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create department"
      );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Department Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter department name" {...field} />
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
                  <Textarea
                    placeholder="Enter department description"
                    {...field}
                  />
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
                <FormLabel>Department Head (Optional)</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a department head" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.firstName} {user.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full bg-kr-orange hover:bg-kr-orange/90"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2"
              >
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Creating...
              </motion.div>
            ) : (
              "Create Department"
            )}
          </Button>
        </form>
      </Form>
    </motion.div>
  );
}
