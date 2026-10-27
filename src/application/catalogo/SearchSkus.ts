import type { Sku } from '@domain/catalogo/Produto';
import type { ProductCatalogRepository } from '@domain/catalogo/ProductCatalogRepository';

export const LIMITE_BUSCA_CATALOGO = 20;

export class SearchSkus {
  constructor(private readonly catalog: ProductCatalogRepository) {}

  execute(termo: string): Promise<Sku[]> {
    return this.catalog.searchSkus(termo.trim(), LIMITE_BUSCA_CATALOGO);
  }
}
