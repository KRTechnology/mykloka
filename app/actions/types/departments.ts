export type GetDepartmentsOptions = {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  search?: string;
  isDropdown?: boolean;
};

export type CreateDepartmentData = {
  name: string;
  description?: string;
  headId?: string | null;
};
