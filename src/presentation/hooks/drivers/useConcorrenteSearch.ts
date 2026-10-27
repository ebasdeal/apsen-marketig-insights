'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { CATALOG_STALE_TIME } from '../../providers/queryClient';
import { useUseCases } from '../../providers/UseCasesContext';
import { driversKeys } from './driversKeys';

export function useLaboratorioSearch() {
  const useCases = useUseCases();
  const queryClient = useQueryClient();
  return useCallback(
    (termo: string) =>
      queryClient.fetchQuery({
        queryKey: driversKeys.labs(termo.trim()),
        queryFn: () => useCases.drivers.searchLaboratorios.execute(termo),
        staleTime: CATALOG_STALE_TIME,
      }),
    [queryClient, useCases],
  );
}

export function useMarcaSearch() {
  const useCases = useUseCases();
  const queryClient = useQueryClient();
  return useCallback(
    (laboratorio: string, termo: string) =>
      queryClient.fetchQuery({
        queryKey: driversKeys.marcas(laboratorio.trim(), termo.trim()),
        queryFn: () => useCases.drivers.searchMarcas.execute({ laboratorio, termo }),
        staleTime: CATALOG_STALE_TIME,
      }),
    [queryClient, useCases],
  );
}
