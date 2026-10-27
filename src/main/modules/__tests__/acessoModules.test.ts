import { FetchHttpClient } from '@infrastructure/http/FetchHttpClient';
import { createFakeFetch } from '@test/fakeFetch';
import { createFakeHttpClient } from '@test/fakeHttpClient';
import db from '../../../../mock-api/db.json';
import { createContainer } from '../../container';
import { createAgentesModule } from '../agentes';
import { createPermissoesModule } from '../permissoes';
import { createUsuariosModule } from '../usuarios';

const BASE = 'http://localhost:3001';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

function http() {
  const { fetchFn, calls } = createFakeFetch({
    '/usuarios?_page=1': { body: db.usuarios, headers: { 'X-Total-Count': '4' } },
    '/permissoes': { body: db.permissoes, headers: { 'X-Total-Count': '11' } },
    '/agentes?_page=1': { body: db.agentes, headers: { 'X-Total-Count': '5' } },
  });
  return { client: new FetchHttpClient({ baseUrl: BASE, fetchFn }), calls };
}

describe('módulos de acesso e agentes', () => {
  it('o container registra usuarios, permissoes e agentes', async () => {
    const { fetchFn } = createFakeFetch({
      '/usuarios': { body: db.usuarios, headers: { 'X-Total-Count': '4' } },
    });
    const { useCases } = createContainer(
      { apiUrl: BASE, authMode: 'simulado' },
      { fetchFn, sso: { redirecionarParaLogin: vi.fn(), redirecionarParaLogout: vi.fn() } },
    );
    expect((await useCases.usuarios.list.execute({ page: 1 })).resumo).toBe('4 usuários');
    expect(Object.keys(useCases.permissoes)).toEqual(['list']);
    expect(Object.keys(useCases.agentes)).toEqual([
      'list',
      'resumo',
      'getForm',
      'save',
      'toggle',
      'testar',
    ]);
  });

  it('usuarios lista pelo HTTP e gera UUID no cadastro', async () => {
    const { client, calls } = http();
    const usuarios = createUsuariosModule(client);
    expect((await usuarios.list.execute({ page: 1 })).rows).toHaveLength(4);
    expect(calls[0]?.url).toContain('/usuarios?_page=1&_limit=10&_sort=nome&_order=asc');

    const fake = createFakeHttpClient({
      get: async (path) => (path === '/perfis' ? db.perfis : []),
      post: async (_path, body) => body,
    });
    await createUsuariosModule(fake).save.execute({
      draft: {
        nome: 'Ana',
        email: 'ana@apsen.com.br',
        area: 'Marketing',
        perfil: 'viewer',
        categorias: [],
        ativo: true,
      },
    });
    expect((fake.post.mock.calls[0]?.[1] as { id: string }).id).toMatch(UUID);
  });

  it('permissoes monta a matriz pelo HTTP', async () => {
    const { client } = http();
    const matriz = await createPermissoesModule(client).list.execute();
    expect(matriz.grupos).toHaveLength(3);
  });

  it('agentes usa o relógio e o gerador injetados, com padrões reais', async () => {
    const { client } = http();
    expect((await createAgentesModule(client).list.execute({ page: 1 })).total).toBe(5);

    const fake = createFakeHttpClient({
      patch: async (_path, body) => ({ ...db.agentes[0], ...(body as object) }),
      get: async () => db.agentes,
      post: async (_path, body) => body,
    });
    const now = () => new Date(2026, 9, 27, 14, 5);
    const custom = createAgentesModule(fake, { now, newId: () => 'id-fixo' });
    const teste = await custom.testar.execute({ id: 'AG-001', papel: '🏛️ Agente Regulatório' });
    expect(teste.ultimoTeste.ts).toBe('27/10/2026 14:05');

    const padrao = createAgentesModule(fake);
    const real = await padrao.testar.execute({ id: 'AG-001', papel: '🏛️ Agente Regulatório' });
    expect(real.ultimoTeste.ts).toMatch(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/);
    await padrao.save.execute({
      draft: {
        papelOpcao: '➕ Agente customizado',
        nome: 'X',
        provedor: 'openai',
        ambiente: 'Produção',
        endpoint: 'https://api.openai.com',
        vault: 'v',
        secret: 's',
        modelo: 'gpt-4o',
        schedule: 'Diário · 03h00',
        fontes: '',
        limiar: 75,
        ativo: true,
      },
    });
    expect((fake.post.mock.calls[0]?.[1] as { id: string; codigo: string }).id).toMatch(UUID);
  });
});
