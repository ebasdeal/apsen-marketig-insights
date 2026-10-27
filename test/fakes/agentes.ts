import { conexaoOkToast, toggleToast } from '@application/agentes/agenteToasts';
import type { AgentesUseCases } from '@application/agentes/agentesUseCases';
import { AGENTE_SALVO_TOAST } from '@application/agentes/dto';
import {
  AGENTE_FORM_FIXTURE,
  AGENTES_PAGE_FIXTURE,
  AGENTES_RESUMO_FIXTURE,
} from '../fixtures/agentes';

export function createFakeAgentesUseCases(
  overrides: Partial<AgentesUseCases> = {},
): AgentesUseCases {
  return {
    list: { execute: vi.fn().mockResolvedValue(AGENTES_PAGE_FIXTURE) },
    resumo: { execute: vi.fn().mockResolvedValue(AGENTES_RESUMO_FIXTURE) },
    getForm: { execute: vi.fn().mockResolvedValue(AGENTE_FORM_FIXTURE) },
    save: { execute: vi.fn().mockResolvedValue({ toast: AGENTE_SALVO_TOAST }) },
    toggle: {
      execute: vi.fn(async ({ papel, ativo }: { papel: string; ativo: boolean }) => ({
        toast: toggleToast(papel, ativo),
      })),
    },
    testar: {
      execute: vi.fn(async ({ papel }: { papel: string }) => ({
        toast: conexaoOkToast(papel),
        ultimoTeste: { status: 'ok' as const, ts: '27/10/2026 14:05' },
      })),
    },
    ...overrides,
  };
}
