'use client';

import type { DriversPageDto } from '@application/drivers/dto';
import { useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query';
import { useToast } from '../../providers/ToastProvider';
import { useUseCases } from '../../providers/UseCasesContext';
import { driversKeys } from './driversKeys';
import { invalidarDrivers } from './invalidarDrivers';

export const MENSAGEM_FALHA_REMOVER = '⚠️ Não foi possível remover o registro.';

interface RemoveContext {
  anteriores: [QueryKey, DriversPageDto | undefined][];
}

export function semDriver(pagina: DriversPageDto, id: string): DriversPageDto {
  if (!pagina.items.some((item) => item.id === id)) {
    return pagina;
  }
  return {
    ...pagina,
    items: pagina.items.filter((item) => item.id !== id),
    total: Math.max(0, pagina.total - 1),
  };
}

export function useDeleteDriverMutation() {
  const useCases = useUseCases();
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation<void, Error, string, RemoveContext>({
    mutationFn: (id) => useCases.drivers.remove.execute(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: driversKeys.lists() });
      const anteriores = queryClient.getQueriesData<DriversPageDto>({
        queryKey: driversKeys.lists(),
      });
      queryClient.setQueriesData<DriversPageDto>({ queryKey: driversKeys.lists() }, (pagina) =>
        pagina === undefined ? pagina : semDriver(pagina, id),
      );
      return { anteriores };
    },
    onError: (_error, _id, context) => {
      context?.anteriores.forEach(([key, data]) => queryClient.setQueryData(key, data));
      toast.show(MENSAGEM_FALHA_REMOVER);
    },
    onSettled: () => invalidarDrivers(queryClient),
  });
}
