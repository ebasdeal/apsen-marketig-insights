import { createFakeUseCases, createTestQueryClient } from '@test/renderWithProviders';
import { useQueryClient, type QueryClient } from '@tanstack/react-query';
import { render, renderHook, screen } from '@testing-library/react';
import { stubMatchMedia } from '../../theme/__tests__/matchMediaStub';
import { AppProviders } from '../AppProviders';
import { createQueryClient } from '../queryClient';
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
  it('disponibiliza query client, casos de uso e sincroniza o tema', () => {
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
    expect(seen.client).toBe(queryClient);
    expect(seen.useCases).toBe(useCases);
    expect(document.documentElement).toHaveClass('dark');
  });
});

describe('createQueryClient', () => {
  it('configura staleTime e retry padrão', () => {
    expect(createQueryClient().getDefaultOptions().queries).toMatchObject({
      staleTime: 60_000,
      retry: 1,
    });
  });
});
