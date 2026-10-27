import { toIngeridoRowDto, type ListIngeridosResult } from '@application/ingeridos/dto';
import type { IngeridosUseCases } from '@application/ingeridos/ingeridosUseCases';
import { resumoIngeridos } from '@domain/ingeridos/ingeridoRules';
import { INGERIDOS } from '../fixtures/ingeridos';

export function listIngeridosResult(): ListIngeridosResult {
  return {
    rows: INGERIDOS.map(toIngeridoRowDto),
    total: INGERIDOS.length,
    totalPages: 1,
    resumo: resumoIngeridos(INGERIDOS.length),
  };
}

export function createFakeIngeridosUseCases(
  overrides: Partial<IngeridosUseCases> = {},
): IngeridosUseCases {
  return {
    list: { execute: vi.fn().mockResolvedValue(listIngeridosResult()) },
    remove: { execute: vi.fn().mockResolvedValue({ toast: '⚠️ Driver removido.' }) },
    ...overrides,
  };
}
