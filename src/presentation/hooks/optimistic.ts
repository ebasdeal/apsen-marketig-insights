import type { QueryClient, QueryKey } from '@tanstack/react-query';

export type QuerySnapshot = [QueryKey, unknown][];

export async function snapshotQueries(
  queryClient: QueryClient,
  queryKeys: readonly QueryKey[],
): Promise<QuerySnapshot> {
  await Promise.all(queryKeys.map((queryKey) => queryClient.cancelQueries({ queryKey })));
  return queryKeys.flatMap((queryKey) => queryClient.getQueriesData({ queryKey }));
}

export function restoreSnapshot(
  queryClient: QueryClient,
  snapshot: QuerySnapshot | undefined,
): void {
  snapshot?.forEach(([queryKey, data]) => queryClient.setQueryData(queryKey, data));
}
