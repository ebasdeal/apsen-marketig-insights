import type { FamiliaSkus } from '@domain/catalogo/Produto';
import type { ProductCatalogRepository } from '@domain/catalogo/ProductCatalogRepository';
import { skusDaFranquia } from '../drivers/skusDoDraft';

export class GetFranquiaSkus {
  constructor(private readonly catalog: ProductCatalogRepository) {}

  execute(franquia: string): Promise<FamiliaSkus[]> {
    return skusDaFranquia(this.catalog, franquia);
  }
}
