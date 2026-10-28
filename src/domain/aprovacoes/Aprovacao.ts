export type AprovStatus = 'pendente' | 'aprovado' | 'rejeitado';

export type AprovModo = 'SKU' | 'Molécula';

export type Intensidade = 1 | 2 | 3 | 4 | 5;

export interface Periodo {
  ini: string;
  fim: string;
}

export type DecisaoTipo = 'aprovado' | 'rejeitado' | 'reaberto';

export interface DecisaoRegistrada {
  tipo: DecisaoTipo;
  por: string;
  em: string;
}

export interface Aprovacao {
  id: string;
  modo: AprovModo;
  produto: string;
  molecula: string;
  tipo: string;
  cat: string;
  periodo: Periodo;
  intensidade: Intensidade;
  registrante: string;
  dataReg: string;
  status: AprovStatus;
  params: string;
  motivoRejeicao: string;
  justificativaRejeicao: string;
  decisao: DecisaoRegistrada | null;
}

export interface AprovFiltro {
  q: string;
  ini: string;
  fim: string;
  tipo: string;
  status: AprovStatus | '';
}

export const FILTRO_VAZIO: AprovFiltro = { q: '', ini: '', fim: '', tipo: '', status: '' };

export interface AprovPageRequest {
  page: number;
  size: number;
}

export interface AprovacaoPatch {
  status: AprovStatus;
  motivoRejeicao?: string;
  justificativaRejeicao?: string;
  decisao?: DecisaoRegistrada;
}

export type Decisao =
  | { tipo: 'aprovar' }
  | { tipo: 'rejeitar'; motivo: string; justificativa: string }
  | { tipo: 'reabrir' };
