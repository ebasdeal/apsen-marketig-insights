import type { CiclosUseCases } from '@application/ciclos/ciclosUseCases';
import { CICLOS_PAGE_FIXTURE, CICLOS_RESUMO_FIXTURE } from '../fixtures/ciclos';

export function createFakeCiclosUseCases(overrides: Partial<CiclosUseCases> = {}): CiclosUseCases {
  return {
    list: { execute: vi.fn().mockResolvedValue(CICLOS_PAGE_FIXTURE) },
    resumo: { execute: vi.fn().mockResolvedValue(CICLOS_RESUMO_FIXTURE) },
    save: { execute: vi.fn().mockResolvedValue({ toast: '✅ Ciclo criado!' }) },
    toggle: {
      execute: vi
        .fn()
        .mockResolvedValue({ toast: '✅ Ciclo ativado como ciclo corrente.', encerradoId: null }),
    },
    ...overrides,
  };
}
