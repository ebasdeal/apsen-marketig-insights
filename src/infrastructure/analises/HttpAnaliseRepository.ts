import type { Analise, AnalisePatch } from '@domain/analises/Analise';
import type {
  AnaliseContagemFiltro,
  AnaliseListFiltro,
  AnaliseRepository,
} from '@domain/analises/AnaliseRepository';
import { NotFoundError } from '@domain/shared/DomainError';
import type { Page } from '@domain/shared/Page';
import type { HttpClient } from '../http/HttpClient';
import { toPageQuery } from '../http/pageQuery';
import { toAnalise, toAnaliseBody, toAnalisePatchBody } from './analiseMapper';
import { analiseDtoSchema, analisesDtoSchema, maiorCodigoDtoSchema } from './analiseSchemas';
import { isNotFound, parseResposta } from './parseResposta';

const RECURSO = '/analises';

export class HttpAnaliseRepository implements AnaliseRepository {
  constructor(private readonly http: HttpClient) {}

  async listPage(filtro: AnaliseListFiltro): Promise<Page<Analise>> {
    const query = toPageQuery({
      page: filtro.pagina,
      limit: filtro.tamanho,
      search: filtro.busca,
      sort: 'codigo',
      order: 'desc',
      filters: {
        status: filtro.status,
        ...(filtro.criadoPor === undefined ? {} : { criado_por: filtro.criadoPor }),
      },
    });
    const { data, total } = await this.http.getPage(RECURSO, { query });
    return {
      items: parseResposta(analisesDtoSchema, data, RECURSO).map(toAnalise),
      total,
      page: filtro.pagina,
      limit: filtro.tamanho,
    };
  }

  async count(filtro: AnaliseContagemFiltro = {}): Promise<number> {
    const { total } = await this.http.getPage(RECURSO, {
      query: { status: filtro.status, _page: '1', _limit: '1' },
    });
    return total;
  }

  async get(id: string): Promise<Analise> {
    try {
      const data = await this.http.get(this.pathOf(id));
      return toAnalise(parseResposta(analiseDtoSchema, data, RECURSO));
    } catch (error) {
      throw this.traduzir(error, id);
    }
  }

  async maiorCodigo(): Promise<string | null> {
    const data = await this.http.get(RECURSO, {
      query: { _sort: 'codigo', _order: 'desc', _limit: '1' },
    });
    return parseResposta(maiorCodigoDtoSchema, data, RECURSO)[0]?.codigo ?? null;
  }

  async create(analise: Analise): Promise<Analise> {
    const data = await this.http.post(RECURSO, toAnaliseBody(analise));
    return toAnalise(parseResposta(analiseDtoSchema, data, RECURSO));
  }

  async update(id: string, patch: AnalisePatch): Promise<Analise> {
    try {
      const data = await this.http.patch(this.pathOf(id), toAnalisePatchBody(patch));
      return toAnalise(parseResposta(analiseDtoSchema, data, RECURSO));
    } catch (error) {
      throw this.traduzir(error, id);
    }
  }

  private pathOf(id: string): string {
    return `${RECURSO}/${encodeURIComponent(id)}`;
  }

  private traduzir(error: unknown, id: string): unknown {
    return isNotFound(error) ? new NotFoundError('Análise', id) : error;
  }
}
