'use client';

import type { ListAnalisesInput } from '@application/analises/dto';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { CATALOG_STALE_TIME, DEFAULT_STALE_TIME } from '../../providers/queryClient';
import { useUseCases } from '../../providers/UseCasesContext';
import { retryExcetoNotFound } from '../retryExcetoNotFound';
import { analisesKeys } from './analisesKeys';

export function useAnalises(input: ListAnalisesInput) {
  const { analises } = useUseCases();
  return useQuery({
    queryKey: analisesKeys.list(input),
    queryFn: () => analises.list.execute(input),
    staleTime: DEFAULT_STALE_TIME,
    placeholderData: keepPreviousData,
  });
}

export function useTotalAnalises() {
  const { analises } = useUseCases();
  return useQuery({
    queryKey: analisesKeys.total(),
    queryFn: () => analises.contar.execute(),
    staleTime: DEFAULT_STALE_TIME,
  });
}

export function useAnalise(id: string) {
  const { analises } = useUseCases();
  return useQuery({
    queryKey: analisesKeys.detail(id),
    queryFn: () => analises.get.execute(id),
    staleTime: DEFAULT_STALE_TIME,
    retry: retryExcetoNotFound,
  });
}

export function useNovaAnaliseOpcoes() {
  const { analises } = useUseCases();
  return useQuery({
    queryKey: analisesKeys.opcoes(),
    queryFn: () => analises.opcoes.execute(),
    staleTime: CATALOG_STALE_TIME,
  });
}

export function useSkusDoCiclo(ciclo: string) {
  const { analises } = useUseCases();
  return useQuery({
    queryKey: analisesKeys.skusCiclo(ciclo),
    queryFn: () => analises.skusDoCiclo.execute(ciclo),
    staleTime: CATALOG_STALE_TIME,
    enabled: ciclo !== '',
  });
}

export function useDriversSugeridos(enabled: boolean) {
  const { analises } = useUseCases();
  return useQuery({
    queryKey: analisesKeys.driversSugeridos(),
    queryFn: () => analises.driversSugeridos.execute(),
    staleTime: DEFAULT_STALE_TIME,
    enabled,
  });
}
