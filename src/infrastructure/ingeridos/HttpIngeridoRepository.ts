import type { Ingerido, IngeridoFiltro, IngeridoPageRequest } from '@domain/ingeridos/Ingerido';
import type { IngeridoRepository } from '@domain/ingeridos/IngeridoRepository';
import { NotFoundError } from '@domain/shared/DomainError';
import type { Page } from '@domain/shared/Page';
import type { HttpClient } from '../http/HttpClient';
import { isNotFound, parseContract } from '../http/parseContract';
import { toIngerido, toIngeridoQuery } from './ingeridoMapper';
import { ingeridosResponseSchema } from './ingeridoSchema';

const INGERIDOS = '/ingeridos';

export class HttpIngeridoRepository implements IngeridoRepository {
  constructor(private readonly http: HttpClient) {}

  async listPage(
    filtro: IngeridoFiltro,
    { page, size }: IngeridoPageRequest,
  ): Promise<Page<Ingerido>> {
    const result = await this.http.getPage(INGERIDOS, {
      query: { _page: String(page), _limit: String(size), ...toIngeridoQuery(filtro) },
    });
    const items = parseContract(ingeridosResponseSchema, result.data, INGERIDOS).map(toIngerido);
    return { items, total: result.total, page, limit: size };
  }

  async delete(id: string): Promise<void> {
    try {
      await this.http.delete(`${INGERIDOS}/${encodeURIComponent(id)}`);
    } catch (error) {
      throw isNotFound(error) ? new NotFoundError('Driver ingerido', id) : error;
    }
  }
}
