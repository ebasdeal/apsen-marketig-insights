export type Provedor = 'azure-foundry' | 'anthropic' | 'openai';

export type TesteStatus = 'ok' | 'falha' | 'pendente';

export interface UltimoTeste {
  status: TesteStatus;
  ts: string;
}

export interface Agente {
  id: string;
  codigo: string;
  papel: string;
  nome: string;
  fontes: string;
  provedor: Provedor;
  endpoint: string;
  secret: string;
  vault: string;
  modelo: string;
  schedule: string;
  ambiente: string;
  ultimoTeste: UltimoTeste;
  ativo: boolean;
  limiar: number;
}

export interface AgenteDraft {
  papelOpcao: string;
  nome: string;
  provedor: Provedor | '';
  ambiente: string;
  endpoint: string;
  vault: string;
  secret: string;
  modelo: string;
  schedule: string;
  fontes: string;
  limiar: number;
  ativo: boolean;
}

export type AgentePatch = Partial<Omit<Agente, 'id' | 'codigo'>>;

export const TESTE_PENDENTE: UltimoTeste = { status: 'pendente', ts: '— não testado' };
