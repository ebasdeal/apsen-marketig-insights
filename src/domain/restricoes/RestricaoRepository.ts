import type { Page } from '../shared/Page';
import type {
  Restricao,
  RestricaoPatch,
  RestricaoStatus,
  RestricaoTipo,
  Severidade,
} from './Restricao';

export interface RestricaoFiltro {
  status?: RestricaoStatus;
  sev?: Severidade;
  tipo?: RestricaoTipo;
}

export interface RestricaoRepository {
  listPage(filtro: RestricaoFiltro, pagina: number, tamanho: number): Promise<Page<Restricao>>;
  count(filtro: RestricaoFiltro): Promise<number>;
  maiorCodigo(): Promise<string | null>;
  create(restricao: Restricao): Promise<Restricao>;
  update(id: string, patch: RestricaoPatch): Promise<Restricao>;
}
