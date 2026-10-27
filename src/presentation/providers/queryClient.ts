import { QueryClient } from '@tanstack/react-query';

export const DEFAULT_STALE_TIME = 30_000;

export const CATALOG_STALE_TIME = 300_000;

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: DEFAULT_STALE_TIME,
        retry: 1,
      },
    },
  });
}
