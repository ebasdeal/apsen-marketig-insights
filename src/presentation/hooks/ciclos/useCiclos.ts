'use client';

import { useQuery } from '@tanstack/react-query';
import { DEFAULT_STALE_TIME } from '../../providers/queryClient';
import { useUseCases } from '../../providers/UseCasesContext';
import { useSessaoStore } from '../../stores/sessaoStore';
import { usePagedListQuery } from '../usePagedListQuery';
import { ciclosKeys, type CiclosPageParams } from './ciclosKeys';

export function useCiclosPage(params: CiclosPageParams) {
  const { ciclos } = useUseCases();
  return usePagedListQuery(ciclosKeys.page, ciclos.list, params);
}

export function useCiclosResumo() {
  const { ciclos } = useUseCases();
  const autenticado = useSessaoStore((state) => state.sessao !== null);
  return useQuery({
    queryKey: ciclosKeys.resumo(),
    queryFn: () => ciclos.resumo.execute(),
    staleTime: DEFAULT_STALE_TIME,
    enabled: autenticado,
  });
}
