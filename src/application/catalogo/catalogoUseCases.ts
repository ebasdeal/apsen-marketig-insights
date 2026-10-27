import type { GetCatalogFilters } from './GetCatalogFilters';
import type { GetFamiliaDrivers } from './GetFamiliaDrivers';
import type { GetFamiliaSkus } from './GetFamiliaSkus';
import type { GetFranquiaSkus } from './GetFranquiaSkus';
import type { ListCatalogFamilias } from './ListCatalogFamilias';
import type { SearchFamilias } from './SearchFamilias';
import type { SearchSkus } from './SearchSkus';

export interface CatalogoUseCases {
  searchSkus: Pick<SearchSkus, 'execute'>;
  searchFamilias: Pick<SearchFamilias, 'execute'>;
  familiaSkus: Pick<GetFamiliaSkus, 'execute'>;
  franquiaSkus: Pick<GetFranquiaSkus, 'execute'>;
  listFamilias: Pick<ListCatalogFamilias, 'execute'>;
  filters: Pick<GetCatalogFilters, 'execute'>;
  familiaDrivers: Pick<GetFamiliaDrivers, 'execute'>;
}
