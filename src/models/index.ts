export interface ApiResponse<T> {
  result: T;
}

export interface Product {
  brand?: string | null;
  id: string;
  price?: number;
  product?: string;
}

export interface FieldParams {
  field?: string;
  offset?: number;
  limit?: number;
}

export interface FilterParams {
  [key: string]: string | number;
}
