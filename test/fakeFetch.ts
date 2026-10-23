import type { FetchFn } from '@infrastructure/http/FetchHttpClient';

export interface FakeRoute {
  status?: number;
  body?: unknown;
  raw?: string;
}

export function fakeResponse({ status = 200, body, raw }: FakeRoute): Response {
  const text = raw ?? (body === undefined ? '' : JSON.stringify(body));
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => text,
  } as Response;
}

export function createFakeFetch(routes: Record<string, FakeRoute>) {
  const calls: { url: string; init: RequestInit | undefined }[] = [];
  const fetchFn: FetchFn = async (url, init) => {
    calls.push({ url, init });
    const path = new URL(url).pathname;
    const route = routes[path];
    return fakeResponse(route ?? { status: 404, body: { message: 'not found' } });
  };
  return { fetchFn, calls };
}
