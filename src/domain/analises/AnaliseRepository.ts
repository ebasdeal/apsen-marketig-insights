import type { Page } from '../shared/Page';
import type { Analise, AnalisePatch, AnaliseStatus } from './Analise';

export interface AnaliseListFiltro {
  busca: string;
  status: AnaliseStatus | '';
  pagina: number;
  tamanho: number;
}

export interface AnaliseContagemFiltro {
  status?: AnaliseStatus;
}

export interface AnaliseRepository {
  listPage(filtro: AnaliseListFiltro): Promise<Page<Analise>>;
  count(filtro?: AnaliseContagemFiltro): Promise<number>;
  get(id: string): Promise<Analise>;
  maiorCodigo(): Promise<string | null>;
  create(analise: Analise): Promise<Analise>;
  update(id: string, patch: AnalisePatch): Promise<Analise>;
}
