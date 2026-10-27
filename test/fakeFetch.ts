import type { FetchFn } from '@infrastructure/http/FetchHttpClient';

export interface FakeRoute {
  status?: number;
  body?: unknown;
  raw?: string;
  headers?: Record<string, string>;
}

export function fakeResponse({ status = 200, body, raw, headers = {} }: FakeRoute): Response {
  const text = raw ?? (body === undefined ? '' : JSON.stringify(body));
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: new Headers(headers),
    text: async () => text,
  } as Response;
}

function matches(key: string, url: URL): boolean {
  const [path, query = ''] = key.split('?');
  if (path !== url.pathname) {
    return false;
  }
  return Array.from(new URLSearchParams(query)).every(
    ([name, value]) => url.searchParams.get(name) === value,
  );
}

export function findRoute(routes: Record<string, FakeRoute>, url: string): FakeRoute | undefined {
  const parsed = new URL(url);
  const key = Object.keys(routes)
    .filter((candidate) => matches(candidate, parsed))
    .sort((a, b) => b.length - a.length)[0];
  return key === undefined ? undefined : routes[key];
}

export function createFakeFetch(routes: Record<string, FakeRoute>) {
  const calls: { url: string; init: RequestInit | undefined }[] = [];
  const fetchFn: FetchFn = async (url, init) => {
    calls.push({ url, init });
    return fakeResponse(findRoute(routes, url) ?? { status: 404, body: { message: 'not found' } });
  };
  return { fetchFn, calls };
}
