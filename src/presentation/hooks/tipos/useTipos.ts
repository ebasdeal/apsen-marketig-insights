'use client';

import type { ListTiposInput } from '@application/tipos/dto';
import { NotFoundError } from '@domain/shared/DomainError';
import type { CategoriaSlug } from '@domain/tipos/Tipo';
import { keepPreviousData, skipToken, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { CATALOG_STALE_TIME, DEFAULT_STALE_TIME } from '../../providers/queryClient';
import { useUseCases } from '../../providers/UseCasesContext';
import { tiposKeys } from './tiposKeys';

function inputDe(page: number, size: number, cat: CategoriaSlug | undefined): ListTiposInput {
  return cat === undefined ? { page, size } : { page, size, cat };
}

export function useTiposPage({ page, size, cat }: ListTiposInput) {
  const useCases = useUseCases();
  const queryClient = useQueryClient();
  const input = inputDe(page, size, cat);
  const query = useQuery({
    queryKey: tiposKeys.page(input),
    queryFn: () => useCases.tipos.list.execute(input),
    placeholderData: keepPreviousData,
    staleTime: DEFAULT_STALE_TIME,
  });
  const totalPages = query.isPlaceholderData ? undefined : query.data?.totalPages;
  useEffect(() => {
    if (totalPages === undefined || page >= totalPages) {
      return;
    }
    const next = inputDe(page + 1, size, cat);
    void queryClient.prefetchQuery({
      queryKey: tiposKeys.page(next),
      queryFn: () => useCases.tipos.list.execute(next),
      staleTime: DEFAULT_STALE_TIME,
    });
  }, [queryClient, useCases, page, size, cat, totalPages]);
  return query;
}

export function useTiposResumo(cat?: CategoriaSlug) {
  const useCases = useUseCases();
  return useQuery({
    queryKey: tiposKeys.resumo(cat),
    queryFn: () => useCases.tipos.list.execute(inputDe(1, 1, cat)),
    select: ({ filtrados, total, ativos }) => ({ filtrados, total, ativos }),
    staleTime: DEFAULT_STALE_TIME,
  });
}

export function useCategorias() {
  const useCases = useUseCases();
  return useQuery({
    queryKey: tiposKeys.categorias(),
    queryFn: () => useCases.tipos.categorias.execute(),
    staleTime: CATALOG_STALE_TIME,
  });
}

export function useTipoForm(id: string | undefined) {
  const useCases = useUseCases();
  return useQuery({
    queryKey: tiposKeys.form(id ?? ''),
    queryFn: id === undefined ? skipToken : () => useCases.tipos.getForm.execute(id),
    retry: (failureCount, error) => !(error instanceof NotFoundError) && failureCount < 1,
    staleTime: 0,
  });
}
