import type { CatalogQuery } from '@domain/catalogo/ProductCatalogRepository';

export const catalogoKeys = {
  all: ['catalogo'] as const,
  familiaSkus: (familia: string) => ['catalogo', 'familia-skus', familia] as const,
  franquiaSkus: (franquia: string) => ['catalogo', 'franquia-skus', franquia] as const,
  skus: (termo: string) => ['catalogo', 'skus', termo] as const,
  familias: (termo: string) => ['catalogo', 'familias', termo] as const,
  list: (query: CatalogQuery) => ['catalogo', 'list', query] as const,
  filters: () => ['catalogo', 'filters'] as const,
  familia: (familia: string) => ['catalogo', 'familia', familia] as const,
};
