import type { AgentesPageDto, AgentesResumoDto, TestarAgenteDto } from '@application/agentes/dto';
import { createFakeAgentesUseCases } from '@test/fakes/agentes';
import {
  AGENTE_FORM_FIXTURE,
  AGENTES_PAGE_FIXTURE,
  AGENTES_RESUMO_FIXTURE,
} from '@test/fixtures/agentes';
import {
  createFakeUseCases,
  createTestQueryClient,
  createWrapper,
} from '@test/renderWithProviders';
import { act, renderHook, screen, waitFor } from '@testing-library/react';
import { queryKeys } from '../../queryKeys';
import { aplicarAtivoNoResumo, restaurarAgentes } from '../agentesCache';
import {
  esperar,
  TESTE_MIN_MS,
  useSaveAgenteMutation,
  useTestarAgenteMutation,
  useToggleAgenteMutation,
} from '../useAgenteMutations';

const PAGE_KEY = queryKeys.agentes.page(1);
const REGULATORIO = { id: 'AG-001', papel: '🏛️ Agente Regulatório', schedule: 'Diário · 03h00' };
const CLINICO = { id: 'AG-004', papel: '📄 Agente Clínico', schedule: 'Semanal · Dom 02h' };

function deferred<T>() {
  let resolve: (value: T) => void = () => undefined;
  let reject: (reason: unknown) => void = () => undefined;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function setup(agentes = createFakeAgentesUseCases()) {
  const useCases = createFakeUseCases({ agentes });
  const queryClient = createTestQueryClient();
  queryClient.setQueryData(PAGE_KEY, AGENTES_PAGE_FIXTURE);
  queryClient.setQueryData(queryKeys.agentes.resumo(), AGENTES_RESUMO_FIXTURE);
  const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
  return { useCases, queryClient, invalidate, wrapper: createWrapper(useCases, queryClient) };
}

function linha(queryClient: ReturnType<typeof createTestQueryClient>, id: string) {
  return queryClient.getQueryData<AgentesPageDto>(PAGE_KEY)?.rows.find((row) => row.id === id);
}

function resumo(queryClient: ReturnType<typeof createTestQueryClient>) {
  return queryClient.getQueryData<AgentesResumoDto>(queryKeys.agentes.resumo());
}

function invalidatedKeys(invalidate: { mock: { calls: unknown[][] } }) {
  return invalidate.mock.calls.map((call) => (call[0] as { queryKey: unknown }).queryKey);
}

describe('useSaveAgenteMutation', () => {
  it('salva e invalida agentes.all e os badges', async () => {
    const { useCases, invalidate, wrapper } = setup();
    const { result } = renderHook(() => useSaveAgenteMutation(), { wrapper });
    await act(() => result.current.mutateAsync({ draft: AGENTE_FORM_FIXTURE.draft }));
    expect(useCases.agentes.save.execute).toHaveBeenCalledWith({
      draft: AGENTE_FORM_FIXTURE.draft,
    });
    expect(invalidatedKeys(invalidate)).toEqual([['agentes'], ['navegacao', 'badges']]);
  });
});

describe('useToggleAgenteMutation (CA-03)', () => {
  it('ativa na hora, atualiza o resumo e mostra o toast', async () => {
    const { useCases, queryClient, invalidate, wrapper } = setup();
    const { result } = renderHook(() => useToggleAgenteMutation(), { wrapper });
    await act(() => result.current.mutateAsync({ ...CLINICO, ativo: true }));
    expect(useCases.agentes.toggle.execute).toHaveBeenCalledWith({
      id: 'AG-004',
      papel: '📄 Agente Clínico',
      ativo: true,
    });
    expect(linha(queryClient, 'AG-004')?.ativo).toBe(true);
    expect(resumo(queryClient)?.resumoTexto).toBe('5 agentes cadastrados · 4 ativos');
    expect(await screen.findByText('📄 Agente ativado.')).toBeInTheDocument();
    expect(invalidatedKeys(invalidate)).toEqual([['agentes'], ['navegacao', 'badges']]);
  });

  it('dado falha, então otimista e rollback com toast de falha', async () => {
    const pending = deferred<{ toast: string }>();
    const toggle = { execute: vi.fn(() => pending.promise) };
    const { queryClient, wrapper } = setup(createFakeAgentesUseCases({ toggle }));
    const { result } = renderHook(() => useToggleAgenteMutation(), { wrapper });
    act(() => result.current.mutate({ ...REGULATORIO, ativo: false }));
    await waitFor(() => expect(linha(queryClient, 'AG-001')?.ativo).toBe(false));
    expect(resumo(queryClient)).toMatchObject({
      ativos: 2,
      proxima: { nome: 'Agente Concorrência', hora: '04h00' },
    });
    await act(async () => pending.reject(new Error('500')));
    await waitFor(() => expect(linha(queryClient, 'AG-001')?.ativo).toBe(true));
    expect(resumo(queryClient)?.resumoTexto).toBe('5 agentes cadastrados · 3 ativos');
    expect(
      await screen.findByText(/Não foi possível salvar as alterações\. Tente novamente\./),
    ).toBeInTheDocument();
  });

  it('sem resumo nem página carregados, o toggle não cria dados no cache', async () => {
    const { queryClient, wrapper } = setup();
    queryClient.removeQueries({ queryKey: queryKeys.agentes.all });
    void queryClient.prefetchQuery({
      queryKey: queryKeys.agentes.page(2),
      queryFn: () => new Promise<never>(() => undefined),
    });
    const { result } = renderHook(() => useToggleAgenteMutation(), { wrapper });
    await act(() => result.current.mutateAsync({ ...CLINICO, ativo: true }));
    expect(resumo(queryClient)).toBeUndefined();
    expect(queryClient.getQueryData(queryKeys.agentes.page(2))).toBeUndefined();
  });

  it('regras de cache sem dados ou sem mudança', () => {
    expect(aplicarAtivoNoResumo(AGENTES_RESUMO_FIXTURE, { ...REGULATORIO, ativo: true })).toBe(
      AGENTES_RESUMO_FIXTURE,
    );
    const queryClient = createTestQueryClient();
    const set = vi.spyOn(queryClient, 'setQueryData');
    restaurarAgentes(queryClient, undefined);
    expect(set).not.toHaveBeenCalled();
  });
});

describe('useTestarAgenteMutation (CA-04)', () => {
  it('toast inicial, aguarda o mínimo de 1,8 s e atualiza a célula', async () => {
    const espera = deferred<void>();
    const wait = vi.fn(() => espera.promise);
    const { useCases, queryClient, wrapper } = setup();
    const { result } = renderHook(() => useTestarAgenteMutation({ wait }), { wrapper });
    act(() => result.current.mutate(REGULATORIO));
    expect(await screen.findByText('⟳ Testando 🏛️ Agente...')).toBeInTheDocument();
    expect(wait).toHaveBeenCalledWith(TESTE_MIN_MS);
    await waitFor(() => expect(useCases.agentes.testar.execute).toHaveBeenCalled());
    expect(result.current.isPending).toBe(true);
    await act(async () => espera.resolve());
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(linha(queryClient, 'AG-001')?.ultimoTeste).toEqual({
      status: 'ok',
      ts: '27/10/2026 14:05',
    });
    expect(await screen.findByText('Conexão OK — 🏛️ Agente')).toBeInTheDocument();
  });

  it('rejeição mostra "Falha ao conectar"', async () => {
    const testar = {
      execute: vi.fn<() => Promise<TestarAgenteDto>>().mockRejectedValue(new Error('x')),
    };
    const { wrapper } = setup(createFakeAgentesUseCases({ testar }));
    const { result } = renderHook(() => useTestarAgenteMutation({ wait: async () => undefined }), {
      wrapper,
    });
    await act(() => result.current.mutateAsync(REGULATORIO).catch(() => undefined));
    expect(await screen.findByText('Falha ao conectar — 🏛️ Agente')).toBeInTheDocument();
  });

  it('esperar usa setTimeout', async () => {
    vi.useFakeTimers();
    const done = vi.fn();
    void esperar(TESTE_MIN_MS).then(done);
    await vi.advanceTimersByTimeAsync(TESTE_MIN_MS - 1);
    expect(done).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(done).toHaveBeenCalled();
    vi.useRealTimers();
  });
});
