export interface PaginationState {
  page: number;
  pageSize: number;
}

export interface SortingState<T extends string> {
  field: T;
  direction: "asc" | "desc";
}

export interface FilterState {
  search?: string;
  [key: string]: any;
}

export interface TableState<T extends string> {
  pagination: PaginationState;
  sorting: SortingState<T>;
  filters: FilterState;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
