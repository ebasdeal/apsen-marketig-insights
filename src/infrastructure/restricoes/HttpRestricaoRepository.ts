import type { Restricao, RestricaoPatch } from '@domain/restricoes/Restricao';
import type { RestricaoFiltro, RestricaoRepository } from '@domain/restricoes/RestricaoRepository';
import { NotFoundError } from '@domain/shared/DomainError';
import type { Page } from '@domain/shared/Page';
import type { z } from 'zod';
import { HttpError, InvalidResponseError, type HttpClient } from '../http/HttpClient';
import { toRestricao, toRestricaoDto } from './restricaoMapper';
import { restricaoDtoSchema, restricaoListSchema } from './restricaoSchemas';

const PATH = 'restricoes';
const NOT_FOUND = 404;

function parse<T>(schema: z.ZodType<T>, payload: unknown): T {
  const result = schema.safeParse(payload);
  if (!result.success) {
    throw new InvalidResponseError('Resposta inválida de /restricoes');
  }
  return result.data;
}

function filtroQuery(filtro: RestricaoFiltro) {
  return { status: filtro.status, sev: filtro.sev, tipo: filtro.tipo };
}

export class HttpRestricaoRepository implements RestricaoRepository {
  constructor(private readonly http: HttpClient) {}

  async listPage(
    filtro: RestricaoFiltro,
    pagina: number,
    tamanho: number,
  ): Promise<Page<Restricao>> {
    const { data, total } = await this.http.getPage(PATH, {
      query: { ...filtroQuery(filtro), _page: String(pagina), _limit: String(tamanho) },
    });
    const items = parse(restricaoListSchema, data).map(toRestricao);
    return { items, total, page: pagina, limit: tamanho };
  }

  async count(filtro: RestricaoFiltro): Promise<number> {
    const { total } = await this.http.getPage(PATH, {
      query: { ...filtroQuery(filtro), _limit: '1' },
    });
    return total;
  }

  async maiorCodigo(): Promise<string | null> {
    const payload = await this.http.get(PATH, {
      query: { _sort: 'codigo', _order: 'desc', _limit: '1' },
    });
    const [primeira] = parse(restricaoListSchema, payload).map(toRestricao);
    return primeira?.codigo ?? null;
  }

  async create(restricao: Restricao): Promise<Restricao> {
    const payload = await this.http.post(PATH, toRestricaoDto(restricao));
    return toRestricao(parse(restricaoDtoSchema, payload));
  }

  async update(id: string, patch: RestricaoPatch): Promise<Restricao> {
    try {
      const payload = await this.http.patch(`${PATH}/${encodeURIComponent(id)}`, patch);
      return toRestricao(parse(restricaoDtoSchema, payload));
    } catch (error) {
      if (error instanceof HttpError && error.status === NOT_FOUND) {
        throw new NotFoundError('Restrição', id);
      }
      throw error;
    }
  }
}
