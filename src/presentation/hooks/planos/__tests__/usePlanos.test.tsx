import { formularioInclusaoVazio } from '@domain/planos/planoRules';
import { NotFoundError } from '@domain/shared/DomainError';
import {
  PLANO_FILTRO_PADRAO,
  planoItemDetailFixture,
  planoItemRowFixture,
  planoListFixture,
} from '@test/fakes/planos';
import {
  createFakeUseCases,
  createTestQueryClient,
  createWrapper,
} from '@test/renderWithProviders';
import { logout } from '@test/resetStores';
import { act, renderHook, screen, waitFor } from '@testing-library/react';
import { queryKeys } from '../../queryKeys';
import { paginaSemItem, tentarDeNovo, totalAposExcluir } from '../planosCache';
import { planosKeys } from '../planosKeys';
import {
  useAtualizarPlanoItemMutation,
  useExcluirPlanoItemMutation,
  useIncluirPlanoItemMutation,
} from '../usePlanoMutations';
import { usePlanoItem, usePlanoItens, useSkusInclusao, useTotalPlanoItens } from '../usePlanos';

const FILTRO = {
  ...PLANO_FILTRO_PADRAO,
  ordem: { campo: 'codigo' as const, direcao: 'asc' as const },
};

function deferred<T>() {
  let resolve: (value: T) => void = () => undefined;
  let reject: (error: unknown) => void = () => undefined;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function setup(useCases = createFakeUseCases()) {
  const queryClient = createTestQueryClient();
  return { useCases, queryClient, wrapper: createWrapper(useCases, queryClient) };
}

describe('planosKeys', () => {
  it('ficam agrupadas em queryKeys.planos', () => {
    expect(queryKeys.planos.all).toEqual(['planos']);
    expect(planosKeys.list(FILTRO)).toEqual(['planos', 'list', FILTRO]);
    expect(planosKeys.detail('x')).toEqual(['planos', 'detail', 'x']);
    expect(planosKeys.total()).toEqual(['planos', 'total']);
    expect(planosKeys.skusInclusao()).toEqual(['planos', 'skusInclusao']);
  });
});

describe('planosCache', () => {
  it('remove o item da página e decrementa o total', () => {
    const pagina = planoListFixture();
    expect(paginaSemItem(pagina, 'PLP-2026-07-001')).toMatchObject({ itens: [], total: 246 });
    expect(paginaSemItem(pagina, 'outro')).toEqual(pagina);
    expect(paginaSemItem({ ...pagina, total: 0 }, 'PLP-2026-07-001').total).toBe(0);
    expect(totalAposExcluir(247)).toBe(246);
    expect(totalAposExcluir(0)).toBe(0);
  });

  it('não repete a consulta de item inexistente', () => {
    expect(tentarDeNovo(0, new NotFoundError('Item do plano', 'x'))).toBe(false);
    expect(tentarDeNovo(0, new Error('500'))).toBe(true);
    expect(tentarDeNovo(1, new Error('500'))).toBe(false);
  });
});

describe('usePlanoItens', () => {
  it('carrega a página e faz prefetch da próxima com o mesmo filtro', async () => {
    const { useCases, queryClient, wrapper } = setup();
    vi.mocked(useCases.planos.list.execute).mockImplementation(async ({ pagina }) =>
      planoListFixture({ pagina }),
    );
    const { result } = renderHook(() => usePlanoItens(FILTRO), { wrapper });
    await waitFor(() => expect(result.current.data?.total).toBe(247));
    await waitFor(() =>
      expect(useCases.planos.list.execute).toHaveBeenCalledWith({ ...FILTRO, pagina: 2 }),
    );
    const query = queryClient.getQueryCache().find({ queryKey: planosKeys.list(FILTRO) });
    expect(query?.options).toMatchObject({ staleTime: 30_000 });
  });

  it('mantém as linhas anteriores ao trocar o filtro e não faz prefetch na última página', async () => {
    const { useCases, wrapper } = setup();
    const proxima = deferred<ReturnType<typeof planoListFixture>>();
    vi.mocked(useCases.planos.list.execute).mockImplementation((filtro) =>
      filtro.familia === '' ? Promise.resolve(planoListFixture({ total: 5 })) : proxima.promise,
    );
    const { result, rerender } = renderHook(({ filtro }) => usePlanoItens(filtro), {
      wrapper,
      initialProps: { filtro: FILTRO },
    });
    await waitFor(() => expect(result.current.data?.total).toBe(5));
    rerender({ filtro: { ...FILTRO, familia: 'Cardio' } });
    expect(result.current.isPlaceholderData).toBe(true);
    expect(result.current.data?.total).toBe(5);
    await act(async () => proxima.resolve(planoListFixture({ total: 3 })));
    await waitFor(() => expect(result.current.data?.total).toBe(3));
    expect(useCases.planos.list.execute).toHaveBeenCalledTimes(2);
  });

  it('não consulta sem sessão', () => {
    logout();
    const { useCases, wrapper } = setup();
    renderHook(() => usePlanoItens(FILTRO), { wrapper });
    renderHook(() => useSkusInclusao(true), { wrapper });
    expect(useCases.planos.list.execute).not.toHaveBeenCalled();
    expect(useCases.planos.skusInclusao.execute).not.toHaveBeenCalled();
  });
});

describe('consultas do plano', () => {
  it('useTotalPlanoItens e usePlanoItem', async () => {
    const { useCases, wrapper } = setup();
    vi.mocked(useCases.planos.contar.execute).mockResolvedValue(247);
    const total = renderHook(() => useTotalPlanoItens(), { wrapper });
    const item = renderHook(() => usePlanoItem('PLP-2026-07-005'), { wrapper });
    await waitFor(() => expect(total.result.current.data).toBe(247));
    await waitFor(() => expect(item.result.current.data).toEqual(planoItemDetailFixture()));
    expect(useCases.planos.get.execute).toHaveBeenCalledWith('PLP-2026-07-005');
  });

  it('useSkusInclusao só consulta com o modal aberto e com staleTime de 5 min', async () => {
    const { useCases, queryClient, wrapper } = setup();
    const { result, rerender } = renderHook(({ aberto }) => useSkusInclusao(aberto), {
      wrapper,
      initialProps: { aberto: false },
    });
    expect(useCases.planos.skusInclusao.execute).not.toHaveBeenCalled();
    rerender({ aberto: true });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const query = queryClient.getQueryCache().find({ queryKey: planosKeys.skusInclusao() });
    expect(query?.options).toMatchObject({ staleTime: 300_000 });
  });
});

describe('mutações de incluir e atualizar (CA-13)', () => {
  it('incluir invalida planos, dashboard e badges e recarrega o total', async () => {
    const { useCases, queryClient, wrapper } = setup();
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(
      () => ({ total: useTotalPlanoItens(), incluir: useIncluirPlanoItemMutation() }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.total.isSuccess).toBe(true));
    const form = { ...formularioInclusaoVazio(), sku: 'SKU-00058', qtd: '50000' };
    await expect(act(() => result.current.incluir.mutateAsync(form))).resolves.toEqual({
      id: 'uuid-1',
      codigo: 'PLP-2026-07-248',
    });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['planos'] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['dashboard'] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['navegacao', 'badges'] });
    await waitFor(() => expect(useCases.planos.contar.execute).toHaveBeenCalledTimes(2));
  });

  it('atualizar repassa id e formulário', async () => {
    const { useCases, wrapper } = setup();
    const { result } = renderHook(() => useAtualizarPlanoItemMutation(), { wrapper });
    const { form } = planoItemDetailFixture();
    await act(() => result.current.mutateAsync({ id: 'PLP-2026-07-005', form }));
    expect(useCases.planos.atualizar.execute).toHaveBeenCalledWith('PLP-2026-07-005', form);
  });
});

describe('useExcluirPlanoItemMutation (CA-06, RN-07)', () => {
  function prepararCache(queryClient: ReturnType<typeof createTestQueryClient>) {
    const pagina = planoListFixture({
      itens: [planoItemRowFixture({ id: 'PLP-2026-07-005', editavel: true })],
    });
    queryClient.setQueryData(planosKeys.list(FILTRO), pagina);
    queryClient.setQueryData(planosKeys.total(), 247);
    return pagina;
  }

  it('remove na hora e restaura com toast de erro se a API falhar', async () => {
    const { useCases, queryClient, wrapper } = setup();
    const pendente = deferred<void>();
    vi.mocked(useCases.planos.excluir.execute).mockReturnValue(pendente.promise);
    const pagina = prepararCache(queryClient);
    const { result } = renderHook(() => useExcluirPlanoItemMutation(FILTRO), { wrapper });

    act(() => result.current.mutate('PLP-2026-07-005'));
    await waitFor(() =>
      expect(queryClient.getQueryData(planosKeys.list(FILTRO))).toMatchObject({ itens: [] }),
    );
    expect(queryClient.getQueryData(planosKeys.total())).toBe(246);

    await act(async () => pendente.reject(new Error('500')));
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(queryClient.getQueryData(planosKeys.list(FILTRO))).toEqual(pagina);
    expect(queryClient.getQueryData(planosKeys.total())).toBe(247);
    expect(
      await screen.findByText('Não foi possível excluir. Tente novamente.'),
    ).toBeInTheDocument();
  });

  it('com sucesso mostra o toast, descarta o detalhe e invalida as chaves', async () => {
    const { useCases, queryClient, wrapper } = setup();
    queryClient.setQueryData(planosKeys.detail('PLP-2026-07-005'), planoItemDetailFixture());
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useExcluirPlanoItemMutation(FILTRO), { wrapper });
    await act(() => result.current.mutateAsync('PLP-2026-07-005'));
    expect(useCases.planos.excluir.execute).toHaveBeenCalledWith('PLP-2026-07-005');
    expect(await screen.findByText('🗑️ Item removido do plano.')).toBeInTheDocument();
    expect(queryClient.getQueryData(planosKeys.detail('PLP-2026-07-005'))).toBeUndefined();
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['planos'] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['dashboard'] });
  });

  it('sem cache prévio só mostra o erro', async () => {
    const { useCases, queryClient, wrapper } = setup();
    vi.mocked(useCases.planos.excluir.execute).mockRejectedValue(new Error('x'));
    const { result } = renderHook(() => useExcluirPlanoItemMutation(FILTRO), { wrapper });
    await act(async () => {
      await result.current.mutateAsync('x').catch(() => undefined);
    });
    expect(queryClient.getQueryData(planosKeys.total())).toBeUndefined();
    expect(
      await screen.findByText('Não foi possível excluir. Tente novamente.'),
    ).toBeInTheDocument();
  });
});
