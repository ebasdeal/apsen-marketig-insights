import type { Ciclo, CicloPatch } from '@domain/ciclos/Ciclo';
import type {
  CicloAtivoInfo,
  CicloPage,
  CicloPageQuery,
  CicloRepository,
} from '@domain/ciclos/CicloRepository';
import { NotFoundError } from '@domain/shared/DomainError';
import type { z } from 'zod';
import { HttpError, InvalidResponseError, type HttpClient } from '../http/HttpClient';
import { toPageQuery } from '../http/pageQuery';
import { toCiclo, toCicloDto } from './cicloMapper';
import { cicloDtoSchema, cicloListSchema } from './cicloSchema';

const PATH = '/ciclos';

const NOT_FOUND = 404;

function parse<S extends z.ZodType>(schema: S, value: unknown): z.infer<S> {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw new InvalidResponseError('Resposta de /ciclos inválida');
  }
  return result.data;
}

export class HttpCicloRepository implements CicloRepository {
  constructor(private readonly http: HttpClient) {}

  async listPage({ page, size }: CicloPageQuery): Promise<CicloPage> {
    const { data, total } = await this.http.getPage(PATH, {
      query: toPageQuery({ page, limit: size, sort: 'inicio', order: 'desc' }),
    });
    return { items: parse(cicloListSchema, data).map(toCiclo), total };
  }

  async findAtivo(): Promise<CicloAtivoInfo> {
    const { data, total } = await this.http.getPage(PATH, {
      query: { status: 'ativo', _page: '1', _limit: '1' },
    });
    const [ativo] = parse(cicloListSchema, data);
    return { ativo: ativo === undefined ? null : toCiclo(ativo), totalAtivos: total };
  }

  async listCodigos(): Promise<string[]> {
    return parse(cicloListSchema, await this.http.get(PATH)).map((dto) => toCiclo(dto).codigo);
  }

  async create(ciclo: Ciclo): Promise<Ciclo> {
    return toCiclo(parse(cicloDtoSchema, await this.http.post(PATH, toCicloDto(ciclo))));
  }

  async update(id: string, patch: CicloPatch): Promise<Ciclo> {
    try {
      const body = await this.http.patch(`${PATH}/${encodeURIComponent(id)}`, patch);
      return toCiclo(parse(cicloDtoSchema, body));
    } catch (error) {
      if (error instanceof HttpError && error.status === NOT_FOUND) {
        throw new NotFoundError('Ciclo', id);
      }
      throw error;
    }
  }
}
