'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { DEFAULT_STALE_TIME } from '../../providers/queryClient';
import { useUseCases } from '../../providers/UseCasesContext';
import { retryExcetoNotFound } from '../retryExcetoNotFound';
import { agentesKeys } from './agentesKeys';

export function useAgentesPage(page: number) {
  const { agentes } = useUseCases();
  return useQuery({
    queryKey: agentesKeys.page(page),
    queryFn: () => agentes.list.execute({ page }),
    placeholderData: keepPreviousData,
    staleTime: DEFAULT_STALE_TIME,
  });
}

export function useAgentesResumo() {
  const { agentes } = useUseCases();
  return useQuery({
    queryKey: agentesKeys.resumo(),
    queryFn: () => agentes.resumo.execute(),
    staleTime: DEFAULT_STALE_TIME,
  });
}

export function useAgenteForm(id: string) {
  const { agentes } = useUseCases();
  return useQuery({
    queryKey: agentesKeys.form(id),
    queryFn: () => agentes.getForm.execute(id),
    retry: retryExcetoNotFound,
  });
}
