import { formularioVazio } from '@domain/restricoes/restricaoRules';
import { restricaoItemFixture, restricoesPaginaFixture } from '@test/fakes/restricoes';
import {
  createFakeUseCases,
  createTestQueryClient,
  createWrapper,
} from '@test/renderWithProviders';
import { logout } from '@test/resetStores';
import { act, renderHook, screen, waitFor } from '@testing-library/react';
import { queryKeys } from '../../queryKeys';
import { contagemAposResolver, paginaSemRestricao } from '../restricoesCache';
import { restricoesKeys } from '../restricoesKeys';
import { useContagemRestricoes, useRestricoes } from '../useRestricoes';
import {
  useAtualizarRestricaoMutation,
  useRegistrarRestricaoMutation,
  useResolverRestricaoMutation,
} from '../useRestricaoMutations';

const INPUT = { aba: 'ativas' as const, pagina: 1 };

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

describe('restricoesKeys', () => {
  it('ficam agrupadas em queryKeys.restricoes', () => {
    expect(queryKeys.restricoes.all).toEqual(['restricoes']);
    expect(restricoesKeys.list(INPUT)).toEqual(['restricoes', 'list', INPUT]);
    expect(restricoesKeys.contagem()).toEqual(['restricoes', 'contagem']);
  });
});

describe('restricoesCache', () => {
  it('remove o item da página e ajusta o total', () => {
    const pagina = restricoesPaginaFixture({ total: 8 });
    expect(paginaSemRestricao(pagina, 'RST-001')).toMatchObject({ itens: [], total: 7 });
    expect(paginaSemRestricao(pagina, 'outro')).toEqual(pagina);
    expect(paginaSemRestricao({ ...pagina, total: 0 }, 'RST-001').total).toBe(0);
  });

  it('move uma ativa para resolvidas sem ficar negativo', () => {
    expect(contagemAposResolver({ ativas: 8, resolvidas: 14 })).toEqual({
      ativas: 7,
      resolvidas: 15,
    });
    expect(contagemAposResolver({ ativas: 0, resolvidas: 1 }).ativas).toBe(0);
  });
});

describe('useRestricoes', () => {
  it('carrega a página com staleTime de 30 s e faz prefetch da próxima', async () => {
    const { useCases, queryClient, wrapper } = setup();
    vi.mocked(useCases.restricoes.list.execute).mockImplementation(async ({ pagina }) =>
      restricoesPaginaFixture({ total: 22, pagina }),
    );
    const { result } = renderHook(() => useRestricoes(INPUT), { wrapper });
    await waitFor(() => expect(result.current.data?.total).toBe(22));
    await waitFor(() =>
      expect(useCases.restricoes.list.execute).toHaveBeenCalledWith({ aba: 'ativas', pagina: 2 }),
    );
    const query = queryClient.getQueryCache().find({ queryKey: restricoesKeys.list(INPUT) });
    expect(query?.options).toMatchObject({ staleTime: 30_000 });
  });

  it('não faz prefetch na última página e mantém os dados ao trocar de página', async () => {
    const { useCases, wrapper } = setup();
    const segunda = deferred<ReturnType<typeof restricoesPaginaFixture>>();
    vi.mocked(useCases.restricoes.list.execute).mockImplementation(({ pagina }) =>
      pagina === 1 ? Promise.resolve(restricoesPaginaFixture({ total: 8 })) : segunda.promise,
    );
    const { result, rerender } = renderHook(({ input }) => useRestricoes(input), {
      wrapper,
      initialProps: { input: INPUT },
    });
    await waitFor(() => expect(result.current.data?.total).toBe(8));
    expect(useCases.restricoes.list.execute).toHaveBeenCalledTimes(1);
    rerender({ input: { aba: 'ativas', pagina: 2 } });
    expect(result.current.isPlaceholderData).toBe(true);
    expect(result.current.data?.pagina).toBe(1);
    await act(async () => segunda.resolve(restricoesPaginaFixture({ pagina: 2, total: 8 })));
    await waitFor(() => expect(result.current.data?.pagina).toBe(2));
  });

  it('não consulta sem sessão', () => {
    logout();
    const { useCases, wrapper } = setup();
    renderHook(() => useRestricoes(INPUT), { wrapper });
    renderHook(() => useContagemRestricoes(), { wrapper });
    expect(useCases.restricoes.list.execute).not.toHaveBeenCalled();
    expect(useCases.restricoes.contar.execute).not.toHaveBeenCalled();
  });
});

describe('useContagemRestricoes', () => {
  it('carrega os contadores das abas', async () => {
    const { useCases, wrapper } = setup();
    vi.mocked(useCases.restricoes.contar.execute).mockResolvedValue({ ativas: 8, resolvidas: 14 });
    const { result } = renderHook(() => useContagemRestricoes(), { wrapper });
    await waitFor(() => expect(result.current.data).toEqual({ ativas: 8, resolvidas: 14 }));
  });
});

describe('mutações de registrar e atualizar', () => {
  it('registrar invalida restrições, dashboard e badges', async () => {
    const { useCases, queryClient, wrapper } = setup();
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useRegistrarRestricaoMutation(), { wrapper });
    const form = { ...formularioVazio(), tipo: 'mp' as const, desc: 'x' };
    await act(() => result.current.mutateAsync(form));
    expect(useCases.restricoes.registrar.execute).toHaveBeenCalledWith(form);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['restricoes'] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['dashboard'] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['navegacao', 'badges'] });
  });

  it('atualizar repassa o original e o formulário', async () => {
    const { useCases, queryClient, wrapper } = setup();
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useAtualizarRestricaoMutation(), { wrapper });
    const item = restricaoItemFixture();
    await act(() => result.current.mutateAsync({ original: item, form: item.form }));
    expect(useCases.restricoes.atualizar.execute).toHaveBeenCalledWith(item, item.form);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['dashboard'] });
  });
});

describe('useResolverRestricaoMutation (CA-09, CA-12)', () => {
  function prepararCache(queryClient: ReturnType<typeof createTestQueryClient>) {
    queryClient.setQueryData(restricoesKeys.list(INPUT), restricoesPaginaFixture());
    queryClient.setQueryData(restricoesKeys.contagem(), { ativas: 8, resolvidas: 14 });
  }

  it('remove a linha na hora e restaura com toast de erro se a API falhar', async () => {
    const { useCases, queryClient, wrapper } = setup();
    const pendente = deferred<void>();
    vi.mocked(useCases.restricoes.resolver.execute).mockReturnValue(pendente.promise);
    prepararCache(queryClient);
    const { result } = renderHook(() => useResolverRestricaoMutation(INPUT), { wrapper });

    act(() => result.current.mutate('RST-001'));
    await waitFor(() =>
      expect(queryClient.getQueryData(restricoesKeys.list(INPUT))).toMatchObject({ itens: [] }),
    );
    expect(queryClient.getQueryData(restricoesKeys.contagem())).toEqual({
      ativas: 7,
      resolvidas: 15,
    });

    await act(async () => pendente.reject(new Error('500')));
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(queryClient.getQueryData(restricoesKeys.list(INPUT))).toEqual(restricoesPaginaFixture());
    expect(queryClient.getQueryData(restricoesKeys.contagem())).toEqual({
      ativas: 8,
      resolvidas: 14,
    });
    expect(
      await screen.findByText('Não foi possível salvar. Tente novamente.'),
    ).toBeInTheDocument();
  });

  it('com sucesso mostra o toast, invalida as chaves e recarrega a contagem', async () => {
    const { useCases, queryClient, wrapper } = setup();
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(
      () => ({ contagem: useContagemRestricoes(), resolver: useResolverRestricaoMutation(INPUT) }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.contagem.isSuccess).toBe(true));
    await act(() => result.current.resolver.mutateAsync('RST-001'));
    expect(useCases.restricoes.resolver.execute).toHaveBeenCalledWith('RST-001');
    expect(await screen.findByText('Restrição marcada como resolvida.')).toBeInTheDocument();
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['restricoes'] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['dashboard'] });
    await waitFor(() => expect(useCases.restricoes.contar.execute).toHaveBeenCalledTimes(2));
  });

  it('sem cache prévio não cria dados e só mostra o erro', async () => {
    const { useCases, queryClient, wrapper } = setup();
    vi.mocked(useCases.restricoes.resolver.execute).mockRejectedValue(new Error('x'));
    const { result } = renderHook(() => useResolverRestricaoMutation(INPUT), { wrapper });
    await act(async () => {
      await result.current.mutateAsync('RST-001').catch(() => undefined);
    });
    expect(queryClient.getQueryData(restricoesKeys.list(INPUT))).toBeUndefined();
    expect(
      await screen.findByText('Não foi possível salvar. Tente novamente.'),
    ).toBeInTheDocument();
  });
});
