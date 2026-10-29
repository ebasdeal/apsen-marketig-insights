import type { Driver } from '@domain/drivers/Driver';
import type { DriverRepository } from '@domain/drivers/DriverRepository';
import { DriverValidationError } from '@domain/drivers/errors';
import { montarDriver } from '@domain/drivers/montarDriver';
import { validarDraft } from '@domain/drivers/validarDraft';
import type { UpdateDriverInput } from './dto';

export class UpdateDriver {
  constructor(private readonly drivers: DriverRepository) {}

  async execute({ id, draft, campos, original }: UpdateDriverInput): Promise<Driver> {
    const erro = validarDraft(draft, campos);
    if (erro !== null) {
      throw new DriverValidationError(erro);
    }
    const contexto =
      draft.tipo === original.tipo ? { campos, preservar: original.parametros } : { campos };
    return this.drivers.update(montarDriver(draft, contexto, id));
  }
}
