import type { CicloRepository } from '@domain/ciclos/CicloRepository';
import { InvalidValueError } from '@domain/shared/DomainError';
import type { ToggleCicloInput, ToggleCicloResult } from './dto';
import { encerrarAtivoExceto, encerrarCiclo } from './encerrarAtivo';

export const CICLO_ENCERRADO = '⏸ Ciclo encerrado. Ative outro ciclo para continuar.';

export const CICLO_ATIVADO = '✅ Ciclo ativado como ciclo corrente.';

export class ToggleCiclo {
  constructor(
    private readonly repository: CicloRepository,
    private readonly now: () => Date,
  ) {}

  async execute({ id, ativo: ligar }: ToggleCicloInput): Promise<ToggleCicloResult> {
    const today = this.now();
    const { ativo } = await this.repository.findAtivo();
    if (!ligar) {
      if (ativo?.id !== id) {
        throw new InvalidValueError(`Ciclo ${id} não está ativo.`);
      }
      await encerrarCiclo(this.repository, ativo, today);
      return { toast: CICLO_ENCERRADO, encerradoId: null };
    }
    const encerradoId = await encerrarAtivoExceto(this.repository, ativo, id, today);
    await this.repository.update(id, { status: 'ativo' });
    return { toast: CICLO_ATIVADO, encerradoId };
  }
}
