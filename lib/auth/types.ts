export type Permission =
  // User management permissions
  | "view_users"
  | "create_users"
  | "edit_users"
  | "delete_users"
  | "view_user_profiles"

  // Department permissions
  | "view_all_departments"
  | "create_departments"
  | "edit_departments"
  | "delete_departments"
  | "view_department"
  | "view_department_members"

  // Attendance permissions
  | "view_all_attendance"
  | "create_attendance"
  | "view_attendance_reports"
  | "view_department_attendance"
  | "view_department_attendance_reports"
  | "view_own_attendance"

  // Task permissions
  | "view_all_tasks"
  | "create_tasks"
  | "edit_tasks"
  | "delete_tasks"
  | "approve_tasks"
  | "create_tasks_for_others"
  | "view_department_tasks"
  | "edit_own_tasks"
  | "delete_own_tasks"
  | "approve_department_tasks"
  | "create_tasks_for_department"
  | "view_own_tasks"

  // System management permissions
  | "manage_roles"
  | "view_system_reports"
  | "manage_system_settings";

export type UserJWTPayload = {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: {
    id: string;
    name: string;
  };
  roleId: string;
  roleName: string;
  permissions: Permission[];
  departmentId?: string;
  managerId?: string;
};
