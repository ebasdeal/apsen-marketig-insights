export type QueryParams = Record<string, string | undefined>;

export interface HttpRequestOptions {
  query?: QueryParams;
  signal?: AbortSignal;
}

export interface HttpClient {
  get(path: string, options?: HttpRequestOptions): Promise<unknown>;
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

export class InvalidResponseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidResponseError';
  }
}
