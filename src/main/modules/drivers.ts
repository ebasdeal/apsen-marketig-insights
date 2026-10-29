import { CreateDriver } from '@application/drivers/CreateDriver';
import { DeleteDriver } from '@application/drivers/DeleteDriver';
import type { DriversUseCases } from '@application/drivers/driversUseCases';
import { GetDriverForForm } from '@application/drivers/GetDriverForForm';
import { GetDriverFormLookups } from '@application/drivers/GetDriverFormLookups';
import { GetDriversExport } from '@application/drivers/GetDriversExport';
import { ListDrivers } from '@application/drivers/ListDrivers';
import { SearchLaboratorios } from '@application/drivers/SearchLaboratorios';
import { SearchMarcas } from '@application/drivers/SearchMarcas';
import { UpdateDriver } from '@application/drivers/UpdateDriver';
import { HttpAprovacaoRepository } from '@infrastructure/aprovacoes/HttpAprovacaoRepository';
import { HttpProductCatalogRepository } from '@infrastructure/catalogo/HttpProductCatalogRepository';
import { CryptoIdGenerator } from '@infrastructure/drivers/CryptoIdGenerator';
import { HttpDriverLookupRepository } from '@infrastructure/drivers/HttpDriverLookupRepository';
import { HttpDriverRepository } from '@infrastructure/drivers/HttpDriverRepository';
import type { HttpClient } from '@infrastructure/http/HttpClient';

export function createDriversModule(
  http: HttpClient,
  clock: () => Date = () => new Date(),
): DriversUseCases {
  const drivers = new HttpDriverRepository(http);
  const lookups = new HttpDriverLookupRepository(http);
  const catalog = new HttpProductCatalogRepository(http);
  const aprovacoes = new HttpAprovacaoRepository(http);
  return {
    formLookups: new GetDriverFormLookups(lookups, catalog),
    getForForm: new GetDriverForForm(drivers, catalog),
    create: new CreateDriver(drivers, new CryptoIdGenerator(), aprovacoes, clock),
    update: new UpdateDriver(drivers),
    searchLaboratorios: new SearchLaboratorios(lookups),
    searchMarcas: new SearchMarcas(lookups),
    list: new ListDrivers(drivers, lookups),
    remove: new DeleteDriver(drivers, aprovacoes),
    export: new GetDriversExport(drivers, lookups, clock),
  };
}
