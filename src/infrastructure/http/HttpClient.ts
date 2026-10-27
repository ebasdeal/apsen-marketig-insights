export type QueryParams = Record<string, string | undefined>;

export interface HttpRequestOptions {
  query?: QueryParams;
  signal?: AbortSignal;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface PageResult {
  data: unknown;
  total: number;
}

export interface HttpClient {
  get(path: string, options?: HttpRequestOptions): Promise<unknown>;
  getPage(path: string, options?: HttpRequestOptions): Promise<PageResult>;
  post(path: string, body: unknown, options?: HttpRequestOptions): Promise<unknown>;
  put(path: string, body: unknown, options?: HttpRequestOptions): Promise<unknown>;
  patch(path: string, body: unknown, options?: HttpRequestOptions): Promise<unknown>;
  delete(path: string, options?: HttpRequestOptions): Promise<unknown>;
}

export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly url: string,
    readonly body: unknown,
  ) {
    super(`Requisição para ${url} falhou com status ${status}`);
    this.name = 'HttpError';
  }
}

export class NetworkError extends Error {
  constructor(
    readonly url: string,
    override readonly cause: unknown,
  ) {
    super(`Falha de rede ao acessar ${url}`);
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends Error {
  constructor(
    readonly url: string,
    readonly timeoutMs: number,
  ) {
    super(`Tempo de resposta esgotado ao acessar ${url}`);
    this.name = 'TimeoutError';
  }
}

export class InvalidResponseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidResponseError';
  }
}
