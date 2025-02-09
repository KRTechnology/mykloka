export type Permission =
  // User management permissions
  | "view_users"
  | "create_users"
  | "edit_users"
  | "delete_users"

  // Report/View permissions
  | "view_reports"
  | "view_all_departments"
  | "view_department_reports"

  // Task permissions
  | "create_tasks"
  | "view_tasks"
  | "approve_tasks"
  | "view_all_tasks"

  // Attendance permissions
  | "view_attendance"
  | "view_department_attendance"
  | "view_all_attendance"

  // Role management
  | "manage_roles";
