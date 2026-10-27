import type { QueryClient } from '@tanstack/react-query';
import { queryKeys } from '../queryKeys';

export async function invalidarDrivers(queryClient: QueryClient): Promise<void> {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.drivers.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.catalogo.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.navegacao.badges() }),
  ]);
}
