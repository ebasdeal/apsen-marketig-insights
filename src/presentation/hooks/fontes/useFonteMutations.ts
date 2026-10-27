'use client';

import type { DeleteFonteInput } from '@application/fontes/DeleteFonte';
import type { FontesPageDto } from '@application/fontes/dto';
import type { UpdateFonteConfigInput } from '@application/fontes/UpdateFonteConfig';
import type { FonteDraft } from '@domain/fontes/Fonte';
import { FonteProtegidaError, FonteValidationError } from '@domain/fontes/errors';
import { useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useToast } from '../../providers/ToastProvider';
import { useUseCases } from '../../providers/UseCasesContext';
import { restoreSnapshot, takeSnapshot } from '../cacheSnapshot';
import { queryKeys } from '../queryKeys';
import { WRITE_FAILURE_TOAST } from '../writeFailure';
import { applyRemoveToPage } from './fonteOptimistic';
import { fontesKeys } from './fontesKeys';

function invalidateFontes(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: fontesKeys.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.navegacao.badges() }),
  ]);
}

function failureMessage(error: Error): string {
  return error instanceof FonteValidationError || error instanceof FonteProtegidaError
    ? error.message
    : WRITE_FAILURE_TOAST;
}

export function useCreateFonteMutation() {
  const { fontes } = useUseCases();
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (draft: FonteDraft) => fontes.create.execute(draft),
    onSuccess: (result) => toast.show(result.toast),
    onError: (error) => toast.show(failureMessage(error)),
    onSettled: () => invalidateFontes(queryClient),
  });
}

export function useUpdateFonteMutation() {
  const { fontes } = useUseCases();
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (input: UpdateFonteConfigInput) => fontes.update.execute(input),
    onSuccess: (result) => toast.show(result.toast),
    onError: (error) => toast.show(failureMessage(error)),
    onSettled: () => invalidateFontes(queryClient),
  });
}

export function useDeleteFonteMutation() {
  const { fontes } = useUseCases();
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (input: DeleteFonteInput) => fontes.remove.execute(input),
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: fontesKeys.all });
      const snapshot = takeSnapshot(queryClient, fontesKeys.all);
      queryClient.setQueriesData<FontesPageDto>({ queryKey: fontesKeys.pages() }, (page) =>
        page === undefined ? page : applyRemoveToPage(page, id),
      );
      return { snapshot };
    },
    onSuccess: (result) => toast.show(result.toast),
    onError: (error, _input, context) => {
      restoreSnapshot(queryClient, context?.snapshot);
      toast.show(failureMessage(error));
    },
    onSettled: () => invalidateFontes(queryClient),
  });
}
