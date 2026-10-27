import type { ProductCatalogRepository } from '@domain/catalogo/ProductCatalogRepository';
import type { Driver } from '@domain/drivers/Driver';
import type { DriverRepository } from '@domain/drivers/DriverRepository';
import { DriverValidationError } from '@domain/drivers/errors';
import { montarDriver } from '@domain/drivers/montarDriver';
import { validarDraft } from '@domain/drivers/validarDraft';
import type { UpdateDriverInput } from './dto';
import { skusDoDraft } from './skusDoDraft';

export class UpdateDriver {
  constructor(
    private readonly drivers: DriverRepository,
    private readonly catalog: ProductCatalogRepository,
  ) {}

  async execute({ id, draft, campos, original }: UpdateDriverInput): Promise<Driver> {
    const erro = validarDraft(draft, campos);
    if (erro !== null) {
      throw new DriverValidationError(erro);
    }
    const skus = await skusDoDraft(this.catalog, draft);
    const contexto =
      draft.tipo === original.tipo
        ? { campos, skus, preservar: original.parametros }
        : { campos, skus };
    return this.drivers.update(montarDriver(draft, contexto, id));
  }
}
