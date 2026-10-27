import type { CatalogoUseCases } from '@application/catalogo/catalogoUseCases';
import {
  LEVOXIN_SKUS,
  makeCatalogRow,
  makeFamilia,
  makeFamiliaDriverRow,
  makeSku,
} from '../factories/catalogo';

export function createFakeCatalogoUseCases(): CatalogoUseCases {
  return {
    searchSkus: { execute: vi.fn().mockResolvedValue([makeSku()]) },
    searchFamilias: { execute: vi.fn().mockResolvedValue([makeFamilia()]) },
    familiaSkus: { execute: vi.fn().mockResolvedValue(LEVOXIN_SKUS) },
    franquiaSkus: {
      execute: vi.fn().mockResolvedValue([{ familia: 'LEVOXIN', skus: LEVOXIN_SKUS }]),
    },
    listFamilias: {
      execute: vi.fn().mockResolvedValue({ rows: [makeCatalogRow()], total: 1, page: 1, size: 10 }),
    },
    filters: {
      execute: vi.fn().mockResolvedValue({
        franquias: ['ASTER'],
        familiasPorFranquia: { ASTER: ['LEVOXIN'] },
      }),
    },
    familiaDrivers: {
      execute: vi.fn().mockResolvedValue({
        franquia: 'ASTER',
        familia: 'LEVOXIN',
        drivers: [makeFamiliaDriverRow()],
      }),
    },
  };
}
