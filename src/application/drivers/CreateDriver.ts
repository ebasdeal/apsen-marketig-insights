import type { AprovacaoRepository } from '@domain/aprovacoes/AprovacaoRepository';
import type { Driver } from '@domain/drivers/Driver';
import type { DriverRepository } from '@domain/drivers/DriverRepository';
import { DriverValidationError } from '@domain/drivers/errors';
import type { IdGenerator } from '@domain/drivers/IdGenerator';
import { montarDriver } from '@domain/drivers/montarDriver';
import { validarDraft } from '@domain/drivers/validarDraft';
import { aprovacaoDoDriver, proximoIdAprovacao } from './aprovacaoDoDriver';
import type { CreateDriverInput } from './dto';

export class CreateDriver {
  constructor(
    private readonly drivers: DriverRepository,
    private readonly ids: IdGenerator,
    private readonly aprovacoes: AprovacaoRepository,
    private readonly clock: () => Date = () => new Date(),
  ) {}

  async execute({ draft, campos, registro }: CreateDriverInput): Promise<Driver> {
    const erro = validarDraft(draft, campos);
    if (erro !== null) {
      throw new DriverValidationError(erro);
    }
    const driver = await this.drivers.create(montarDriver(draft, { campos }, this.ids.next()));
    const agora = this.clock();
    const id = proximoIdAprovacao(await this.aprovacoes.maiorId(), agora);
    await this.aprovacoes.create(aprovacaoDoDriver(driver, registro, id, agora));
    return driver;
  }
}
