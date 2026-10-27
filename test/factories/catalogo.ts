import type { CatalogRowDto, FamiliaDriverRowDto } from '@application/catalogo/dto';
import type { Familia, Franquia, Sku } from '@domain/catalogo/Produto';

export const LEVOXIN_SKUS = [
  'LEVOXIN 250MG - 10 COMP. (2298)',
  'LEVOXIN 500MG - 10 COMP. (2299)',
  'LEVOXIN 500MG - 7 COMP. (2300)',
];

export function makeSku(overrides: Partial<Sku> = {}): Sku {
  return {
    id: 'LEVOXIN 500MG - 7 COMP. (2300)',
    label: 'LEVOXIN 500MG - 7 COMP. (2300)',
    familia: 'LEVOXIN',
    franquia: 'ASTER',
    ...overrides,
  };
}

export function makeFamilia(overrides: Partial<Familia> = {}): Familia {
  return { id: 'LEVOXIN', franquia: 'ASTER', skus: LEVOXIN_SKUS, ...overrides };
}

export function makeFranquia(overrides: Partial<Franquia> = {}): Franquia {
  return { id: 'ASTER', familias: ['FEMELIV', 'LEVOXIN', 'RETEMIC', 'RETEMIC UD'], ...overrides };
}

export function makeCatalogRow(overrides: Partial<CatalogRowDto> = {}): CatalogRowDto {
  return { franquia: 'ASTER', familia: 'LEVOXIN', nSkus: 3, nDrivers: 2, ...overrides };
}

export function makeFamiliaDriverRow(
  overrides: Partial<FamiliaDriverRowDto> = {},
): FamiliaDriverRowDto {
  return {
    id: '3',
    badge: { label: '💲 Preço', tone: 'pdv' },
    titulo: 'Ajuste de preço Levoxin 500mg Jul/2026',
    produto: 'LEVOXIN 500MG - 7 COMP. (2300)',
    periodo: '2026-07-15 → 2027-01-15',
    nivel: { label: 'SKU', tone: 'sku' },
    intensidade: 3,
    estrelas: '★★★☆☆',
    ...overrides,
  };
}
