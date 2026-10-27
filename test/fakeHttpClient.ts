import type { HttpClient } from '@infrastructure/http/HttpClient';

type Methods = { [K in keyof HttpClient]: HttpClient[K] };

export type FakeHttpClient = { [K in keyof HttpClient]: ReturnType<typeof vi.fn> & HttpClient[K] };

function notConfigured(): Promise<never> {
  return Promise.reject(new Error('não configurado'));
}

export function createFakeHttpClient(overrides: Partial<Methods> = {}): FakeHttpClient {
  return {
    get: vi.fn(overrides.get ?? notConfigured),
    getPage: vi.fn(overrides.getPage ?? notConfigured),
    post: vi.fn(overrides.post ?? notConfigured),
    put: vi.fn(overrides.put ?? notConfigured),
    patch: vi.fn(overrides.patch ?? notConfigured),
    delete: vi.fn(overrides.delete ?? notConfigured),
  } as FakeHttpClient;
}
