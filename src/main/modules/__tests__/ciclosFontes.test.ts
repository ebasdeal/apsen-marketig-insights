import { createFakeHttpClient } from '@test/fakeHttpClient';
import { CICLO_DTOS_FIXTURE } from '@test/fixtures/ciclos';
import { FONTE_DTOS_FIXTURE } from '@test/fixtures/fontes';
import { createCiclosModule } from '../ciclos';
import { createFontesModule } from '../fontes';

describe('createCiclosModule', () => {
  it('monta os casos de uso sobre o HttpClient com o relógio injetado', async () => {
    const http = createFakeHttpClient({
      getPage: async () => ({ data: CICLO_DTOS_FIXTURE, total: 3 }),
      get: async () => CICLO_DTOS_FIXTURE,
      post: async (_path, body) => body,
      patch: async () => CICLO_DTOS_FIXTURE[0],
    });
    const ciclos = createCiclosModule(http, () => new Date(2026, 9, 27));
    await expect(ciclos.list.execute({ page: 1, size: 10 })).resolves.toMatchObject({ total: 3 });
    await expect(ciclos.resumo.execute()).resolves.toMatchObject({ proximoCodigo: 'PLP-2026-08' });
    await ciclos.save.execute({
      modo: 'novo',
      draft: {
        descricao: 'Agosto',
        inicio: '2026-08-01',
        fim: '2026-08-31',
        responsavel: 'Ana Planejadora',
        ativar: false,
      },
    });
    expect(http.post.mock.calls[0]?.[1]).toMatchObject({
      codigo: 'PLP-2026-08',
      meta: 'Criado em 27/10/2026 · v1',
    });
    expect(String(http.post.mock.calls[0]?.[1]?.id)).toMatch(/^[0-9a-f-]{36}$/);
    await expect(ciclos.toggle.execute({ id: 'PLP-2026-07', ativo: false })).resolves.toMatchObject(
      { encerradoId: null },
    );
  });

  it('usa a data atual por padrão', async () => {
    const http = createFakeHttpClient({
      getPage: async () => ({ data: [], total: 0 }),
      get: async () => [],
    });
    const ciclos = createCiclosModule(http);
    expect(Object.keys(ciclos)).toEqual(['list', 'resumo', 'save', 'toggle']);
    const hoje = new Date();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    await expect(ciclos.resumo.execute()).resolves.toMatchObject({
      proximoCodigo: `PLP-${hoje.getFullYear()}-${mes}`,
    });
  });
});

describe('createFontesModule', () => {
  it('monta os casos de uso sobre o HttpClient', async () => {
    const http = createFakeHttpClient({
      getPage: async () => ({ data: FONTE_DTOS_FIXTURE, total: 4 }),
      get: async () => FONTE_DTOS_FIXTURE,
      post: async (_path, body) => body,
      patch: async () => FONTE_DTOS_FIXTURE[0],
      delete: async () => ({}),
    });
    const fontes = createFontesModule(http);
    await expect(fontes.list.execute({ page: 1, size: 10 })).resolves.toMatchObject({ total: 4 });
    await expect(fontes.options.execute()).resolves.toHaveLength(4);
    await expect(
      fontes.create.execute({
        nome: 'Distribuidores',
        icon: '🚚',
        desc: '',
        modo: 'mock',
        url: '',
        auth: 'none',
        cache: '60',
        mapValor: '',
        mapLabel: '',
      }),
    ).resolves.toEqual({ toast: '✅ Nova fonte "Distribuidores" adicionada.' });
    await expect(
      fontes.update.execute({
        id: 'concorrentes',
        config: { modo: 'mock', url: '', auth: 'none', cache: '', mapValor: '', mapLabel: '' },
      }),
    ).resolves.toEqual({ toast: '✅ Fonte configurada para lista interna.' });
    await expect(fontes.remove.execute({ id: 'x', removivel: true })).resolves.toEqual({
      toast: 'Fonte removida.',
    });
  });
});
