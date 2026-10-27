'use client';

import type {
  CiclosPageDto,
  CiclosResumoDto,
  SaveCicloInput,
  ToggleCicloInput,
} from '@application/ciclos/dto';
import { CicloValidationError } from '@domain/ciclos/CicloValidationError';
import { useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useToast } from '../../providers/ToastProvider';
import { useUseCases } from '../../providers/UseCasesContext';
import { restoreSnapshot, takeSnapshot } from '../cacheSnapshot';
import { queryKeys } from '../queryKeys';
import { WRITE_FAILURE_TOAST } from '../writeFailure';
import { applyToggleToPage, applyToggleToResumo } from './cicloOptimistic';
import { ciclosKeys } from './ciclosKeys';

function invalidateCiclos(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: ciclosKeys.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.navegacao.badges() }),
  ]);
}

export function useSaveCicloMutation() {
  const { ciclos } = useUseCases();
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (input: SaveCicloInput) => ciclos.save.execute(input),
    onSuccess: (result) => toast.show(result.toast),
    onError: (error) =>
      toast.show(error instanceof CicloValidationError ? error.message : WRITE_FAILURE_TOAST),
    onSettled: () => invalidateCiclos(queryClient),
  });
}

export function useToggleCicloMutation() {
  const { ciclos } = useUseCases();
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (input: ToggleCicloInput) => ciclos.toggle.execute(input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: ciclosKeys.all });
      const snapshot = takeSnapshot(queryClient, ciclosKeys.all);
      const row = queryClient
        .getQueriesData<CiclosPageDto>({ queryKey: ciclosKeys.pages() })
        .flatMap(([, page]) => page?.rows ?? [])
        .find((candidate) => candidate.id === input.id);
      queryClient.setQueriesData<CiclosPageDto>({ queryKey: ciclosKeys.pages() }, (page) =>
        page === undefined ? page : applyToggleToPage(page, input),
      );
      queryClient.setQueryData<CiclosResumoDto>(ciclosKeys.resumo(), (resumo) =>
        resumo === undefined ? resumo : applyToggleToResumo(resumo, input, row),
      );
      return { snapshot };
    },
    onSuccess: (result) => toast.show(result.toast),
    onError: (_error, _input, context) => {
      restoreSnapshot(queryClient, context?.snapshot);
      toast.show(WRITE_FAILURE_TOAST);
    },
    onSettled: () => invalidateCiclos(queryClient),
  });
}
