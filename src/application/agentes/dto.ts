import type { AgenteDraft, Provedor, UltimoTeste } from '@domain/agentes/Agente';
import type { AmbienteTone, ProximaExecucao } from '@domain/agentes/agenteRules';

export interface AgenteRowDto {
  id: string;
  codigo: string;
  papel: string;
  papelCurto: string;
  nome: string;
  fontes: string;
  provedor: Provedor;
  endpoint: string;
  secret: string;
  vault: string;
  modelo: string;
  schedule: string;
  ambiente: string;
  ambienteLabel: string;
  ambienteTone: AmbienteTone;
  ultimoTeste: UltimoTeste;
  ativo: boolean;
  limiar: number;
}

export interface AgentesPageDto {
  rows: AgenteRowDto[];
  total: number;
  totalPages: number;
}

export interface ListAgentesInput {
  page: number;
  size?: number;
}

export interface AgenteAgendadoDto {
  id: string;
  papel: string;
  schedule: string;
}

export interface AgentesResumoDto {
  total: number;
  ativos: number;
  agendados: AgenteAgendadoDto[];
  proxima: ProximaExecucao | null;
  alertaTexto: string;
  resumoTexto: string;
}

export interface AgenteFormDto {
  draft: AgenteDraft;
  extras: { schedule?: string; modelo?: string };
}

export interface SaveAgenteInput {
  id?: string;
  draft: AgenteDraft;
}

export interface ToggleAgenteInput {
  id: string;
  papel: string;
  ativo: boolean;
}

export interface TestarAgenteInput {
  id: string;
  papel: string;
}

export interface AgenteToastDto {
  toast: string;
}

export interface TestarAgenteDto extends AgenteToastDto {
  ultimoTeste: UltimoTeste;
}

export const AGENTE_SALVO_TOAST = '✅ Agente salvo!';

export const AGENTE_FALHA_TOAST = '⚠️ Não foi possível salvar as alterações. Tente novamente.';

export const AGENTE_TESTAR_FORM_INICIO_TOAST = '⟳ Testando conexão...';

export const AGENTE_TESTAR_FORM_OK_TOAST = '✅ Conexão OK — Key Vault e endpoint acessíveis.';
