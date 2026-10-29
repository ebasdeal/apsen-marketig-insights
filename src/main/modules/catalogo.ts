import type { CatalogoUseCases } from '@application/catalogo/catalogoUseCases';
import { GetCatalogFilters } from '@application/catalogo/GetCatalogFilters';
import { GetFamiliaDrivers } from '@application/catalogo/GetFamiliaDrivers';
import { GetFamiliaSkus } from '@application/catalogo/GetFamiliaSkus';
import { GetFranquiaSkus } from '@application/catalogo/GetFranquiaSkus';
import { ListCatalogFamilias } from '@application/catalogo/ListCatalogFamilias';
import { SearchFamilias } from '@application/catalogo/SearchFamilias';
import { SearchSkus } from '@application/catalogo/SearchSkus';
import { HttpProductCatalogRepository } from '@infrastructure/catalogo/HttpProductCatalogRepository';
import { HttpDriverLookupRepository } from '@infrastructure/drivers/HttpDriverLookupRepository';
import { HttpDriverRepository } from '@infrastructure/drivers/HttpDriverRepository';
import type { HttpClient } from '@infrastructure/http/HttpClient';

export function createCatalogoModule(http: HttpClient): CatalogoUseCases {
  const catalog = new HttpProductCatalogRepository(http);
  const drivers = new HttpDriverRepository(http);
  return {
    searchSkus: new SearchSkus(catalog),
    searchFamilias: new SearchFamilias(catalog),
    familiaSkus: new GetFamiliaSkus(catalog),
    franquiaSkus: new GetFranquiaSkus(catalog),
    listFamilias: new ListCatalogFamilias(catalog, drivers),
    filters: new GetCatalogFilters(catalog),
    familiaDrivers: new GetFamiliaDrivers(catalog, drivers, new HttpDriverLookupRepository(http)),
  };
}
