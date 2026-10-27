import type { AprovFiltro } from '@domain/aprovacoes/Aprovacao';

export const aprovacoesKeys = {
  all: ['aprovacoes'] as const,
  pages: () => ['aprovacoes', 'page'] as const,
  page: (filtro: AprovFiltro, page: number) => ['aprovacoes', 'page', filtro, page] as const,
  pendentes: () => ['aprovacoes', 'pendentes'] as const,
  emUso: () => ['aprovacoes', 'emUso'] as const,
};
