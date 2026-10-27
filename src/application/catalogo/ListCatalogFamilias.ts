import { contarDrivers } from '@domain/catalogo/driversDaFamilia';
import { normalizarBusca } from '@domain/catalogo/filtrosCatalogo';
import type {
  CatalogQuery,
  ProductCatalogRepository,
} from '@domain/catalogo/ProductCatalogRepository';
import type { DriverRepository } from '@domain/drivers/DriverRepository';
import type { CatalogPageDto } from './dto';

export class ListCatalogFamilias {
  constructor(
    private readonly catalog: ProductCatalogRepository,
    private readonly drivers: DriverRepository,
  ) {}

  async execute(query: CatalogQuery): Promise<CatalogPageDto> {
    const [pagina, drivers] = await Promise.all([
      this.catalog.listFamilias({ ...query, busca: normalizarBusca(query.busca) }),
      this.drivers.listAll(),
    ]);
    return {
      rows: pagina.items.map((familia) => ({
        franquia: familia.franquia,
        familia: familia.id,
        nSkus: familia.skus.length,
        nDrivers: contarDrivers(drivers, familia.franquia, familia.id, familia.skus),
      })),
      total: pagina.total,
      page: query.page,
      size: query.size,
    };
  }
}
