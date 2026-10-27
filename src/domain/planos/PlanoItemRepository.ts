import type { Page } from '../shared/Page';
import type { PlanoFiltro, PlanoItem, PlanoItemPatch, PlanoStatus, SkuMeta } from './PlanoItem';

export interface PlanoContagemFiltro {
  status?: PlanoStatus;
}

export interface PlanoItemRepository {
  listPage(filtro: PlanoFiltro): Promise<Page<PlanoItem>>;
  count(filtro?: PlanoContagemFiltro): Promise<number>;
  get(id: string): Promise<PlanoItem>;
  maiorCodigo(prefixo?: string): Promise<string | null>;
  create(item: PlanoItem): Promise<PlanoItem>;
  update(id: string, patch: PlanoItemPatch): Promise<PlanoItem>;
  delete(id: string): Promise<void>;
}

export interface SkuMetaRepository {
  listByIds(ids: readonly string[]): Promise<SkuMeta[]>;
}

export interface CicloAtivoRepository {
  cicloAtivoId(): Promise<string | null>;
}
