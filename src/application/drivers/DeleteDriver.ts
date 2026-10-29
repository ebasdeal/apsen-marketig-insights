import type { AprovacaoRepository } from '@domain/aprovacoes/AprovacaoRepository';
import type { DriverRepository } from '@domain/drivers/DriverRepository';
import { NotFoundError } from '@domain/shared/DomainError';

export class DeleteDriver {
  constructor(
    private readonly drivers: DriverRepository,
    private readonly aprovacoes: AprovacaoRepository,
  ) {}

  async execute(id: string): Promise<void> {
    try {
      await this.drivers.remove(id);
    } catch (error) {
      if (!(error instanceof NotFoundError)) {
        throw error;
      }
    }
    // A aprovação nasce com o driver; sem ele ficaria órfã na Fila e inflaria os contadores.
    await this.aprovacoes.removerPorDriver(id);
  }
}
