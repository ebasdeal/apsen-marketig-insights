import type {
  Aprovacao,
  AprovacaoPatch,
  AprovFiltro,
  AprovPageRequest,
} from '@domain/aprovacoes/Aprovacao';
import { FILTRO_VAZIO } from '@domain/aprovacoes/Aprovacao';
import type { AprovacaoRepository } from '@domain/aprovacoes/AprovacaoRepository';
import { NotFoundError } from '@domain/shared/DomainError';
import type { Page } from '@domain/shared/Page';
import type { HttpClient } from '../http/HttpClient';
import { isNotFound, parseContract } from '../http/parseContract';
import { toAprovacao, toAprovacaoDto, toAprovacaoPatchDto, toFiltroQuery } from './aprovacaoMapper';
import { aprovacoesResponseSchema, aprovConfigSchema } from './aprovacaoSchema';

const APROVACOES = '/aprovacoes';
const CONFIG = '/config';

export class HttpAprovacaoRepository implements AprovacaoRepository {
  constructor(private readonly http: HttpClient) {}

  async listPage(filtro: AprovFiltro, { page, size }: AprovPageRequest): Promise<Page<Aprovacao>> {
    const result = await this.http.getPage(APROVACOES, {
      query: {
        _page: String(page),
        _limit: String(size),
        _sort: 'id',
        _order: 'desc',
        ...toFiltroQuery(filtro),
      },
    });
    const items = parseContract(aprovacoesResponseSchema, result.data, APROVACOES).map(toAprovacao);
    return { items, total: result.total, page, limit: size };
  }

  async countPendentes(filtro?: AprovFiltro): Promise<number> {
    const base = filtro === undefined ? {} : toFiltroQuery(filtro);
    const result = await this.http.getPage(APROVACOES, {
      query: { ...base, status: 'pendente', _page: '1', _limit: '1' },
    });
    return result.total;
  }

  async listEmUso(): Promise<string[]> {
    return parseContract(aprovConfigSchema, await this.http.get(CONFIG), CONFIG).APROV_INGERIDOS;
  }

  async create(aprovacao: Aprovacao): Promise<void> {
    await this.http.post(APROVACOES, toAprovacaoDto(aprovacao));
  }

  async maiorId(): Promise<string | null> {
    const { items } = await this.listPage(FILTRO_VAZIO, { page: 1, size: 1 });
    return items[0]?.id ?? null;
  }

  async removerPorDriver(driverId: string): Promise<void> {
    const { data } = await this.http.getPage(APROVACOES, {
      query: { driver_id: driverId, _page: '1', _limit: '100' },
    });
    const itens = parseContract(aprovacoesResponseSchema, data, APROVACOES);
    await Promise.all(
      itens.map((item) =>
        this.http.delete(`${APROVACOES}/${encodeURIComponent(item.id)}`).catch((error: unknown) => {
          if (!isNotFound(error)) {
            throw error;
          }
        }),
      ),
    );
  }

  async update(id: string, patch: AprovacaoPatch): Promise<void> {
    try {
      await this.http.patch(`${APROVACOES}/${encodeURIComponent(id)}`, toAprovacaoPatchDto(patch));
    } catch (error) {
      throw isNotFound(error) ? new NotFoundError('Aprovação', id) : error;
    }
  }
}
