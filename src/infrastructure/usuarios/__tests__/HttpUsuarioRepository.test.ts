import { NotFoundError } from '@domain/shared/DomainError';
import { FetchHttpClient } from '@infrastructure/http/FetchHttpClient';
import { HttpError, InvalidResponseError } from '@infrastructure/http/HttpClient';
import { createFakeFetch, type FakeRoute } from '@test/fakeFetch';
import { createFakeHttpClient } from '@test/fakeHttpClient';
import { buildUsuario, USUARIOS_FIXTURE } from '@test/fixtures/usuarios';
import db from '../../../../mock-api/db.json';
import { HttpUsuarioRepository } from '../HttpUsuarioRepository';

const BASE = 'http://localhost:3001';

const PROVISIONADO = {
  ...db.usuarios[3],
  id: 'c0a8-0000-4000-8000-000000000009',
  area: '',
  ultimoAcesso: 'Primeiro acesso',
  ativo: true,
  criadoNoPrimeiroAcesso: true,
};

function repositoryFor(routes: Record<string, FakeRoute>) {
  const { fetchFn, calls } = createFakeFetch(routes);
  return {
    repository: new HttpUsuarioRepository(new FetchHttpClient({ baseUrl: BASE, fetchFn })),
    calls,
  };
}

describe('HttpUsuarioRepository (§4)', () => {
  it('lista paginada ordenada por nome com q e perfil; id numérico vira string', async () => {
    const { repository, calls } = repositoryFor({
      '/usuarios': { body: db.usuarios, headers: { 'X-Total-Count': '4' } },
    });
    const page = await repository.listPage({ q: ' mkt ', perfil: 'area' }, { page: 2, size: 10 });
    const url = new URL(calls[0]?.url ?? '');
    expect(url.pathname).toBe('/usuarios');
    expect(Object.fromEntries(url.searchParams)).toEqual({
      _page: '2',
      _limit: '10',
      _sort: 'nome',
      _order: 'asc',
      q: 'mkt',
      perfil: 'area',
    });
    expect(page).toEqual({ items: USUARIOS_FIXTURE, total: 4, page: 2, limit: 10 });
  });

  it('filtros vazios são omitidos', async () => {
    const { repository, calls } = repositoryFor({
      '/usuarios': { body: [], headers: { 'X-Total-Count': '0' } },
    });
    await repository.listPage({ q: '', perfil: '' }, { page: 1, size: 10 });
    await repository.listPage({}, { page: 1, size: 10 });
    calls.forEach((call) => {
      const params = new URL(call.url).searchParams;
      expect(params.has('q')).toBe(false);
      expect(params.has('perfil')).toBe(false);
    });
  });

  it('aceita usuário criado no primeiro acesso (UUID, área vazia, campo extra)', async () => {
    const { repository, calls } = repositoryFor({
      [`/usuarios/${PROVISIONADO.id}`]: { body: PROVISIONADO },
    });
    const usuario = await repository.get(PROVISIONADO.id);
    expect(calls[0]?.url).toBe(`${BASE}/usuarios/${PROVISIONADO.id}`);
    expect(usuario).toMatchObject({ id: PROVISIONADO.id, area: '', categorias: [] });
    expect(usuario).not.toHaveProperty('criadoNoPrimeiroAcesso');
  });

  it('get 404 → NotFoundError; 500 propaga', async () => {
    const { repository } = repositoryFor({ '/usuarios/500': { status: 500, body: {} } });
    await expect(repository.get('99')).rejects.toEqual(new NotFoundError('Usuário', '99'));
    await expect(repository.get('500')).rejects.toBeInstanceOf(HttpError);
  });

  it('busca por e-mail exato', async () => {
    const { repository, calls } = repositoryFor({
      '/usuarios': { body: [db.usuarios[1]] },
    });
    const encontrados = await repository.findByEmail('carlos.lima@apsen.com.br');
    expect(new URL(calls[0]?.url ?? '').searchParams.get('email')).toBe('carlos.lima@apsen.com.br');
    expect(encontrados.map((usuario) => usuario.id)).toEqual(['2']);
  });

  it('create faz POST com o corpo do §4; update PATCH; delete DELETE', async () => {
    const novo = buildUsuario({ id: 'c0a8', categorias: ['midia', 'comercial'] });
    const http = createFakeHttpClient({
      post: async (_path, body) => body,
      patch: async () => ({ ...db.usuarios[3], ativo: true }),
      delete: async () => ({}),
    });
    const repository = new HttpUsuarioRepository(http);
    await expect(repository.create(novo)).resolves.toEqual(novo);
    expect(http.post).toHaveBeenCalledWith('/usuarios', novo);
    await expect(repository.update('4', { ativo: true })).resolves.toMatchObject({
      id: '4',
      ativo: true,
    });
    expect(http.patch).toHaveBeenCalledWith('/usuarios/4', { ativo: true });
    await repository.delete('2');
    expect(http.delete).toHaveBeenCalledWith('/usuarios/2');
  });

  it('update e delete com 404 viram NotFoundError; outros erros propagam', async () => {
    const notFound = () => Promise.reject(new HttpError(404, 'x', null));
    const repository = new HttpUsuarioRepository(
      createFakeHttpClient({ patch: notFound, delete: notFound }),
    );
    await expect(repository.update('9', { ativo: true })).rejects.toBeInstanceOf(NotFoundError);
    await expect(repository.delete('9')).rejects.toBeInstanceOf(NotFoundError);
    const falha = new HttpError(500, 'x', null);
    const quebrado = new HttpUsuarioRepository(
      createFakeHttpClient({
        patch: () => Promise.reject(falha),
        delete: () => Promise.reject(falha),
      }),
    );
    await expect(quebrado.update('9', { ativo: true })).rejects.toBe(falha);
    await expect(quebrado.delete('9')).rejects.toBe(falha);
  });

  it('perfil "x" → InvalidResponseError sem expor dados pessoais', async () => {
    const http = createFakeHttpClient({
      getPage: async () => ({ data: [{ ...db.usuarios[0], perfil: 'x' }], total: 1 }),
    });
    const error = await new HttpUsuarioRepository(http).listPage({}, { page: 1, size: 10 }).then(
      () => new Error('não rejeitou'),
      (caught: unknown) => caught as Error,
    );
    expect(error).toBeInstanceOf(InvalidResponseError);
    expect(error.message).toBe('Resposta de /usuarios fora do contrato: 0.perfil');
    expect(error.message).not.toContain('ana.admin');
  });

  it('corpo fora de array → (raiz)', async () => {
    const http = createFakeHttpClient({ get: async () => ({ usuarios: [] }) });
    await expect(new HttpUsuarioRepository(http).findByEmail('a@b.c')).rejects.toThrow(
      'Resposta de /usuarios fora do contrato: (raiz)',
    );
  });
});
