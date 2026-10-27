import type { CiclosPageDto, CiclosResumoDto } from '@application/ciclos/dto';
import { CicloValidationError } from '@domain/ciclos/CicloValidationError';
import { HttpError } from '@infrastructure/http/HttpClient';
import { createFakeCiclosUseCases } from '@test/fakes/ciclos';
import {
  CICLO_RASCUNHO,
  CICLOS_PAGE_FIXTURE,
  CICLOS_RESUMO_FIXTURE,
  cicloRow,
} from '@test/fixtures/ciclos';
import {
  createFakeUseCases,
  createTestQueryClient,
  createWrapper,
} from '@test/renderWithProviders';
import { logout } from '@test/resetStores';
import { act, renderHook, screen, waitFor } from '@testing-library/react';
import { queryKeys } from '../../queryKeys';
import { ciclosKeys } from '../ciclosKeys';
import { useSaveCicloMutation, useToggleCicloMutation } from '../useCicloMutations';
import { useCiclosPage, useCiclosResumo } from '../useCiclos';

const FALHA = 'Não foi possível salvar as alterações. Tente novamente.';

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function setup(ciclos = createFakeCiclosUseCases()) {
  const useCases = createFakeUseCases({ ciclos });
  const queryClient = createTestQueryClient();
  return { useCases, queryClient, wrapper: createWrapper(useCases, queryClient) };
}

describe('ciclosKeys', () => {
  it('agrupa as chaves do módulo em queryKeys', () => {
    expect(queryKeys.ciclos.all).toEqual(['ciclos']);
    expect(queryKeys.ciclos.page({ page: 2, size: 10 })).toEqual([
      'ciclos',
      'page',
      { page: 2, size: 10 },
    ]);
    expect(queryKeys.ciclos.resumo()).toEqual(['ciclos', 'resumo']);
  });
});

describe('useCiclosPage', () => {
  it('pede a página com staleTime de 30 s', async () => {
    const { useCases, queryClient, wrapper } = setup();
    const { result } = renderHook(() => useCiclosPage({ page: 2, size: 10 }), { wrapper });
    await waitFor(() => expect(result.current.data).toEqual(CICLOS_PAGE_FIXTURE));
    expect(useCases.ciclos.list.execute).toHaveBeenCalledWith({ page: 2, size: 10 });
    const query = queryClient
      .getQueryCache()
      .find({ queryKey: ciclosKeys.page({ page: 2, size: 10 }) });
    expect(query?.options).toMatchObject({ staleTime: 30_000 });
  });

  it('mantém os dados anteriores na troca e faz prefetch da próxima página', async () => {
    const page = (n: number): CiclosPageDto => ({
      total: 25,
      totalPages: 3,
      rows: [{ ...cicloRow(CICLO_RASCUNHO), id: `p${n}` }],
    });
    const firstId = (data: CiclosPageDto | undefined) => data?.rows[0]?.id;
    const execute = vi.fn(async ({ page: n }: { page: number }) => page(n));
    const { queryClient, wrapper } = setup(createFakeCiclosUseCases({ list: { execute } }));
    const { result, rerender } = renderHook(({ p }) => useCiclosPage({ page: p, size: 10 }), {
      wrapper,
      initialProps: { p: 1 },
    });
    await waitFor(() => expect(execute).toHaveBeenCalledWith({ page: 2, size: 10 }));
    await waitFor(() =>
      expect(queryClient.getQueryData(ciclosKeys.page({ page: 2, size: 10 }))).toBeDefined(),
    );
    const slow = deferred<CiclosPageDto>();
    execute.mockImplementationOnce(() => slow.promise);
    queryClient.removeQueries({ queryKey: ciclosKeys.page({ page: 2, size: 10 }) });
    rerender({ p: 2 });
    expect(result.current.isPlaceholderData).toBe(true);
    expect(firstId(result.current.data)).toBe('p1');
    await act(async () => slow.resolve(page(2)));
    await waitFor(() => expect(result.current.isPlaceholderData).toBe(false));
    expect(firstId(result.current.data)).toBe('p2');
    rerender({ p: 3 });
    await waitFor(() => expect(firstId(result.current.data)).toBe('p3'));
    expect(execute).not.toHaveBeenCalledWith({ page: 4, size: 10 });
  });

  it('não busca sem sessão', () => {
    logout();
    const { useCases, wrapper } = setup();
    renderHook(() => useCiclosPage({ page: 1, size: 10 }), { wrapper });
    renderHook(() => useCiclosResumo(), { wrapper });
    expect(useCases.ciclos.list.execute).not.toHaveBeenCalled();
    expect(useCases.ciclos.resumo.execute).not.toHaveBeenCalled();
  });
});

describe('useCiclosResumo', () => {
  it('carrega o resumo', async () => {
    const { wrapper } = setup();
    const { result } = renderHook(() => useCiclosResumo(), { wrapper });
    await waitFor(() => expect(result.current.data).toEqual(CICLOS_RESUMO_FIXTURE));
  });
});

describe('useSaveCicloMutation', () => {
  const INPUT = {
    modo: 'novo' as const,
    draft: {
      descricao: 'Agosto',
      inicio: '2026-08-01',
      fim: '2026-08-31',
      responsavel: 'Ana Planejadora',
      ativar: false,
    },
  };

  it('CA-08 mostra o toast e invalida ciclos e badges', async () => {
    const { useCases, queryClient, wrapper } = setup();
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useSaveCicloMutation(), { wrapper });
    await act(() => result.current.mutateAsync(INPUT));
    expect(useCases.ciclos.save.execute).toHaveBeenCalledWith(INPUT);
    expect(await screen.findByText('Ciclo criado!')).toBeInTheDocument();
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['ciclos'] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.navegacao.badges() });
  });

  it('RN-04 erro de validação mostra a primeira mensagem', async () => {
    const execute = vi
      .fn()
      .mockRejectedValue(new CicloValidationError({ descricao: '⚠️ Informe a descrição.' }));
    const { wrapper } = setup(createFakeCiclosUseCases({ save: { execute } }));
    const { result } = renderHook(() => useSaveCicloMutation(), { wrapper });
    await act(() => result.current.mutateAsync(INPUT).catch(() => undefined));
    expect(await screen.findByText('Informe a descrição.')).toBeInTheDocument();
    expect(result.current.error).toBeInstanceOf(CicloValidationError);
  });

  it('CA-10 falha HTTP mostra o toast de falha', async () => {
    const execute = vi.fn().mockRejectedValue(new HttpError(500, '/ciclos', {}));
    const { wrapper } = setup(createFakeCiclosUseCases({ save: { execute } }));
    const { result } = renderHook(() => useSaveCicloMutation(), { wrapper });
    await act(() => result.current.mutateAsync(INPUT).catch(() => undefined));
    expect(await screen.findByText(FALHA)).toBeInTheDocument();
  });
});

describe('useToggleCicloMutation', () => {
  const RASCUNHO = cicloRow(CICLO_RASCUNHO);
  const PAGE: CiclosPageDto = {
    ...CICLOS_PAGE_FIXTURE,
    rows: [...CICLOS_PAGE_FIXTURE.rows, RASCUNHO],
  };

  function seeded(ciclos = createFakeCiclosUseCases()) {
    const context = setup(ciclos);
    context.queryClient.setQueryData(ciclosKeys.page({ page: 1, size: 10 }), PAGE);
    context.queryClient.setQueryData(ciclosKeys.resumo(), CICLOS_RESUMO_FIXTURE);
    return context;
  }

  const statuses = (data: CiclosPageDto | undefined) => data?.rows.map((row) => row.status);

  it('CA-05 atualiza na hora e volta ao estado anterior quando a API falha', async () => {
    const pending = deferred<never>();
    const { queryClient, wrapper } = seeded(
      createFakeCiclosUseCases({ toggle: { execute: vi.fn(() => pending.promise) } }),
    );
    const { result } = renderHook(() => useToggleCicloMutation(), { wrapper });
    act(() => result.current.mutate({ id: 'PLP-2026-07', ativo: false }));
    await waitFor(() =>
      expect(statuses(queryClient.getQueryData(ciclosKeys.page({ page: 1, size: 10 })))).toEqual([
        'encerrado',
        'encerrado',
        'encerrado',
        'rascunho',
      ]),
    );
    expect(queryClient.getQueryData<CiclosResumoDto>(ciclosKeys.resumo())?.ativo).toBeNull();
    await act(async () => pending.reject(new HttpError(500, '/ciclos', {})));
    expect(await screen.findByText(FALHA)).toBeInTheDocument();
    expect(queryClient.getQueryData(ciclosKeys.resumo())).toEqual(CICLOS_RESUMO_FIXTURE);
    expect(statuses(queryClient.getQueryData(ciclosKeys.page({ page: 1, size: 10 })))).toEqual([
      'ativo',
      'encerrado',
      'encerrado',
      'rascunho',
    ]);
  });

  it('CA-06 ligar um rascunho reflete os dois ciclos e mostra o toast', async () => {
    const { useCases, queryClient, wrapper } = seeded();
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useToggleCicloMutation(), { wrapper });
    await act(() => result.current.mutateAsync({ id: RASCUNHO.id, ativo: true }));
    expect(useCases.ciclos.toggle.execute).toHaveBeenCalledWith({ id: RASCUNHO.id, ativo: true });
    expect(await screen.findByText('Ciclo ativado como ciclo corrente.')).toBeInTheDocument();
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['ciclos'] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.navegacao.badges() });
  });

  it('funciona sem dados em cache', async () => {
    const { queryClient, wrapper } = setup();
    queryClient
      .getQueryCache()
      .build(queryClient, { queryKey: ciclosKeys.page({ page: 1, size: 10 }) });
    const { result } = renderHook(() => useToggleCicloMutation(), { wrapper });
    await act(() => result.current.mutateAsync({ id: 'x', ativo: true }));
    expect(queryClient.getQueryData(ciclosKeys.resumo())).toBeUndefined();
    expect(queryClient.getQueryData(ciclosKeys.page({ page: 1, size: 10 }))).toBeUndefined();
  });
});
