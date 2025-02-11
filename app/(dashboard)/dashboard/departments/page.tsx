import { DepartmentsTable } from "@/components/departments/departments-table";
import { CreateDepartmentDialog } from "@/components/departments/create-department-dialog";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { getAllDepartments } from "@/lib/api/departments";

export default async function DepartmentsPage() {
  const departments = await getAllDepartments();

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <Heading
          title="Departments"
          description="Manage your organization's departments"
        />
        <CreateDepartmentDialog />
      </div>
      <Separator />
      <DepartmentsTable initialDepartments={departments} />
    </div>
  );
}
