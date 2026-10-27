import { familiasPorFranquia, opcoesFranquia } from '@domain/catalogo/filtrosCatalogo';
import type { ProductCatalogRepository } from '@domain/catalogo/ProductCatalogRepository';
import type { CatalogFiltersDto } from './dto';

export class GetCatalogFilters {
  constructor(private readonly catalog: ProductCatalogRepository) {}

  async execute(): Promise<CatalogFiltersDto> {
    const franquias = await this.catalog.listFranquias();
    return {
      franquias: opcoesFranquia(franquias),
      familiasPorFranquia: familiasPorFranquia(franquias),
    };
  }
}
