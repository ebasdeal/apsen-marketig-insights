import {
  HttpError,
  InvalidResponseError,
  NetworkError,
  TimeoutError,
  type HttpClient,
  type HttpMethod,
  type PageResult,
  type HttpRequestOptions,
  type QueryParams,
} from './HttpClient';

export type FetchFn = (input: string, init?: RequestInit) => Promise<Response>;

export const DEFAULT_TIMEOUT_MS = 15_000;

export interface FetchHttpClientOptions {
  baseUrl: string;
  fetchFn?: FetchFn;
  headers?: Record<string, string>;
  timeoutMs?: number;
  getToken?: () => string | undefined;
  onUnauthorized?: () => void;
}

const UNAUTHORIZED = 401;

const TOKEN_PATH = '/auth/token';

interface SentRequest {
  payload: unknown;
  response: Response;
  url: string;
}

function buildQuery(query: QueryParams | undefined): string {
  const pairs = Object.entries(query ?? {}).filter(
    (entry): entry is [string, string] => entry[1] !== undefined && entry[1] !== '',
  );
  if (pairs.length === 0) {
    return '';
  }
  return `?${pairs.map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`).join('&')}`;
}

async function readBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (text.length === 0) {
    return null;
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function readTotal(response: Response, url: string): number {
  const header = response.headers.get('X-Total-Count');
  const total = header === null || header.trim() === '' ? Number.NaN : Number(header);
  if (Number.isInteger(total) && total >= 0) {
    return total;
  }
  throw new InvalidResponseError(`Resposta de ${url} sem X-Total-Count válido`);
}

export class FetchHttpClient implements HttpClient {
  private readonly baseUrl: string;
  private readonly fetchFn: FetchFn;
  private readonly headers: Record<string, string>;
  private readonly timeoutMs: number;
  private readonly getToken: () => string | undefined;
  private readonly onUnauthorized: () => void;

  constructor(options: FetchHttpClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/+$/, '');
    this.fetchFn = options.fetchFn ?? ((input, init) => fetch(input, init));
    this.headers = { Accept: 'application/json', ...options.headers };
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.getToken = options.getToken ?? (() => undefined);
    this.onUnauthorized = options.onUnauthorized ?? (() => undefined);
  }

  async get(path: string, options: HttpRequestOptions = {}): Promise<unknown> {
    return (await this.send('GET', path, undefined, options)).payload;
  }

  async getPage(path: string, options: HttpRequestOptions = {}): Promise<PageResult> {
    const { payload, response, url } = await this.send('GET', path, undefined, options);
    return { data: payload, total: readTotal(response, url) };
  }

  async post(path: string, body: unknown, options: HttpRequestOptions = {}): Promise<unknown> {
    return (await this.send('POST', path, body, options)).payload;
  }

  async put(path: string, body: unknown, options: HttpRequestOptions = {}): Promise<unknown> {
    return (await this.send('PUT', path, body, options)).payload;
  }

  async patch(path: string, body: unknown, options: HttpRequestOptions = {}): Promise<unknown> {
    return (await this.send('PATCH', path, body, options)).payload;
  }

  async delete(path: string, options: HttpRequestOptions = {}): Promise<unknown> {
    return (await this.send('DELETE', path, undefined, options)).payload;
  }

  private headersFor(body: unknown): Record<string, string> {
    const token = this.getToken();
    return {
      ...this.headers,
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(token === undefined ? {} : { Authorization: `Bearer ${token}` }),
    };
  }

  private async send(
    method: HttpMethod,
    path: string,
    body: unknown,
    options: HttpRequestOptions,
  ): Promise<SentRequest> {
    const relative = `/${path.replace(/^\/+/, '')}`;
    const url = `${this.baseUrl}${relative}${buildQuery(options.query)}`;
    const controller = new AbortController();
    const timeout = new TimeoutError(url, this.timeoutMs);
    const timer = setTimeout(() => controller.abort(timeout), this.timeoutMs);
    const external = options.signal;
    const forwardAbort = () => controller.abort(external?.reason);
    if (external?.aborted === true) {
      forwardAbort();
    }
    external?.addEventListener('abort', forwardAbort, { once: true });

    const init: RequestInit = { method, headers: this.headersFor(body), signal: controller.signal };
    if (body !== undefined) {
      init.body = JSON.stringify(body);
    }

    let response: Response;
    try {
      response = await this.fetchFn(url, init);
    } catch (error) {
      if (controller.signal.reason === timeout) {
        throw timeout;
      }
      if (external?.aborted === true) {
        throw error;
      }
      throw new NetworkError(url, error);
    } finally {
      clearTimeout(timer);
      external?.removeEventListener('abort', forwardAbort);
    }

    const payload = await readBody(response);
    if (!response.ok) {
      if (response.status === UNAUTHORIZED && relative !== TOKEN_PATH) {
        this.onUnauthorized();
      }
      throw new HttpError(response.status, url, payload);
    }
    if (typeof payload === 'string') {
      throw new InvalidResponseError(`Resposta de ${url} não é JSON válido`);
    }
    return { payload, response, url };
  }
}
