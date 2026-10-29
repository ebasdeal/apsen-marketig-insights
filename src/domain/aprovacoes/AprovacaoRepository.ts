import type { Page } from '../shared/Page';
import type { Aprovacao, AprovacaoPatch, AprovFiltro, AprovPageRequest } from './Aprovacao';

export interface AprovacaoRepository {
  listPage(filtro: AprovFiltro, request: AprovPageRequest): Promise<Page<Aprovacao>>;
  countPendentes(filtro?: AprovFiltro): Promise<number>;
  listEmUso(): Promise<string[]>;
  update(id: string, patch: AprovacaoPatch): Promise<void>;
  create(aprovacao: Aprovacao): Promise<void>;
  maiorId(): Promise<string | null>;
  removerPorDriver(driverId: string): Promise<void>;
}
