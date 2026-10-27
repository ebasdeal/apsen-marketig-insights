import { NotFoundError } from '@domain/shared/DomainError';
import type { Page } from '@domain/shared/Page';
import type {
  CamposTipo,
  Categoria,
  CategoriaTipoRef,
  Tipo,
  TipoPageRequest,
  TipoPatch,
} from '@domain/tipos/Tipo';
import type { TipoRepository } from '@domain/tipos/TipoRepository';
import type { HttpClient, QueryParams } from '../http/HttpClient';
import { isNotFound, parseContract } from '../http/parseContract';
import { toCamposTipo, toCategoria, toTipo } from './tipoMapper';
import {
  camposTipoDtoSchema,
  categoriasResponseSchema,
  tipoDtoSchema,
  tiposResponseSchema,
} from './tipoSchemas';

const TIPOS = '/tipos';
const CAMPOS = '/camposTipo';
const CATEGORIAS = '/categorias';

function itemPath(base: string, id: string | number): string {
  return `${base}/${encodeURIComponent(String(id))}`;
}

export class HttpTipoRepository implements TipoRepository {
  constructor(private readonly http: HttpClient) {}

  async listPage({ page, size, cat }: TipoPageRequest): Promise<Page<Tipo>> {
    const query: QueryParams = { _page: String(page), _limit: String(size) };
    if (cat !== undefined) {
      query.cat = cat;
    }
    const result = await this.http.getPage(TIPOS, { query });
    const items = parseContract(tiposResponseSchema, result.data, TIPOS).map(toTipo);
    return { items, total: result.total, page, limit: size };
  }

  async count(filtro: { ativo?: boolean } = {}): Promise<number> {
    const query: QueryParams = { _page: '1', _limit: '1' };
    if (filtro.ativo !== undefined) {
      query.ativo = String(filtro.ativo);
    }
    return (await this.http.getPage(TIPOS, { query })).total;
  }

  async get(id: string): Promise<Tipo> {
    const path = itemPath(TIPOS, id);
    try {
      return toTipo(parseContract(tipoDtoSchema, await this.http.get(path), path));
    } catch (error) {
      throw isNotFound(error) ? new NotFoundError('Tipo', id) : error;
    }
  }

  async findBySlug(slug: string): Promise<Tipo | null> {
    const payload = await this.http.get(TIPOS, { query: { slug } });
    const [tipo] = parseContract(tiposResponseSchema, payload, TIPOS);
    return tipo === undefined ? null : toTipo(tipo);
  }

  async create(tipo: Tipo): Promise<void> {
    await this.http.post(TIPOS, tipo);
  }

  async update(id: string, patch: TipoPatch): Promise<void> {
    await this.http.patch(itemPath(TIPOS, id), patch);
  }

  async delete(id: string): Promise<void> {
    try {
      await this.http.delete(itemPath(TIPOS, id));
    } catch (error) {
      throw isNotFound(error) ? new NotFoundError('Tipo', id) : error;
    }
  }

  async getCampos(id: string): Promise<CamposTipo | null> {
    const path = itemPath(CAMPOS, id);
    try {
      return toCamposTipo(parseContract(camposTipoDtoSchema, await this.http.get(path), path));
    } catch (error) {
      if (isNotFound(error)) {
        return null;
      }
      throw error;
    }
  }

  async saveCampos(campos: CamposTipo, existe: boolean): Promise<void> {
    if (existe) {
      await this.http.put(itemPath(CAMPOS, campos.id), campos);
      return;
    }
    await this.http.post(CAMPOS, campos);
  }

  async deleteCampos(id: string): Promise<void> {
    try {
      await this.http.delete(itemPath(CAMPOS, id));
    } catch (error) {
      if (!isNotFound(error)) {
        throw error;
      }
    }
  }

  async listCategorias(): Promise<Categoria[]> {
    const payload = await this.http.get(CATEGORIAS);
    return parseContract(categoriasResponseSchema, payload, CATEGORIAS).map(toCategoria);
  }

  async updateCategoriaTipos(id: number, tipos: CategoriaTipoRef[]): Promise<void> {
    await this.http.patch(itemPath(CATEGORIAS, id), { tipos });
  }
}
