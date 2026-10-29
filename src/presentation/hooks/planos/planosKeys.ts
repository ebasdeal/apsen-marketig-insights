import type { PlanoFiltro } from '@domain/planos/PlanoItem';

export const planosKeys = {
  all: ['planos'] as const,
  list: (filtro: PlanoFiltro) => ['planos', 'list', filtro] as const,
  detail: (id: string) => ['planos', 'detail', id] as const,
  total: () => ['planos', 'total'] as const,
  skusInclusao: () => ['planos', 'skusInclusao'] as const,
};
