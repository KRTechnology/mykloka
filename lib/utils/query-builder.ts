import { FilterState, PaginationState, SortingState } from "@/types/table";

export function buildQueryString<T extends string>(
  pagination: PaginationState,
  sorting: SortingState<T>,
  filters: FilterState
): string {
  const params = new URLSearchParams();

  // Add pagination params
  params.append("page", pagination.page.toString());
  params.append("pageSize", pagination.pageSize.toString());

  // Add sorting params
  params.append("sortBy", sorting.field);
  params.append("sortDirection", sorting.direction);

  // Add filter params
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, value.toString());
    }
  });

  return params.toString();
}
