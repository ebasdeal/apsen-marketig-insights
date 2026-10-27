import type { SkuMeta } from '@domain/planos/PlanoItem';
import type { SkuMetaRepository } from '@domain/planos/PlanoItemRepository';
import type { HttpClient } from '../http/HttpClient';
import { parseResponse } from './parseResponse';
import { skuMetaListSchema } from './planoSchemas';

const PATH = 'skuMeta';

export class HttpSkuMetaRepository implements SkuMetaRepository {
  constructor(private readonly http: HttpClient) {}

  async listByIds(ids: readonly string[]): Promise<SkuMeta[]> {
    if (ids.length === 0) {
      return [];
    }
    const query = ids.map((id) => `id=${encodeURIComponent(id)}`).join('&');
    return parseResponse(skuMetaListSchema, await this.http.get(`${PATH}?${query}`), PATH);
  }
}
