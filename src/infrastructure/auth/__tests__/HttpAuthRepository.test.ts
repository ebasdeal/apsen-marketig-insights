import {
  CodigoInvalidoError,
  SessaoExpiradaError,
  SsoNaoConfiguradoError,
  UsuarioNaoCadastradoError,
} from '@domain/auth/AuthErrors';
import { FetchHttpClient } from '@infrastructure/http/FetchHttpClient';
import { HttpError, InvalidResponseError } from '@infrastructure/http/HttpClient';
import { createFakeFetch, type FakeRoute } from '@test/fakeFetch';
import { createFakeHttpClient } from '@test/fakeHttpClient';
import { SESSAO_ADMIN } from '@test/fixtures/sessao';
import { HttpAuthRepository } from '../HttpAuthRepository';
import { EntraSsoProvider, MockSsoProvider } from '../ssoProviders';

const BASE = 'http://localhost:3001';
const USUARIO_API = { ...SESSAO_ADMIN.usuario, id: 1 };

function repositoryFor(routes: Record<string, FakeRoute>) {
  const { fetchFn, calls } = createFakeFetch(routes);
  const http = new FetchHttpClient({ baseUrl: BASE, fetchFn, getToken: () => 'tok-admin' });
  return { repository: new HttpAuthRepository(http), calls };
}

describe('HttpAuthRepository', () => {
  it('troca o código por token e usuário com id em texto', async () => {
    const { repository, calls } = repositoryFor({
      '/auth/token': { body: { token: 'tok-admin', usuario: USUARIO_API } },
    });
    await expect(repository.trocarCodigo('c-1')).resolves.toEqual(SESSAO_ADMIN);
    expect(calls[0]?.url).toBe(`${BASE}/auth/token`);
    expect(calls[0]?.init?.method).toBe('POST');
    expect(calls[0]?.init?.body).toBe(JSON.stringify({ code: 'c-1' }));
  });

  it('aceita id UUID de usuário provisionado no primeiro acesso', async () => {
    const id = '7d2f8a4e-3c1b-4f5a-9e8d-1a2b3c4d5e6f';
    const usuario = { ...USUARIO_API, id, perfil: 'viewer', perfilLabel: 'Visualizador' };
    const { repository } = repositoryFor({ '/auth/token': { body: { token: 't', usuario } } });
    await expect(repository.trocarCodigo('c')).resolves.toMatchObject({
      usuario: { id, perfil: 'viewer' },
    });
  });

  it.each([
    [400, CodigoInvalidoError],
    [401, CodigoInvalidoError],
    [403, UsuarioNaoCadastradoError],
  ])('troca com %i lança o erro de domínio', async (status, ErrorClass) => {
    const { repository } = repositoryFor({ '/auth/token': { status, body: { message: 'x' } } });
    await expect(repository.trocarCodigo('c')).rejects.toBeInstanceOf(ErrorClass);
  });

  it('500 propaga HttpError e payload inválido lança InvalidResponseError', async () => {
    const falha = repositoryFor({ '/auth/token': { status: 500, body: {} } });
    await expect(falha.repository.trocarCodigo('c')).rejects.toBeInstanceOf(HttpError);
    const invalido = repositoryFor({ '/auth/token': { body: { token: '' } } });
    await expect(invalido.repository.trocarCodigo('c')).rejects.toThrow(
      'Resposta de /auth/token fora do contrato: token, usuario',
    );
    const raiz = new HttpAuthRepository(createFakeHttpClient({ post: async () => null }));
    await expect(raiz.trocarCodigo('c')).rejects.toThrow(InvalidResponseError);
    await expect(raiz.trocarCodigo('c')).rejects.toThrow('(raiz)');
  });

  it('me envia o Bearer e devolve o usuário; 401 vira SessaoExpiradaError', async () => {
    const ok = repositoryFor({ '/auth/me': { body: { usuario: USUARIO_API } } });
    await expect(ok.repository.me()).resolves.toEqual(SESSAO_ADMIN.usuario);
    expect(ok.calls[0]?.init?.headers).toMatchObject({ Authorization: 'Bearer tok-admin' });
    const expirada = repositoryFor({ '/auth/me': { status: 401, body: {} } });
    await expect(expirada.repository.me()).rejects.toBeInstanceOf(SessaoExpiradaError);
  });

  it('logout faz POST /auth/logout', async () => {
    const { repository, calls } = repositoryFor({ '/auth/logout': { status: 204 } });
    await expect(repository.logout()).resolves.toBeUndefined();
    expect(calls[0]?.url).toBe(`${BASE}/auth/logout`);
  });
});

describe('MockSsoProvider', () => {
  const location = { origin: 'http://localhost:3000', assign: vi.fn() };

  beforeEach(() => {
    location.assign.mockReset();
  });

  it('redireciona para o authorize do mock com redirect_uri e state', () => {
    new MockSsoProvider(BASE, () => location).redirecionarParaLogin('/drivers?q=a b');
    const url = new URL(location.assign.mock.calls[0]?.[0] as string);
    expect(`${url.origin}${url.pathname}`).toBe(`${BASE}/sso/authorize`);
    expect(url.searchParams.get('redirect_uri')).toBe('http://localhost:3000/auth/callback');
    expect(url.searchParams.get('state')).toBe('/drivers?q=a b');
  });

  it('logout vai para o /sso/logout com volta para a tela de login', () => {
    new MockSsoProvider(BASE, () => location).redirecionarParaLogout();
    expect(location.assign).toHaveBeenCalledWith(
      `${BASE}/sso/logout?post_logout_redirect_uri=${encodeURIComponent('http://localhost:3000/entrar')}`,
    );
  });

  it('usa window.location por padrão', () => {
    const provider = new MockSsoProvider(BASE);
    expect(() => provider.redirecionarParaLogout()).not.toThrow();
  });
});

describe('EntraSsoProvider', () => {
  it('ainda não está configurado', () => {
    const provider = new EntraSsoProvider();
    expect(() => provider.redirecionarParaLogin('/')).toThrow(SsoNaoConfiguradoError);
    expect(() => provider.redirecionarParaLogout()).toThrow(
      'Login Microsoft ainda não configurado (App Registration do Entra ID pendente).',
    );
  });
});
