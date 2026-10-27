export interface PageRequest {
  page: number;
  limit: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  filters?: Readonly<Record<string, string>>;
}

export interface Page<T> {
  items: readonly T[];
  total: number;
  page: number;
  limit: number;
}

export const PAGE_SIZES = [10, 25, 50] as const;

export const DEFAULT_PAGE_SIZE = 10;

export function pageCountOf(total: number, limit: number): number {
  if (limit <= 0) {
    return 1;
  }
  return Math.max(1, Math.ceil(total / limit));
}
