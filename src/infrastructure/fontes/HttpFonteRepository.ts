import type { Fonte, FonteConfig } from '@domain/fontes/Fonte';
import type { FontePage, FontePageQuery, FonteRepository } from '@domain/fontes/FonteRepository';
import { slugFonte } from '@domain/fontes/fonteRules';
import { NotFoundError } from '@domain/shared/DomainError';
import type { z } from 'zod';
import { HttpError, InvalidResponseError, type HttpClient } from '../http/HttpClient';
import { toPageQuery } from '../http/pageQuery';
import { toFonte, toFonteDto } from './fonteMapper';
import { fonteDtoSchema, fonteListSchema } from './fonteSchema';

const PATH = '/fontes';

const NOT_FOUND = 404;

export const OPTIONS_LIMIT = 50;

function parse<S extends z.ZodType>(schema: S, value: unknown): z.infer<S> {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw new InvalidResponseError('Resposta de /fontes inválida');
  }
  return result.data;
}

export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export class HttpFonteRepository implements FonteRepository {
  constructor(private readonly http: HttpClient) {}

  async listPage({ page, size }: FontePageQuery): Promise<FontePage> {
    const { data, total } = await this.http.getPage(PATH, {
      query: toPageQuery({ page, limit: size }),
    });
    return { items: parse(fonteListSchema, data).map(toFonte), total };
  }

  async listAll(): Promise<readonly Fonte[]> {
    const body = await this.http.get(PATH, {
      query: toPageQuery({ page: 1, limit: OPTIONS_LIMIT }),
    });
    return parse(fonteListSchema, body).map(toFonte);
  }

  async existsNome(nome: string): Promise<boolean> {
    const body = await this.http.get(PATH, { query: { nome_like: escapeRegex(nome.trim()) } });
    const slug = slugFonte(nome);
    return parse(fonteListSchema, body).some((dto) => slugFonte(dto.nome) === slug);
  }

  async create(fonte: Fonte): Promise<Fonte> {
    return toFonte(parse(fonteDtoSchema, await this.http.post(PATH, toFonteDto(fonte))));
  }

  async update(id: string, patch: FonteConfig): Promise<Fonte> {
    return this.notFoundAs(id, async () =>
      toFonte(parse(fonteDtoSchema, await this.http.patch(this.itemPath(id), patch))),
    );
  }

  async delete(id: string): Promise<void> {
    await this.notFoundAs(id, () => this.http.delete(this.itemPath(id)));
  }

  private itemPath(id: string): string {
    return `${PATH}/${encodeURIComponent(id)}`;
  }

  private async notFoundAs<T>(id: string, action: () => Promise<T>): Promise<T> {
    try {
      return await action();
    } catch (error) {
      if (error instanceof HttpError && error.status === NOT_FOUND) {
        throw new NotFoundError('Fonte', id);
      }
      throw error;
    }
  }
}
