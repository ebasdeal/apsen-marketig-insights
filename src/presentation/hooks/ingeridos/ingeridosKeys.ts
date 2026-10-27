import type { IngeridoFiltro } from '@domain/ingeridos/Ingerido';

export const ingeridosKeys = {
  all: ['ingeridos'] as const,
  pages: () => ['ingeridos', 'page'] as const,
  page: (filtro: IngeridoFiltro, page: number) => ['ingeridos', 'page', filtro, page] as const,
};
