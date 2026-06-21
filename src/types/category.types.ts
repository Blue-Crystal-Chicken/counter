export interface CategoryResponse {
  id: number;
  name: string;
}

export interface CategoryResponseWithTotalProducts {
  category: CategoryResponse;
  count: number;
}
