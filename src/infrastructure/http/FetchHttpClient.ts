import {
  HttpError,
  InvalidResponseError,
  NetworkError,
  type HttpClient,
  type HttpRequestOptions,
  type QueryParams,
} from './HttpClient';

export type FetchFn = (input: string, init?: RequestInit) => Promise<Response>;

export interface FetchHttpClientOptions {
  baseUrl: string;
  fetchFn?: FetchFn;
  headers?: Record<string, string>;
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

export class FetchHttpClient implements HttpClient {
  private readonly baseUrl: string;
  private readonly fetchFn: FetchFn;
  private readonly headers: Record<string, string>;

  constructor(options: FetchHttpClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/+$/, '');
    this.fetchFn = options.fetchFn ?? ((input, init) => fetch(input, init));
    this.headers = { Accept: 'application/json', ...options.headers };
  }

  async get(path: string, options: HttpRequestOptions = {}): Promise<unknown> {
    const url = `${this.baseUrl}/${path.replace(/^\/+/, '')}${buildQuery(options.query)}`;
    const init: RequestInit = { method: 'GET', headers: this.headers };
    if (options.signal !== undefined) {
      init.signal = options.signal;
    }

    let response: Response;
    try {
      response = await this.fetchFn(url, init);
    } catch (error) {
      throw new NetworkError(url, error);
    }

    const body = await readBody(response);
    if (!response.ok) {
      throw new HttpError(response.status, url, body);
    }
    if (typeof body === 'string') {
      throw new InvalidResponseError(`Resposta de ${url} não é JSON válido`);
    }
    return body;
  }
}
