import type { AnaliseDetailOutput } from '@application/analises/dto';
import {
  buildAnaliseDetail,
  buildListAnalisesOutput,
  buildNovaAnaliseForm,
} from '@test/fixtures/analises';
import {
  createFakeUseCases,
  createTestQueryClient,
  createWrapper,
} from '@test/renderWithProviders';
import { act, renderHook, waitFor } from '@testing-library/react';
import { queryKeys } from '../../queryKeys';
import { analisesKeys, DASHBOARD_ROOT_KEY } from '../analisesKeys';
import {
  useAnalise,
  useAnalises,
  useDriversSugeridos,
  useNovaAnaliseOpcoes,
  useSkusDoCiclo,
  useTotalAnalises,
} from '../useAnalises';
import {
  useDocumentarInteracaoMutation,
  useExecutarAnaliseMutation,
  useExportarPdfMutation,
  useResponderChatMutation,
  useSalvarAnaliseMutation,
} from '../useAnalisesMutations';

function setup(overrides: Parameters<typeof createFakeUseCases>[0] = {}) {
  const useCases = createFakeUseCases(overrides);
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

describe('analisesKeys', () => {
  it('agrupa as chaves sob ["analises"] e entra em queryKeys', () => {
    const input = { busca: 'bari', status: 'salva' as const, pagina: 1 };
    expect(queryKeys.analises).toBe(analisesKeys);
    expect(analisesKeys.all).toEqual(['analises']);
    expect(analisesKeys.list(input)).toEqual(['analises', 'list', input]);
    expect(analisesKeys.total()).toEqual(['analises', 'total']);
    expect(analisesKeys.detail('ANL-001')).toEqual(['analises', 'detail', 'ANL-001']);
    expect(analisesKeys.opcoes()).toEqual(['analises', 'opcoes']);
    expect(analisesKeys.skusCiclo('PLP-2026-07')).toEqual(['analises', 'skusCiclo', 'PLP-2026-07']);
    expect(analisesKeys.driversSugeridos()).toEqual(['analises', 'driversSugeridos']);
    expect(DASHBOARD_ROOT_KEY).toEqual(['dashboard']);
  });
});

describe('queries de análises', () => {
  it('useAnalises lista e mantém a página anterior enquanto carrega a próxima', async () => {
    const { useCases, queryClient, wrapper } = setup();
    const primeira = buildListAnalisesOutput();
    let resolver: (value: typeof primeira) => void = () => undefined;
    vi.mocked(useCases.analises.list.execute)
      .mockResolvedValueOnce(primeira)
      .mockImplementationOnce(() => new Promise((resolve) => (resolver = resolve)));
    const { result, rerender } = renderHook(
      ({ pagina }) => useAnalises({ busca: '', status: '', pagina }),
      { wrapper, initialProps: { pagina: 1 } },
    );
    await waitFor(() => expect(result.current.data).toEqual(primeira));
    rerender({ pagina: 2 });
    await waitFor(() => expect(useCases.analises.list.execute).toHaveBeenCalledTimes(2));
    expect(result.current.data).toEqual(primeira);
    expect(result.current.isPlaceholderData).toBe(true);
    act(() => resolver({ ...primeira, pagina: 2 }));
    await waitFor(() => expect(result.current.data?.pagina).toBe(2));
    expect(useCases.analises.list.execute).toHaveBeenLastCalledWith({
      busca: '',
      status: '',
      pagina: 2,
    });
    expect(staleTimeOf(queryClient, analisesKeys.list({ busca: '', status: '', pagina: 2 }))).toBe(
      30_000,
    );
  });

  it('useTotalAnalises, useAnalise e useNovaAnaliseOpcoes', async () => {
    const { useCases, queryClient, wrapper } = setup();
    const total = renderHook(() => useTotalAnalises(), { wrapper });
    const detalhe = renderHook(() => useAnalise('ANL-001'), { wrapper });
    const opcoes = renderHook(() => useNovaAnaliseOpcoes(), { wrapper });
    await waitFor(() => expect(total.result.current.data).toBe(2));
    await waitFor(() => expect(detalhe.result.current.data?.id).toBe('ANL-001'));
    await waitFor(() => expect(opcoes.result.current.isSuccess).toBe(true));
    expect(useCases.analises.get.execute).toHaveBeenCalledWith('ANL-001');
    expect(staleTimeOf(queryClient, analisesKeys.opcoes())).toBe(300_000);
  });

  it('useSkusDoCiclo só consulta com ciclo; useDriversSugeridos respeita enabled', async () => {
    const { useCases, queryClient, wrapper } = setup();
    const { rerender } = renderHook(({ ciclo }) => useSkusDoCiclo(ciclo), {
      wrapper,
      initialProps: { ciclo: '' },
    });
    const drivers = renderHook(({ on }) => useDriversSugeridos(on), {
      wrapper,
      initialProps: { on: false },
    });
    expect(useCases.analises.skusDoCiclo.execute).not.toHaveBeenCalled();
    expect(useCases.analises.driversSugeridos.execute).not.toHaveBeenCalled();
    rerender({ ciclo: 'PLP-2026-07' });
    drivers.rerender({ on: true });
    await waitFor(() =>
      expect(useCases.analises.skusDoCiclo.execute).toHaveBeenCalledWith('PLP-2026-07'),
    );
    await waitFor(() => expect(drivers.result.current.isSuccess).toBe(true));
    expect(staleTimeOf(queryClient, analisesKeys.skusCiclo('PLP-2026-07'))).toBe(300_000);
  });
});

describe('mutações de análises (CA-15 / RN-13)', () => {
  it('executar invalida análises, dashboard e badges; o total é recarregado', async () => {
    const { useCases, queryClient, wrapper } = setup();
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
    const total = renderHook(() => useTotalAnalises(), { wrapper });
    await waitFor(() => expect(total.result.current.data).toBe(2));
    vi.mocked(useCases.analises.contar.execute).mockResolvedValue(3);
    const { result } = renderHook(() => useExecutarAnaliseMutation(), { wrapper });
    await act(() => result.current.mutateAsync(buildNovaAnaliseForm()));
    expect(useCases.analises.executar.execute).toHaveBeenCalledWith(buildNovaAnaliseForm());
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['analises'] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['dashboard'] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['navegacao', 'badges'] });
    await waitFor(() => expect(total.result.current.data).toBe(3));
    expect(useCases.analises.contar.execute).toHaveBeenCalledTimes(2);
  });

  it('salvar atualiza o status do detalhe de forma otimista', async () => {
    const { useCases, queryClient, wrapper } = setup();
    const key = analisesKeys.detail('ANL-001');
    queryClient.setQueryData(key, buildAnaliseDetail({ status: 'rascunho' }));
    let concluir: () => void = () => undefined;
    vi.mocked(useCases.analises.salvar.execute).mockImplementation(
      () => new Promise((resolve) => (concluir = () => resolve('salva'))),
    );
    const { result } = renderHook(() => useSalvarAnaliseMutation(), { wrapper });
    act(() => result.current.mutate('ANL-001'));
    await waitFor(() =>
      expect(queryClient.getQueryData<AnaliseDetailOutput>(key)).toMatchObject({
        status: 'salva',
        statusLabel: '✅ Salva',
        podeExportarPdf: true,
      }),
    );
    act(() => concluir());
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('salvar com erro faz rollback do detalhe', async () => {
    const { useCases, queryClient, wrapper } = setup();
    const key = analisesKeys.detail('ANL-001');
    const anterior = buildAnaliseDetail({ status: 'rascunho' });
    queryClient.setQueryData(key, anterior);
    vi.mocked(useCases.analises.salvar.execute).mockRejectedValue(new Error('500'));
    const { result } = renderHook(() => useSalvarAnaliseMutation(), { wrapper });
    await act(() => result.current.mutateAsync('ANL-001').catch(() => undefined));
    expect(queryClient.getQueryData(key)).toEqual(anterior);
    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it('exportar marca relatório de forma otimista; sem detalhe em cache só chama o caso de uso', async () => {
    const { useCases, queryClient, wrapper } = setup();
    const key = analisesKeys.detail('ANL-001');
    queryClient.setQueryData(key, buildAnaliseDetail({ status: 'salva' }));
    const { result } = renderHook(() => useExportarPdfMutation(), { wrapper });
    await act(() => result.current.mutateAsync('ANL-001'));
    expect(useCases.analises.exportarPdf.execute).toHaveBeenCalledWith('ANL-001');
    expect(queryClient.getQueryData<AnaliseDetailOutput>(key)?.status).toBe('relatorio');

    vi.mocked(useCases.analises.exportarPdf.execute).mockRejectedValueOnce(new Error('x'));
    await act(() => result.current.mutateAsync('ANL-999').catch(() => undefined));
    expect(queryClient.getQueryData(analisesKeys.detail('ANL-999'))).toBeUndefined();
  });

  it('documentar interação invalida; responder chat só chama o caso de uso', async () => {
    const { useCases, queryClient, wrapper } = setup();
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
    const documentar = renderHook(() => useDocumentarInteracaoMutation(), { wrapper });
    const input = { id: 'ANL-001', pergunta: 'p', resposta: 'r' };
    await act(() => documentar.result.current.mutateAsync(input));
    expect(useCases.analises.documentarInteracao.execute).toHaveBeenCalledWith(input);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['analises'] });

    invalidate.mockClear();
    const chat = renderHook(() => useResponderChatMutation(), { wrapper });
    const pergunta = { pergunta: 'qual o lag?', ciclo: 'PLP-2026-07', modelo: 'SARIMAX' };
    await expect(act(() => chat.result.current.mutateAsync(pergunta))).resolves.toBe(
      'Resposta da IA',
    );
    expect(useCases.analises.responderChat.execute).toHaveBeenCalledWith(pergunta);
    expect(invalidate).not.toHaveBeenCalled();
  });
});
