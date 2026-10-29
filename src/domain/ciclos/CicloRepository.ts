import type { Ciclo, CicloPatch } from './Ciclo';

export interface CicloPageQuery {
  page: number;
  size: number;
}

export interface CicloPage {
  items: readonly Ciclo[];
  total: number;
}

export interface CicloAtivoInfo {
  ativo: Ciclo | null;
  totalAtivos: number;
}

export interface CicloRepository {
  listPage(query: CicloPageQuery): Promise<CicloPage>;
  findAtivo(): Promise<CicloAtivoInfo>;
  listCodigos(): Promise<string[]>;
  create(ciclo: Ciclo): Promise<Ciclo>;
  update(id: string, patch: CicloPatch): Promise<Ciclo>;
}
