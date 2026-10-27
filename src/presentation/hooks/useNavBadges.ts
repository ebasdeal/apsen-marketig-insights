'use client';

import { useQuery } from '@tanstack/react-query';
import { useUseCases } from '../providers/UseCasesContext';
import { useSessaoStore } from '../stores/sessaoStore';
import { queryKeys } from './queryKeys';

export function useNavBadges() {
  const useCases = useUseCases();
  const autenticado = useSessaoStore((state) => state.sessao !== null);
  return useQuery({
    queryKey: queryKeys.navegacao.badges(),
    queryFn: () => useCases.navegacao.badges.execute(),
    enabled: autenticado,
  });
}
