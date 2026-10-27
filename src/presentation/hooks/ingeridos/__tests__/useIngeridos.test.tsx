import type { ListIngeridosResult } from '@application/ingeridos/dto';
import { INGERIDO_FILTRO_VAZIO } from '@domain/ingeridos/Ingerido';
import { listIngeridosResult } from '@test/fakes/ingeridos';
import {
  createFakeUseCases,
  createTestQueryClient,
  createWrapper,
} from '@test/renderWithProviders';
import { act, renderHook, screen, waitFor } from '@testing-library/react';
import { queryKeys } from '../../queryKeys';
import { ingeridosKeys } from '../ingeridosKeys';
import { removerIngerido, useDeleteIngeridoMutation, useIngeridosPage } from '../useIngeridos';

function setup(overrides: Parameters<typeof createFakeUseCases>[0] = {}) {
  const useCases = createFakeUseCases(overrides);
  const queryClient = createTestQueryClient();
  return { useCases, queryClient, wrapper: createWrapper(useCases, queryClient) };
}

const CHAVE = ingeridosKeys.page(INGERIDO_FILTRO_VAZIO, 1);

describe('ingeridosKeys', () => {
  it('agrupa as chaves em queryKeys', () => {
    expect(queryKeys.ingeridos).toBe(ingeridosKeys);
    expect(CHAVE).toEqual(['ingeridos', 'page', { q: '', categoria: '' }, 1]);
  });
});

describe('useIngeridosPage (CA-02, CA-06)', () => {
  it('repassa filtro e página, mantém dados anteriores e faz prefetch', async () => {
    const { useCases, queryClient, wrapper } = setup();
    const list = vi.mocked(useCases.ingeridos.list.execute);
    list.mockResolvedValueOnce({ ...listIngeridosResult(), totalPages: 2 });
    const { result, rerender } = renderHook(
      (props: { categoria: string }) => useIngeridosPage({ q: 'bari', ...props }, 1),
      { wrapper, initialProps: { categoria: '' } },
    );
    await waitFor(() => expect(result.current.data?.resumo).toBe('4 drivers'));
    await waitFor(() =>
      expect(list).toHaveBeenCalledWith({ filtro: { q: 'bari', categoria: '' }, page: 2 }),
    );
    const query = queryClient.getQueryCache().find({
      queryKey: ingeridosKeys.page({ q: 'bari', categoria: '' }, 1),
    });
    expect(query?.options).toMatchObject({ staleTime: 30_000 });
    list.mockImplementationOnce(() => new Promise(() => undefined));
    rerender({ categoria: 'Supply' });
    expect(result.current.isPlaceholderData).toBe(true);
    expect(list).toHaveBeenLastCalledWith({ filtro: { q: 'bari', categoria: 'Supply' }, page: 1 });
  });
});

describe('useDeleteIngeridoMutation (CA-05, RN-03)', () => {
  it('remove a linha na hora, atualiza o resumo e mostra o toast', async () => {
    let resolver: (value: { toast: string }) => void = () => undefined;
    const remove = vi.fn(() => new Promise<{ toast: string }>((resolve) => (resolver = resolve)));
    const { queryClient, wrapper } = setup({ ingeridos: { remove: { execute: remove } } });
    queryClient.setQueryData(CHAVE, listIngeridosResult());
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useDeleteIngeridoMutation(), { wrapper });
    act(() => result.current.mutate('DRV-2026-029'));
    await waitFor(() =>
      expect(queryClient.getQueryData<ListIngeridosResult>(CHAVE)).toMatchObject({
        total: 3,
        resumo: '3 drivers',
      }),
    );
    resolver({ toast: '⚠️ Driver removido.' });
    expect(await screen.findByText('Driver removido.', { exact: false })).toBeInTheDocument();
    await waitFor(() => expect(invalidate).toHaveBeenCalledWith({ queryKey: ingeridosKeys.all }));
    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.navegacao.badges() });
  });

  it('falha restaura a linha e mostra o toast de falha', async () => {
    const { queryClient, wrapper } = setup({
      ingeridos: { remove: { execute: vi.fn().mockRejectedValue(new Error('500')) } },
    });
    queryClient.setQueryData(CHAVE, listIngeridosResult());
    const { result } = renderHook(() => useDeleteIngeridoMutation(), { wrapper });
    act(() => result.current.mutate('DRV-2026-029'));
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(queryClient.getQueryData<ListIngeridosResult>(CHAVE)?.rows).toHaveLength(4);
    expect(
      await screen.findByText('Não foi possível salvar as alterações', { exact: false }),
    ).toBeInTheDocument();
  });

  it('removerIngerido ignora cache vazio e id ausente; singular com 1', () => {
    const result = listIngeridosResult();
    expect(removerIngerido(undefined, 'x')).toBeUndefined();
    expect(removerIngerido(result, 'x')).toBe(result);
    const dois = { ...result, rows: result.rows.slice(0, 2), total: 2 };
    expect(removerIngerido(dois, 'DRV-2026-029')?.resumo).toBe('1 driver');
  });
});
