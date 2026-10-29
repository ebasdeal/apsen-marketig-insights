export type RestricaoTipo =
  'mp' | 'capacidade' | 'demanda' | 'qualidade' | 'regulatorio' | 'logistica' | 'outro';

export type Severidade = 'critica' | 'atencao' | 'analise';

export type RestricaoStatus = 'ativa' | 'resolvida';

export interface Restricao {
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
  status: RestricaoStatus;
  obs: string;
  resolucao: string | null;
}

export interface RestricaoForm {
  tipo: RestricaoTipo | '';
  sev: Severidade;
  desc: string;
  produto: string;
  impacto: string;
  prazoIso: string;
  resp: string;
  obs: string;
}

export type RestricaoPatch = Partial<Omit<Restricao, 'id' | 'codigo'>>;
