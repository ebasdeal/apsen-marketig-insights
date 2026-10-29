import type { PAGE_SIZES } from '../shared/Page';

export type PlanoStatus = 'aprovado' | 'revisao' | 'bloqueado' | 'pendente';

export interface PlanoItem {
  id: string;
  codigo: string;
  sku: string;
  nome: string;
  apres: string;
  familia: string;
  qtd: number;
  linha: string;
  semana: string;
  status: PlanoStatus;
  resp: string;
  obs: string;
}

export interface SkuMeta {
  id: string;
  nome: string;
  apres: string;
  familia: string;
}

export type PlanoOrdemCampo = 'codigo' | 'qtd';

export type PlanoOrdem = { campo: PlanoOrdemCampo; direcao: 'asc' | 'desc' } | null;

export type TamanhoPagina = (typeof PAGE_SIZES)[number];

export interface PlanoFiltro {
  busca: string;
  familia: string;
  status: PlanoStatus | '';
  ordem: PlanoOrdem;
  pagina: number;
  tamanho: TamanhoPagina;
}

export interface PlanoItemForm {
  qtd: string;
  linha: string;
  semana: string;
  status: PlanoStatus;
  resp: string;
  obs: string;
}

export interface InclusaoForm {
  sku: string;
  qtd: string;
  linha: string;
  semana: string;
  resp: string;
  obs: string;
}

export type PlanoItemPatch = Partial<Omit<PlanoItem, 'id' | 'codigo'>>;
