import type {
  RestricaoForm,
  RestricaoStatus,
  RestricaoTipo,
  Severidade,
} from '@domain/restricoes/Restricao';

export type RestricoesAba = 'ativas' | 'resolvidas';

export interface RestricaoItemOutput {
  id: string;
  codigo: string;
  tipo: RestricaoTipo;
  label: string;
  desc: string;
  det: string;
  produto: string;
  impacto: string;
  impCor: Severidade;
  prazo: string;
  resp: string;
  sev: Severidade;
  sevLabel: string;
  status: RestricaoStatus;
  resolucaoResumo: string;
  form: RestricaoForm;
}

export interface ListRestricoesInput {
  aba: RestricoesAba;
  pagina: number;
}

export interface RestricoesPaginaOutput {
  itens: RestricaoItemOutput[];
  total: number;
  pagina: number;
  tamanho: number;
}

export interface ContagemRestricoesOutput {
  ativas: number;
  resolvidas: number;
}

export interface RestricaoRegistradaOutput {
  id: string;
  codigo: string;
}

export interface RestricoesPorTipoOutput {
  tipo: RestricaoTipo;
  n: number;
}

export interface ResumoRestricoesOutput {
  ativas: number;
  criticas: number;
  porTipo: RestricoesPorTipoOutput[];
}
