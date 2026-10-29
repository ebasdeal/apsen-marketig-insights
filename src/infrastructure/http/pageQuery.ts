import type { PageRequest } from '@domain/shared/Page';
import type { QueryParams } from './HttpClient';

function present(value: string | undefined): value is string {
  return value !== undefined && value.trim() !== '';
}

export function toPageQuery(request: PageRequest): QueryParams {
  const query: QueryParams = {
    _page: String(request.page),
    _limit: String(request.limit),
  };
  if (present(request.sort)) {
    query._sort = request.sort;
    query._order = request.order ?? 'asc';
  }
  if (present(request.search)) {
    query.q = request.search.trim();
  }
  Object.entries(request.filters ?? {}).forEach(([key, value]) => {
    if (present(value)) {
      query[key] = value;
    }
  });
  return query;
}
