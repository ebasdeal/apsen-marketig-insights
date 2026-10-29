import { FetchHttpClient } from '@infrastructure/http/FetchHttpClient';
import { createFakeFetch } from '@test/fakeFetch';
import { ANALISE_001_API, buildNovaAnaliseForm } from '@test/fixtures/analises';
import { readMockDb } from '@test/fixtures/mockDb';
import { createContainer } from '../../container';
import { createAnalisesModule, esperarMs } from '../analises';

const BASE = 'http://localhost:3001';

const CONFIG = {
  analiseMockResultado: {
    modelo: 'Automático → SARIMAX',
    sumario: 's',
    drivers_impacto: [],
    justificativas: [],
    modelo_info: 'm',
  },
  chatRespostas: [{ gatilhos: [], resposta: 'Ciclo {ciclo}, modelo {modelo}' }],
};

const TOTAL_1 = { 'X-Total-Count': '1' };

const APROVADOS = (readMockDb().aprovacoes as { status: string; id: string; intensidade: number }[])
  .filter((aprovacao) => aprovacao.status === 'aprovado')
  .slice(0, 1);

describe('createAnalisesModule', () => {
  it('compõe os casos de uso sobre o HttpClient', async () => {
    const { fetchFn, calls } = createFakeFetch({
      '/analises': { body: [ANALISE_001_API], headers: { 'X-Total-Count': '2' } },
      '/analises?_sort=codigo': { body: [{ codigo: 'ANL-002' }] },
      '/config': { body: CONFIG },
      '/ciclos': { body: (readMockDb().ciclos as unknown[]).slice(0, 1), headers: TOTAL_1 },
      '/aprovacoes': { body: APROVADOS, headers: { 'X-Total-Count': '9' } },
      '/modelosGuiados': { body: [] },
    });
    const http = new FetchHttpClient({ baseUrl: BASE, fetchFn });
    const esperar = vi.fn().mockResolvedValue(undefined);
    const analises = createAnalisesModule(http, {
      now: () => new Date(2026, 9, 27),
      gerarId: () => 'uuid-1',
      esperar,
    });

    await expect(analises.contar.execute()).resolves.toBe(2);
    await expect(analises.resumo.execute()).resolves.toEqual({ total: 2, salvas: 4 });
    await expect(analises.opcoes.execute()).resolves.toMatchObject({
      ciclos: [{ label: 'PLP-2026-07 · Julho 2026 (ativo)' }],
    });
    await expect(analises.driversSugeridos.execute()).resolves.toMatchObject({
      total: 9,
      itens: [{ id: APROVADOS[0]?.id, intensidade: APROVADOS[0]?.intensidade }],
    });
    expect(
      calls.some(
        (call) => call.url.includes('/aprovacoes?') && call.url.includes('status=aprovado'),
      ),
    ).toBe(true);
    await expect(
      analises.responderChat.execute({ pergunta: 'oi', ciclo: 'PLP-2026-07', modelo: 'SARIMAX' }),
    ).resolves.toBe('Ciclo PLP-2026-07, modelo SARIMAX');
    await analises.executar.execute(buildNovaAnaliseForm()).catch(() => undefined);
    const post = calls.find((call) => call.init?.method === 'POST');
    expect(JSON.parse(String(post?.init?.body))).toMatchObject({
      id: 'uuid-1',
      codigo: 'ANL-003',
      criada: '27/10/2026',
    });
    expect(esperar).toHaveBeenCalledWith(2000);
  });

  it('entra no container e usa relógio, UUID e espera reais por padrão', async () => {
    vi.useFakeTimers({ now: new Date(2026, 9, 27, 10, 0) });
    const { fetchFn, calls } = createFakeFetch({
      '/analises': { body: [], headers: { 'X-Total-Count': '0' } },
      '/config': { body: CONFIG },
    });
    const container = createContainer({ apiUrl: BASE, authMode: 'simulado' }, { fetchFn });
    await expect(container.useCases.analises.contar.execute()).resolves.toBe(0);

    const execucao = container.useCases.analises.executar
      .execute(buildNovaAnaliseForm())
      .catch(() => undefined);
    await vi.advanceTimersByTimeAsync(1999);
    expect(calls.some((call) => call.init?.method === 'POST')).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    await execucao;
    const post = calls.find((call) => call.init?.method === 'POST');
    const body = JSON.parse(String(post?.init?.body)) as { id: string; criada: string };
    expect(body.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(body.criada).toBe('27/10/2026');

    const pronto = vi.fn();
    void esperarMs(10).then(pronto);
    await vi.advanceTimersByTimeAsync(10);
    expect(pronto).toHaveBeenCalled();
    vi.useRealTimers();
  });
});
