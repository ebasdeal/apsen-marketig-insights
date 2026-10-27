import type { Provedor } from './Agente';

export interface AgenteOpcao<T extends string> {
  value: T;
  label: string;
}

export interface AgenteModeloGrupo {
  group: string;
  options: readonly string[];
}

export const AGENTE_PAPEIS: readonly string[] = [
  '🏛️ Agente Regulatório — DOU / ANVISA / CMED / MS',
  '🔬 Agente Concorrência — Bulário / IQVIA / press releases',
  '📱 Agente Social — Instagram / TikTok / X',
  '📄 Agente Clínico — PubMed / ClinicalTrials / guidelines',
  '🌍 Agente Macro — Reuters / Fiocruz / IBGE',
  '➕ Agente customizado',
];

export const AGENTE_PROVEDORES: readonly AgenteOpcao<Provedor>[] = [
  { value: 'azure-foundry', label: 'azure-foundry — Microsoft Azure AI Foundry' },
  { value: 'anthropic', label: 'anthropic — Anthropic API' },
  { value: 'openai', label: 'openai — OpenAI API' },
];

export const AGENTE_AMBIENTES: readonly string[] = ['Produção', 'Homologação', 'Desenvolvimento'];

export const AGENTE_MODELOS: readonly AgenteModeloGrupo[] = [
  {
    group: 'Claude (Anthropic)',
    options: ['claude-sonnet-4-6', 'claude-opus-4-6', 'claude-haiku-4-5'],
  },
  { group: 'GPT (OpenAI)', options: ['gpt-4o'] },
];

export const AGENTE_SCHEDULES: readonly string[] = [
  'Diário · 03h00',
  'Diário · 04h00',
  'Diário · 05h00',
  'A cada 6 horas (H24)',
  'Semanal · Dom 02h',
];

export const SCHEDULE_PADRAO = 'Diário · 03h00';

export const LIMIAR_PADRAO = 75;

export const LIMIAR_MIN = 50;

export const LIMIAR_MAX = 100;

export const AGENTE_PAGE_SIZE = 10;

export const AGENTES_ATIVOS_LIMIT = 50;
