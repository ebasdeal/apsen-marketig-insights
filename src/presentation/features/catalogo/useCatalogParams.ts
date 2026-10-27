'use client';

import type { CatalogFiltersDto } from '@application/catalogo/dto';
import { useDebouncedValue } from '@presentation/hooks/useDebouncedValue';
import type { UrlStateSpec } from '@presentation/navigation/urlState';
import { useUrlState } from '@presentation/navigation/useUrlState';
import { useEffect, useState } from 'react';

export const CATALOG_SPEC = {
  q: { kind: 'string', default: '' },
  franquia: { kind: 'string', default: '' },
  familia: { kind: 'string', default: '' },
  page: { kind: 'int', default: 1, min: 1 },
  size: { kind: 'enum', default: '10', values: ['10', '25', '50'] },
} as const satisfies UrlStateSpec;

export function familiaAposFranquia(
  familia: string,
  franquia: string,
  filtros: CatalogFiltersDto | undefined,
): string {
  if (franquia === '' || familia === '') {
    return familia;
  }
  return (filtros?.familiasPorFranquia[franquia] ?? []).includes(familia) ? familia : '';
}

export function useCatalogParams(filtros: CatalogFiltersDto | undefined) {
  const [params, setParams] = useUrlState(CATALOG_SPEC);
  const [busca, setBusca] = useState(params.q);
  const debounced = useDebouncedValue(busca);

  useEffect(() => {
    if (debounced.trim() !== params.q) {
      setParams({ q: debounced.trim() });
    }
  }, [debounced, params.q, setParams]);

  return {
    busca,
    setBusca,
    query: {
      busca: params.q,
      franquia: params.franquia,
      familia: params.familia,
      page: params.page,
      size: Number(params.size),
    },
    setFranquia: (franquia: string) =>
      setParams({ franquia, familia: familiaAposFranquia(params.familia, franquia, filtros) }),
    setFamilia: (familia: string) => setParams({ familia }),
    setPage: (page: number) => setParams({ page }),
    setSize: (size: number) => setParams({ size: String(size) }),
  };
}
