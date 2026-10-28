import type { QueryClient } from '@tanstack/react-query';
import { queryKeys } from '../queryKeys';

export async function invalidarDrivers(queryClient: QueryClient): Promise<void> {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.drivers.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.catalogo.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.navegacao.badges() }),
    // registrar ou remover um driver cria ou apaga a aprovação dele (e o ingerido, se aprovado)
    queryClient.invalidateQueries({ queryKey: queryKeys.aprovacoes.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.ingeridos.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all }),
  ]);
}
