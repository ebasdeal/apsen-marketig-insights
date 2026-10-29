import { FetchHttpClient } from '@infrastructure/http/FetchHttpClient';
import { HttpError, InvalidResponseError } from '@infrastructure/http/HttpClient';
import { createFakeFetch } from '@test/fakeFetch';
import { createFakeHttpClient } from '@test/fakeHttpClient';
import { ListPerfis } from '@application/perfis/ListPerfis';
import { PERFIS_FIXTURE } from '@test/fixtures/perfis';
import { HttpPerfilRepository } from '../HttpPerfilRepository';

const BASE = 'http://localhost:3001';

const PERFIS_API = [
  {
    id: 'viewer',
    level: 1,
    label: 'Visualizador',
    color: 'var(--muted)',
    av: 'P',
    user: 'Pedro Viewer',
    dot: 'var(--muted)',
    hint: 'Somente visualiza drivers ingeridos e a lista de tipos. Sem edição ou registro.',
  },
  {
    id: 'area',
    level: 2,
    label: 'Área',
    color: 'var(--teal)',
    av: 'F',
    user: 'Fernanda Marketing',
    dot: 'var(--teal)',
    hint: 'Registra drivers apenas das categorias autorizadas. Não acessa admin nem exportação.',
  },
  {
    id: 'admin',
    level: 4,
    label: 'Admin',
    color: 'var(--purple)',
    av: 'A',
    user: 'Ana Admin',
    dot: 'var(--purple)',
    hint: 'Acesso total: configura tipos, usuários e exporta dados para o modelo.',
  },
  {
    id: 'planejador',
    level: 3,
    label: 'Planejador',
    color: 'var(--blue)',
    av: 'C',
    user: 'Carlos Planejador',
    dot: 'var(--blue)',
    hint: 'Revisa e valida drivers. Acessa catálogo e drivers ingeridos. Pode exportar JSON.',
  },
];

function repositoryFor(body: unknown, status = 200) {
  const { fetchFn, calls } = createFakeFetch({ '/perfis': { body, status } });
  return {
    repository: new HttpPerfilRepository(new FetchHttpClient({ baseUrl: BASE, fetchFn })),
    calls,
  };
}

describe('HttpPerfilRepository', () => {
  it('consome GET /perfis e converte cor em tom', async () => {
    const { repository, calls } = repositoryFor(PERFIS_API);
    const perfis = await repository.list();
    expect(calls[0]?.url).toBe(`${BASE}/perfis`);
    expect(perfis.map((perfil) => perfil.tone)).toEqual(['muted', 'teal', 'purple', 'blue']);
    expect(perfis[2]).toEqual(PERFIS_FIXTURE[0]);
  });

  it('com ListPerfis ordena por nível mesmo com a resposta embaralhada', async () => {
    const { repository } = repositoryFor(PERFIS_API);
    const perfis = await new ListPerfis(repository).execute();
    expect(perfis).toEqual(PERFIS_FIXTURE);
  });

  it('aceita lista vazia', async () => {
    const { repository } = repositoryFor([]);
    await expect(repository.list()).resolves.toEqual([]);
  });

  it.each([
    ['level 5', [{ ...PERFIS_API[0], level: 5 }], '0.level'],
    ['cor hex', [{ ...PERFIS_API[0], color: '#7c3aed' }], '0.color'],
    ['id desconhecido', [{ ...PERFIS_API[0], id: 'x' }], '0.id'],
    ['corpo não-array', { perfis: [] }, '(raiz)'],
  ])('rejeita %s com InvalidResponseError sem expor o valor', async (_caso, body, campo) => {
    const http = createFakeHttpClient({ get: async () => body });
    const error = await new HttpPerfilRepository(http).list().then(
      () => new Error('não rejeitou'),
      (caught: unknown) => caught as Error,
    );
    expect(error).toBeInstanceOf(InvalidResponseError);
    expect(error.message).toBe(`Resposta de /perfis fora do contrato: ${campo}`);
    expect(error.message).not.toMatch(/#7c3aed|\b5\b|'x'/);
    expect(http.get).toHaveBeenCalledWith('/perfis');
  });

  it('propaga HttpError em 500', async () => {
    const { repository } = repositoryFor({ message: 'boom' }, 500);
    await expect(repository.list()).rejects.toBeInstanceOf(HttpError);
  });
});
