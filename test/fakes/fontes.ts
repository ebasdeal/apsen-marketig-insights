import type { FontesUseCases } from '@application/fontes/fontesUseCases';
import { FONTE_OPTIONS_FIXTURE, FONTES_PAGE_FIXTURE } from '../fixtures/fontes';

export function createFakeFontesUseCases(overrides: Partial<FontesUseCases> = {}): FontesUseCases {
  return {
    list: { execute: vi.fn().mockResolvedValue(FONTES_PAGE_FIXTURE) },
    options: { execute: vi.fn().mockResolvedValue(FONTE_OPTIONS_FIXTURE) },
    create: { execute: vi.fn().mockResolvedValue({ toast: '✅ Nova fonte "X" adicionada.' }) },
    update: {
      execute: vi.fn().mockResolvedValue({ toast: '✅ Fonte configurada para lista interna.' }),
    },
    remove: { execute: vi.fn().mockResolvedValue({ toast: 'Fonte removida.' }) },
    ...overrides,
  };
}
