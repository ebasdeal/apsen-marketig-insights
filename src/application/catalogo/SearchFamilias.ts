import type { Familia } from '@domain/catalogo/Produto';
import type { ProductCatalogRepository } from '@domain/catalogo/ProductCatalogRepository';
import { LIMITE_BUSCA_CATALOGO } from './SearchSkus';

export class SearchFamilias {
  constructor(private readonly catalog: ProductCatalogRepository) {}

  execute(termo: string): Promise<Familia[]> {
    return this.catalog.searchFamilias(termo.trim(), LIMITE_BUSCA_CATALOGO);
  }
}
