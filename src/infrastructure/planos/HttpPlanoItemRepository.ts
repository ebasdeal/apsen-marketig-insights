import type { PlanoFiltro, PlanoItem, PlanoItemPatch } from '@domain/planos/PlanoItem';
import type { PlanoContagemFiltro, PlanoItemRepository } from '@domain/planos/PlanoItemRepository';
import { padraoDoPrefixo } from '@domain/planos/planoRules';
import { NotFoundError } from '@domain/shared/DomainError';
import type { Page } from '@domain/shared/Page';
import { HttpError, type HttpClient, type QueryParams } from '../http/HttpClient';
import { parseResponse } from './parseResponse';
import { toPlanoItem, toPlanoItemDto } from './planoMapper';
import { planoItemDtoSchema, planoItemListSchema } from './planoSchemas';

const PATH = 'planoItens';
const RECURSO = 'Item do plano';
const NOT_FOUND = 404;

function listQuery(filtro: PlanoFiltro): QueryParams {
  return {
    q: filtro.busca.trim(),
    familia: filtro.familia,
    status: filtro.status,
    _sort: filtro.ordem?.campo,
    _order: filtro.ordem?.direcao,
    _page: String(filtro.pagina),
    _limit: String(filtro.tamanho),
  };
}

export class HttpPlanoItemRepository implements PlanoItemRepository {
  constructor(private readonly http: HttpClient) {}

  async listPage(filtro: PlanoFiltro): Promise<Page<PlanoItem>> {
    const { data, total } = await this.http.getPage(PATH, { query: listQuery(filtro) });
    return {
      items: parseResponse(planoItemListSchema, data, PATH).map(toPlanoItem),
      total,
      page: filtro.pagina,
      limit: filtro.tamanho,
    };
  }

  async count(filtro: PlanoContagemFiltro = {}): Promise<number> {
    const { total } = await this.http.getPage(PATH, {
      query: { status: filtro.status, _limit: '1' },
    });
    return total;
  }

  get(id: string): Promise<PlanoItem> {
    return this.comItem(id, async (path) =>
      toPlanoItem(parseResponse(planoItemDtoSchema, await this.http.get(path), PATH)),
    );
  }

  async maiorCodigo(prefixo?: string): Promise<string | null> {
    const payload = await this.http.get(PATH, {
      query: {
        codigo_like: prefixo === undefined ? undefined : padraoDoPrefixo(prefixo),
        _sort: 'codigo',
        _order: 'desc',
        _limit: '1',
      },
    });
    const [primeiro] = parseResponse(planoItemListSchema, payload, PATH).map(toPlanoItem);
    return primeiro?.codigo ?? null;
  }

  async create(item: PlanoItem): Promise<PlanoItem> {
    const payload = await this.http.post(PATH, toPlanoItemDto(item));
    return toPlanoItem(parseResponse(planoItemDtoSchema, payload, PATH));
  }

  update(id: string, patch: PlanoItemPatch): Promise<PlanoItem> {
    return this.comItem(id, async (path) =>
      toPlanoItem(parseResponse(planoItemDtoSchema, await this.http.patch(path, patch), PATH)),
    );
  }

  delete(id: string): Promise<void> {
    return this.comItem(id, async (path) => {
      await this.http.delete(path);
    });
  }

  private async comItem<T>(id: string, acao: (path: string) => Promise<T>): Promise<T> {
    try {
      return await acao(`${PATH}/${encodeURIComponent(id)}`);
    } catch (error) {
      if (error instanceof HttpError && error.status === NOT_FOUND) {
        throw new NotFoundError(RECURSO, id);
      }
      throw error;
    }
  }
}
