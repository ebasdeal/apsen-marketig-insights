import { createFakeUseCases, createTestQueryClient } from '@test/renderWithProviders';
import { PERFIS_FIXTURE } from '@test/fixtures/perfis';
import { NAV_BADGES_FIXTURE } from '@test/fixtures/navBadges';
import { useQueryClient, type QueryClient } from '@tanstack/react-query';
import { render, renderHook, screen } from '@testing-library/react';
import { stubMatchMedia } from '../../theme/__tests__/matchMediaStub';
import { AppProviders } from '../AppProviders';
import { CATALOG_STALE_TIME, createQueryClient } from '../queryClient';
import { UseCasesProvider, useUseCases, type UseCases } from '../UseCasesContext';

describe('UseCasesContext', () => {
  it('expõe os casos de uso do provider', () => {
    const useCases = createFakeUseCases();
    const { result } = renderHook(() => useUseCases(), {
      wrapper: ({ children }) => (
        <UseCasesProvider useCases={useCases}>{children}</UseCasesProvider>
      ),
    });
    expect(result.current).toBe(useCases);
  });

  it('lança erro fora do provider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => renderHook(() => useUseCases())).toThrow(
      'useUseCases deve ser usado dentro de <UseCasesProvider>',
    );
    consoleError.mockRestore();
  });
});

describe('AppProviders', () => {
  it('disponibiliza query client, casos de uso, toast e sincroniza o tema', () => {
    stubMatchMedia(true);
    const useCases = createFakeUseCases();
    const queryClient = createTestQueryClient();
    const seen: { client: QueryClient | null; useCases: UseCases | null } = {
      client: null,
      useCases: null,
    };
    function Probe() {
      seen.client = useQueryClient();
      seen.useCases = useUseCases();
      return <p>filho</p>;
    }
    render(
      <AppProviders useCases={useCases} queryClient={queryClient}>
        <Probe />
      </AppProviders>,
    );
    expect(screen.getByText('filho')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Notificações' })).toBeEmptyDOMElement();
    expect(seen.client).toBe(queryClient);
    expect(seen.useCases).toBe(useCases);
    expect(document.documentElement).toHaveClass('dark');
  });
});

describe('createFakeUseCases', () => {
  it('mescla overrides por módulo mantendo os demais stubs', async () => {
    const list = { execute: vi.fn().mockResolvedValue([]) };
    const useCases = createFakeUseCases({ perfis: { list } });
    expect(useCases.perfis.list).toBe(list);
    await expect(useCases.navegacao.badges.execute()).resolves.toEqual(NAV_BADGES_FIXTURE);
    await expect(createFakeUseCases().perfis.list.execute()).resolves.toEqual(PERFIS_FIXTURE);
  });
});

describe('createQueryClient', () => {
  it('configura staleTime de listas e retry padrão', () => {
    expect(createQueryClient().getDefaultOptions().queries).toMatchObject({
      staleTime: 30_000,
      retry: 1,
    });
    expect(CATALOG_STALE_TIME).toBe(300_000);
  });
});
