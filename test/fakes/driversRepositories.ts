import type { ProductCatalogRepository } from '@domain/catalogo/ProductCatalogRepository';
import type { Driver } from '@domain/drivers/Driver';
import type { DriverLookupRepository } from '@domain/drivers/DriverLookupRepository';
import type { DriverRepository } from '@domain/drivers/DriverRepository';
import { NotFoundError } from '@domain/shared/DomainError';
import { makeFamilia, makeFranquia, makeSku } from '../factories/catalogo';
import { CATEGORIAS, CONFIG, INTENSIDADES, makeCamposTipo, makeDriver } from '../factories/drivers';

type Mocked<T> = { [K in keyof T]: ReturnType<typeof vi.fn> & T[K] };

export function createFakeDriverRepository(drivers: Driver[] = [makeDriver()]) {
  const repository = {
    get: vi.fn(async (id: string) => {
      const driver = drivers.find((item) => item.id === id);
      if (driver === undefined) {
        throw new NotFoundError('Driver', id);
      }
      return driver;
    }),
    create: vi.fn(async (driver: Driver) => driver),
    update: vi.fn(async (driver: Driver) => driver),
    list: vi.fn(async ({ page, limit }: { page: number; limit: number }) => ({
      items: drivers.slice((page - 1) * limit, page * limit),
      total: drivers.length,
      page,
      limit,
    })),
    listAll: vi.fn(async () => drivers),
    remove: vi.fn(async () => undefined),
  };
  return repository as Mocked<DriverRepository>;
}

export function createFakeLookupRepository() {
  const repository = {
    listCategorias: vi.fn(async () => CATEGORIAS),
    listTipos: vi.fn(async () => [{ slug: 'fv', ativo: false }]),
    listCamposTipo: vi.fn(async () => [makeCamposTipo()]),
    listIntensidades: vi.fn(async () => INTENSIDADES),
    getFormConfig: vi.fn(async () => CONFIG),
    searchLaboratorios: vi.fn(async () => ['EMS']),
    getMarcas: vi.fn(async () => ['Genérico EMS', 'Germed', 'Legrand']),
  };
  return repository as Mocked<DriverLookupRepository>;
}

export function createFakeCatalogRepository() {
  const repository = {
    searchSkus: vi.fn(async () => [makeSku()]),
    findSku: vi.fn(async () => makeSku()),
    searchFamilias: vi.fn(async () => [makeFamilia()]),
    getFamilia: vi.fn(async (id: string) => makeFamilia({ id })),
    listFamiliasDaFranquia: vi.fn(async () => [makeFamilia()]),
    listFranquias: vi.fn(async () => [makeFranquia()]),
    listFamilias: vi.fn(async () => ({ items: [makeFamilia()], total: 1, page: 1, limit: 10 })),
  };
  return repository as Mocked<ProductCatalogRepository>;
}
