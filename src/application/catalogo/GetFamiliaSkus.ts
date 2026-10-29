import type { ProductCatalogRepository } from '@domain/catalogo/ProductCatalogRepository';
import { NotFoundError } from '@domain/shared/DomainError';

export class GetFamiliaSkus {
  constructor(private readonly catalog: ProductCatalogRepository) {}

  async execute(familia: string): Promise<string[]> {
    try {
      return [...(await this.catalog.getFamilia(familia)).skus];
    } catch (error) {
      if (error instanceof NotFoundError) {
        return [];
      }
      throw error;
    }
  }
}
