import type { AprovacoesUseCases } from '@application/aprovacoes/aprovacoesUseCases';
import { toAprovacaoCardDto, type ListAprovacoesResult } from '@application/aprovacoes/dto';
import { APROV_PAGE_SIZE } from '@domain/aprovacoes/vocabulario';
import { pageCountOf } from '@domain/shared/Page';
import { APROV_INGERIDOS_FIXTURE, APROVACOES } from '../fixtures/aprovacoes';

export function listAprovacoesResult(page = 1): ListAprovacoesResult {
  const ordenadas = [...APROVACOES].sort((a, b) => b.id.localeCompare(a.id));
  const emUso = new Set(APROV_INGERIDOS_FIXTURE);
  return {
    cards: ordenadas
      .slice((page - 1) * APROV_PAGE_SIZE, page * APROV_PAGE_SIZE)
      .map((item) => toAprovacaoCardDto(item, emUso.has(item.id))),
    total: APROVACOES.length,
    totalPages: pageCountOf(APROVACOES.length, APROV_PAGE_SIZE),
    pendentesNoResultado: APROVACOES.filter((item) => item.status === 'pendente').length,
  };
}

export function createFakeAprovacoesUseCases(
  overrides: Partial<AprovacoesUseCases> = {},
): AprovacoesUseCases {
  return {
    list: { execute: vi.fn().mockResolvedValue(listAprovacoesResult()) },
    pendentes: {
      execute: vi
        .fn()
        .mockResolvedValue(APROVACOES.filter((item) => item.status === 'pendente').length),
    },
    emUso: { execute: vi.fn().mockResolvedValue([...APROV_INGERIDOS_FIXTURE]) },
    aprovar: {
      execute: vi.fn((id: string) =>
        Promise.resolve({ toast: `✅ ${id} aprovado e enviado para ingestão!` }),
      ),
    },
    rejeitar: {
      execute: vi.fn(({ id }: { id: string }) =>
        Promise.resolve({ toast: `❌ ${id} rejeitado. Registrante notificado.` }),
      ),
    },
    reabrir: {
      execute: vi
        .fn()
        .mockResolvedValue({ toast: '↩️ Decisão reaberta — driver voltou para pendente.' }),
    },
    ...overrides,
  };
}
