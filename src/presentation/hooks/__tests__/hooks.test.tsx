import { NAV_BADGES_FIXTURE } from '@test/fixtures/navBadges';
import { PERFIS_FIXTURE } from '@test/fixtures/perfis';
import {
  createFakeUseCases,
  createTestQueryClient,
  createWrapper,
} from '@test/renderWithProviders';
import { renderHook, waitFor } from '@testing-library/react';
import { useUseCases } from '../../providers/UseCasesContext';
import { queryKeys } from '../queryKeys';
import { useNavBadges } from '../useNavBadges';
import { usePerfis } from '../usePerfis';

describe('queryKeys', () => {
  it('agrupa as chaves por módulo', () => {
    expect(queryKeys.perfis.all).toEqual(['perfis']);
    expect(queryKeys.perfis.list()).toEqual(['perfis', 'list']);
    expect(queryKeys.navegacao.badges()).toEqual(['navegacao', 'badges']);
  });
});

describe('usePerfis', () => {
  it('carrega os perfis com staleTime de catálogo', async () => {
    const useCases = createFakeUseCases();
    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => usePerfis(), {
      wrapper: createWrapper(useCases, queryClient),
    });
    await waitFor(() => expect(result.current.data).toEqual(PERFIS_FIXTURE));
    expect(useCases.perfis.list.execute).toHaveBeenCalledTimes(1);
    const query = queryClient.getQueryCache().find({ queryKey: queryKeys.perfis.list() });
    expect(query?.options).toMatchObject({ staleTime: 300_000 });
  });
});

describe('useNavBadges', () => {
  it('carrega as contagens dos badges', async () => {
    const useCases = createFakeUseCases();
    const { result } = renderHook(() => useNavBadges(), { wrapper: createWrapper(useCases) });
    await waitFor(() => expect(result.current.data).toEqual(NAV_BADGES_FIXTURE));
    expect(useCases.navegacao.badges.execute).toHaveBeenCalledTimes(1);
  });
});

describe('useUseCases', () => {
  it('falha fora do provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => renderHook(() => useUseCases())).toThrow(
      'useUseCases deve ser usado dentro de <UseCasesProvider>',
    );
    vi.mocked(console.error).mockRestore();
  });
});
