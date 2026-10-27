import { useSessaoStore } from '@presentation/stores/sessaoStore';
import { createFakeFetch } from '@test/fakeFetch';
import { createContainer, createContainerFromProcessEnv } from '../container';

const PERFIL = {
  id: 'admin',
  level: 4,
  label: 'Admin',
  color: 'var(--purple)',
  av: 'A',
  user: 'Ana Admin',
  dot: 'var(--purple)',
  hint: 'Acesso total.',
};

const ENV = { apiUrl: 'http://localhost:3001', authMode: 'simulado' as const };
const sso = () => ({ redirecionarParaLogin: vi.fn(), redirecionarParaLogout: vi.fn() });

describe('createContainer', () => {
  it('monta os módulos sobre o FetchHttpClient com o token da sessão', async () => {
    const { fetchFn, calls } = createFakeFetch({
      '/perfis': { body: [PERFIL] },
      '/drivers': { body: [], headers: { 'X-Total-Count': '4' } },
    });
    const container = createContainer(ENV, { fetchFn });
    const perfis = await container.useCases.perfis.list.execute();
    expect(perfis.map((perfil) => perfil.usuario)).toEqual(['Ana Admin']);
    expect(calls[0]?.url).toBe('http://localhost:3001/perfis');
    expect(calls[0]?.init?.headers).toMatchObject({ Authorization: 'Bearer tok-admin' });
    const badges = await container.useCases.navegacao.badges.execute();
    expect(badges.lista).toBe(4);
    expect(badges.tipos).toBeNull();
  });

  it('401 numa rota de dados expira a sessão', async () => {
    const { fetchFn } = createFakeFetch({ '/perfis': { status: 401, body: {} } });
    const container = createContainer(ENV, { fetchFn });
    await expect(container.useCases.perfis.list.execute()).rejects.toMatchObject({ status: 401 });
    expect(useSessaoStore.getState().sessao).toBeNull();
  });

  it('login, me e logout usam as rotas de auth', async () => {
    const usuario = {
      id: 1,
      nome: 'Ana Admin',
      email: 'ana.admin@apsen.com.br',
      perfil: 'admin',
      perfilLabel: 'Admin',
      area: 'S&OP',
    };
    const { fetchFn, calls } = createFakeFetch({
      '/auth/token': { body: { token: 't', usuario } },
      '/auth/me': { body: { usuario } },
      '/auth/logout': { status: 204 },
    });
    const provider = sso();
    const { auth } = createContainer(ENV, { fetchFn, sso: provider }).useCases;
    await expect(auth.concluirLogin.execute('c-1')).resolves.toMatchObject({ token: 't' });
    await expect(auth.sessaoAtual.execute()).resolves.toMatchObject({ id: '1' });
    await auth.sair.execute();
    auth.iniciarLogin.execute('/drivers');
    auth.encerrarNoProvedor.execute();
    expect(provider.redirecionarParaLogin).toHaveBeenCalledWith('/drivers');
    expect(provider.redirecionarParaLogout).toHaveBeenCalledTimes(1);
    expect(calls.map((call) => call.url)).toEqual([
      'http://localhost:3001/auth/token',
      'http://localhost:3001/auth/me',
      'http://localhost:3001/auth/logout',
    ]);
  });

  it('repassa o timeout configurado', async () => {
    vi.useFakeTimers();
    const fetchFn = (_url: string, init?: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => reject(new Error('abortado')));
      });
    const container = createContainer(ENV, { fetchFn, timeoutMs: 20 });
    const result = container.useCases.perfis.list.execute().catch((error: unknown) => error);
    await vi.advanceTimersByTimeAsync(20);
    await expect(result).resolves.toMatchObject({ name: 'TimeoutError' });
    vi.useRealTimers();
  });
});

describe('createContainerFromProcessEnv', () => {
  it('modo entra usa o provedor Entra (ainda não configurado)', () => {
    const { auth } = createContainer({ ...ENV, authMode: 'entra' }).useCases;
    expect(() => auth.iniciarLogin.execute('/')).toThrow('App Registration do Entra ID pendente');
  });

  it('cria todos os módulos', () => {
    expect(Object.keys(createContainerFromProcessEnv().useCases)).toEqual([
      'auth',
      'perfis',
      'navegacao',
      'drivers',
      'catalogo',
    ]);
  });
});
