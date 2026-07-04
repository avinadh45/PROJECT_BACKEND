export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
export interface PaginationQuery {
  page: number;
  limit: number;
}
export interface CategoryQueryDTO {
  page: number;
  limit: number;
  // search?: string;
   status?: "active" | "inactive";
}