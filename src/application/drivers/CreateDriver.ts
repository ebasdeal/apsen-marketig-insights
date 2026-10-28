import type { Driver } from '@domain/drivers/Driver';
import type { DriverRepository } from '@domain/drivers/DriverRepository';
import { DriverValidationError } from '@domain/drivers/errors';
import type { IdGenerator } from '@domain/drivers/IdGenerator';
import { montarDriver } from '@domain/drivers/montarDriver';
import { validarDraft } from '@domain/drivers/validarDraft';
import type { CreateDriverInput } from './dto';

export class CreateDriver {
  constructor(
    private readonly drivers: DriverRepository,
    private readonly ids: IdGenerator,
  ) {}

  async execute({ draft, campos }: CreateDriverInput): Promise<Driver> {
    const erro = validarDraft(draft, campos);
    if (erro !== null) {
      throw new DriverValidationError(erro);
    }
    return this.drivers.create(montarDriver(draft, { campos }, this.ids.next()));
  }
}
