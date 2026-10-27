import type { ProductCatalogRepository } from '@domain/catalogo/ProductCatalogRepository';
import type { Driver } from '@domain/drivers/Driver';
import type { DriverRepository } from '@domain/drivers/DriverRepository';
import { DriverValidationError } from '@domain/drivers/errors';
import type { IdGenerator } from '@domain/drivers/IdGenerator';
import { montarDriver } from '@domain/drivers/montarDriver';
import { validarDraft } from '@domain/drivers/validarDraft';
import type { CreateDriverInput } from './dto';
import { skusDoDraft } from './skusDoDraft';

export class CreateDriver {
  constructor(
    private readonly drivers: DriverRepository,
    private readonly catalog: ProductCatalogRepository,
    private readonly ids: IdGenerator,
  ) {}

  async execute({ draft, campos }: CreateDriverInput): Promise<Driver> {
    const erro = validarDraft(draft, campos);
    if (erro !== null) {
      throw new DriverValidationError(erro);
    }
    const skus = await skusDoDraft(this.catalog, draft);
    return this.drivers.create(montarDriver(draft, { campos, skus }, this.ids.next()));
  }
}
