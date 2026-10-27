import type { ListAprovacoesResult } from '@application/aprovacoes/dto';
import { FILTRO_VAZIO } from '@domain/aprovacoes/Aprovacao';
import { AprovacaoEmUsoError } from '@domain/aprovacoes/errors';
import type { NavBadges } from '@domain/navegacao/NavBadges';
import { listAprovacoesResult } from '@test/fakes/aprovacoes';
import { NAV_BADGES_FIXTURE } from '@test/fixtures/navBadges';
import {
  createFakeUseCases,
  createTestQueryClient,
  createWrapper,
} from '@test/renderWithProviders';
import { act, renderHook, screen, waitFor } from '@testing-library/react';
import { queryKeys } from '../../queryKeys';
import {
  ajustarBadges,
  ajustarContagem,
  aplicarNaPagina,
  statusAnterior,
} from '../aprovacoesCache';
import { aprovacoesKeys } from '../aprovacoesKeys';
import {
  useAprovarMutation,
  useReabrirMutation,
  useRejeitarMutation,
} from '../useAprovacaoMutations';
import { useAprovacoesPage, useEmUso, usePendentesCount } from '../useAprovacoes';

type Client = ReturnType<typeof createTestQueryClient>;

function setup(overrides: Parameters<typeof createFakeUseCases>[0] = {}) {
  const useCases = createFakeUseCases(overrides);
  const queryClient = createTestQueryClient();
  return { useCases, queryClient, wrapper: createWrapper(useCases, queryClient) };
}

function semear(queryClient: Client) {
  queryClient.setQueryData(aprovacoesKeys.page(FILTRO_VAZIO, 1), listAprovacoesResult(1));
  queryClient.setQueryData(aprovacoesKeys.page(FILTRO_VAZIO, 2), listAprovacoesResult(2));
  queryClient.setQueryData(aprovacoesKeys.pendentes(), 2);
  queryClient.setQueryData(queryKeys.navegacao.badges(), NAV_BADGES_FIXTURE);
}

function estado(queryClient: Client, page = 1) {
  return {
    pagina: queryClient.getQueryData<ListAprovacoesResult>(aprovacoesKeys.page(FILTRO_VAZIO, page)),
    pendentes: queryClient.getQueryData<number>(aprovacoesKeys.pendentes()),
    badge: queryClient.getQueryData<NavBadges>(queryKeys.navegacao.badges())?.aprovacoes,
  };
}

function deferred() {
  let resolve: (value: { toast: string }) => void = () => undefined;
  let reject: (error: unknown) => void = () => undefined;
  const promise = new Promise<{ toast: string }>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe('aprovacoesKeys', () => {
  it('agrupa as chaves em queryKeys', () => {
    expect(queryKeys.aprovacoes).toBe(aprovacoesKeys);
    expect(aprovacoesKeys.page(FILTRO_VAZIO, 2)).toEqual(['aprovacoes', 'page', FILTRO_VAZIO, 2]);
    expect(aprovacoesKeys.pendentes()).toEqual(['aprovacoes', 'pendentes']);
    expect(aprovacoesKeys.emUso()).toEqual(['aprovacoes', 'emUso']);
  });
});

describe('consultas de aprovações', () => {
  it('página com prefetch da próxima e dados anteriores ao filtrar', async () => {
    const { useCases, wrapper } = setup();
    const list = vi.mocked(useCases.aprovacoes.list.execute);
    list.mockImplementation(async ({ page }) => listAprovacoesResult(page));
    const { result, rerender } = renderHook(
      (props: { status: '' | 'aprovado' }) => useAprovacoesPage({ ...FILTRO_VAZIO, ...props }, 1),
      { wrapper, initialProps: { status: '' } },
    );
    await waitFor(() => expect(result.current.data?.cards).toHaveLength(5));
    await waitFor(() => expect(list).toHaveBeenCalledWith({ filtro: FILTRO_VAZIO, page: 2 }));
    list.mockImplementationOnce(() => new Promise(() => undefined));
    rerender({ status: 'aprovado' });
    expect(result.current.isPlaceholderData).toBe(true);
    expect(result.current.data?.cards[0]?.id).toBe('DRV-2026-034');
  });

  it('pendentes (30 s) e em uso (5 min)', async () => {
    const { queryClient, wrapper } = setup();
    const pendentes = renderHook(() => usePendentesCount(), { wrapper });
    const emUso = renderHook(() => useEmUso(), { wrapper });
    await waitFor(() => expect(pendentes.result.current.data).toBe(2));
    await waitFor(() => expect(emUso.result.current.data).toContain('DRV-2026-028'));
    const cache = queryClient.getQueryCache();
    expect(cache.find({ queryKey: aprovacoesKeys.pendentes() })?.options).toMatchObject({
      staleTime: 30_000,
    });
    expect(cache.find({ queryKey: aprovacoesKeys.emUso() })?.options).toMatchObject({
      staleTime: 300_000,
    });
  });
});

describe('decisões otimistas (CA-05, CA-07, CA-09)', () => {
  it('aprovar muda card, pendentes e badge antes da API e mostra o toast', async () => {
    const api = deferred();
    const { queryClient, wrapper } = setup({
      aprovacoes: { aprovar: { execute: () => api.promise } },
    });
    semear(queryClient);
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useAprovarMutation(), { wrapper });
    act(() => result.current.mutate('DRV-2026-034'));
    await waitFor(() => expect(estado(queryClient).pendentes).toBe(1));
    expect(estado(queryClient).badge).toBe(1);
    expect(estado(queryClient).pagina?.cards[0]).toMatchObject({
      status: 'aprovado',
      statusTone: 'green',
    });
    expect(estado(queryClient).pagina?.pendentesNoResultado).toBe(1);
    expect(estado(queryClient, 2).pagina?.pendentesNoResultado).toBe(2);
    api.resolve({ toast: '✅ DRV-2026-034 aprovado e enviado para ingestão!' });
    expect(await screen.findByText('DRV-2026-034 aprovado', { exact: false })).toBeInTheDocument();
    await waitFor(() => expect(invalidate).toHaveBeenCalledWith({ queryKey: aprovacoesKeys.all }));
    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.navegacao.badges() });
  });

  it('falha desfaz card, contadores e badge e mostra o toast de falha', async () => {
    const api = deferred();
    const { queryClient, wrapper } = setup({
      aprovacoes: { aprovar: { execute: () => api.promise } },
    });
    semear(queryClient);
    const { result } = renderHook(() => useAprovarMutation(), { wrapper });
    act(() => result.current.mutate('DRV-2026-034'));
    await waitFor(() => expect(estado(queryClient).pendentes).toBe(1));
    api.reject(new Error('500'));
    await waitFor(() => expect(estado(queryClient).pendentes).toBe(2));
    expect(estado(queryClient).badge).toBe(2);
    expect(estado(queryClient).pagina?.cards[0]?.status).toBe('pendente');
    expect(
      await screen.findByText('Não foi possível salvar as alterações', { exact: false }),
    ).toBeInTheDocument();
  });

  it('rejeitar grava motivo e justificativa no card', async () => {
    const { useCases, queryClient, wrapper } = setup();
    semear(queryClient);
    const { result } = renderHook(() => useRejeitarMutation(), { wrapper });
    const input = { id: 'DRV-2026-033', motivo: 'Outro', justificativa: 'Sem fonte.' };
    act(() => result.current.mutate(input));
    await waitFor(() =>
      expect(estado(queryClient).pagina?.cards[1]).toMatchObject({
        status: 'rejeitado',
        motivo: 'Outro',
        justificativa: 'Sem fonte.',
      }),
    );
    expect(useCases.aprovacoes.rejeitar.execute).toHaveBeenCalledWith(input);
    expect(await screen.findByText('DRV-2026-033 rejeitado', { exact: false })).toBeInTheDocument();
  });

  it('reabrir volta a pendente (+1); em uso mostra a mensagem do domínio', async () => {
    const reabrir = vi
      .fn()
      .mockResolvedValueOnce({ toast: '↩️ Decisão reaberta — driver voltou para pendente.' })
      .mockRejectedValueOnce(new AprovacaoEmUsoError());
    const { queryClient, wrapper } = setup({ aprovacoes: { reabrir: { execute: reabrir } } });
    semear(queryClient);
    vi.spyOn(queryClient, 'invalidateQueries').mockResolvedValue();
    const { result } = renderHook(() => useReabrirMutation(), { wrapper });
    await act(() => result.current.mutateAsync('DRV-2026-026'));
    expect(estado(queryClient).pendentes).toBe(3);
    expect(estado(queryClient, 2).pagina?.cards.find((c) => c.id === 'DRV-2026-026')).toMatchObject(
      {
        status: 'pendente',
        motivo: '',
      },
    );
    expect(await screen.findByText('Decisão reaberta', { exact: false })).toBeInTheDocument();
    await act(() => result.current.mutateAsync('DRV-2026-028').catch(() => undefined));
    expect(
      await screen.findByText('Driver em uso no Data Lake', { exact: false }),
    ).toBeInTheDocument();
  });
});

describe('aprovacoesCache', () => {
  it('status anterior, página sem o card e contadores ausentes', () => {
    const pagina = listAprovacoesResult(1);
    expect(
      statusAnterior([undefined, pagina], { id: 'DRV-2026-034', decisao: { tipo: 'aprovar' } }),
    ).toBe('pendente');
    expect(statusAnterior([], { id: 'X', decisao: { tipo: 'reabrir' } })).toBe('aprovado');
    expect(statusAnterior([], { id: 'X', decisao: { tipo: 'aprovar' } })).toBe('pendente');
    expect(aplicarNaPagina(pagina, { id: 'X', decisao: { tipo: 'aprovar' } })).toBe(pagina);
    expect(aplicarNaPagina(undefined, { id: 'X', decisao: { tipo: 'aprovar' } })).toBeUndefined();
    expect(ajustarContagem(undefined, -1)).toBeUndefined();
    expect(ajustarContagem(0, -1)).toBe(0);
    expect(ajustarBadges(undefined, 1)).toBeUndefined();
    const semContagem = { ...NAV_BADGES_FIXTURE, aprovacoes: null };
    expect(ajustarBadges(semContagem, 1)).toBe(semContagem);
  });
});
