import type { CatalogPageDto } from '@application/catalogo/dto';
import { LEVOXIN_SKUS, makeCatalogRow, makeFamilia, makeSku } from '@test/factories/catalogo';
import {
  createFakeUseCases,
  createTestQueryClient,
  createWrapper,
} from '@test/renderWithProviders';
import { renderHook, waitFor } from '@testing-library/react';
import { queryKeys } from '../../queryKeys';
import { catalogoKeys } from '../catalogoKeys';
import { useCatalogFamilias } from '../useCatalogFamilias';
import { useCatalogFilters } from '../useCatalogFilters';
import { useFamiliaDrivers } from '../useFamiliaDrivers';
import { useFamiliaSearch, useSkuSearch } from '../useProdutoSearch';
import { useFamiliaSkus, useFranquiaSkus } from '../useProdutoSkus';

const QUERY = { busca: '', franquia: '', familia: '', page: 2, size: 25 };

function setup() {
  const useCases = createFakeUseCases();
  const queryClient = createTestQueryClient();
  return { useCases, queryClient, wrapper: createWrapper(useCases, queryClient) };
}

function staleTimeOf(
  queryClient: ReturnType<typeof createTestQueryClient>,
  key: readonly unknown[],
) {
  return (queryClient.getQueryCache().find({ queryKey: key })?.options as { staleTime?: number })
    .staleTime;
}

describe('catalogoKeys', () => {
  it('chaves do módulo catalogo expostas em queryKeys', () => {
    expect(queryKeys.catalogo).toBe(catalogoKeys);
    expect(catalogoKeys.all).toEqual(['catalogo']);
    expect(catalogoKeys.familiaSkus('L')).toEqual(['catalogo', 'familia-skus', 'L']);
    expect(catalogoKeys.franquiaSkus('A')).toEqual(['catalogo', 'franquia-skus', 'A']);
    expect(catalogoKeys.skus('lev')).toEqual(['catalogo', 'skus', 'lev']);
    expect(catalogoKeys.familias('lev')).toEqual(['catalogo', 'familias', 'lev']);
    expect(catalogoKeys.list(QUERY)).toEqual(['catalogo', 'list', QUERY]);
    expect(catalogoKeys.filters()).toEqual(['catalogo', 'filters']);
    expect(catalogoKeys.familia('L')).toEqual(['catalogo', 'familia', 'L']);
  });
});

describe('SKUs da família e da franquia (CA-04 registrar)', () => {
  it('só buscam com valor', async () => {
    const { useCases, queryClient, wrapper } = setup();
    expect(renderHook(() => useFamiliaSkus(''), { wrapper }).result.current.fetchStatus).toBe(
      'idle',
    );
    expect(renderHook(() => useFranquiaSkus(''), { wrapper }).result.current.fetchStatus).toBe(
      'idle',
    );
    const familia = renderHook(() => useFamiliaSkus('LEVOXIN'), { wrapper });
    await waitFor(() => expect(familia.result.current.data).toEqual(LEVOXIN_SKUS));
    const franquia = renderHook(() => useFranquiaSkus('ASTER'), { wrapper });
    await waitFor(() => expect(franquia.result.current.isSuccess).toBe(true));
    expect(useCases.catalogo.franquiaSkus.execute).toHaveBeenCalledWith('ASTER');
    expect(staleTimeOf(queryClient, catalogoKeys.familiaSkus('LEVOXIN'))).toBe(300_000);
  });

  it('autocompletes usam fetchQuery com cache por termo', async () => {
    const { useCases, wrapper } = setup();
    const skus = renderHook(() => useSkuSearch(), { wrapper });
    await expect(skus.result.current('lev')).resolves.toEqual([makeSku()]);
    await skus.result.current(' lev ');
    expect(useCases.catalogo.searchSkus.execute).toHaveBeenCalledTimes(1);
    const familias = renderHook(() => useFamiliaSearch(), { wrapper });
    await expect(familias.result.current('lev')).resolves.toEqual([makeFamilia()]);
    expect(useCases.catalogo.searchFamilias.execute).toHaveBeenCalledWith('lev');
  });
});

describe('useCatalogFamilias (CA-04 catálogo)', () => {
  it('pede a página, guarda 30 s e faz prefetch da próxima', async () => {
    const { useCases, queryClient, wrapper } = setup();
    vi.mocked(useCases.catalogo.listFamilias.execute).mockImplementation(
      async (query): Promise<CatalogPageDto> => ({
        rows: [makeCatalogRow()],
        total: 92,
        page: query.page,
        size: query.size,
      }),
    );
    const { result } = renderHook(() => useCatalogFamilias(QUERY), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(useCases.catalogo.listFamilias.execute).toHaveBeenCalledWith(QUERY);
    await waitFor(() =>
      expect(useCases.catalogo.listFamilias.execute).toHaveBeenCalledWith({ ...QUERY, page: 3 }),
    );
    expect(staleTimeOf(queryClient, catalogoKeys.list(QUERY))).toBe(30_000);
  });

  it('na última página não faz prefetch', async () => {
    const { useCases, wrapper } = setup();
    const { result } = renderHook(() => useCatalogFamilias({ ...QUERY, page: 1, size: 10 }), {
      wrapper,
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(useCases.catalogo.listFamilias.execute).toHaveBeenCalledTimes(1);
  });
});

describe('useCatalogFilters / useFamiliaDrivers (CA-03, CA-08)', () => {
  it('filtros com 5 min e drivers da família com 30 s', async () => {
    const { useCases, queryClient, wrapper } = setup();
    const filtros = renderHook(() => useCatalogFilters(), { wrapper });
    await waitFor(() => expect(filtros.result.current.isSuccess).toBe(true));
    expect(staleTimeOf(queryClient, catalogoKeys.filters())).toBe(300_000);
    expect(renderHook(() => useFamiliaDrivers(''), { wrapper }).result.current.fetchStatus).toBe(
      'idle',
    );
    const familia = renderHook(() => useFamiliaDrivers('LEVOXIN'), { wrapper });
    await waitFor(() => expect(familia.result.current.data?.familia).toBe('LEVOXIN'));
    expect(useCases.catalogo.familiaDrivers.execute).toHaveBeenCalledWith('LEVOXIN');
    expect(staleTimeOf(queryClient, catalogoKeys.familia('LEVOXIN'))).toBe(30_000);
  });
});
