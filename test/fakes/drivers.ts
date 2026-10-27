import type { DriversUseCases } from '@application/drivers/driversUseCases';
import {
  makeDriver,
  makeDriversExport,
  makeDriversPage,
  makeLookups,
  makeSku,
} from '../factories/drivers';

export function createFakeDriversUseCases(): DriversUseCases {
  return {
    formLookups: { execute: vi.fn().mockResolvedValue(makeLookups()) },
    getForForm: {
      execute: vi.fn().mockResolvedValue({ driver: makeDriver(), sku: makeSku(), familia: null }),
    },
    create: { execute: vi.fn().mockResolvedValue(makeDriver({ id: 'novo-id' })) },
    update: { execute: vi.fn().mockResolvedValue(makeDriver()) },
    searchLaboratorios: { execute: vi.fn().mockResolvedValue(['EMS', 'Eurofarma']) },
    searchMarcas: { execute: vi.fn().mockResolvedValue(['Genérico EMS', 'Germed']) },
    list: { execute: vi.fn().mockResolvedValue(makeDriversPage()) },
    remove: { execute: vi.fn().mockResolvedValue(undefined) },
    export: { execute: vi.fn().mockResolvedValue(makeDriversExport()) },
  };
}
