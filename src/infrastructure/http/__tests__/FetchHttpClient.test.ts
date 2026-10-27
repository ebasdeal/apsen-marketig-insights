import { fakeResponse } from '@test/fakeFetch';
import { DEFAULT_TIMEOUT_MS, FetchHttpClient, type FetchFn } from '../FetchHttpClient';
import { HttpError, InvalidResponseError, NetworkError, TimeoutError } from '../HttpClient';

const BASE = 'https://api.exemplo.com';

function initOf(fetchFn: ReturnType<typeof vi.fn>): RequestInit {
  return fetchFn.mock.calls[0]?.[1] as RequestInit;
}

describe('FetchHttpClient', () => {
  it('monta URL com base, path e query ignorando valores vazios', async () => {
    const fetchFn = vi.fn().mockResolvedValue(fakeResponse({ body: { ok: true } }));
    const client = new FetchHttpClient({
      baseUrl: `${BASE}/v1/`,
      fetchFn,
      headers: { Authorization: 'Bearer t' },
    });

    const body = await client.get('/drivers', {
      query: { tipo: 'tv', status: undefined, from: '', q: 'a b' },
    });

    expect(body).toEqual({ ok: true });
    expect(fetchFn).toHaveBeenCalledWith(`${BASE}/v1/drivers?tipo=tv&q=a%20b`, expect.any(Object));
    expect(initOf(fetchFn)).toMatchObject({
      method: 'GET',
      headers: { Accept: 'application/json', Authorization: 'Bearer t' },
    });
    expect(initOf(fetchFn).body).toBeUndefined();
    expect(initOf(fetchFn).signal).toBeInstanceOf(AbortSignal);
  });

  it('não adiciona query string quando ausente', async () => {
    const fetchFn = vi.fn().mockResolvedValue(fakeResponse({ body: [] }));
    await new FetchHttpClient({ baseUrl: BASE, fetchFn }).get('drivers');
    expect(fetchFn.mock.calls[0]?.[0]).toBe(`${BASE}/drivers`);
  });

  it.each([
    ['post', 'POST'],
    ['put', 'PUT'],
    ['patch', 'PATCH'],
  ] as const)('%s envia o corpo como JSON', async (method, verb) => {
    const fetchFn = vi.fn().mockResolvedValue(fakeResponse({ body: { id: 1 } }));
    const client = new FetchHttpClient({ baseUrl: BASE, fetchFn });

    await expect(client[method]('/drivers', { nome: 'X' })).resolves.toEqual({ id: 1 });

    expect(fetchFn.mock.calls[0]?.[0]).toBe(`${BASE}/drivers`);
    expect(initOf(fetchFn)).toMatchObject({
      method: verb,
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: '{"nome":"X"}',
    });
  });

  it('delete não envia corpo', async () => {
    const fetchFn = vi.fn().mockResolvedValue(fakeResponse({ body: {} }));
    await new FetchHttpClient({ baseUrl: BASE, fetchFn }).delete('/drivers/7');
    expect(initOf(fetchFn)).toMatchObject({
      method: 'DELETE',
      headers: { Accept: 'application/json' },
    });
    expect(initOf(fetchFn).body).toBeUndefined();
  });

  describe('getPage', () => {
    it('lê o total do header X-Total-Count', async () => {
      const fetchFn = vi
        .fn()
        .mockResolvedValue(
          fakeResponse({ body: [{ id: 1 }], headers: { 'X-Total-Count': '247' } }),
        );
      const client = new FetchHttpClient({ baseUrl: BASE, fetchFn });

      await expect(
        client.getPage('/planoItens', { query: { _page: '2', _limit: '10' } }),
      ).resolves.toEqual({ data: [{ id: 1 }], total: 247 });
      expect(fetchFn.mock.calls[0]?.[0]).toBe(`${BASE}/planoItens?_page=2&_limit=10`);
    });

    it.each([
      [{}],
      [{ 'X-Total-Count': 'abc' }],
      [{ 'X-Total-Count': '-3' }],
      [{ 'X-Total-Count': '2.5' }],
      [{ 'X-Total-Count': '' }],
    ])('sem header válido %p lança InvalidResponseError', async (headers) => {
      const fetchFn = vi.fn().mockResolvedValue(fakeResponse({ body: [{ id: 1 }], headers }));
      const result = new FetchHttpClient({ baseUrl: BASE, fetchFn }).getPage('/x');
      await expect(result).rejects.toBeInstanceOf(InvalidResponseError);
      await expect(result).rejects.toThrow(`Resposta de ${BASE}/x sem X-Total-Count válido`);
    });

    it('aceita total zero', async () => {
      const fetchFn = vi
        .fn()
        .mockResolvedValue(fakeResponse({ body: [], headers: { 'X-Total-Count': '0' } }));
      const page = await new FetchHttpClient({ baseUrl: BASE, fetchFn }).getPage('/x');
      expect(page).toEqual({ data: [], total: 0 });
    });
  });

  it('retorna null para corpo vazio', async () => {
    const fetchFn = vi.fn().mockResolvedValue(fakeResponse({ status: 204 }));
    const client = new FetchHttpClient({ baseUrl: BASE, fetchFn });
    await expect(client.get('/x')).resolves.toBeNull();
  });

  it('lança HttpError com status e corpo em respostas não-2xx', async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValue(fakeResponse({ status: 500, body: { message: 'boom' } }));
    const client = new FetchHttpClient({ baseUrl: BASE, fetchFn });
    const error = await client.get('/x').catch((e: unknown) => e);
    expect(error).toBeInstanceOf(HttpError);
    expect(error).toMatchObject({
      status: 500,
      url: `${BASE}/x`,
      body: { message: 'boom' },
      name: 'HttpError',
    });
  });

  it('preserva corpo textual em erro HTTP', async () => {
    const fetchFn = vi.fn().mockResolvedValue(fakeResponse({ status: 502, raw: 'Bad Gateway' }));
    const client = new FetchHttpClient({ baseUrl: BASE, fetchFn });
    await expect(client.get('/x')).rejects.toMatchObject({ status: 502, body: 'Bad Gateway' });
  });

  it('lança InvalidResponseError quando 2xx não é JSON', async () => {
    const fetchFn = vi.fn().mockResolvedValue(fakeResponse({ raw: '<html>' }));
    const client = new FetchHttpClient({ baseUrl: BASE, fetchFn });
    await expect(client.get('/x')).rejects.toBeInstanceOf(InvalidResponseError);
  });

  it('converte falhas do fetch em NetworkError', async () => {
    const cause = new TypeError('Network request failed');
    const fetchFn = vi.fn().mockRejectedValue(cause);
    const client = new FetchHttpClient({ baseUrl: BASE, fetchFn });
    const error = await client.get('/x').catch((e: unknown) => e);
    expect(error).toBeInstanceOf(NetworkError);
    expect(error).toMatchObject({ url: `${BASE}/x`, cause });
  });

  describe('cancelamento e timeout', () => {
    const hangingFetch: FetchFn = (_url, init) =>
      new Promise((_resolve, reject) => {
        const abort = () => reject(new DOMException('Aborted', 'AbortError'));
        if (init?.signal?.aborted === true) {
          abort();
        }
        init?.signal?.addEventListener('abort', abort);
      });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('usa 15 s de timeout por padrão', () => {
      expect(DEFAULT_TIMEOUT_MS).toBe(15_000);
    });

    it('lança TimeoutError quando a API não responde no prazo', async () => {
      vi.useFakeTimers();
      const client = new FetchHttpClient({ baseUrl: BASE, fetchFn: hangingFetch, timeoutMs: 50 });
      const result = client.get('/lenta').catch((e: unknown) => e);
      await vi.advanceTimersByTimeAsync(50);
      const error = await result;
      expect(error).toBeInstanceOf(TimeoutError);
      expect(error).toMatchObject({ url: `${BASE}/lenta`, timeoutMs: 50, name: 'TimeoutError' });
      expect((error as Error).message).toBe(`Tempo de resposta esgotado ao acessar ${BASE}/lenta`);
      expect(vi.getTimerCount()).toBe(0);
    });

    it('repassa o cancelamento do chamador sem embrulhar o erro', async () => {
      const controller = new AbortController();
      const client = new FetchHttpClient({ baseUrl: BASE, fetchFn: hangingFetch });
      const result = client.get('/x', { signal: controller.signal }).catch((e: unknown) => e);
      controller.abort();
      const error = await result;
      expect(error).toBeInstanceOf(DOMException);
      expect(error).toMatchObject({ name: 'AbortError' });
    });

    it('aborta na hora quando o sinal já chega cancelado', async () => {
      const controller = new AbortController();
      controller.abort();
      const fetchFn = vi.fn(hangingFetch);
      const client = new FetchHttpClient({ baseUrl: BASE, fetchFn });
      const result = client.get('/x', { signal: controller.signal }).catch((e: unknown) => e);
      expect(initOf(fetchFn).signal?.aborted).toBe(true);
      await expect(result).resolves.toBeInstanceOf(DOMException);
    });
  });

  it('limpa o timer após uma resposta bem-sucedida', async () => {
    vi.useFakeTimers();
    const fetchFn = vi.fn().mockResolvedValue(fakeResponse({ body: { ok: true } }));
    await new FetchHttpClient({ baseUrl: BASE, fetchFn }).get('/x');
    expect(vi.getTimerCount()).toBe(0);
    vi.useRealTimers();
  });

  describe('sessão', () => {
    it('envia o token da sessão como Bearer', async () => {
      const fetchFn = vi.fn().mockResolvedValue(fakeResponse({ body: [] }));
      const client = new FetchHttpClient({ baseUrl: BASE, fetchFn, getToken: () => 'tok-1' });
      await client.post('/x', { a: 1 });
      expect(initOf(fetchFn).headers).toEqual({
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer tok-1',
      });
    });

    it('sem token não envia Authorization', async () => {
      const fetchFn = vi.fn().mockResolvedValue(fakeResponse({ body: [] }));
      await new FetchHttpClient({ baseUrl: BASE, fetchFn, getToken: () => undefined }).get('/x');
      expect(initOf(fetchFn).headers).toEqual({ Accept: 'application/json' });
    });

    it('avisa 401 fora da troca de código e propaga HttpError', async () => {
      const onUnauthorized = vi.fn();
      const fetchFn = vi.fn().mockResolvedValue(fakeResponse({ status: 401, body: {} }));
      const client = new FetchHttpClient({ baseUrl: BASE, fetchFn, onUnauthorized });
      await expect(client.get('/drivers')).rejects.toMatchObject({ status: 401 });
      expect(onUnauthorized).toHaveBeenCalledTimes(1);
      await expect(client.post('auth/token', {})).rejects.toMatchObject({ status: 401 });
      expect(onUnauthorized).toHaveBeenCalledTimes(1);
    });

    it('não avisa em outros erros', async () => {
      const onUnauthorized = vi.fn();
      const fetchFn = vi.fn().mockResolvedValue(fakeResponse({ status: 403, body: {} }));
      const client = new FetchHttpClient({ baseUrl: BASE, fetchFn, onUnauthorized });
      await expect(client.get('/x')).rejects.toBeInstanceOf(HttpError);
      expect(onUnauthorized).not.toHaveBeenCalled();
    });
  });

  it('usa o fetch global por padrão', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(fakeResponse({ body: { ok: 1 } }));
    await expect(new FetchHttpClient({ baseUrl: BASE }).get('/y')).resolves.toEqual({ ok: 1 });
    expect(spy).toHaveBeenCalledWith(`${BASE}/y`, expect.any(Object));
    spy.mockRestore();
  });
});
