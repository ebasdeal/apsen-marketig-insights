import { fakeResponse } from '@test/fakeFetch';
import { FetchHttpClient } from '../FetchHttpClient';
import { HttpError, InvalidResponseError, NetworkError } from '../HttpClient';

describe('FetchHttpClient', () => {
  it('monta URL com base, path e query ignorando valores vazios', async () => {
    const fetchFn = vi.fn().mockResolvedValue(fakeResponse({ body: { ok: true } }));
    const client = new FetchHttpClient({
      baseUrl: 'https://api.exemplo.com/v1/',
      fetchFn,
      headers: { Authorization: 'Bearer t' },
    });
    const controller = new AbortController();

    const body = await client.get('/campaigns', {
      query: { channel: 'meta', status: undefined, from: '', q: 'a b' },
      signal: controller.signal,
    });

    expect(body).toEqual({ ok: true });
    expect(fetchFn).toHaveBeenCalledWith(
      'https://api.exemplo.com/v1/campaigns?channel=meta&q=a%20b',
      {
        method: 'GET',
        headers: { Accept: 'application/json', Authorization: 'Bearer t' },
        signal: controller.signal,
      },
    );
  });

  it('não adiciona query string nem signal quando ausentes', async () => {
    const fetchFn = vi.fn().mockResolvedValue(fakeResponse({ body: [] }));
    await new FetchHttpClient({ baseUrl: 'https://api.exemplo.com', fetchFn }).get('campaigns');
    expect(fetchFn).toHaveBeenCalledWith('https://api.exemplo.com/campaigns', {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
  });

  it('retorna null para corpo vazio', async () => {
    const fetchFn = vi.fn().mockResolvedValue(fakeResponse({ status: 204 }));
    const client = new FetchHttpClient({ baseUrl: 'https://api.exemplo.com', fetchFn });
    await expect(client.get('/x')).resolves.toBeNull();
  });

  it('lança HttpError com status e corpo em respostas não-2xx', async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValue(fakeResponse({ status: 500, body: { message: 'boom' } }));
    const client = new FetchHttpClient({ baseUrl: 'https://api.exemplo.com', fetchFn });
    const error = await client.get('/x').catch((e: unknown) => e);
    expect(error).toBeInstanceOf(HttpError);
    expect(error).toMatchObject({
      status: 500,
      url: 'https://api.exemplo.com/x',
      body: { message: 'boom' },
      name: 'HttpError',
    });
  });

  it('preserva corpo textual em erro HTTP', async () => {
    const fetchFn = vi.fn().mockResolvedValue(fakeResponse({ status: 502, raw: 'Bad Gateway' }));
    const client = new FetchHttpClient({ baseUrl: 'https://api.exemplo.com', fetchFn });
    await expect(client.get('/x')).rejects.toMatchObject({ status: 502, body: 'Bad Gateway' });
  });

  it('lança InvalidResponseError quando 2xx não é JSON', async () => {
    const fetchFn = vi.fn().mockResolvedValue(fakeResponse({ raw: '<html>' }));
    const client = new FetchHttpClient({ baseUrl: 'https://api.exemplo.com', fetchFn });
    await expect(client.get('/x')).rejects.toBeInstanceOf(InvalidResponseError);
  });

  it('converte falhas do fetch em NetworkError', async () => {
    const cause = new TypeError('Network request failed');
    const fetchFn = vi.fn().mockRejectedValue(cause);
    const client = new FetchHttpClient({ baseUrl: 'https://api.exemplo.com', fetchFn });
    const error = await client.get('/x').catch((e: unknown) => e);
    expect(error).toBeInstanceOf(NetworkError);
    expect(error).toMatchObject({ url: 'https://api.exemplo.com/x', cause });
  });

  it('usa o fetch global por padrão', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(fakeResponse({ body: { ok: 1 } }));
    await expect(
      new FetchHttpClient({ baseUrl: 'https://api.exemplo.com' }).get('/y'),
    ).resolves.toEqual({ ok: 1 });
    expect(spy).toHaveBeenCalledWith('https://api.exemplo.com/y', expect.any(Object));
    spy.mockRestore();
  });
});
