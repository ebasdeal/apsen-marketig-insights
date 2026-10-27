import type { ContagemRepository } from '@domain/navegacao/ContagemRepository';
import type { HttpClient } from '../http/HttpClient';

export class HttpContagemRepository implements ContagemRepository {
  constructor(private readonly http: HttpClient) {}

  async contar(colecao: string, filtro: Readonly<Record<string, string>> = {}): Promise<number> {
    const page = await this.http.getPage(`/${colecao}`, {
      query: { ...filtro, _page: '1', _limit: '1' },
    });
    return page.total;
  }
}
