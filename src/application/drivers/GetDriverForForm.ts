import type { Familia } from '@domain/catalogo/Produto';
import type { ProductCatalogRepository } from '@domain/catalogo/ProductCatalogRepository';
import type { DriverRepository } from '@domain/drivers/DriverRepository';
import { NotFoundError } from '@domain/shared/DomainError';
import type { DriverForFormDto } from './dto';

export class GetDriverForForm {
  constructor(
    private readonly drivers: DriverRepository,
    private readonly catalog: ProductCatalogRepository,
  ) {}

  async execute(id: string): Promise<DriverForFormDto> {
    const driver = await this.drivers.get(id);
    const sku =
      driver.modo === 'sku' ? await this.catalog.findSku(driver.produto, driver.codigo) : null;
    const familia = driver.modo === 'familia' ? await this.familia(driver.molecula) : null;
    return { driver, sku, familia };
  }

  private async familia(id: string): Promise<Familia | null> {
    try {
      return await this.catalog.getFamilia(id);
    } catch (error) {
      if (error instanceof NotFoundError) {
        return null;
      }
      throw error;
    }
  }
}
