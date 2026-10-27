import { montarAgentesResumo } from '@application/agentes/GetAgentesResumo';
import { toAgenteRowDto } from '@application/agentes/ListAgentes';
import type { AgenteFormDto, AgentesPageDto, AgentesResumoDto } from '@application/agentes/dto';
import type { Agente } from '@domain/agentes/Agente';

const BASE = {
  nome: '',
  endpoint: 'https://apsen-di.services.ai.azure.com',
  vault: 'apsen-keyvault.vault.azure.net',
  provedor: 'azure-foundry',
  modelo: 'claude-sonnet-4-6',
  ambiente: 'Produção',
  limiar: 75,
} as const;

export const AGENTES_FIXTURE: Agente[] = [
  {
    ...BASE,
    id: 'AG-001',
    codigo: 'AG-001',
    papel: '🏛️ Agente Regulatório',
    fontes: 'DOU · ANVISA · CMED · MS',
    secret: 'apsen-di-reg-agent-key',
    schedule: 'Diário · 03h00',
    ultimoTeste: { status: 'ok', ts: '19/06/2026 03:12' },
    ativo: true,
  },
  {
    ...BASE,
    id: 'AG-002',
    codigo: 'AG-002',
    papel: '🔬 Agente Concorrência',
    fontes: 'Bulário ANVISA · IQVIA · press releases',
    secret: 'apsen-di-conc-agent-key',
    schedule: 'Diário · 04h00',
    ultimoTeste: { status: 'ok', ts: '19/06/2026 04:08' },
    ativo: true,
  },
  {
    ...BASE,
    id: 'AG-003',
    codigo: 'AG-003',
    papel: '📱 Agente Social',
    fontes: 'Instagram · TikTok · X · buzz / off-label',
    secret: 'apsen-di-social-agent-key',
    modelo: 'claude-haiku-4-5',
    schedule: 'H24 · a cada 6h',
    ultimoTeste: { status: 'ok', ts: '19/06/2026 18:00' },
    ativo: true,
  },
  {
    ...BASE,
    id: 'AG-004',
    codigo: 'AG-004',
    papel: '📄 Agente Clínico',
    fontes: 'PubMed · ClinicalTrials · guidelines',
    endpoint: 'https://apsen-di-hml.services.ai.azure.com',
    secret: 'apsen-di-clin-agent-key',
    modelo: 'claude-opus-4-6',
    schedule: 'Semanal · Dom 02h',
    ambiente: 'Homologação',
    ultimoTeste: { status: 'pendente', ts: '— não testado' },
    ativo: false,
  },
  {
    ...BASE,
    id: 'AG-005',
    codigo: 'AG-005',
    papel: '🌍 Agente Macro',
    fontes: 'Reuters · Fiocruz · IBGE · crises',
    provedor: 'anthropic',
    endpoint: 'https://api.anthropic.com',
    secret: 'apsen-di-macro-agent-key',
    schedule: 'Diário · 05h00',
    ambiente: 'Dev',
    ultimoTeste: { status: 'falha', ts: '17/06/2026 05:00' },
    ativo: false,
  },
];

export function buildAgente(overrides: Partial<Agente> = {}): Agente {
  return { ...(AGENTES_FIXTURE[0] as Agente), ...overrides };
}

export const AGENTES_PAGE_FIXTURE: AgentesPageDto = {
  rows: AGENTES_FIXTURE.map(toAgenteRowDto),
  total: AGENTES_FIXTURE.length,
  totalPages: 1,
};

export const AGENTES_RESUMO_FIXTURE: AgentesResumoDto = montarAgentesResumo(
  AGENTES_FIXTURE.length,
  3,
  AGENTES_FIXTURE.filter((agente) => agente.ativo).map(({ id, papel, schedule }) => ({
    id,
    papel,
    schedule,
  })),
);

export const AGENTE_FORM_FIXTURE: AgenteFormDto = {
  draft: {
    papelOpcao: '🌍 Agente Macro — Reuters / Fiocruz / IBGE',
    nome: '',
    provedor: 'anthropic',
    ambiente: 'Desenvolvimento',
    endpoint: 'https://api.anthropic.com',
    vault: 'apsen-keyvault.vault.azure.net',
    secret: 'apsen-di-macro-agent-key',
    modelo: 'claude-sonnet-4-6',
    schedule: 'Diário · 05h00',
    fontes: 'Reuters · Fiocruz · IBGE · crises',
    limiar: 75,
    ativo: false,
  },
  extras: {},
};
