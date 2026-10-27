import type { QueryClient, QueryKey } from '@tanstack/react-query';

export type CacheSnapshot = readonly [QueryKey, unknown][];

export function takeSnapshot(queryClient: QueryClient, queryKey: QueryKey): CacheSnapshot {
  return queryClient.getQueriesData({ queryKey });
}

export function restoreSnapshot(
  queryClient: QueryClient,
  snapshot: CacheSnapshot | undefined,
): void {
  snapshot?.forEach(([key, data]) => queryClient.setQueryData(key, data));
}
