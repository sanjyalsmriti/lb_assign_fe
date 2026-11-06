export interface PageMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  message: string;
  meta: PageMeta;
}

export interface ItemResponse<T> {
  data: T;
  message: string;
}

export type FieldErrors = Record<string, string[]>;

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    fieldErrors?: FieldErrors;
  };
}

export interface LookupOption {
  value: string;
  label: string;
}
